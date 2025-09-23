import asyncio
import websockets
import pyautogui
import json

config = {}
with open("config.json", "r", encoding="utf-8") as f:
    config = json.load(f)

DISCONNECT_KEY = "k"

HOST = config["host"]
PORT = config["port"]

async def handler(ws):
    print("[INFO] Sender connected")
    try:
        async for msg in ws:
            print(f"[INFO] Received message: {msg}")

            if msg == "disconnect":
                pyautogui.press(DISCONNECT_KEY)

    except websockets.ConnectionClosed:
        print("[INFO] Sender disconnected")


async def main():
    async with websockets.serve(handler, HOST, PORT):
        print(f"[INFO] Receiver running at ws://{HOST}:{PORT}")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())