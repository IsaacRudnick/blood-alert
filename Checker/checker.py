from os import getenv as env
from dotenv import load_dotenv
from pymongo import MongoClient
import urllib.request
import json
import threading
import schedule

load_dotenv()

# Returns dictionary of user's data
def user_check(user): 
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
def check_all():
    # Connect to MongoDB -> get database 'blood sugar alert' -> get collection 'users'
    users = MongoClient(env('DBURI') + "&ssl_cert_reqs=CERT_NONE")['blood-sugar-alert']['users']

    for user in users.find():
        user_bg = user_check(user)
        
        # Report user BG
        if user_bg <= user['lowValue']:
            print(f"{user['email']}'s BG is low ({user_bg} mg/dL)")
            
        elif user_bg >= user['highValue']:
            print(f"{user['email']}'s BG is high ({user_bg} mg/dL)")
        
        else:
            print(f"{user['email']}'s BG is normal ({user_bg} mg/dL)")
            
        
# Run checker every 5 minutes
schedule.every(.1).minutes.do(lambda: threading.Thread(target=check_all).start())
    
while True:
    schedule.run_pending()