import json
import pyautogui
from time import sleep
from PIL import Image, ImageDraw
import sys
import os

from classes.Client import Client
from classes.Utils import Utils

TEST_IMAGE_PATH = "image.png" # A screenshot image of the CS clients
OUTPUT_IMAGE_PATH = "test_output.png"
DOT_SIZE = 2

img = None
if os.path.exists(TEST_IMAGE_PATH):
    print(f"[INFO] Loading existing screenshot: {TEST_IMAGE_PATH}")
    img = Image.open(TEST_IMAGE_PATH).convert("RGB")
else:
    print("[INFO] Taking a new screenshot")
    img = pyautogui.screenshot().convert("RGB")

config = {}
try:
    with open("./config.json", "r", encoding="utf-8") as f:
        config = json.load(f)
except FileNotFoundError:
    print("[ERROR] config.json not found!")
    sys.exit(1)

cs_conf = config["cs"]
isInDebugMode = config["advanced"]["debug"]


csWindowWidth, csWindowHeight = cs_conf["width"], cs_conf["height"]

def test_client_detection():
    """Test the Client class modal detection functionality"""
    print("\n=== Testing Client Modal Detection ===")
    
    results = []
    for i in range(3):
        for j in range(5):
            start_x = cs_conf["starting"][0]
            start_y = cs_conf["starting"][1]

            base_x = start_x + csWindowWidth * i
            base_y = start_y + csWindowHeight * j

            client_id = f"Client[{i},{j}]"
            print(f"\n[TEST] Testing {client_id} at position ({base_x}, {base_y})")

            try:
                client = Client(base_x, base_y, screenshot=Image.open(TEST_IMAGE_PATH).convert("RGB"))
                is_modal_visible = client.is_modal_visible()

                result = {
                    'client_id': client_id,
                    'position': (base_x, base_y),
                    'modal_visible': is_modal_visible
                }
                results.append(result)
                
                print(f"[TEST] {client_id}: Modal visible = {is_modal_visible}")
                
            except Exception as e:
                print(f"[ERROR] Failed to test {client_id}: {e}")
                results.append({
                    'client_id': client_id,
                    'position': (base_x, base_y),
                    'error': str(e)
                })
    
    return results

def test_pixel_analysis():
    print("\n=== Testing Pixel Analysis ===")

    draw = ImageDraw.Draw(img)
    
    checks = cs_conf["checks"]
    
    # Test each client position
    for i in range(3):
        for j in range(5):
            start_x = cs_conf["starting"][0]
            start_y = cs_conf["starting"][1]

            base_x = start_x + csWindowWidth * i
            base_y = start_y + csWindowHeight * j

            client_id = f"Client[{i},{j}]"

            try:
                print(f"[TEST] {client_id}:")
                check_matches = []
                for target_hex, position in checks.items():
                    # Determine color distance
                    r, g, b = img.getpixel(position[0], position[1])
                    pixel_color = f"#{r:02X}{g:02X}{b:02X}"

                    distance = Utils.color_distance(pixel_color, target_hex)
                    match = Utils.is_color_similar(pixel_color, target_hex, threshold=15)
                    check_matches.append(match)

                    print(f" Color at position {position} (expected: {target_hex}: {pixel_color} [distance: {distance:.2f}] match: {match})")

                    # Draw dot
                    draw.ellipse((position[0]-DOT_SIZE, position[1]-DOT_SIZE,
                                  position[0]+DOT_SIZE, position[1]+DOT_SIZE), fill="red")


                modal_detected = all(check_matches)
                
                print(f"  Modal detected: {modal_detected}")
                
                region = img.crop((base_x, base_y, base_x + csWindowWidth, base_y + csWindowHeight))
                region_draw = ImageDraw.Draw(region)

                # Mark action points with green dots if modal detected
                if modal_detected:
                    try:

                        ok_btn = cs_conf["button_locations"]["ok"]
                        friend_btn = cs_conf["button_locations"]["friend"]
                        connect_btn = cs_conf["button_locations"]["connect"]
                        
                        ok_x = base_x + ok_btn[0]
                        ok_y = base_y + ok_btn[1]
                        friend_x = base_x + friend_btn[0]
                        friend_y = base_y + friend_btn[1]
                        connect_x = friend_x + connect_btn[0]
                        connect_y = friend_y + connect_btn[1]
                        
                        region_connect_x = friend_btn[0] + connect_btn[0]
                        region_connect_y = friend_btn[1] + connect_btn[1]

                        draw.ellipse((ok_x-DOT_SIZE, ok_y-DOT_SIZE,
                                    ok_x+DOT_SIZE, ok_y+DOT_SIZE), fill="purple")
                        draw.ellipse((friend_x-DOT_SIZE, friend_y-DOT_SIZE, 
                                    friend_x+DOT_SIZE, friend_y+DOT_SIZE), fill="green")
                        draw.ellipse((connect_x-DOT_SIZE, connect_y-DOT_SIZE, 
                                    connect_x+DOT_SIZE, connect_y+DOT_SIZE), fill="blue")
                        
                        region_draw.ellipse((ok_btn[0]-DOT_SIZE, ok_btn[1]-DOT_SIZE,
                                            ok_btn[0]+DOT_SIZE, ok_btn[1]+DOT_SIZE), fill="purple")
                        region_draw.ellipse((friend_btn[0]-DOT_SIZE, friend_btn[1]-DOT_SIZE,
                                            friend_btn[0]+DOT_SIZE, friend_btn[1]+DOT_SIZE), fill="green")
                        region_draw.ellipse((region_connect_x-DOT_SIZE, region_connect_y-DOT_SIZE, 
                                            region_connect_x+DOT_SIZE, region_connect_y+DOT_SIZE), fill="blue")

                        print("")
                        print(f"  Would click OK button at ({ok_x}, {ok_y})")
                        print(f"  Would click friend button at ({friend_x}, {friend_y})")
                        print(f"  Would click connect button at ({connect_x}, {connect_y})")
                    except KeyError as e:
                        print(f"  [WARNING] Button configuration missing: {e}")
            
            except Exception as e:
                print(f"[ERROR] Error analyzing {client_id}: {e}")

            region.save(f"./debug_regions/client_{i}_{j}_actions.png")

    # Save annotated image
    img.save(OUTPUT_IMAGE_PATH)
    print(f"\n[TEST] Annotated images saved in ./debug_regions/")
    print("[TEST] Red dots = modal check points, Purple dots = OK buttons, Green dots = friend buttons, Blue dots = connect buttons")

def test_main_script_logic():
    print("\n=== Testing Main Script Logic ===")
    
    original_click = pyautogui.click
    click_log = []
    
    def mock_click(x, y):
        click_log.append((x, y))
        print(f"[MOCK] Would click at ({x}, {y})")
    
    pyautogui.click = mock_click
    
    try:
        # Run one iteration of the main loop logic
        for i in range(3):
            for j in range(5):
                start_x = cs_conf["starting"][0]
                start_y = cs_conf["starting"][1]

                base_x = start_x + csWindowWidth * i
                base_y = start_y + csWindowHeight * j

                client = Client(base_x, base_y, screenshot=img)
                client_id = f"Client[{i},{j}]"

                print(f"[TEST] Checking {client_id} at ({base_x}, {base_y})")
                
                if client.is_modal_visible():
                    print(f"[TEST] {client_id}: Modal detected, would join friend")
                    client.join_friend()
                else:
                    print(f"[TEST] {client_id}: No modal detected")
    
    finally:
        # Restore original click function
        pyautogui.click = original_click
    
    print(f"\n[TEST] Total mock clicks performed: {len(click_log)}")
    for i, (x, y) in enumerate(click_log):
        print(f"  Click {i+1}: ({x}, {y})")

def main():
    print("=== CS Client Automation Test Suite ===")
    print(f"Debug mode: {isInDebugMode}")
    print(f"CS Window size: {csWindowWidth}x{csWindowHeight}")
    print(f"Starting position: ({cs_conf['starting'][0]}, {cs_conf['starting'][1]})")
    
    try:
        test_pixel_analysis()
        
        detection_results = test_client_detection()
        
        test_main_script_logic()
        
        print("\n=== Test Summary ===")
        modals_detected = sum(1 for r in detection_results if r.get('modal_visible', False))
        print(f"Total clients tested: {len(detection_results)}")
        print(f"Modals detected: {modals_detected}")
        
        if modals_detected > 0:
            print(f"✓ Found {modals_detected} clients with visible modals")
        else:
            print("! No modals detected - check your configuration or take a new screenshot")
        
        print(f"\nCheck {OUTPUT_IMAGE_PATH} for visual analysis of detection points")
        
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()