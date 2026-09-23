from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

OUT = 'output/pdf/Nikhat_Ansari_Professional_CV_Updated.pdf'
NAVY = HexColor('#163B5B')
INK = HexColor('#202A35')
MUTED = HexColor('#596675')
RULE = HexColor('#CCD8E2')


def para(text, style):
    return Paragraph(text, style)


def section(title, width, style):
    return Table([[para(title, style), '']], colWidths=[46*mm, width - 46*mm], style=TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LINEBELOW', (0, 0), (-1, -1), 0.7, RULE),
        ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))


def build():
    page_w, _ = A4
    doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=14*mm, bottomMargin=14*mm)
    width = page_w - doc.leftMargin - doc.rightMargin

    name = ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=21, leading=24, textColor=NAVY, spaceAfter=2)
    title = ParagraphStyle('title', fontName='Helvetica', fontSize=10.7, leading=13, textColor=MUTED, spaceAfter=4)
    contact = ParagraphStyle('contact', fontName='Helvetica', fontSize=9.2, leading=11.5, textColor=INK)
    section_title = ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=10.2, leading=12, textColor=NAVY)
    body = ParagraphStyle('body', fontName='Helvetica', fontSize=9.5, leading=13.1, textColor=INK, spaceAfter=0)
    role = ParagraphStyle('role', fontName='Helvetica-Bold', fontSize=9.8, leading=12.5, textColor=INK, spaceAfter=1)
    meta = ParagraphStyle('meta', fontName='Helvetica', fontSize=9, leading=11.5, textColor=MUTED)
    bullet = ParagraphStyle('bullet', fontName='Helvetica', fontSize=9.35, leading=12.6, textColor=INK, leftIndent=10, firstLineIndent=-8)
    skill_label = ParagraphStyle('skill_label', fontName='Helvetica-Bold', fontSize=9.2, leading=12, textColor=INK)
    skill_text = ParagraphStyle('skill_text', fontName='Helvetica', fontSize=9.2, leading=12, textColor=INK)

    story = [
        para('NIKHAT ANSARI', name),
        para('MERN STACK DEVELOPER  |  FRONTEND DEVELOPER', title),
        para('Pune, India 411048  |  08788156600  |  nikhat.react2026@gmail.com', contact),
        Spacer(1, 10),
        section('PROFESSIONAL SUMMARY', width, section_title),
        Spacer(1, 5),
        para('MERN Stack Developer with hands-on frontend and full-stack internship experience. Skilled in React, TypeScript, JavaScript, Node.js and NestJS, with practical experience building REST APIs, MongoDB-backed applications and modern web interfaces. Currently contributing to an AI-enabled Library Management System with role-based workflows.', body),
        Spacer(1, 12),
        section('TECHNICAL SKILLS', width, section_title),
        Spacer(1, 4),
    ]
    skills = [
        [para('Frontend', skill_label), para('React JS  |  JavaScript  |  TypeScript  |  Redux  |  HTML5  |  CSS3  |  Bootstrap', skill_text)],
        [para('Backend', skill_label), para('Node.js  |  Express.js  |  NestJS', skill_text)],
        [para('APIs & Security', skill_label), para('REST APIs  |  Swagger  |  JWT  |  Role-Based Access Control', skill_text)],
        [para('Database', skill_label), para('MongoDB  |  MySQL', skill_text)],
        [para('Tools', skill_label), para('Git  |  GitHub', skill_text)],
    ]
    story += [Table(skills, colWidths=[30*mm, width-30*mm], style=TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LINEBELOW', (0, 0), (-1, -2), 0.35, RULE),
        ('LEFTPADDING', (0, 0), (-1, -1), 2), ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 3), ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ])), Spacer(1, 12), section('INTERNSHIP EXPERIENCE', width, section_title), Spacer(1, 6),
        para('Mavin - Frontend Developer Intern', role), para('4 months', meta), Spacer(1, 6),
        para('Naxora - Full Stack Developer Intern', role), para('Current - 3 months', meta), Spacer(1, 3),
        para('Working on full-stack web development using React, TypeScript, NestJS, MongoDB and REST APIs, focused on developing and integrating practical application features.', body),
        Spacer(1, 12), section('PROJECT', width, section_title), Spacer(1, 6),
        para('AI-Enabled Library Management System', role), Spacer(1, 2),
        para('- Web-based platform for managing books, members, issue/return, fines, reservations, reports and study-seat booking.', bullet), Spacer(1, 3),
        para('- Role-based workflows for Admin, Librarian/Staff and Member across core library operations.', bullet), Spacer(1, 3),
        para('- Built with React + TypeScript, NestJS + TypeScript, MongoDB and REST APIs; Swagger used for API documentation.', bullet), Spacer(1, 3),
        para('- AI-assisted features include smart book search, recommendations, insights and a role-aware library assistant.', bullet),
        Spacer(1, 12), section('EDUCATION', width, section_title), Spacer(1, 6),
        para('B.E. (E & TC) - Electronics & Telecommunication Engineering', role), para('Completed with distinction - 73%', meta),
        Spacer(1, 12), section('LANGUAGES', width, section_title), Spacer(1, 5), para('English  |  Hindi  |  Marathi', body),
    ]
    doc.build(story)


if __name__ == '__main__':
    build()
