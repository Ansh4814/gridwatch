from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import io
from datetime import datetime

def generate_report(neighborhoods: list, temp_f: float, subsidy: float, moratorium: bool) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.75*inch, bottomMargin=0.75*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("title", fontSize=22, textColor=colors.HexColor("#1e3a5f"), spaceAfter=12, spaceBefore=20, alignment=TA_CENTER, fontName="Helvetica-Bold")
    subtitle_style = ParagraphStyle("subtitle", fontSize=11, textColor=colors.HexColor("#4b5563"), spaceAfter=4, alignment=TA_CENTER)
    section_style = ParagraphStyle("section", fontSize=13, textColor=colors.HexColor("#1e3a5f"), spaceBefore=16, spaceAfter=6, fontName="Helvetica-Bold")
    body_style = ParagraphStyle("body", fontSize=9, textColor=colors.HexColor("#374151"), spaceAfter=4, leading=14)
    
    story = []
    
    # Header
    story.append(Paragraph("⚡ GridWatch", title_style))
    story.append(Paragraph("Energy Poverty Risk Assessment Report — Boston, MA", subtitle_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')} | Live Temp: {temp_f}°F | Data: US Census ACS 2022", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1e3a5f"), spaceAfter=12))
    
    # Policy settings
    story.append(Paragraph("Active Policy Settings", section_style))
    policy_data = [
        ["Parameter", "Value"],
        ["Subsidy Level", f"Level {int(subsidy)} of 3" if subsidy > 0 else "None active"],
        ["Utility Moratorium", "Active" if moratorium else "Not active"],
        ["Temperature", f"{temp_f}°F (live Boston reading)"],
        ["Model", "GradientBoostingRegressor (R²=0.975)"],
        ["Data Source", "US Census ACS 2022 + Open-Meteo NOAA"],
    ]
    policy_table = Table(policy_data, colWidths=[2.5*inch, 4*inch])
    policy_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1f2937")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.HexColor("#00e5ff")),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("BACKGROUND", (0,1), (-1,-1), colors.HexColor("#f9fafb")),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.HexColor("#f9fafb"), colors.HexColor("#f3f4f6")]),
        ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#e5e7eb")),
        ("PADDING", (0,0), (-1,-1), 6),
    ]))
    story.append(policy_table)
    
    # Risk summary
    story.append(Paragraph("Neighborhood Risk Summary", section_style))
    sorted_n = sorted(neighborhoods, key=lambda x: -x["risk_score"])
    
    risk_data = [["Neighborhood", "ZIP", "Risk Score", "Risk Level", "Median Income", "Poverty Rate"]]
    for n in sorted_n:
        risk_data.append([
            n["name"],
            n.get("zip", "N/A"),
            str(n["risk_score"]),
            n["risk_level"],
            f"${n['median_income']:,}",
            f"{n['poverty_rate']*100:.1f}%",
        ])
    
    risk_table = Table(risk_data, colWidths=[1.4*inch, 0.7*inch, 0.9*inch, 0.9*inch, 1.2*inch, 0.9*inch])
    
    level_colors = {"Critical": "#d32f2f", "High": "#f57c00", "Moderate": "#fbc02d", "Low": "#388e3c"}
    style_cmds = [
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1f2937")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.HexColor("#00e5ff")),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 8),
        ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#e5e7eb")),
        ("PADDING", (0,0), (-1,-1), 5),
        ("ALIGN", (2,0), (2,-1), "CENTER"),
        ("ALIGN", (3,0), (3,-1), "CENTER"),
    ]
    for i, n in enumerate(sorted_n, 1):
        c = colors.HexColor(level_colors.get(n["risk_level"], "#374151"))
        style_cmds.append(("TEXTCOLOR", (3,i), (3,i), c))
        style_cmds.append(("FONTNAME", (3,i), (3,i), "Helvetica-Bold"))
        if i % 2 == 0:
            style_cmds.append(("BACKGROUND", (0,i), (-1,i), colors.HexColor("#f3f4f6")))
    
    risk_table.setStyle(TableStyle(style_cmds))
    story.append(risk_table)
    
    # High risk neighborhoods detail
    high_risk = [n for n in sorted_n if n["risk_level"] in ("Critical", "High")]
    if high_risk:
        story.append(Paragraph("High Priority Neighborhoods — Intervention Required", section_style))
        for n in high_risk:
            story.append(Paragraph(f"<b>{n['name']}</b> (ZIP: {n.get('zip','N/A')}) — Risk Score: {n['risk_score']}/100", body_style))
            story.append(Paragraph(
                f"Median income ${n['median_income']:,} with {n['poverty_rate']*100:.1f}% poverty rate. "
                f"Income risk factor: {n['breakdown']['income_factor']} | Poverty factor: {n['breakdown']['poverty_factor']} | "
                f"Housing factor: {n['breakdown']['housing_factor']} | Weather factor: {n['breakdown']['weather_factor']}.",
                body_style
            ))
            story.append(Spacer(1, 4))
    
    # Footer

    
    doc.build(story)
    return buffer.getvalue()
