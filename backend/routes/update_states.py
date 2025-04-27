from flask import Blueprint, request, jsonify
from db.connection import users_collection

update_states_bp = Blueprint("update_states", __name__)

# Appliance update route
@update_states_bp.route("/update", methods=["POST"])
def update_appliances():
    data = request.get_json()
    email = data.get("email")
    appliance_states = data.get("appliances")
    total_consumption = data.get("total")

    appliances = ["TV", "AC", "Fridge", "Oven", "Fan", "Light"]

    if not email or appliance_states is None:
        return jsonify({"message": "Email or appliances data missing"}), 400

    # Convert list to a dictionary like {"TV": 0, "AC": 1, ...}
    updates = {appliances[i]: state for i, state in enumerate(appliance_states)}

    result = users_collection.update_one(
        {"email": email},
        {"$set": {**updates, "total": total_consumption}}
    )

    if result.matched_count == 0:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"message": "Appliance states updated successfully!"}), 200
