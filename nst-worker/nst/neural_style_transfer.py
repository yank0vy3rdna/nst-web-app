import copy
import errno
import io
import os
from io import BytesIO
from typing import Generator

import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
from torch import Tensor

from nst.loss_norm import ContentLoss, StyleLoss, Normalization


class NST(object):

    def __init__(self, content_layers=None, style_layers=None, num_steps=300, style_weight=1000000, content_weight=1,
                 gpu=False, path=None):

        if style_layers is None:
            style_layers = ['conv_1', 'conv_2', 'conv_3', 'conv_4', 'conv_5']
        if content_layers is None:
            content_layers = ['conv_4']
        if gpu and not torch.cuda.is_available():
            raise ValueError('gpu is True but cuda not available')

        self.content_layers = content_layers
        self.style_layers = style_layers
        self.num_steps = num_steps
        self.style_weight = style_weight
        self.content_weight = content_weight
        self.path = path

        self.device = torch.device('cuda') if gpu else torch.device('cpu')
        self.img_size = 512 if torch.cuda.is_available() else 128

        self.cnn = models.vgg19(pretrained=True).features.to(self.device).eval()

        self.cnn_normalization_mean = torch.tensor([0.485, 0.456, 0.406]).to(self.device)
        self.cnn_normalization_std = torch.tensor([0.229, 0.224, 0.225]).to(self.device)

    def image_loader(self, content: io.BytesIO, style: io.BytesIO):
        content_img = Image.open(content)
        style_img = Image.open(style)

        width, height = content_img.size
        style_img = style_img.resize((width, height))

        loader = transforms.Compose([transforms.ToTensor()])

        content_img = loader(content_img).unsqueeze(0)
        style_img = loader(style_img).unsqueeze(0)
        input_img = torch.randn(content_img.data.size(), device=self.device)

        content_img = content_img.to(self.device, torch.float)
        style_img = style_img.to(self.device, torch.float)
        input_img = input_img.to(self.device, torch.float)

        return content_img, style_img, input_img

    def style_model_and_losses(self, cnn, cnn_normalization_mean, cnn_normalization_std, content_img, style_img):

        content_layers = self.content_layers
        style_layers = self.style_layers

        cnn = copy.deepcopy(cnn)

        normalization = Normalization(cnn_normalization_mean, cnn_normalization_std).to(self.device)

        content_loss = []
        style_loss = []

        model = nn.Sequential(normalization)

        i = 0  # increment when we find a conv layer
        for layer in cnn.children():

            if isinstance(layer, nn.Conv2d):
                i += 1
                name = 'conv_{}'.format(i)

            elif isinstance(layer, nn.ReLU):
                name = 'relu_{}'.format(i)

                layer = nn.ReLU(inplace=False)

            elif isinstance(layer, nn.MaxPool2d):
                name = 'pool_{}'.format(i)

            elif isinstance(layer, nn.BatchNorm2d):
                name = 'bn_{}'.format(i)

            else:
                raise RuntimeError('Layer {} is not recognized'.format(layer.__class__.__name__))

            model.add_module(name, layer)

            if name in content_layers:
                target = model(content_img).detach()
                cnt_loss = ContentLoss(target)
                model.add_module('content_loss_{}'.format(i), cnt_loss)
                content_loss.append(cnt_loss)

            if name in style_layers:
                target_feature = model(style_img).detach()
                styl_loss = StyleLoss(target_feature)
                model.add_module('style_loss_{}'.format(i), styl_loss)
                style_loss.append(styl_loss)

        for i in range(len(model) - 1, -1, -1):
            if isinstance(model[i], ContentLoss) or isinstance(model[i], StyleLoss):
                break

        model = model[:(i + 1)]

        return model, style_loss, content_loss

    def run_nst(self, content_bytes: io.BytesIO, style_bytes: io.BytesIO, out: io.BytesIO):

        num_steps = self.num_steps
        style_weight = self.style_weight
        content_weight = self.content_weight

        content_img, style_img, input_img = self.image_loader(content_bytes, style_bytes)

        model, style_loss, content_loss = self.style_model_and_losses(self.cnn, self.cnn_normalization_mean,
                                                                      self.cnn_normalization_std, content_img,
                                                                      style_img)

        optimizer = optim.LBFGS([input_img.requires_grad_()])

        print('Optimizing')
        run = [0]
        while run[0] <= num_steps:

            def closure():
                input_img.data.clamp_(0, 1)

                optimizer.zero_grad()
                model(input_img)
                content_score: Tensor = Tensor()
                style_score: Tensor = Tensor()

                for cl in content_loss:
                    content_score += cl.loss
                for sl in style_loss:
                    style_score += (1 / 5) * sl.loss

                style_score *= style_weight
                content_score *= content_weight

                loss = content_score + style_score

                loss.backward()

                run[0] += 1

                if run[0] % 50 == 0:
                    print("Step {}:".format(run[0]))
                    print('Style Loss : {:4f} Content Loss: {:4f}'.format(
                        style_score.item(), content_score.item()))

                return style_score + content_score

            optimizer.step(closure)
            yield float(run[0])/num_steps

        input_img.data.clamp_(0, 1)

        unloader = transforms.ToPILImage()

        output_img = input_img.cpu().clone()  # cloning the tensor to not do changes on it
        output_img = output_img.squeeze(0)  # removing the fake batch dimension
        output_img = unloader(output_img)

        if self.path is not None:
            output_img.save(out)
        yield 0.
