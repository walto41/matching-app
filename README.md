# Matching App

A full-stack dating/matching web app where users can register, swipe on other users, match, and chat with their matches.

**Live App:** https://waltermatchingapp.netlify.app

**GitHub:** https://github.com/walto41/matching-app

---

## Features

- Register and log in
- Upload a profile photo and write a bio
- Swipe right to like, left to pass (drag or buttons)
- Mutual likes create a match
- Chat in real time with your matches

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend | Python / Flask |
| Database | SQLite (via SQLAlchemy) |
| Frontend Hosting | Netlify |
| Backend Hosting | PythonAnywhere |

---

## Project Structure

```
matching-app/
├── frontend/          # React app
│   └── src/
│       └── components/
│           ├── Login.js
│           ├── Register.js
│           ├── Users.js      # swipe cards
│           ├── Matches.js
│           ├── Chat.js
│           └── Profile.js
└── backend/           # Flask API
    ├── app.py         # all routes
    ├── models.py      # User, Like, Match, Message
    ├── config.py
    ├── extensions.py
    └── wsgi.py        # PythonAnywhere entry point
```

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | /register | Create account |
| POST | /login | Log in |
| GET | /users | Get all users |
| POST | /like | Like a user |
| GET | /matches/:id | Get matches for a user |
| POST | /message | Send a message |
| GET | /messages/:id1/:id2 | Get conversation |
| GET | /profile/:id | Get profile |
| POST | /profile/:id/bio | Update bio |
| POST | /upload/:id | Upload profile photo |

---

## Running Locally

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

The frontend proxies API requests to `http://localhost:5000` in development.
