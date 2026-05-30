from PIL import Image
import pytesseract


def load_image(file_path: str) -> str:
    image = Image.open(file_path)
    return pytesseract.image_to_string(image)
