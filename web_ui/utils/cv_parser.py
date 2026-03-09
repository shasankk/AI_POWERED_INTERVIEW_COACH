import os
import re

def extract_text_from_file(file_path):
    """
    Detects file type and extracts text accordingly.
    Supports: .pdf, .docx, .txt
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif ext == '.docx':
        return extract_text_from_docx(file_path)
    elif ext == '.txt':
        return extract_text_from_txt(file_path)
    else:
        return ""

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except ImportError:
        print("Error: pdfplumber not installed.")
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def extract_text_from_docx(docx_path):
    text = ""
    try:
        import docx
        doc = docx.Document(docx_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except ImportError:
        print("Error: python-docx not installed.")
    except Exception as e:
        print(f"Error reading DOCX: {e}")
    return text

def extract_text_from_txt(txt_path):
    try:
        with open(txt_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading TXT: {e}")
        return ""

def preprocess_text(text):
    """
    Basic cleaning: lowercase, remove special chars, extra whitespace.
    """
    if not text:
        return ""
    
    # Lowercase
    text = text.lower()
    
    # Remove special chars (keep basic punctuation for sentence structure if needed, 
    # but for SBERT, cleaner is often better, or keeping structure is fine. 
    # Let's clean mostly noise)
    text = re.sub(r'[^a-zA-Z0-9\s\.\,\+\-\#]', ' ', text)
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text
