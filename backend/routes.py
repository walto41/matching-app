from flask import request, jsonify
from extensions import db
from models import User
from app import app

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    new_user = User(
        username=data['username'],
        password=data['password'],
        bio=data.get('bio', '')
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created"})