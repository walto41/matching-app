import sys
import os

# Replace 'yourusername' with your actual PythonAnywhere username
path = '/home/yourusername/matching-app/backend'
if path not in sys.path:
    sys.path.insert(0, path)

os.chdir(path)

from app import app as application
