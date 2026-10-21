from PIL import Image

# 1. Buka icon_crop
icon = Image.open('public/logo-icon.png')
# Cari piksel warna hijau (r > 100, g > 150, b < 100)
w, h = icon.size
left, top, right, bottom = w, h, 0, 0

for y in range(h):
    for x in range(w):
        r, g, b = icon.getpixel((x, y))[:3]
        # Pixel hijau icon
        if g > 150 and r > 100:
            if x < left: left = x
            if x > right: right = x
            if y < top: top = y
            if y > bottom: bottom = y

print(f"Icon exact green bounds: left={left}, top={top}, right={right}, bottom={bottom}")
# Tambahkan padding kecil 2px
clean_icon = icon.crop((max(0, left - 2), max(0, top - 2), min(w, right + 2), min(h, bottom + 2)))
clean_icon.save('public/logo-icon.png')

# 2. Buka text_crop
text_img = Image.open('public/logo-text.png')
tw, th = text_img.size
t_left, t_top, t_right, t_bottom = tw, th, 0, 0

for y in range(th):
    for x in range(tw):
        r, g, b = text_img.getpixel((x, y))[:3]
        if g > 150 and r > 100:
            if x < t_left: t_left = x
            if x > t_right: t_right = x
            if y < t_top: t_top = y
            if y > t_bottom: t_bottom = y

print(f"Text exact green bounds: left={t_left}, top={t_top}, right={t_right}, bottom={t_bottom}")
clean_text = text_img.crop((max(0, t_left - 2), max(0, t_top - 2), min(tw, t_right + 2), min(th, t_bottom + 2)))
clean_text.save('public/logo-text.png')

print("Clean icon and text saved successfully!")
