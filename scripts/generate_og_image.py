import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_emblem(size=240):
    # Render high-resolution emblem image
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 1. Rounded rectangle background
    r = size * 0.25
    draw.rounded_rectangle([0, 0, size, size], radius=r, fill=(30, 58, 138, 255))
    
    # Gradient overlay emulation: draw layered circles for rich gradient
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse([size*0.1, size*0.1, size*1.1, size*1.1], fill=(59, 130, 246, 120))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)
    
    # Outer ring
    cx, cy = size / 2, size / 2
    draw.ellipse([size*0.08, size*0.08, size*0.92, size*0.92], outline=(147, 197, 253, 90), width=math.ceil(size*0.015))
    
    # Open book at bottom
    # Bottom page curve
    w = math.ceil(size * 0.038)
    draw.arc([size*0.25, size*0.68, size*0.5, size*0.82], 180, 360, fill=(255, 255, 255, 255), width=w)
    draw.arc([size*0.5, size*0.68, size*0.75, size*0.82], 180, 360, fill=(255, 255, 255, 255), width=w)
    # Inner page curve
    draw.arc([size*0.28, size*0.62, size*0.5, size*0.74], 180, 360, fill=(191, 219, 254, 200), width=math.ceil(size*0.025))
    draw.arc([size*0.5, size*0.62, size*0.72, size*0.74], 180, 360, fill=(191, 219, 254, 200), width=math.ceil(size*0.025))
    # Center spine
    draw.line([size*0.5, size*0.68, size*0.5, size*0.78], fill=(255, 255, 255, 255), width=w)
    
    # Left wing/leaf (Green emerald)
    pts_left = [
        (size*0.28, size*0.60),
        (size*0.24, size*0.48),
        (size*0.29, size*0.35),
        (size*0.38, size*0.30),
        (size*0.38, size*0.37),
        (size*0.36, size*0.48),
        (size*0.45, size*0.55),
    ]
    draw.polygon(pts_left, fill=(16, 185, 129, 240))
    
    # Right wing/leaf (Teal)
    pts_right = [
        (size*0.72, size*0.60),
        (size*0.76, size*0.48),
        (size*0.71, size*0.35),
        (size*0.62, size*0.30),
        (size*0.62, size*0.37),
        (size*0.64, size*0.48),
        (size*0.55, size*0.55),
    ]
    draw.polygon(pts_right, fill=(45, 212, 191, 240))
    
    # Center Pearl
    pr = size * 0.15
    p_box = [cx - pr, cy*0.84 - pr, cx + pr, cy*0.84 + pr]
    draw.ellipse(p_box, fill=(240, 244, 255, 255), outline=(199, 210, 254, 255), width=math.ceil(size*0.015))
    # Pearl highlight
    hr = size * 0.05
    hx, hy = cx - pr*0.35, cy*0.84 - pr*0.35
    draw.ellipse([hx - hr, hy - hr*0.7, hx + hr, hy + hr*0.7], fill=(255, 255, 255, 240))
    
    # Gold star on top
    star_cy = cy * 0.42
    sr = size * 0.06
    # 4-point sparkle star
    star_pts = [
        (cx, star_cy - sr),
        (cx + sr*0.3, star_cy - sr*0.3),
        (cx + sr, star_cy),
        (cx + sr*0.3, star_cy + sr*0.3),
        (cx, star_cy + sr),
        (cx - sr*0.3, star_cy + sr*0.3),
        (cx - sr, star_cy),
        (cx - sr*0.3, star_cy - sr*0.3),
    ]
    draw.polygon(star_pts, fill=(245, 158, 11, 255))
    
    return img

def generate_og_image():
    W, H = 1200, 630
    img = Image.new('RGB', (W, H), (15, 23, 42))  # slate-900 base
    draw = ImageDraw.Draw(img)
    
    # Rich background radial glow
    for r in range(500, 0, -10):
        alpha = int(70 * (1 - r / 500))
        # Blue gradient glow centered around top left / center
        draw.ellipse([150 - r, 315 - r, 150 + r, 315 + r], outline=(30, 58, 138, alpha), width=10)
        draw.ellipse([900 - r, 150 - r, 900 + r, 150 + r], outline=(15, 118, 110, int(alpha*0.6)), width=10)

    # Subdued subtle background pattern / frame
    draw.rounded_rectangle([24, 24, W - 24, H - 24], radius=32, outline=(59, 130, 246, 70), width=2)
    draw.rounded_rectangle([32, 32, W - 32, H - 32], radius=26, outline=(255, 255, 255, 20), width=1)
    
    # Fonts
    font_bold = r'C:\Windows\Fonts\malgunbd.ttf'
    font_reg = r'C:\Windows\Fonts\malgun.ttf'
    
    f_badge = ImageFont.truetype(font_bold, 22)
    f_title = ImageFont.truetype(font_bold, 54)
    f_eng = ImageFont.truetype(font_bold, 24)
    f_quote = ImageFont.truetype(font_bold, 30)
    f_desc = ImageFont.truetype(font_reg, 23)
    f_footer = ImageFont.truetype(font_bold, 20)
    
    # Left Emblem Logo
    emblem = create_emblem(size=260)
    img.paste(emblem, (80, 185), emblem)
    
    # Right Text Content starts at X = 390
    tx = 390
    
    # 1. Top Pill Badge
    badge_text = "✦ 진주시 유·초·중·고·특수학교 학교운영위원장 협조기구"
    bbox = f_badge.getbbox(badge_text)
    bw, bh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    px, py = 18, 9
    bx, by = tx, 88
    draw.rounded_rectangle([bx, by, bx + bw + px*2, by + bh + py*2], radius=18, fill=(30, 58, 138), outline=(96, 165, 250), width=1)
    draw.text((bx + px, by + py - 2), badge_text, font=f_badge, fill=(191, 219, 254))
    
    # 2. Main Title
    draw.text((tx, 165), "학교운영위원회 진주지역협의회", font=f_title, fill=(255, 255, 255))
    
    # 3. English Subtitle
    draw.text((tx, 242), "Jinju School Council Chairpersons Association", font=f_eng, fill=(56, 189, 248))
    
    # 4. Horizontal Divider Line
    draw.line([tx, 290, W - 90, 290], fill=(59, 130, 246), width=2)
    
    # 5. Quote / Slogan
    draw.text((tx, 320), "“소통과 신뢰로 함께 여는 진주 교육의 희망찬 내일”", font=f_quote, fill=(253, 224, 71))
    
    # 6. Description bullets
    desc_lines = [
        "• 단위학교 교육자치 실현과 학교 간 유기적 협조체제 구축",
        "• 학부모·학교·교육지원청의 든든한 소통 가교 플랫폼",
        "• 우리 아이들이 안전하고 행복하게 꿈을 키워가는 진주 교육"
    ]
    dy = 385
    for line in desc_lines:
        draw.text((tx, dy), line, font=f_desc, fill=(203, 213, 225))
        dy += 36
        
    # 7. Bottom bar info
    draw.line([80, H - 75, W - 80, H - 75], fill=(30, 41, 59), width=1)
    draw.text((80, H - 56), "진주시 학교운영위원장 협의회 공식 웹플랫폼", font=f_footer, fill=(148, 163, 184))
    draw.text((W - 320, H - 56), "jinju-scca.vercel.app", font=f_footer, fill=(96, 165, 250))
    
    # Save OG image
    out_og = r'C:\Users\Administrator\Desktop\anty\jinju-scca\public\og-image.png'
    img.save(out_og, format='PNG', optimize=True)
    print(f"Saved OG Image to {out_og}")
    
    # Save standalone Logo PNG
    logo_512 = create_emblem(size=512)
    out_logo = r'C:\Users\Administrator\Desktop\anty\jinju-scca\public\logo.png'
    logo_512.save(out_logo, format='PNG', optimize=True)
    print(f"Saved Logo PNG to {out_logo}")

if __name__ == '__main__':
    generate_og_image()
