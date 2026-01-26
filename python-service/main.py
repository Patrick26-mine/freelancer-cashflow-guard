from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import smtplib
import os
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# =========================
# CORS (THIS FIXES YOUR ISSUE)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite frontend
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ENV
# =========================
GMAIL_EMAIL = os.getenv("GMAIL_EMAIL")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

# =========================
# REQUEST MODEL
# =========================
class EmailRequest(BaseModel):
    to: EmailStr
    subject: str
    message: str

# =========================
# ROUTE
# =========================
@app.post("/send-email")
def send_email(data: EmailRequest):
    msg = EmailMessage()
    msg["From"] = GMAIL_EMAIL
    msg["To"] = data.to
    msg["Subject"] = data.subject
    msg.set_content(data.message)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
        smtp.send_message(msg)

    return {"success": True}
