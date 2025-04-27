from flask import Blueprint, request, jsonify
import pickle
import numpy as np
from datetime import datetime
import os

bayesian_model = None
scaler = None
poly = None

def load_model_and_scaler():
    global bayesian_model, scaler, poly
    try:
        model_path = 'models/bayesian_model.pkl'
        scaler_path = 'models/scaler.pkl'
        poly_path = 'models/poly.pkl'
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path) or not os.path.exists(poly_path):
            raise FileNotFoundError("Model, scaler, or poly file not found")
            
        with open(model_path, 'rb') as f:
            bayesian_model = pickle.load(f)
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
        with open(poly_path, 'rb') as f:
            poly = pickle.load(f)
        print("✅ Bayesian model, scaler, and poly loaded successfully.")
    except Exception as e:
        print(f"❌ Error loading model, scaler, or poly: {e}")

load_model_and_scaler()

energy_prediction_bp = Blueprint('energy_prediction', __name__)

@energy_prediction_bp.route('/predict_energy_consumption', methods=['POST'])
def predict_energy_consumption():
    try:
        if bayesian_model is None or scaler is None or poly is None:
            return jsonify({'error': 'Model, scaler, or poly transformer not loaded'}), 500

        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400

        required_fields = ['temperatures', 'humidities', 'winds']
        if not all(field in data for field in required_fields):
            return jsonify({'error': f'Missing required fields: {", ".join(required_fields)}'}), 400

        temperatures = data['temperatures']
        humidities = data['humidities']
        winds = data['winds']

        if not (len(temperatures) == len(humidities) == len(winds) == 24):
            return jsonify({'error': 'Each of temperatures, humidities, and winds must have 24 values'}), 400

        now = datetime.now()
        month = now.month
        day = now.day

        inputs = []
        for hour in range(24):
            inputs.append([
                temperatures[hour],
                humidities[hour],
                winds[hour],
                hour,
                np.sin(2 * np.pi * hour / 24),
                np.cos(2 * np.pi * hour / 24),
                month,
                day,
                1 if datetime.now().weekday() < 5 else 0,
                1 if 17 <= hour <= 21 else 0,
                temperatures[hour] * hour,
                temperatures[hour] * (1 if 17 <= hour <= 21 else 0)
            ])

        input_array = np.array(inputs)
        input_array = poly.transform(input_array)
        input_scaled = scaler.transform(input_array)
        predictions = bayesian_model.predict(input_scaled)
        return jsonify({
            'status': 'success',
            'predictions': predictions.tolist(),
            'used_time': {
                'Month': month,
                'Day': day
            }
        }), 200

    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500