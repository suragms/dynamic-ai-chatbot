import os
import sys
from pathlib import Path

# Add project root to python path so backend package can be imported
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Ensure writable NLTK directory for serverless environment
os.environ.setdefault("NLTK_DATA", "/tmp/nltk_data")

from backend.app import create_app

app = create_app()
