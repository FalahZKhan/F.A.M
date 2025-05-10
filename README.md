
# F.A.M: Fault-Aware Management of Energy in Smart Homes

## Welcome to F.A.M
F.A.M (Fault-Aware Management) is an AI-driven energy management system for smart homes, designed to predict energy usage, optimize appliance states, and correct faults in real-time. Powered by a Flask backend, React frontend, and MongoDB database, F.A.M achieves up to 20% energy savings using machine learning and constraint-based optimization. Meet **Buzzer**, our friendly robot mascot, who guides you through F.A.M's intelligent features!

![robot](https://github.com/user-attachments/assets/7b1bedb9-a828-4c64-aa67-93e48309ab59)

## Features
- **Real-Time Energy Prediction**: Bayesian Ridge regression with MinMaxScaler predicts energy consumption (High/Low) and estimates kWh.
- **Appliance Optimization**: Decision Tree classifier recommends optimal appliance states (e.g., "Switch AC to energy-saving mode").
- **Fault Correction**: Constraint Satisfaction Problem (CSP) solver resolves conflicts, ensuring constraints like "max 3 appliances ON" are met.
- **Interactive Dashboard**: React-based switch panel for six appliances (TV, AC, Fridge, Oven, Light, Fan) with real-time kWh tracking.
- **Environmental Insights**: PowerCast graphs show energy usage versus environmental data (time, temperature, humidity, wind speed) from Open Mateo API.
- **Scalable & IoT-Ready**: Built for integration with smart home devices and robust error handling.

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB Atlas account
- Open Mateo API key

### Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/fam-smart-home.git
   cd fam-smart-home
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   export FLASK_APP=app.py
   flask run
   ```
   - On Windows, use `set FLASK_APP=app.py` instead of `export`.

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **MongoDB Configuration**:
   - Set up a MongoDB Atlas cluster and update the connection string in `backend/config.py`.

![WhatsApp Image 2025-05-10 at 11 59 51_43f3ee60](https://github.com/user-attachments/assets/85bb4f3e-ee63-48b4-b05e-555e1c01a220)

## User Journey

### 1. Login
Start at the login page, where MongoDB securely stores user credentials. Enter your username and password to access the homepage.

![WhatsApp Image 2025-05-10 at 11 51 36_ee78032d](https://github.com/user-attachments/assets/a7e3e429-9c30-4df1-a858-0bde20b5d820)

### 2. Homepage
Upon logging in, you're greeted by **Buzzer**, who shares fun facts, like how F.A.M saves up to 20% energy with AI. From here, navigate to the dashboard to begin managing your smart home.

![WhatsApp Image 2025-05-10 at 11 42 57_8f62e5ba](https://github.com/user-attachments/assets/2d623536-6d32-42d1-9928-170515275fc1)

### 3. Dashboard
The dashboard is the heart of F.A.M, featuring a switch panel for six appliances: TV, AC, Fridge, Oven, Light, and Fan. Each appliance has preset kWh values. Toggle switches to adjust states (ON/OFF), and watch the total energy consumption update in real-time. Click "Save" to store these states in MongoDB for further analysis.

![WhatsApp Image 2025-05-10 at 11 42 57_1a6fbf15](https://github.com/user-attachments/assets/edf08340-835d-4f62-8751-7fa7d1a20ffd)

### 4. PowerCast
Navigate to the PowerCast tab to visualize your energy footprint. F.A.M uses Open Mateo data (time, temperature, humidity, wind speed) to graph how environmental factors impact energy consumption. See a detailed breakdown based on your toggled appliances.

![WhatsApp Image 2025-05-10 at 11 42 58_5b1d2143](https://github.com/user-attachments/assets/d9219826-9e24-4f81-94f9-00cf76cb4737)

### 5. Optimizer
In the Optimizer tab, F.A.M's AI shines. A **Decision Tree classifier** evaluates appliance states against constraints:
- **AC**: ON if temperature > 28°C, OFF if < 26°C.
- **Oven**: ON if temperature < 26°C and time is 10 AM–8 PM.
- **Fan**: ON if temperature > 25°C and humidity > 60%.
- **Light**: ON from 6 PM–6 AM.
- **TV**: ON from 6 PM–11 PM.
- **Fridge**: Always ON.

The **CSP solver** ensures:
- Max 3 appliances ON.
- AC and Oven are mutually exclusive (AC prioritized).
- Less critical appliances (e.g., TV, Fan) turn OFF if limits are exceeded.

If decisions repeat (e.g., AC re-evaluated), the optimizer aggregates prior choices, weighs energy savings versus user comfort, and provides recommendations like "Switch AC to energy-saving mode" or "Turn off TV."

![WhatsApp Image 2025-05-10 at 11 42 58_d5916562](https://github.com/user-attachments/assets/6611d695-ed2d-4bf2-9054-8b6e3cfd08f2)
---
![WhatsApp Image 2025-05-10 at 11 42 59_8efd2832](https://github.com/user-attachments/assets/ceb6662d-c4b4-4b33-bebf-6258cfc950cc)


## AI Models and Performance
- **Bayesian Ridge with MinMaxScaler**:
  - Accuracy: 92%
  - Precision: 91.2%
  - Recall: 94.5%
  - F1 Score: 92.8%
  - Prediction Time: 0.5 seconds
- **Decision Tree + CSP**:
  - Energy Savings: 20%
  - Optimization Time: <1 second

![image](https://github.com/user-attachments/assets/6c4a0ffc-8b0f-4d81-a96e-392473ac2c5a)

## Constraints
- Maximum 3 appliances ON simultaneously.
- AC and Oven cannot be ON together (AC prioritized).
- Appliance-specific rules based on time, temperature, and humidity.
- Total energy limits enforced (e.g., TV: 0.5 kWh max, AC: 3 kWh max).

## Development
- **Backend**: Flask, Python, scikit-learn, pymongo, constraint.
- **Frontend**: React, JavaScript.
- **Database**: MongoDB Atlas.
- **Tools**: Open Mateo API, GitHub.

## Challenges
- **CSP Complexity**: Limited to six appliances with rule-based fallbacks.
- **Noisy Data**: Mitigated with preprocessing and user correction prompts.
- **Model Loading**: Added retry mechanisms and logging.

## Team Contributions
- **Amna Shah**: Developed Bayesian Ridge and Decision Tree models, optimizer logic.
- **Muhammad Raza Khan**: Built Flask backend, MongoDB integration, API endpoints.
- **Falah Zainab**: Designed React frontend, PowerCast graphs, performance testing.

## References
- [Smart Energy Systems](https://www.mdpi.com/1996-1073/11/12/3494)
- [Confusion Matrix](https://www.geeksforgeeks.org/confusion-matrix-machine-learning/)
- [Bayesian Ridge](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.BayesianRidge.html)
- [MinMaxScaler](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.MinMaxScaler.html)
- [Scikit-learn](https://scikit-learn.org)
- [Flask](https://flask.palletsprojects.com)
- [React](https://reactjs.org)
