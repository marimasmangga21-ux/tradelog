from PIL import Image

img = Image.open('public/logo-tradelog.jpeg')
width, height = img.size
print(f"Image dimensions: {width} x {height}")

# Cari batas bounding box elemen non-hitam
# Background adalah hitam (#000000)
# Bagian atas: Icon (kotak hijau)
# Bagian bawah: Text "TRADELOG"

# Mari potong icon bagian atas:
# Dari y = 0 sampai sekitar y = height * 0.75
# Dan text bagian bawah dari y = height * 0.70 sampai height

# Potong icon:
# Bounding box icon
icon_crop = img.crop((0, 0, width, int(height * 0.70)))
# Trim black borders around icon
icon_bbox = icon_crop.getbbox()
if icon_bbox:
    icon_cropped = icon_crop.crop(icon_bbox)
    icon_cropped.save('public/logo-icon.png')
    print(f"Saved logo-icon.png: {icon_cropped.size}")

# Potong teks:
text_crop = img.crop((0, int(height * 0.70), width, height))
text_bbox = text_crop.getbbox()
if text_bbox:
    text_cropped = text_crop.crop(text_bbox)
    text_cropped.save('public/logo-text.png')
    print(f"Saved logo-text.png: {text_cropped.size}")
