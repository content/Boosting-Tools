from PIL import Image
import mss
import pyautogui
from time import sleep
import json

config = json.load(open("./config.json", "r", encoding="utf-8"))
isInDebugMode = config["advanced"]["debug"]
settings = config["settings"]

class Utils:
    @staticmethod
    def get_pixel_hex(img, x, y):
        try:
            r, g, b = img.getpixel((x, y))
            return f"#{r:02X}{g:02X}{b:02X}"
        except Exception as e:
            if isInDebugMode:
                print(f"[DEBUG] Error getting pixel at ({x}, {y}): {e}")
            return "#000000"
    
    @staticmethod
    def hex_to_rgb(hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    @staticmethod
    def grab_region(x, y, w, h, screenshot=None):
        try:
            if not screenshot:
                with mss.mss() as sct:
                    region = {"top": y, "left": x, "width": w, "height": h}
                    screenshot = sct.grab(region)
                    img = Image.frombytes("RGB", screenshot.size, screenshot.bgra, "raw", "BGRX")
                    return img
                
            return screenshot.crop((x, y, x + w, y + h))
        except Exception as e:
            if isInDebugMode:
                print(f"[DEBUG] Error grabbing region ({x}, {y}, {w}, {h}): {e}")
            return Image.new("RGB", (w, h), "black")
        
    @staticmethod
    def click_relative(base_x, base_y, rel_x, rel_y, label=""):
        try:
            abs_x, abs_y = base_x + rel_x, base_y + rel_y
            
            if isInDebugMode:
                print(f"[DEBUG] Clicking {label} at ({abs_x}, {abs_y})")
            
            pyautogui.moveTo(abs_x, abs_y)
            pyautogui.click(abs_x, abs_y)
            sleep(0.1) 
            
        except Exception as e:
            print(f"[ERROR] Failed to click {label} at relative ({rel_x}, {rel_y}): {e}")

    @staticmethod
    def color_distance(color1, color2):
        if isinstance(color1, str):
            color1 = Utils.hex_to_rgb(color1)
        if isinstance(color2, str):
            color2 = Utils.hex_to_rgb(color2)
        
        return ((color1[0] - color2[0]) ** 2 + 
                (color1[1] - color2[1]) ** 2 + 
                (color1[2] - color2[2]) ** 2) ** 0.5

    @staticmethod
    def is_color_similar(actual_color, target_color, threshold=10):
        distance = Utils.color_distance(actual_color, target_color)
        
        if isInDebugMode:
            print(f"[DEBUG] Color similarity - Distance: {distance:.1f}, Threshold: {threshold}")
        
        return distance <= threshold