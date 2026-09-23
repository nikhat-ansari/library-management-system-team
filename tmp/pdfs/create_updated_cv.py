from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether


OUT = 'output/pdf/Nikhat_Ansari_Professional_CV_Updated.pdf'
NAVY = HexColor('#163B5B')
INK = HexColor('#1F2933')
MUTED = HexColor('#52606D')
PALE = HexColor('#E8EEF3')
ACCENT = HexColor('#2D6A8C')


def p(text, style):
    return Paragraph(text, style)


def build():
    page_w, page_h = A4
    doc = SimpleDocTemplate(
        OUT, pagesize=A4, leftMargin=16*mm, rightMargin=16*mm,
        topMargin=13*mm, bottomMargin=12*mm,
    )
    usable = page_w - doc.leftMargin - doc.rightMargin
    left_w, gap, right_w = 48*mm, 7*mm, usable - 48*mm - 7*mm

    name = ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=20, leading=22, textColor=NAVY, spaceAfter=2)
    title = ParagraphStyle('title', fontName='Helvetica', fontSize=10.3, leading=12, textColor=MUTED, spaceAfter=4)
    contact = ParagraphStyle('contact', fontName='Helvetica', fontSize=8.8, leading=11, textColor=INK)
    section = ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=NAVY, spaceBefore=0, spaceAfter=5)
    side_section = ParagraphStyle('side_section', fontName='Helvetica-Bold', fontSize=9, leading=11, textColor=NAVY, spaceBefore=8, spaceAfter=4)
    body = ParagraphStyle('body', fontName='Helvetica', fontSize=9, leading=12, textColor=INK, spaceAfter=4)
    small = ParagraphStyle('small', fontName='Helvetica', fontSize=8.4, leading=10.7, textColor=INK, spaceAfter=3)
    role = ParagraphStyle('role', fontName='Helvetica-Bold', fontSize=9.5, leading=12, textColor=INK, spaceAfter=1)
    meta = ParagraphStyle('meta', fontName='Helvetica', fontSize=8.5, leading=10.8, textColor=MUTED, spaceAfter=3)
    bullet = ParagraphStyle('bullet', fontName='Helvetica', fontSize=8.8, leading=11.6, textColor=INK, leftIndent=9, firstLineIndent=-7, spaceAfter=3)
    skill_label = ParagraphStyle('skill_label', fontName='Helvetica-Bold', fontSize=8.5, leading=10.8, textColor=INK, spaceAfter=0)

    story = []
    header = [
        p('NIKHAT ANSARI', name),
        p('MERN STACK DEVELOPER  |  FRONTEND DEVELOPER', title),
        p('Pune, India 411048  |  08788156600  |  nikhat.react2026@gmail.com', contact),
    ]
    story.append(Table([[header]], colWidths=[usable], style=TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 1.2, NAVY),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ])))
    story.append(Spacer(1, 8))

    left = [
        p('TECHNICAL SKILLS', side_section),
        p('Frontend', skill_label), p('React JS<br/>JavaScript<br/>TypeScript<br/>Redux<br/>HTML5 / CSS3<br/>Bootstrap', small),
        p('Backend', skill_label), p('Node.js<br/>Express.js<br/>NestJS', small),
        p('APIs & Security', skill_label), p('REST APIs<br/>Swagger<br/>JWT<br/>Role-Based Access Control', small),
        p('Databases', skill_label), p('MongoDB<br/>MySQL', small),
        p('Tools', skill_label), p('Git  |  GitHub', small),
        p('EDUCATION', side_section),
        p('B.E. (E & TC)', skill_label),
        p('Electronics & Telecommunication Engineering<br/>Completed with distinction - 73%', small),
        p('LANGUAGES', side_section),
        p('English<br/>Hindi<br/>Marathi', small),
    ]
    right = [
        p('PROFESSIONAL SUMMARY', section),
        p('MERN Stack Developer with hands-on frontend and full-stack internship experience. Skilled in React, TypeScript, JavaScript, Node.js and NestJS, with practical experience building REST APIs, MongoDB-backed applications and modern web interfaces. Currently contributing to an AI-enabled Library Management System with role-based workflows.', body),
        Spacer(1, 4),
        p('INTERNSHIP EXPERIENCE', section),
        p('Mavin - Frontend Developer Intern', role),
        p('4 months', meta),
        p('Naxora - Full Stack Developer Intern', role),
        p('Current - 3 months', meta),
        p('Working on full-stack web development using React, TypeScript, NestJS, MongoDB and REST APIs, focused on developing and integrating practical application features.', body),
        Spacer(1, 4),
        p('PROJECT', section),
        p('AI-Enabled Library Management System', role),
        p('- Web-based platform for books, members, issue/return, fines, reservations, reports and study-seat booking.', bullet),
        p('- Role-based workflows for Admin, Librarian/Staff and Member across core library operations.', bullet),
        p('- Built with React + TypeScript, NestJS + TypeScript, MongoDB and REST APIs; Swagger used for API documentation.', bullet),
        p('- AI-assisted features include smart book search, recommendations, insights and a role-aware library assistant.', bullet),
    ]
    columns = Table([[left, '', right]], colWidths=[left_w, gap, right_w], hAlign='LEFT', style=TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LINEAFTER', (0, 0), (0, 0), 0.6, PALE),
        ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(columns)
    doc.build(story)


if __name__ == '__main__':
    build()
