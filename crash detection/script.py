from discord_webhook import DiscordWebhook
import pyautogui, time, psutil, json

config = {}
with open("config.json", "r", encoding="utf-8") as f:
    config = json.load(f)

discord_id = config["discord_id"]
webhook_url = config["webhook_url"]

expected_cs2_count = 15
key_to_press = "end"

cs2_process_name = "cs2.exe"
cs2_pids = []

has_sent_alert = False

print("[INFO] Script has been started.")
while True:
    cs2_pids = [p.pid for p in psutil.process_iter() if p.name().lower() == cs2_process_name]
    cs2_client_count = len(cs2_pids)

    if cs2_client_count != expected_cs2_count:
        pyautogui.press(key_to_press)

        if not has_sent_alert:
            webhook = DiscordWebhook(url=webhook_url, content=f"<@{discord_id}> Not enough CS2 clients! Current count: {len(cs2_pids)} (Expected: {expected_cs2_count})")
            response = webhook.execute()

            has_sent_alert = True

            print("[INFO] Not enough CS2 clients! Sent alert to Discord.")
    
    elif has_sent_alert and cs2_client_count == expected_cs2_count:
        has_sent_alert = False
        print("[INFO] All CS2 clients are now running!")

    time.sleep(1)