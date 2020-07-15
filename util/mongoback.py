#encode=utf-8
import os
from config import mongo_back_path
import time

def back_mongo():
    path = mongo_back_path+"/"+str(time.time())
    command = "mkdir " + path
    back_mongo_command = "/usr/bin/mongodump -d ss -o "+path
    try:
        os.system(command)
        os.system(back_mongo_command)
        return True
    except Exception as e:
        pass
        return False

# if __name__ == "__main__":
    # back_mongo()
