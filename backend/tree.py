import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.tree import export_graphviz
import graphviz
import re
import os

# Load and prepare data
try:
    df = pd.read_csv('static/powerconsumption_with_appliances.csv', parse_dates=['Datetime'])
except FileNotFoundError:
    print("Error: 'powerconsumption_with_appliances.csv' not found.")
    exit(1)
except pd.errors.ParserError:
    print("Error: Unable to parse 'powerconsumption_with_appliances.csv'. Please check the file format.")
    exit(1)

df['Day'] = df['Datetime'].dt.day
df['Month'] = df['Datetime'].dt.month
df['Hour'] = df['Datetime'].dt.hour

features = ['Day', 'Month', 'Hour', 'Temperature', 'Humidity', 'WindSpeed']
X = df[features]
y = df[['Fridge', 'TV', 'AC', 'Oven', 'Fan', 'Light']]

# Train model
try:
    base_tree = DecisionTreeClassifier(max_depth=4, random_state=42)
    multi_output_tree = MultiOutputClassifier(base_tree)
    multi_output_tree.fit(X, y)
except Exception as e:
    print(f"Error: Failed to train the model: {str(e)}")
    exit(1)

# Function to make tree labels user-friendly
def make_dot_user_friendly(dot_data):
    # Replace 'gini' with 'Decision based on'
    dot_data = re.sub(r'gini = [0-9.]+', 'Decision based on', dot_data)
    # Replace 'samples' with 'Number of cases'
    dot_data = re.sub(r'samples = [0-9]+', lambda m: f"Number of cases = {m.group().split('=')[1].strip()}", dot_data)
    # Replace 'value' with 'Outcome'
    dot_data = re.sub(r'value = \[([0-9]+), ([0-9]+)\]', lambda m: f"Outcome: {m.group(1)} OFF, {m.group(2)} ON", dot_data)
    return dot_data

# Function to customize tree appearance
def customize_dot_appearance(dot_data, edge_color="white"):
    # Add transparent background
    dot_data = dot_data.replace('digraph Tree {', f'digraph Tree {{\nbgcolor="transparent";\nedge [color="{edge_color}", fontcolor="{edge_color}", pencolor="{edge_color}", arrowhead="normal", color="{edge_color}"];\n')
    # Ensure all edges are white, including arrowheads
    dot_data = re.sub(r'(\d+\s*->\s*\d+\s*\[.*?)(?=\])', f'\\1 color="{edge_color}" fontcolor="{edge_color}" pencolor="{edge_color}"', dot_data)
    # Customize node colors to match the image (orange for OFF, blue for ON)
    def replace_node_color(match):
        node_def = match.group(0)
        if 'ON' in node_def and '0 OFF' in node_def:  # Pure ON nodes (e.g., "0 OFF, 10 ON")
            return node_def.replace('fillcolor="#', 'fillcolor="#00BFFF')  # Blue
        else:  # OFF or mixed nodes (e.g., "4104 OFF, 0 ON" or "4244 OFF, 10 ON")
            return node_def.replace('fillcolor="#', 'fillcolor="#FFA500')  # Orange
    dot_data = re.sub(r'\d+ \[label=.*?style="filled".*?\]', replace_node_color, dot_data)
    return dot_data

# Export decision trees
for i, appliance in enumerate(y.columns):
    try:
        dot_data = export_graphviz(
            multi_output_tree.estimators_[i],
            out_file=None,
            feature_names=features,
            class_names=['OFF', 'ON'],
            filled=True,
            rounded=True,
            special_characters=True
        )
        # Apply modifications
        dot_data = make_dot_user_friendly(dot_data)
        dot_data = customize_dot_appearance(dot_data, edge_color="white")
        
        # Check if file exists before writing
        dot_file = f'decision_tree_{appliance}.dot'
        png_file = f'decision_tree_{appliance}.png'
        if os.path.exists(dot_file) or os.path.exists(png_file):
            print(f"Warning: Files for {appliance} already exist and will be overwritten.")
        
        # Write DOT file
        with open(dot_file, 'w') as f:
            f.write(dot_data)
        
        # Render the graph
        graph = graphviz.Source(dot_data)
        graph.render(f'decision_tree_{appliance}', format='png', cleanup=True)
        print(f"Generated decision tree for {appliance}")
    except Exception as e:
        print(f"Error: Failed to generate decision tree for {appliance}: {str(e)}")

if __name__ == '__main__':
    print("Decision tree files generated for all appliances.")