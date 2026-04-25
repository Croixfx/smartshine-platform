from celery import shared_task
from django.conf import settings
from django.utils import timezone


@shared_task
def send_sms(recipient_id: int, phone_number: str, message: str):
    """Dispatch an SMS via Africa's Talking and persist the log."""
    from .models import SMSLog

    log = SMSLog.objects.create(
        recipient_id=recipient_id,
        phone_number=phone_number,
        message=message,
    )

    try:
        import africastalking
        africastalking.initialize(
            username=settings.AFRICASTALKING_USERNAME,
            api_key=settings.AFRICASTALKING_API_KEY,
        )
        sms = africastalking.SMS
        response = sms.send(message, [phone_number])
        recipient_data = response['SMSMessageData']['Recipients'][0]
        log.provider_message_id = recipient_data.get('messageId', '')
        log.status = SMSLog.SENT
        log.sent_at = timezone.now()
    except Exception:
        log.status = SMSLog.FAILED
        raise
    finally:
        log.save()
