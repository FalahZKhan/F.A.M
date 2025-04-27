import pandas as pd

# Load the dataset
df = pd.read_csv('static/powerconsumption_aggregated.csv', parse_dates=['Datetime'])

# Extract hour for time-based constraints
df['Hour'] = df['Datetime'].dt.hour

# Initialize appliance columns
df['Fridge'] = 1  # Always ON

# Function to compute appliance states per row with constraints
def apply_constraints(row):
    temp = row['Temperature']
    humidity = row['Humidity']
    hour = row['Hour']

    # Initial appliance states based on individual rules
    ac = 1 if temp > 28 else (0 if temp <= 26 else 0)
    oven = 1 if (temp < 26 and 10 <= hour <= 20) else 0
    fan = 1 if (temp > 25 and humidity > 60) else 0
    light = 1 if (hour >= 18 or hour <= 6) else 0
    tv = 1 if (18 <= hour <= 23) else 0
    fridge = 1

    # Pack into list for manipulation
    appliance_values = {'TV': tv, 'AC': ac, 'Fridge': fridge, 'Oven': oven, 'Fan': fan, 'Light': light}

    # Apply CSP constraints
    # Constraint: AC and Oven cannot both be ON
    if ac == 1 and oven == 1:
        # Prefer keeping the one with higher activation condition
        # (Assume Oven used less critically than AC)
        oven = 0
        appliance_values['Oven'] = 0

    # Constraint: Max 3 appliances ON
    while sum(appliance_values.values()) > 3:
        # Try to turn OFF least critical appliance first (TV, Fan, Light, Oven, AC)
        for key in ['TV', 'Fan', 'Light', 'Oven', 'AC']:
            if appliance_values[key] == 1:
                appliance_values[key] = 0
                break

    return pd.Series(appliance_values)

# Apply constraints row-wise
df[['TV', 'AC', 'Fridge', 'Oven', 'Fan', 'Light']] = df.apply(apply_constraints, axis=1)
print(df.head(24))
df.to_csv('static/powerconsumption_with_appliances.csv', index=False)
