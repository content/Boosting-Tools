from classes.Utils import Utils
import json
from time import sleep

config = {}
with open("./config.json", "r", encoding="utf-8") as f:
    config = json.load(f)

cs_conf = config["cs"]
adv_conf = config["advanced"]
csWindowWidth, csWindowHeight = cs_conf["width"], cs_conf["height"]
isInDebugMode = adv_conf["debug"]

class Client:
    def __init__(self, start_x, start_y, screenshot=None):
        self.start_x = start_x
        self.start_y = start_y
        self.screenshot = screenshot

    def is_modal_visible(self):
        checks = cs_conf["checks"]

        img = Utils.grab_region(self.start_x, self.start_y, csWindowWidth, csWindowHeight, self.screenshot)

        # Save the image for debugging
        if isInDebugMode:
            img.save(f"./client_regions/client_{int(self.start_x / csWindowWidth)}_{int(self.start_y / csWindowHeight)}.png")
        

        results = []
        for target_hex, position in checks.items():
            pixel_color = Utils.get_pixel_hex(img, position[0], position[1])
            results.append(Utils.is_color_similar(pixel_color, target_hex, threshold=15))

        for result in results:
            if not result:
                return False

        return True
    
    def join_friend(self):
        try:
            ok_button = cs_conf["button_locations"]["ok"]
            friend_button = cs_conf["button_locations"]["friend"]
            connect_button = cs_conf["button_locations"]["connect"]
            
            base_connection_button_location = [
                self.start_x + friend_button[0],
                self.start_y + friend_button[1]
            ]

            if isInDebugMode:
                print(f"[DEBUG] Starting join_friend for client at ({self.start_x}, {self.start_y})")
            
            Utils.click_relative(self.start_x, self.start_y, 
                                ok_button[0], ok_button[1], 
                                "ok_button")
            sleep(0.5)

            Utils.click_relative(self.start_x, self.start_y, 
                                friend_button[0], friend_button[1], 
                                "friend_button")
            sleep(1)
            
            Utils.click_relative(base_connection_button_location[0], base_connection_button_location[1], 
                                connect_button[0], connect_button[1], 
                                "connect_button")
            sleep(0.3)
            
            if isInDebugMode:
                print(f"[DEBUG] Completed join_friend for client at ({self.start_x}, {self.start_y})")
            
        except KeyError as e:
            print(f"[ERROR] Missing configuration key: {e}")
        except Exception as e:
            print(f"[ERROR] Error in join_friend: {e}")