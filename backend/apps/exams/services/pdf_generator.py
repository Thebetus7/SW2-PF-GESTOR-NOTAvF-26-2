import io
import json
import qrcode
from PIL import Image
from decimal import Decimal
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from ..models import Exam, ComponentType

class ExamPDFGenerator:
    """
    Generador de exámenes imprimibles en formato PDF con soporte de código QR de calibración.
    """

    @classmethod
    def generate(cls, exam: Exam, with_qr: bool = True) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Estilos tipográficos
        title_style = ParagraphStyle(
            'ExamTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor('#2C1810')
        )
        subtitle_style = ParagraphStyle(
            'ExamSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#8B5E3C')
        )
        instruction_style = ParagraphStyle(
            'ExamInstructions',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#4A3E38')
        )
        question_header_style = ParagraphStyle(
            'QuestionHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#2C1810')
        )
        question_text_style = ParagraphStyle(
            'QuestionText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#1A120B')
        )
        choice_style = ParagraphStyle(
            'ChoiceText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#2C1810')
        )

        story = []

        # 1. Cabecera con datos y código QR
        qr_img_flowable = None
        if with_qr and exam.has_qr_code:
            qr_payload = json.dumps({
                'exam_id': str(exam.id),
                'parallel_id': str(exam.parallel.id),
                'format': 'PHYSICAL_EXAM_V1',
            })
            qr = qrcode.QRCode(box_size=3, border=1)
            qr.add_data(qr_payload)
            qr.make(fit=True)
            img_pil = qr.make_image(fill_color="black", back_color="white")

            qr_buffer = io.BytesIO()
            img_pil.save(qr_buffer, format='PNG')
            qr_buffer.seek(0)
            qr_img_flowable = RLImage(qr_buffer, width=65, height=65)

        header_text = [
            Paragraph(f"<b>{exam.parallel.subject.name.upper()}</b> — AULA {exam.parallel.group_code} ({exam.parallel.period})", subtitle_style),
            Paragraph(exam.title, title_style),
            Paragraph(f"Docente: {exam.parallel.subject.teacher.full_name} | Fecha: {exam.application_date.strftime('%d/%m/%Y')} | Puntaje Total: {exam.total_score} pts", instruction_style),
        ]

        if qr_img_flowable:
            header_table = Table(
                [[header_text, qr_img_flowable]],
                colWidths=[460, 80]
            )
            header_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(header_table)
        else:
            for item in header_text:
                story.append(item)

        story.append(Spacer(1, 10))

        # 2. Casillas para identificación manuscrita del estudiante
        student_id_box = Table(
            [
                [
                    Paragraph("<b>ESTUDIANTE (Nombre Completo):</b> ____________________________________________________________________", question_text_style)
                ],
                [
                    Paragraph("<b>MATRÍCULA / ID:</b> [ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ][ &nbsp; ] &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>CALIFICACIÓN:</b> [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / " + str(exam.total_score) + " pts ]", question_text_style)
                ]
            ],
            colWidths=[540]
        )
        student_id_box.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#8B5E3C')),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FDF6EC')),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 1), (-1, 1), 6),
        ]))
        story.append(student_id_box)
        story.append(Spacer(1, 12))

        # 3. Instrucciones generales si existen
        if exam.description:
            story.append(Paragraph(f"<b>INSTRUCCIONES:</b> {exam.description}", instruction_style))
            story.append(Spacer(1, 10))

        # 4. Componentes y Preguntas del Examen
        components = exam.components.all().order_by('order')
        for comp in components:
            comp_elements = []

            # Encabezado de pregunta
            type_label = comp.get_type_display()
            comp_elements.append(
                Paragraph(
                    f"<b>Pregunta {comp.order}</b> ({comp.max_score} pts) — <i>[{type_label}]</i>",
                    question_header_style
                )
            )
            comp_elements.append(Spacer(1, 3))
            comp_elements.append(Paragraph(comp.prompt, question_text_style))
            comp_elements.append(Spacer(1, 6))

            rubric = comp.options_or_rubric or {}

            if comp.type == ComponentType.OPEN:
                # Recuadro rayado para respuesta manuscrita
                lines_box = Table(
                    [[''], [''], [''], ['']],
                    colWidths=[540],
                    rowHeights=[18, 18, 18, 18]
                )
                lines_box.setStyle(TableStyle([
                    ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#C4956A')),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ]))
                comp_elements.append(lines_box)

            elif comp.type == ComponentType.MULTIPLE_CHOICE:
                options = rubric.get('options', [])
                opt_rows = []
                letters = ['A', 'B', 'C', 'D', 'E', 'F']
                for idx, opt in enumerate(options):
                    letter_tag = letters[idx] if idx < len(letters) else str(idx + 1)
                    opt_rows.append([Paragraph(f"<b>( &nbsp; ) {letter_tag}.</b> {opt}", choice_style)])
                opt_table = Table(opt_rows, colWidths=[540])
                opt_table.setStyle(TableStyle([
                    ('PADDING', (0, 0), (-1, -1), 2),
                    ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ]))
                comp_elements.append(opt_table)

            elif comp.type == ComponentType.TRUE_FALSE:
                tf_table = Table(
                    [[Paragraph("<b>( &nbsp; ) VERDADERO</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>( &nbsp; ) FALSO</b>", choice_style)]],
                    colWidths=[540]
                )
                tf_table.setStyle(TableStyle([
                    ('PADDING', (0, 0), (-1, -1), 4),
                    ('LEFTPADDING', (0, 0), (-1, -1), 15),
                ]))
                comp_elements.append(tf_table)

            comp_elements.append(Spacer(1, 14))
            story.append(KeepTogether(comp_elements))

        doc.build(story)
        buffer.seek(0)
        return buffer
