import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from extensions import db

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
CORS(app)

from models import User, Like, Match, Message

with app.app_context():
    db.create_all()
    # Add profile_pic column if it doesn't exist yet (SQLite migration)
    with db.engine.connect() as conn:
        columns = [row[1] for row in conn.execute(db.text("PRAGMA table_info(user)"))]
        if 'profile_pic' not in columns:
            conn.execute(db.text("ALTER TABLE user ADD COLUMN profile_pic VARCHAR(300)"))
            conn.commit()

@app.route('/')
def home():
    return "Matchmaking App Backend Running"

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

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    user = User.query.filter_by(username=data['username']).first()

    if user and user.password == data['password']:
        return jsonify({"message": "Login successful", "user_id": user.id})
    else:
        return jsonify({"message": "Invalid username or password"}), 401

@app.route('/like', methods=['POST'])
def like_user():
    data = request.get_json()
    liker_id = data['liker_id']
    liked_id = data['liked_id']

    # Prevent duplicate likes
    existing = Like.query.filter_by(liker_id=liker_id, liked_id=liked_id).first()
    if existing:
        return jsonify({"message": "Already liked this user"}), 400

    new_like = Like(liker_id=liker_id, liked_id=liked_id)
    db.session.add(new_like)

    # Check if the other person already liked this user — if so, it's a match
    mutual = Like.query.filter_by(liker_id=liked_id, liked_id=liker_id).first()
    if mutual:
        # Always store the smaller ID first to avoid duplicates
        match = Match(
            user1_id=min(liker_id, liked_id),
            user2_id=max(liker_id, liked_id)
        )
        db.session.add(match)

    db.session.commit()

    message = "It's a match!" if mutual else "Liked!"
    return jsonify({"message": message})

@app.route('/profile/<int:user_id>/bio', methods=['POST'])
def update_bio(user_id):
    data = request.get_json()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    user.bio = data.get('bio', '')
    db.session.commit()
    return jsonify({"message": "Bio updated"})

@app.route('/profile/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "bio": user.bio,
        "profile_pic": f"/uploads/{user.profile_pic}" if user.profile_pic else None
    })

@app.route('/matches/<int:user_id>', methods=['GET'])
def get_matches(user_id):
    # Find all Match rows where this user is either user1 or user2
    user_matches = Match.query.filter(
        (Match.user1_id == user_id) | (Match.user2_id == user_id)
    ).all()

    results = []
    for match in user_matches:
        # The other person is whichever side isn't the current user
        other_id = match.user2_id if match.user1_id == user_id else match.user1_id
        other_user = User.query.get(other_id)
        results.append({
            "id": other_user.id,
            "username": other_user.username,
            "bio": other_user.bio
        })

    return jsonify(results)

@app.route('/message', methods=['POST'])
def send_message():
    data = request.get_json()
    sender_id = data['sender_id']
    receiver_id = data['receiver_id']

    # Only allow messaging between matched users
    is_matched = Match.query.filter(
        (Match.user1_id == min(sender_id, receiver_id)) &
        (Match.user2_id == max(sender_id, receiver_id))
    ).first()

    if not is_matched:
        return jsonify({"message": "You can only message your matches"}), 403

    new_message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        content=data['content']
    )

    db.session.add(new_message)
    db.session.commit()

    return jsonify({"message": "Message sent"})

@app.route('/messages/<int:user1_id>/<int:user2_id>', methods=['GET'])
def get_messages(user1_id, user2_id):
    # Get all messages between two users in both directions
    messages = Message.query.filter(
        ((Message.sender_id == user1_id) & (Message.receiver_id == user2_id)) |
        ((Message.sender_id == user2_id) & (Message.receiver_id == user1_id))
    ).order_by(Message.timestamp).all()

    result = []
    for msg in messages:
        result.append({
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "content": msg.content,
            "timestamp": msg.timestamp.strftime("%H:%M")
        })

    return jsonify(result)

@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/upload/<int:user_id>', methods=['POST'])
def upload_image(user_id):
    if 'file' not in request.files:
        return jsonify({"message": "No file provided"}), 400

    file = request.files['file']

    if not allowed_file(file.filename):
        return jsonify({"message": "File type not allowed"}), 400

    # Save with a unique name: userid_originalname.ext
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"user_{user_id}.{ext}"
    file.save(os.path.join(UPLOAD_FOLDER, filename))

    # Store the filename on the user record
    user = User.query.get(user_id)
    user.profile_pic = filename
    db.session.commit()

    return jsonify({"message": "Upload successful", "filename": filename})

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()

    user_list = []
    for user in users:
        user_list.append({
            "id": user.id,
            "username": user.username,
            "bio": user.bio,
            "profile_pic": f"/uploads/{user.profile_pic}" if user.profile_pic else None
        })

    return jsonify(user_list)

if __name__ == '__main__':
    app.run(debug=True)
