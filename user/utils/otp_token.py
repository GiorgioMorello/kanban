from secrets import token_hex

def generate_otp(nbytes):
    return token_hex(nbytes)