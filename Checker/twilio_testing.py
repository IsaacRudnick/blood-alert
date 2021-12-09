from os import getenv as env
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

account_sid = env('TWILIO_ACCOUNT_SID')
auth_token = env('TWILIO_AUTH_TOKEN')
client = Client(account_sid, auth_token)

message = client.messages.create(
                     body="Whooo",
                     from_='+2158961221',
                     to='+16102998308')

print(message.sid)
