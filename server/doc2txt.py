import sys
from docx import Document

def docx_to_txt(input_docx, output_txt):
    # Load the DOCX file
    doc = Document(input_docx)

    # Extract text from the DOCX file
    with open(output_txt, "w", encoding="utf-8") as txt_file:
        for paragraph in doc.paragraphs:
            txt_file.write(paragraph.text + "\n")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python doc2txt.py <input_docx> <output_txt>")
        sys.exit(1)

    input_docx = sys.argv[1]
    output_txt = sys.argv[2]

    try:
        docx_to_txt(input_docx, output_txt)
        print(f"Conversion successful: {output_txt}")
    except Exception as e:
        print(f"Error during conversion: {e}")
        sys.exit(1)