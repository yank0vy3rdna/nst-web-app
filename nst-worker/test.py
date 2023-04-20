''' importing the nst module '''
from nst import NST
import matplotlib.pyplot as plt

''' initializing the NST Model '''
nst_res = NST(gpu=True, num_steps=150)

''' reading the content and style image path '''
content_img, style_img = ('results/input/content4.jpg', 'results/input/style3.jpg')
''' running inferences '''
result = nst_res.run_nst(content_img, style_img)

''' displaying the resulting image '''
plt.imshow(result)
plt.show()