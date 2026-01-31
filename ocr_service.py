"""
OCR Service Module for Document Text Extraction
Uses EasyOCR for accurate text recognition from medical documents
"""
import easyocr
from PIL import Image
import os
import io
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OCRService:
    """
    Singleton OCR service for text extraction from images
    Initializes the EasyOCR reader once and reuses it for performance
    """
    
    _instance = None
    _reader = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OCRService, cls).__new__(cls)
            cls._initialize_reader()
        return cls._instance
    
    @classmethod
    def _initialize_reader(cls):
        """Initialize EasyOCR reader (expensive operation, done once)"""
        if cls._reader is None:
            logger.info("Initializing EasyOCR reader... (this may take 10-15 seconds)")
            try:
                # Initialize with English, GPU disabled for compatibility
                cls._reader = easyocr.Reader(['en'], gpu=False, verbose=False)
                logger.info("✓ EasyOCR reader initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize EasyOCR: {e}")
                raise
    
    def extract_text_from_image(self, image_path):
        """
        Extract text from an image file
        
        Args:
            image_path (str): Path to the image file
            
        Returns:
            dict: {
                'text': str - Extracted text (concatenated),
                'raw_results': list - Raw OCR results with bounding boxes,
                'confidence': float - Average confidence score,
                'success': bool - Whether extraction succeeded
            }
        """
        if not os.path.exists(image_path):
            logger.error(f"Image not found: {image_path}")
            return {
                'success': False,
                'error': 'File not found',
                'text': '',
                'confidence': 0.0
            }
        
        try:
            # Verify it's a valid image
            with Image.open(image_path) as img:
                img.verify()
            
            logger.info(f"Extracting text from: {image_path}")
            
            # Perform OCR
            results = self._reader.readtext(image_path)
            
            if not results:
                logger.warning(f"No text detected in: {image_path}")
                return {
                    'success': True,
                    'text': '',
                    'raw_results': [],
                    'confidence': 0.0,
                    'message': 'No text detected in image'
                }
            
            # Extract text and confidence scores
            extracted_lines = []
            confidences = []
            
            for (bbox, text, confidence) in results:
                extracted_lines.append(text)
                confidences.append(confidence)
            
            # Calculate average confidence
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            # Join text with newlines (preserve structure)
            full_text = '\n'.join(extracted_lines)
            
            logger.info(f"✓ Extracted {len(extracted_lines)} text segments (avg confidence: {avg_confidence:.2%})")
            
            return {
                'success': True,
                'text': full_text,
                'raw_results': results,
                'confidence': round(avg_confidence * 100, 2),  # Convert to percentage
                'lines_detected': len(extracted_lines)
            }
            
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'text': '',
                'confidence': 0.0
            }
    
    def extract_text_from_bytes(self, image_bytes):
        """
        Extract text from image bytes (useful for API uploads)
        
        Args:
            image_bytes (bytes): Image file content as bytes
            
        Returns:
            dict: Same as extract_text_from_image
        """
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Save temporarily (EasyOCR works best with file paths)
            import uuid
            temp_filename = f"temp_ocr_{uuid.uuid4()}.png"
            # Use temp directory
            import tempfile
            temp_path = os.path.join(tempfile.gettempdir(), temp_filename)
            image.save(temp_path)
            
            # Extract text
            result = self.extract_text_from_image(temp_path)
            
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return result
            
        except Exception as e:
            logger.error(f"OCR extraction from bytes failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'text': '',
                'confidence': 0.0
            }


# Global instance
_ocr_service = None

def get_ocr_service():
    """Get or create the singleton OCR service instance"""
    global _ocr_service
    if _ocr_service is None:
        _ocr_service = OCRService()
    return _ocr_service


# Convenience function
def extract_text(image_path):
    """
    Quick function to extract text from an image
    
    Args:
        image_path (str): Path to image file
        
    Returns:
        str: Extracted text
    """
    service = get_ocr_service()
    result = service.extract_text_from_image(image_path)
    return result.get('text', '') if result.get('success') else ''
