import os
import sys

try:
    from google.cloud import storage
except ImportError:
    print("Error: google-cloud-storage is not installed.")
    print("Please install it using: pip install google-cloud-storage")
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(os.path.dirname(SCRIPT_DIR), "data", "usa_athletes.json")

def upload_to_gcs(bucket_name, source_file_name, destination_blob_name):
    """Uploads a file to the bucket."""
    # Initialize the Google Cloud Storage client
    # This automatically uses the GOOGLE_APPLICATION_CREDENTIALS environment variable
    try:
        storage_client = storage.Client()
    except Exception as e:
        print(f"Error initializing GCS Client: {e}")
        print("Make sure you have set GOOGLE_APPLICATION_CREDENTIALS to your service account key path.")
        sys.exit(1)

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    print(f"Uploading {source_file_name} to {bucket_name}/{destination_blob_name}...")
    
    try:
        blob.upload_from_filename(source_file_name)
        print(f"File {source_file_name} uploaded to {destination_blob_name} successfully!")
    except Exception as e:
        print(f"Failed to upload file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    
    if not bucket_name:
        print("Error: GCS_BUCKET_NAME environment variable not set.")
        print("Please set it before running: export GCS_BUCKET_NAME='your-bucket-name'")
        sys.exit(1)

    if not os.path.exists(DATA_FILE):
        print(f"Error: Data file {DATA_FILE} not found. Please run etl.py first.")
        sys.exit(1)

    # Use a consistent path structure in the bucket
    destination_blob_name = "data/usa_athletes.json"
    
    upload_to_gcs(bucket_name, DATA_FILE, destination_blob_name)
