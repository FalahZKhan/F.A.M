import pandas as pd
import numpy as np
import pickle
import os
from sklearn.linear_model import BayesianRidge
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error

# Directory for saving models
save_dir = 'models'
os.makedirs(save_dir, exist_ok=True)

# Path to dataset
dataset_path = 'static/powerconsumption_aggregated.csv'

# Load and preprocess data
def load_data_from_csv(path):
    df = pd.read_csv(path)
    
    # Convert Datetime to datetime object
    df['Datetime'] = pd.to_datetime(df['Datetime'])
    
    # Extract hour, month, day, and new features
    df['Hour'] = df['Datetime'].dt.hour
    df['Month'] = df['Datetime'].dt.month
    df['Day'] = df['Datetime'].dt.day
    df['Is_Weekday'] = df['Datetime'].dt.weekday.apply(lambda x: 1 if x < 5 else 0)
    df['Is_Evening'] = df['Hour'].apply(lambda x: 1 if 17 <= x <= 21 else 0)
    
    # Cyclical encoding for Hour
    df['Hour_sin'] = np.sin(2 * np.pi * df['Hour'] / 24)
    df['Hour_cos'] = np.cos(2 * np.pi * df['Hour'] / 24)
    
    # Interaction term
    df['Temp_Hour_Interaction'] = df['Temperature'] * df['Hour']
    df['Temp_Evening_Interaction'] = df['Temperature'] * df['Is_Evening']
    
    # Extract features and target
    X = df[['Temperature', 'Humidity', 'WindSpeed', 'Hour', 'Hour_sin', 'Hour_cos', 'Month', 'Day', 'Is_Weekday', 'Is_Evening', 'Temp_Hour_Interaction', 'Temp_Evening_Interaction']].values
    y = df['Consumption'].values
    
    return X, y

# Train and save the model
def train_bayesian_model():
    # Load data
    X, y = load_data_from_csv(dataset_path)
    
    # Add polynomial features (e.g., Hour^2, Temperature^2)
    poly = PolynomialFeatures(degree=2, include_bias=False)
    X = poly.fit_transform(X)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Standardize features
    scaler = MinMaxScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Initialize and train Bayesian Ridge model
    model = BayesianRidge(alpha_1=1e-6, lambda_1=1e-6)  # Tune regularization
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test_scaled)
    mse = mean_squared_error(y_test, y_pred)
    print(f"Mean Squared Error on test set: {mse:.4f}")
    
    # Feature coefficients
    feature_names = poly.get_feature_names_out(['Temperature', 'Humidity', 'WindSpeed', 'Hour', 'Hour_sin', 'Hour_cos', 'Month', 'Day', 'Is_Weekday', 'Is_Evening', 'Temp_Hour_Interaction', 'Temp_Evening_Interaction'])
    for name, coef in zip(feature_names, model.coef_):
        print(f"Feature {name}: {coef:.4f}")
    
    # Save model, scaler, and polynomial transformer
    model_path = os.path.join(save_dir, 'bayesian_model.pkl')
    scaler_path = os.path.join(save_dir, 'scaler.pkl')
    poly_path = os.path.join(save_dir, 'poly.pkl')
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    with open(poly_path, 'wb') as f:
        pickle.dump(poly, f)
    
    print("✅ Bayesian model trained and saved.")

# Run the training
if __name__ == "__main__":
    train_bayesian_model()