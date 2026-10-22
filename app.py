import os
import sys
from pathlib import Path

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Ensure writable NLTK directory for serverless environment
os.environ.setdefault("NLTK_DATA", "/tmp/nltk_data")

from backend.app import app

if __name__ == "__main__":
    app.run()
