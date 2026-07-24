import os
import logging
import pypdf
import docx
import extract_msg
from email import message_from_bytes

logger = logging.getLogger("pharma_app.document_service")

class DocumentService:
    @staticmethod
    def extract_text(file_bytes: bytes, file_name: str) -> str:
        """Extract plain text from uploaded PDF, DOCX, TXT, or EML/MSG files."""
        ext = os.path.splitext(file_name)[1].lower()
        extracted_text = ""

        try:
            if ext == ".pdf":
                extracted_text = DocumentService._extract_pdf(file_bytes)
            elif ext == ".docx":
                extracted_text = DocumentService._extract_docx(file_bytes)
            elif ext == ".txt":
                extracted_text = file_bytes.decode("utf-8", errors="ignore")
            elif ext in [".eml", ".msg"]:
                extracted_text = DocumentService._extract_email(file_bytes, ext)
            else:
                # Default fallback attempt as text
                extracted_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            logger.error(f"Error extracting text from {file_name}: {e}")
            extracted_text = f"Error extracting document text from {file_name}: {str(e)}"

        return extracted_text.strip()

    @staticmethod
    def _extract_pdf(file_bytes: bytes) -> str:
        import io
        pdf_file = io.BytesIO(file_bytes)
        reader = pypdf.PdfReader(pdf_file)
        text_parts = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text_parts.append(t)
        return "\n".join(text_parts)

    @staticmethod
    def _extract_docx(file_bytes: bytes) -> str:
        import io
        doc_file = io.BytesIO(file_bytes)
        document = docx.Document(doc_file)
        return "\n".join([p.text for p in document.paragraphs if p.text])

    @staticmethod
    def _extract_email(file_bytes: bytes, ext: str) -> str:
        import io
        if ext == ".msg":
            try:
                msg = extract_msg.Message(io.BytesIO(file_bytes))
                return f"Subject: {msg.subject}\nFrom: {msg.sender}\n\n{msg.body}"
            except Exception:
                pass
        
        # Fallback to standard email EML parser
        msg = message_from_bytes(file_bytes)
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    body += part.get_payload(decode=True).decode("utf-8", errors="ignore") + "\n"
        else:
            body = msg.get_payload(decode=True).decode("utf-8", errors="ignore")
        
        subject = msg.get("subject", "")
        sender = msg.get("from", "")
        return f"Subject: {subject}\nFrom: {sender}\n\n{body}"

document_service = DocumentService()
