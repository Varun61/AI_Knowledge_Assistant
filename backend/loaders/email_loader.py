from email import policy
from email.parser import BytesParser


def load_eml(file_path: str) -> str:
    with open(file_path, "rb") as f:
        msg = BytesParser(policy=policy.default).parse(f)

    subject = msg["subject"]
    sender = msg["from"]

    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                body += part.get_content()
    else:
        body = msg.get_content()

    return f"Subject: {subject}\nFrom: {sender}\n\nBody:\n{body}"
