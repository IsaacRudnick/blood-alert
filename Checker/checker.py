from os import getenv as env
from dotenv import load_dotenv
from pymongo import MongoClient
import urllib.request
import json

# For async scheduling
import asyncio
import aioschedule as schedule
import time

load_dotenv()

# Returns dictionary of user's data
async def user_check(user): 
    url = f"https://{user['userDataSource']}/api/v2/entries.json?count=1"
    try: 
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read())[0]
            return data['sgv']
            
    # Retries if there's an error. 
    except:
        print("(Connection) error; retrying")
        return False

# This function checks every user's BG bg and prints whether it's above, below, or within their target range.
async def check_all():
    # Connect to MongoDB -> get database 'blood sugar alert' -> get collection 'users'
    users = MongoClient(env('DBURI') + "&ssl_cert_reqs=CERT_NONE")['blood-sugar-alert']['users']


    for user in users.find():
        user_bg = await user_check(user) 
        
        # Report user BG
        if user_bg <= user['lowValue']:
            print(f"{user['email']}'s BG is low ({user_bg} mg/dL)")
            
        elif user_bg >= user['highValue']:
            print(f"{user['email']}'s BG is high ({user_bg} mg/dL)")
        
        else:
            print(f"{user['email']}'s BG is normal ({user_bg} mg/dL)")
            


# Run checker every 5 minutes
schedule.every(.5).minutes.do(check_all)

loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

while True:
    loop.run_until_complete(schedule.run_pending())
