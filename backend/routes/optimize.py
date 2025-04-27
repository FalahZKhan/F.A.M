import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.multioutput import MultiOutputClassifier
from flask import Blueprint, request, jsonify

optimize_bp = Blueprint('optimize', __name__)

# Load and prepare data
df = pd.read_csv('static/powerconsumption_with_appliances.csv', parse_dates=['Datetime'])
df['Day'] = df['Datetime'].dt.day
df['Month'] = df['Datetime'].dt.month
df['Hour'] = df['Datetime'].dt.hour

features = ['Day', 'Month', 'Hour', 'Temperature', 'Humidity', 'WindSpeed']
X = df[features]
y = df[['TV', 'AC', 'Oven', 'Fan', 'Light']]  # Exclude Fridge since it's always ON

# Train model
base_tree = DecisionTreeClassifier(max_depth=4, random_state=42)
multi_output_tree = MultiOutputClassifier(base_tree)
multi_output_tree.fit(X, y)

@optimize_bp.route('/optimize', methods=['POST'])
def generate_appliance_suggestions():
    try:
        if not request.data:
            return jsonify({'error': 'No data provided'}), 400

        if not request.is_json:
            return jsonify({'error': 'Content-Type must be application/json'}), 400

        data = request.get_json()
        required_fields = ['Day', 'Month', 'Hour', 'Temperature', 'Humidity', 'WindSpeed']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields: ' + ', '.join(set(required_fields) - set(data))}), 400
        
        # Extract current appliance states (optional)
        current_states = data.get('current_states', {})
        valid_appliances = list(y.columns) + ['Fridge']
        if current_states and not all(appliance in valid_appliances for appliance in current_states):
            return jsonify({'error': 'Invalid appliance in current_states: ' + ', '.join(set(current_states) - set(valid_appliances))}), 400
        
        # Validate current_states values (must be 0 or 1)
        for appliance, state in current_states.items():
            if state not in [0, 1]:
                return jsonify({'error': f'Invalid state for {appliance}: must be 0 (OFF) or 1 (ON)'}), 400
        
        # Prepare input data for prediction
        input_data = pd.DataFrame([[data['Day'], data['Month'], data['Hour'], 
                                    data['Temperature'], data['Humidity'], data['WindSpeed']]],
                                  columns=features)
        
        # Predict ideal states
        prediction = multi_output_tree.predict(input_data)[0]
        
        # Generate suggestions
        suggestions = []
        for appliance, predicted_state in zip(y.columns, prediction):
            # Get current state (default to OFF if not provided)
            current_state = current_states.get(appliance, 0)
            
            if current_state == 1 and predicted_state == 0:
                suggestions.append(f"Turn OFF {appliance}")
            elif current_state == 0 and predicted_state == 1:
                suggestions.append(f"Turn ON {appliance}")
        
        # Handle Fridge (always ON, no suggestions to turn it off)
        if 'Fridge' in current_states and current_states['Fridge'] == 0:
            suggestions.append("Turn ON Fridge")  # Suggest turning on if Fridge is OFF
        
        # Return response
        if suggestions:
            return jsonify({'suggestions': suggestions}), 200
        else:
            return jsonify({'suggestions': [], 'message': 'All appliances are in their predicted states.'}), 200

    except ValueError as ve:
        return jsonify({'error': f'Invalid JSON format: {str(ve)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500