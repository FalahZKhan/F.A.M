from flask import Flask
from flask_cors import CORS
from routes.energy_prediction import energy_prediction_bp
from routes.optimize import optimize_bp
from routes.update_states import update_states_bp
from routes.auth import auth_bp

app = Flask(__name__)
CORS(app)  

# Register Blueprints
app.register_blueprint(energy_prediction_bp)
app.register_blueprint(optimize_bp)
app.register_blueprint(update_states_bp)
app.register_blueprint(auth_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True, port=9000)
