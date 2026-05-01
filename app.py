from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np

app = Flask(__name__)

# -----------------------
# Load ML Models
# -----------------------
price_model = joblib.load("models/price_prediction_model.pkl")
rent_model = joblib.load("models/rent_prediction_model.pkl")

# -----------------------
# Home Page
# -----------------------
@app.route("/")
def home():
    return render_template("index.html")

# -----------------------
# Price Prediction
# -----------------------
@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    if not data or "features" not in data:
        return jsonify({"error": "features required"}), 400

    features = np.array(data["features"]).reshape(1, -1)

    prediction = price_model.predict(features)[0]

    return jsonify({
        "predicted_price": float(prediction)
    })

# -----------------------
# Rent Prediction
# -----------------------
@app.route("/predict_rent", methods=["POST"])
def predict_rent():

    data = request.json

    if not data or "features" not in data:
        return jsonify({"error": "features required"}), 400

    features = np.array(data["features"]).reshape(1, -1)

    prediction = rent_model.predict(features)[0]

    return jsonify({
        "predicted_rent": float(prediction)
    })


# -----------------------
# Locality Markers (Working Version)
# -----------------------

@app.route("/properties")
def properties():

    localities = [

        {
            "name": "Dwarka (Delhi)",
            "lat": 28.5921,
            "lng": 77.0460,
            "features": [1200,3,2,2,1,5,10,0,1,0,1,0,1]
        },

        {
            "name": "Saket (Delhi)",
            "lat": 28.5245,
            "lng": 77.2066,
            "features": [1100,3,2,2,1,5,10,0,1,0,1,0,1]
        },

        {
            "name": "Andheri (Mumbai)",
            "lat": 19.1136,
            "lng": 72.8697,
            "features": [900,2,2,2,1,5,10,0,1,0,1,0,1]
        },

        {
            "name": "Bandra (Mumbai)",
            "lat": 19.0596,
            "lng": 72.8295,
            "features": [1000,2,2,2,1,5,10,0,1,0,1,0,1]
        },

        {
            "name": "DLF Phase 3 (Gurgaon)",
            "lat": 28.4939,
            "lng": 77.0931,
            "features": [1300,3,2,2,1,5,10,0,1,0,1,0,1]
        },

        {
            "name": "Sector 56 (Gurgaon)",
            "lat": 28.4211,
            "lng": 77.1031,
            "features": [1250,3,2,2,1,5,10,0,1,0,1,0,1]
        }

    ]

    return jsonify(localities)


# -----------------------
# Run Server
# -----------------------

if __name__ == "__main__":
    app.run(debug=True)
