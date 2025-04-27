from flask import Blueprint, request, jsonify
from db.connection import users_collection
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId

auth_bp = Blueprint("auth", __name__)

# Signup route
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    gender = data.get("gender")

    # Check if user already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 409

    # Insert user into the collection with hashed password
    users_collection.insert_one({
        "email": email,
        "password": generate_password_hash(password),
        "firstName": first_name,
        "lastName": last_name,
        "gender": gender,
        "TV": 0,
        "AC": 0, 
        "Fridge": 0, 
        "Oven": 0, 
        "Fan": 0, 
        "Light": 0,
        "Total": 0
    })
    return jsonify({"message": "User created successfully!"}), 201

# Login route
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Check if the user exists
    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Verify password
    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    # Send back user details along with the message on successful login
    return jsonify({
        "message": "Login successful!",
        "firstName": user["firstName"], 
        "lastName": user["lastName"],    
        "gender": user["gender"],       
        "email": user["email"],
        "TV": user["TV"],
        "AC": user["AC"],
        "Fridge": user["Fridge"],
        "Oven": user["Oven"], 
        "Fan": user["Fan"], 
        "Light": user["Light"],
        "Total": user["Total"]         
    }), 200
