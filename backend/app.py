from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

db = SQLAlchemy(app)

CORS(app)

@app.route('/')
def home():
    return "Matchmaking App Backend Running"

import models   
import routes   

if __name__ == '__main__':
    print(app.url_map)
    app.run(debug=True)