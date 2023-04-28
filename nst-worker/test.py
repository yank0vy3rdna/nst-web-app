''' importing the nst module '''
import io

from nst import NST
import matplotlib.pyplot as plt

''' initializing the NST Model '''
nst_res = NST(gpu=True, num_steps=150)

''' reading the content and style image path '''
content_img, style_img = ('C:\\Users\\yank0vy3rdna\\Pictures\\photo_2023-04-08_13-27-34.jpg', 'C:\\Users\\yank0vy3rdna\\Pictures\\photo_2023-04-08_13-27-33.jpg')
''' running inferences '''

out = io.BytesIO()
with open(content_img, 'rb') as content:
    with open(style_img, 'rb') as style:
        for i in nst_res.run_nst(content, style, out):
            print(i)

# ''' displaying the resulting image '''
# plt.imshow(result)
# plt.show()