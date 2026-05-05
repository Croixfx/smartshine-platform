import random
from django.core.mail import send_mail
from django.conf import settings
from .models import OTPCode


def send_otp(phone, email=None):
    code = f"{random.randint(0, 999999):06d}"
    OTPCode.objects.create(phone=phone, code=code)

    print(f"\n{'='*40}")
    print(f"  [DEV OTP] {phone}: {code}")
    print(f"{'='*40}\n")

    if email:
        html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: 'DM Sans', Arial, sans-serif; background: #F8F9FA; margin: 0; padding: 0; }}
    .wrapper {{ max-width: 480px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }}
    .header {{ background: linear-gradient(160deg, #0B2740 0%, #1A5276 60%, #2E86C1 100%); padding: 32px 40px; text-align: center; }}
    .logo {{ font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }}
    .logo span {{ color: #F39C12; }}
    .body {{ padding: 40px; text-align: center; }}
    .label {{ font-size: 14px; color: #888; margin-bottom: 16px; }}
    .code {{ font-size: 48px; font-weight: 800; letter-spacing: 10px; color: #1A5276; margin: 8px 0 24px; }}
    .expiry {{ font-size: 13px; color: #888; margin-bottom: 32px; }}
    .ignore {{ font-size: 12px; color: #bbb; border-top: 1px solid #f0f0f0; padding-top: 24px; margin-top: 8px; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Smart<span>Shine</span></div>
    </div>
    <div class="body">
      <p class="label">Your verification code</p>
      <div class="code">{code}</div>
      <p class="expiry">This code expires in <strong>10 minutes</strong>.</p>
      <p class="ignore">If you didn't request this, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
"""
        try:
            send_mail(
                subject=f'SmartShine — Your verification code is {code}',
                message=f'Your SmartShine verification code is: {code}\nThis code expires in 10 minutes.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_body,
                fail_silently=True,
            )
        except Exception:
            pass  # console fallback already printed above

    return code
