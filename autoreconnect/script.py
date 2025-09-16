from classes.Client import Client
from time import sleep
import json

with open("./config.json", "r", encoding="utf-8") as f:
    config = json.load(f)

settings = config["settings"]
cs_conf = config["cs"]
adv_conf = config["advanced"]

isInDebugMode = adv_conf["debug"]
csWindowWidth, csWindowHeight = cs_conf["width"], cs_conf["height"]

while True:
    for i in range(3):
        for j in range(5):
            start_x = cs_conf["starting"][0]
            start_y = cs_conf["starting"][1]

            base_x = start_x + csWindowWidth * i
            base_y = start_y + csWindowHeight * j

            client = Client(base_x, base_y)

            if client.is_in_lobby():
                print("[INFO] Modal detected, attempting to join friend...")
                client.join_friend()

    sleep(settings["cooldown"])
