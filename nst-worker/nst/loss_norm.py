import torch

import torch.nn as nn
import torch.nn.functional as F


class ContentLoss(nn.Module):
    def __init__(self, target, ):
        super(ContentLoss, self).__init__()
        self.target = target.detach()

    def forward(self, input):
        self.loss = F.mse_loss(input, self.target)
        return input


class StyleLoss(nn.Module):

    def __init__(self, target_features):
        super(StyleLoss, self).__init__()
        self.target = self.gram_matrix(target_features).detach()

    def gram_matrix(self, input):
        batch_size, num_feature_maps, dim1, dim2 = input.size()

        features = input.view(batch_size * num_feature_maps, dim1 * dim2)

        gram_prod = torch.mm(features, features.t())
        return gram_prod.div(batch_size * num_feature_maps * dim1 * dim2)

    def forward(self, input):
        gram_prod = self.gram_matrix(input)
        self.loss = F.mse_loss(gram_prod, self.target)
        return input


class Normalization(nn.Module):

    def __init__(self, mean, std):
        super(Normalization, self).__init__()

        self.mean = mean.clone().detach().view(-1, 1, 1)
        self.std = std.clone().detach().view(-1, 1, 1)

    def forward(self, img):
        return (img - self.mean) / self.std
