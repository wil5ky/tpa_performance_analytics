#!/usr/bin/env python3
"""Convert PDF performance reviews to Markdown format."""

import os
from pathlib import Path
from pypdf import PdfReader

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    try:
        reader = PdfReader(pdf_path)
        text = []
        for page in reader.pages:
            text.append(page.extract_text())
        return "\n\n".join(text)
    except Exception as e:
        return f"Error reading PDF: {e}"

def convert_pdf_to_md(pdf_path, output_dir=None):
    """Convert a PDF file to Markdown."""
    pdf_file = Path(pdf_path)
    if output_dir is None:
        output_dir = pdf_file.parent
    
    # Create output filename
    md_filename = pdf_file.stem + ".md"
    md_path = Path(output_dir) / md_filename
    
    # Extract text
    print(f"Processing: {pdf_file.name}")
    text = extract_text_from_pdf(pdf_path)
    
    # Create markdown content with title
    md_content = f"# {pdf_file.stem}\n\n"
    md_content += f"*Converted from PDF: {pdf_file.name}*\n\n"
    md_content += "---\n\n"
    md_content += text
    
    # Write to file
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    print(f"Created: {md_filename}")
    return md_path

# Main execution
if __name__ == "__main__":
    current_dir = Path(__file__).parent
    
    # List of PDFs to convert (avoiding duplicates)
    pdfs_to_convert = [
        "Q4_Performance_Summary_n1590277.pdf",
        "n1590277_2022 - PerformanceTalentReviewSummary.pdf",
        "n1590277_2023 - PerformanceTalentReviewSummary.pdf",
        "n1590277_2024 - PerformanceTalentReviewSummary.pdf"
    ]
    
    print("Converting PDFs to Markdown...\n")
    for pdf_name in pdfs_to_convert:
        pdf_path = current_dir / pdf_name
        if pdf_path.exists():
            convert_pdf_to_md(pdf_path)
        else:
            print(f"Warning: {pdf_name} not found")
    
    print("\nConversion complete!")
