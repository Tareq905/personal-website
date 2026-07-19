from email_validator import validate_email, EmailNotValidError
import re

# List of common disposable or fake domains
BLOCKED_DOMAINS = {
    "test.com", "example.com", "yopmail.com", "mailinator.com",
    "guerrillamail.com", "tempmail.com", "10minutemail.com",
    "fakemail.net", "trashmail.com", "throwawaymail.com",
    "temp-mail.org", "admin.com", "email.com"
}

def is_gibberish(text: str) -> bool:
    """Basic check for gibberish like 'fgafgasduh'."""
    # Check for 5 or more consecutive consonants (a common sign of random keyboard mashing)
    if re.search(r"[bcdfghjklmnpqrstvwxyz]{6,}", text.lower()):
        return True
    # Check for 5 or more identical consecutive characters
    if re.search(r"(.)\1{4,}", text):
        return True
    return False

def is_valid_email(email: str) -> tuple[bool, str]:
    try:
        # check_deliverability=True performs DNS checks to see if the domain accepts emails
        valid = validate_email(email, check_deliverability=True)
        domain = valid.domain.lower()
        local_part = valid.local_part.lower()

        if domain in BLOCKED_DOMAINS:
            return False, "Temporary or fake email providers are not allowed."

        if is_gibberish(local_part):
            return False, "Email address appears to be invalid or fake."

        if local_part in ["test", "admin", "fake", "dummy", "noreply"]:
            return False, "This email address is not permitted."

        return True, ""
    except EmailNotValidError as e:
        return False, str(e)
