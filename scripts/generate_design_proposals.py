import os
from PIL import Image, ImageDraw, ImageFont

def render_proposal_card(p, out_path, font_bold, font_reg):
    W, H = 1000, 560
    img = Image.new('RGB', (W, H), p['bg'])
    draw = ImageDraw.Draw(img)

    f_cat = ImageFont.truetype(font_bold, 16)
    f_title = ImageFont.truetype(font_bold, 28)
    f_tag = ImageFont.truetype(font_bold, 13)
    f_sec = ImageFont.truetype(font_bold, 15)
    f_desc = ImageFont.truetype(font_reg, 14)
    f_ui_nav = ImageFont.truetype(font_bold, 14)
    f_ui_btn = ImageFont.truetype(font_bold, 13)
    f_ui_text = ImageFont.truetype(font_reg, 13)
    f_hex = ImageFont.truetype(font_bold, 11)

    # 1. Outer Frame
    draw.rounded_rectangle([15, 15, W - 15, H - 15], radius=24, fill=(255, 255, 255), outline=(226, 232, 240), width=2)

    # 2. Top Header Banner
    draw.rounded_rectangle([15, 15, W - 15, 95], radius=24, fill=p['primary'])
    # Fix bottom corners of header
    draw.rectangle([15, 75, W - 15, 95], fill=p['primary'])

    # Category & Title
    draw.text((40, 28), p['theme_cat'], font=f_cat, fill=(255, 255, 255, 180))
    draw.text((40, 50), f"{p['code']} : {p['name']}", font=f_title, fill=(255, 255, 255))

    # Keywords badges on header right
    kx = W - 45
    for tag in reversed(p['keywords']):
        bbox = f_tag.getbbox(tag)
        tw = bbox[2] - bbox[0]
        kx -= (tw + 18)
        draw.rounded_rectangle([kx, 48, kx + tw + 14, 76], radius=14, fill=(255, 255, 255, 40), outline=(255, 255, 255, 70), width=1)
        draw.text((kx + 7, 54), tag, font=f_tag, fill=(255, 255, 255))
        kx -= 8

    # =========================================================
    # LEFT PANEL: Palette & Description (Width: 380px)
    # =========================================================
    draw.text((40, 115), "🎨 대표 컬러 팔레트 (Color Palette)", font=f_sec, fill=p['text_main'])

    swatches = [
        ("주조색 (Primary)", p['primary']),
        ("보조색 (Secondary)", p['secondary']),
        ("강조색 (Accent)", p['accent']),
        ("배경색 (Background)", p['bg']),
        ("카드표면 (Surface)", p['surface']),
    ]

    sy = 145
    for label, col in swatches:
        # circle
        draw.ellipse([40, sy, 70, sy + 30], fill=col, outline=(203, 213, 225), width=1)
        # label
        draw.text((82, sy + 2), label, font=f_desc, fill=p['text_main'])
        # hex
        hex_str = f"#{col[0]:02X}{col[1]:02X}{col[2]:02X}"
        draw.text((82, sy + 18), hex_str, font=f_hex, fill=p['text_sub'])
        sy += 38

    # Designer's Note
    draw.line([40, sy + 5, 380, sy + 5], fill=(226, 232, 240), width=1)
    draw.text((40, sy + 15), "💡 디자이너 추천 및 설계 의도", font=f_sec, fill=p['text_main'])
    
    # Word wrap description
    desc_words = p['desc']
    lines = []
    curr = ""
    for ch in desc_words:
        curr += ch
        if len(curr) >= 24 and ch in " ,.":
            lines.append(curr.strip())
            curr = ""
    if curr:
        lines.append(curr.strip())
        
    dy = sy + 42
    for line in lines:
        draw.text((40, dy), line, font=f_desc, fill=p['text_sub'])
        dy += 22

    # =========================================================
    # RIGHT PANEL: Live UI Component Mockup (Width: 550px)
    # =========================================================
    mx, my, mw, mh = 410, 115, 550, 420
    # Mockup Frame
    draw.rounded_rectangle([mx, my, mx + mw, my + mh], radius=18, fill=p['bg'], outline=(203, 213, 225), width=1)

    # 1. Mock Navbar (Top of mockup)
    draw.rounded_rectangle([mx, my, mx + mw, my + 54], radius=18, fill=p['surface'], outline=(226, 232, 240), width=1)
    draw.rectangle([mx, my + 30, mx + mw, my + 54], fill=p['surface'])
    # Nav logo
    draw.rounded_rectangle([mx + 15, my + 10, mx + 49, my + 44], radius=10, fill=p['primary'])
    draw.ellipse([mx + 27, my + 22, mx + 37, my + 32], fill=(255, 255, 255))
    draw.text((mx + 56, my + 18), "학교운영위원회 진주지역협의회", font=f_ui_nav, fill=p['text_main'])
    # Nav items
    nx = mx + mw - 190
    draw.text((nx, my + 20), "소개  소식  소통방", font=f_desc, fill=p['secondary'])

    # 2. Mock Hero Banner
    hy = my + 68
    draw.rounded_rectangle([mx + 15, hy, mx + mw - 15, hy + 85], radius=14, fill=p['primary'])
    draw.rounded_rectangle([mx + 30, hy + 12, mx + 240, hy + 32], radius=10, fill=p['accent'])
    draw.text((mx + 38, hy + 15), "✦ 2026 진주시 학교운영위원회 공식 포털", font=f_hex, fill=(255, 255, 255))
    draw.text((mx + 30, hy + 40), "소통과 신뢰로 함께 여는 진주 교육의 희망찬 내일", font=f_ui_nav, fill=(255, 255, 255))
    draw.text((mx + 30, hy + 60), "관내 92개교 운영위원장 및 학부모를 위한 열린 참여 플랫폼", font=f_hex, fill=(203, 213, 225))

    # 3. Mock Classic Board Table (학부모 소통방 미니 프리뷰)
    by = hy + 98
    draw.rounded_rectangle([mx + 15, by, mx + mw - 15, by + 160], radius=14, fill=p['surface'], outline=(226, 232, 240), width=1)
    # Table Header
    draw.rounded_rectangle([mx + 15, by, mx + mw - 15, by + 34], radius=14, fill=p['bg'])
    draw.rectangle([mx + 15, by + 20, mx + mw - 15, by + 34], fill=p['bg'])
    draw.text((mx + 28, by + 9), "번호    학교명        제목                              작성자   조회", font=f_hex, fill=p['text_sub'])

    # Row 1 (Pinned notice)
    ry1 = by + 38
    draw.line([mx + 15, ry1, mx + mw - 15, ry1], fill=(241, 245, 249), width=1)
    draw.rounded_rectangle([mx + 24, ry1 + 6, mx + 52, ry1 + 22], radius=4, fill=(254, 226, 226))
    draw.text((mx + 28, ry1 + 7), "공지", font=f_hex, fill=(185, 28, 28))
    draw.text((mx + 60, ry1 + 7), "[협의회] 2026년도 정기총회 회칙 개정 안내", font=f_ui_text, fill=p['text_main'])
    draw.text((mx + mw - 100, ry1 + 7), "관리자   142", font=f_hex, fill=p['text_sub'])

    # Row 2 (Parent post)
    ry2 = ry1 + 32
    draw.line([mx + 15, ry2, mx + mw - 15, ry2], fill=(241, 245, 249), width=1)
    draw.text((mx + 32, ry2 + 7), "128", font=f_hex, fill=p['text_sub'])
    draw.rounded_rectangle([mx + 60, ry2 + 5, mx + 115, ry2 + 23], radius=4, fill=(241, 245, 249))
    draw.text((mx + 65, ry2 + 7), "으뜸초", font=f_hex, fill=p['secondary'])
    draw.text((mx + 125, ry2 + 7), "급식 소위원회 활동 및 모니터링 건의", font=f_ui_text, fill=p['text_main'])
    # [3] comment badge
    draw.text((mx + 340, ry2 + 7), "[3]", font=f_hex, fill=p['secondary'])
    draw.text((mx + mw - 100, ry2 + 7), "학부모    27", font=f_hex, fill=p['text_sub'])

    # Row 3 (Another post)
    ry3 = ry2 + 32
    draw.line([mx + 15, ry3, mx + mw - 15, ry3], fill=(241, 245, 249), width=1)
    draw.text((mx + 32, ry3 + 7), "127", font=f_hex, fill=p['text_sub'])
    draw.rounded_rectangle([mx + 60, ry3 + 5, mx + 115, ry3 + 23], radius=4, fill=(241, 245, 249))
    draw.text((mx + 65, ry3 + 7), "진주중", font=f_hex, fill=p['secondary'])
    draw.text((mx + 125, ry3 + 7), "등하굣길 교통안전 지킴이 봉사 관련 문의", font=f_ui_text, fill=p['text_main'])
    draw.text((mx + mw - 100, ry3 + 7), "학부모    18", font=f_hex, fill=p['text_sub'])

    # Table footer action buttons
    fy = by + 112
    draw.line([mx + 15, fy, mx + mw - 15, fy], fill=(241, 245, 249), width=1)
    # Button 1 (Write)
    draw.rounded_rectangle([mx + mw - 110, fy + 8, mx + mw - 25, fy + 38], radius=8, fill=p['primary'])
    draw.text((mx + mw - 95, fy + 14), "✏️ 글쓰기", font=f_ui_btn, fill=(255, 255, 255))
    # Button 2 (List)
    draw.rounded_rectangle([mx + 25, fy + 8, mx + 95, fy + 38], radius=8, fill=(255, 255, 255), outline=(203, 213, 225), width=1)
    draw.text((mx + 38, fy + 14), "목록으로", font=f_ui_btn, fill=p['text_main'])
    # Badge (Accent)
    draw.rounded_rectangle([mx + 105, fy + 10, mx + 200, fy + 36], radius=6, fill=p['accent'])
    draw.text((mx + 115, fy + 15), "★ 소통방 바로가기", font=f_hex, fill=(255, 255, 255))

    # Bottom footer info on card
    draw.text((mx + 15, my + mh + 6), f"Preview Canvas • {p['code']} Design Prototype • Jinju SCCA", font=f_hex, fill=p['text_sub'])

    img.save(out_path, format='PNG', optimize=True)
    print(f"Generated: {out_path}")

def main():
    font_bold = r'C:\Windows\Fonts\malgunbd.ttf'
    font_reg = r'C:\Windows\Fonts\malgun.ttf'

    proposals = [
        # THEME 1
        {
            "id": "theme_1a",
            "theme_cat": "THEME 01. 진주 남강 & 교육의 신뢰 (Heritage & Trust)",
            "code": "시안 1-A",
            "name": "남강 로열 클래식 (Namgang Royal Navy)",
            "keywords": ["#정통공공포털", "#안정감과신뢰", "#클래식네이비"],
            "primary": (30, 58, 138),
            "secondary": (2, 132, 199),
            "accent": (245, 158, 11),
            "bg": (248, 250, 252),
            "surface": (255, 255, 255),
            "text_main": (15, 23, 42),
            "text_sub": (100, 116, 139),
            "desc": "진주 남강의 맑고 깊은 푸른빛과 도교육청의 신뢰감을 계승한 정통 공공기관 표준 톤. 차분하고 안정적이며 가독성이 가장 뛰어납니다."
        },
        {
            "id": "theme_1b",
            "theme_cat": "THEME 01. 진주 남강 & 교육의 신뢰 (Heritage & Trust)",
            "code": "시안 1-B",
            "name": "진주 펄 인디고 (Jinju Pearl Indigo & Gold)",
            "keywords": ["#품격있는네이비", "#진주펄골드", "#권위와품위"],
            "primary": (30, 27, 75),
            "secondary": (79, 70, 229),
            "accent": (217, 119, 6),
            "bg": (241, 245, 249),
            "surface": (255, 255, 255),
            "text_main": (15, 23, 42),
            "text_sub": (71, 85, 105),
            "desc": "심야의 남강 물결과 반짝이는 진주(Pearl)를 상징하는 딥 인디고에 은은한 샴페인 골드 포인트를 더한 최고급 품격 톤."
        },
        {
            "id": "theme_1c",
            "theme_cat": "THEME 01. 진주 남강 & 교육의 신뢰 (Heritage & Trust)",
            "code": "시안 1-C",
            "name": "촉석루 세룰리안 (Chokseok Cerulean Sky)",
            "keywords": ["#투명한남강물빛", "#시원한스카이", "#개방감"],
            "primary": (3, 105, 161),
            "secondary": (14, 165, 233),
            "accent": (16, 185, 129),
            "bg": (240, 249, 255),
            "surface": (255, 255, 255),
            "text_main": (12, 74, 96),
            "text_sub": (100, 116, 139),
            "desc": "촉석루 아래로 흐르는 남강의 청량한 물빛과 푸른 하늘을 형상화하여 시원하고 개방적인 소통 분위기를 연출합니다."
        },

        # THEME 2
        {
            "id": "theme_2a",
            "theme_cat": "THEME 02. 따뜻한 배움과 아이들의 성장 (Warm Nurture & Growth)",
            "code": "시안 2-A",
            "name": "에듀 포레스트 그린 (Edu Forest & Mint)",
            "keywords": ["#생명과새싹", "#아이들의성장", "#편안한그린"],
            "primary": (6, 95, 70),
            "secondary": (16, 185, 129),
            "accent": (245, 158, 11),
            "bg": (249, 250, 251),
            "surface": (255, 255, 255),
            "text_main": (17, 24, 39),
            "text_sub": (107, 114, 128),
            "desc": "배움의 터전에서 싱그럽게 자라나는 아이들의 새싹을 상징하며, 눈의 피로를 덜어주는 편안하고 따뜻한 자연 친화 톤."
        },
        {
            "id": "theme_2b",
            "theme_cat": "THEME 02. 따뜻한 배움과 아이들의 성장 (Warm Nurture & Growth)",
            "code": "시안 2-B",
            "name": "따스한 세이지 & 햇살 (Warm Sage & Sunlight)",
            "keywords": ["#포근한학부모공동체", "#온기있는아이보리", "#힐링케어"],
            "primary": (4, 120, 87),
            "secondary": (132, 204, 22),
            "accent": (234, 88, 12),
            "bg": (250, 248, 245),
            "surface": (255, 255, 255),
            "text_main": (28, 25, 23),
            "text_sub": (120, 113, 108),
            "desc": "따뜻한 바닐라/세이지 바탕 위에 햇살 같은 웜 오렌지 액센트를 두어 학부모들이 문턱 없이 편안하게 다가설 수 있는 온기 있는 디자인."
        },
        {
            "id": "theme_2c",
            "theme_cat": "THEME 02. 따뜻한 배움과 아이들의 성장 (Warm Nurture & Growth)",
            "code": "시안 2-C",
            "name": "청정 에메랄드 틸 (Clean Emerald Teal)",
            "keywords": ["#투명한교육자치", "#청렴한학운위", "#스마트민트"],
            "primary": (15, 118, 110),
            "secondary": (6, 182, 212),
            "accent": (251, 191, 36),
            "bg": (240, 253, 250),
            "surface": (255, 255, 255),
            "text_main": (19, 78, 74),
            "text_sub": (100, 116, 139),
            "desc": "청렴하고 공정한 학교운영위원회와 투명한 교육 자치를 상징하는 맑고 세련된 에메랄드 틸 톤."
        },

        # THEME 3
        {
            "id": "theme_3a",
            "theme_cat": "THEME 03. 모던 미니멀 & 스마트 행정 (Modern Clean & Gov Standard)",
            "code": "시안 3-A",
            "name": "KRDS 정부 표준 코발트 (Gov Standard Cobalt)",
            "keywords": ["#전자정부표준", "#무결점고가독성", "#스마트행정"],
            "primary": (29, 78, 216),
            "secondary": (71, 85, 105),
            "accent": (37, 99, 235),
            "bg": (248, 250, 252),
            "surface": (255, 255, 255),
            "text_main": (15, 23, 42),
            "text_sub": (100, 116, 139),
            "desc": "대한민국 디지털 정부 UI/UX 표준(KRDS) 지침을 충실히 반영한 스마트 코발트 블루 톤. 군더더기 없는 행정적 신뢰감의 표본."
        },
        {
            "id": "theme_3b",
            "theme_cat": "THEME 03. 모던 미니멀 & 스마트 행정 (Modern Clean & Gov Standard)",
            "code": "시안 3-B",
            "name": "스마트 슬레이트 앤 틸 (Smart Slate & Modern Teal)",
            "keywords": ["#세련된IT포털", "#차콜슬레이트", "#트렌디모던"],
            "primary": (15, 23, 42),
            "secondary": (13, 148, 136),
            "accent": (56, 189, 248),
            "bg": (241, 245, 249),
            "surface": (255, 255, 255),
            "text_main": (15, 23, 42),
            "text_sub": (100, 116, 139),
            "desc": "깊이 있는 차콜 슬레이트 헤더에 스마트 일렉트릭 틸 라인을 배치하여 최첨단 교육 플랫폼 느낌을 주는 현대적 테크 톤."
        },
        {
            "id": "theme_3c",
            "theme_cat": "THEME 03. 모던 미니멀 & 스마트 행정 (Modern Clean & Gov Standard)",
            "code": "시안 3-C",
            "name": "모노크롬 미니멀 & 로열 (Monochrome Minimalist)",
            "keywords": ["#고대비미니멀", "#극상의시인성", "#정돈된라인"],
            "primary": (24, 24, 27),
            "secondary": (113, 113, 122),
            "accent": (37, 99, 235),
            "bg": (250, 250, 250),
            "surface": (255, 255, 255),
            "text_main": (24, 24, 27),
            "text_sub": (113, 113, 122),
            "desc": "흑백의 명료한 고대비 구조로 시인성을 극대화하고, 주요 버튼에만 정밀한 로열 블루를 배치한 절제된 미니멀 디자인."
        },

        # THEME 4
        {
            "id": "theme_4a",
            "theme_cat": "THEME 04. 활기찬 교육 자치 & 상생 (Vibrant Community & Harmony)",
            "code": "시안 4-A",
            "name": "진주 하모니 코랄 & 네이비 (Jinju Harmony Coral & Navy)",
            "keywords": ["#생동감있는소통", "#다채로운에너지", "#친근한소통방"],
            "primary": (30, 41, 59),
            "secondary": (225, 29, 72),
            "accent": (245, 158, 11),
            "bg": (255, 241, 242),
            "surface": (255, 255, 255),
            "text_main": (30, 41, 59),
            "text_sub": (100, 116, 139),
            "desc": "묵직한 슬레이트 네이비 기본틀 위에 생동감 있는 코랄 로즈 포인트를 부여하여, 학부모와 학교가 함께 웃는 활기찬 학교 현장의 에너지를 담은 테마."
        }
    ]

    out_dir_public = r'C:\Users\Administrator\Desktop\anty\jinju-scca\public\designs'
    out_dir_brain = r'C:\Users\Administrator\.gemini\antigravity\brain\a041092c-9382-418d-878b-2302cedcae82\designs'

    os.makedirs(out_dir_public, exist_ok=True)
    os.makedirs(out_dir_brain, exist_ok=True)

    for p in proposals:
        file_name = f"{p['id']}.png"
        path_pub = os.path.join(out_dir_public, file_name)
        path_brain = os.path.join(out_dir_brain, file_name)

        render_proposal_card(p, path_pub, font_bold, font_reg)
        render_proposal_card(p, path_brain, font_bold, font_reg)

    print("All 10 design proposal mockups rendered successfully!")

if __name__ == '__main__':
    main()
