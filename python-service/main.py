from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import smtplib
import os
from email.message import EmailMessage

app = FastAPI()

# =========================
# ✅ CORS SAFE
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://freelancer-cashflow-guard.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ENV VARIABLES
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
# ✅ HEALTH CHECK ROUTE (Fixes UptimeRobot)
# =========================
@app.get("/")
def health():
    return {"status": "Backend is alive ✅"}

# =========================
# EMAIL SEND ROUTE
# =========================
@app.post("/send-email")
def send_email(data: EmailRequest):

    if not GMAIL_EMAIL or not GMAIL_APP_PASSWORD:
        return {
            "success": False,
            "error": "Server email credentials missing."
        }

    try:
        msg = EmailMessage()
        msg["From"] = GMAIL_EMAIL
        msg["To"] = data.to
        msg["Subject"] = data.subject
        msg.set_content(data.message)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
            smtp.send_message(msg)

        return {"success": True}

    except Exception as e:
        return {"success": False, "error": str(e)}
