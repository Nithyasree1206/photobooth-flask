from flask import Flask, render_template, request, jsonify
import base64, os
from datetime import datetime

app = Flask(__name__)

PHOTO_DIR = "static/photos"
os.makedirs(PHOTO_DIR, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/gallery")
def gallery():
    photos = os.listdir(PHOTO_DIR)
    photos.reverse()
    return render_template("gallery.html", photos=photos)

@app.route("/save_photo", methods=["POST"])
def save_photo():
    image_data = request.json["image"].split(",")[1]
    filename = datetime.now().strftime("%Y%m%d%H%M%S") + ".png"

    with open(f"{PHOTO_DIR}/{filename}", "wb") as f:
        f.write(base64.b64decode(image_data))

    return jsonify({"status": "saved", "file": filename})

if __name__ == "__main__":
    app.run(debug=True)
