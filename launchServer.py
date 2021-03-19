import subprocess
import threading
from random import randint
from pymongo import MongoClient
from pymongo import DESCENDING

client = MongoClient("mongodb://localhost:27017/")
database = client.whatsapp

user = database.servers.find({'status': 'reconnect'}).sort('updated_at', DESCENDING).limit(1)[0]

def generateRandomPort(n):
    range_start = 10**(n-1)
    range_end = (10**n)-1
    return randint(range_start, range_end)

def startWhatsappServer():
  subprocess.call('yarn run start:connection '+ str(generateRandomPort(4))+' '+user['user_id'], shell=True)

startWhatsappServer()

print("=== Existed Gracefully ====")

