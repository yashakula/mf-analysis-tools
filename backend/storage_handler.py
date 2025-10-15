"""
Storage Handler - Supports both local files and Vercel Blob Storage
"""
import os
import io
import pandas as pd
from typing import Optional, List, Dict
import requests
from dotenv import load_dotenv

load_dotenv()


class StorageHandler:
    """Handles data storage for both local and cloud (Vercel Blob) sources"""

    def __init__(self):
        self.storage_type = os.getenv('STORAGE_TYPE', 'local')
        self.blob_token = os.getenv('BLOB_READ_WRITE_TOKEN')
        self.data_dir = os.getenv('DATA_DIR', '../data')

    def list_available_files(self) -> List[str]:
        """List all CSV files available in storage"""
        if self.storage_type == 'local':
            return self._list_local_files()
        else:
            return self._list_blob_files()

    def _list_local_files(self) -> List[str]:
        """List CSV files in local data directory"""
        data_path = os.path.join(os.path.dirname(__file__), self.data_dir)
        if not os.path.exists(data_path):
            return []
        return [f for f in os.listdir(data_path) if f.endswith('.csv')]

    def _list_blob_files(self) -> List[str]:
        """List CSV files in Vercel Blob Storage"""
        try:
            # Vercel Blob list API
            url = "https://blob.vercel-storage.com/list"
            headers = {"Authorization": f"Bearer {self.blob_token}"}

            response = requests.get(url, headers=headers)
            response.raise_for_status()

            blobs = response.json().get('blobs', [])
            return [blob['pathname'] for blob in blobs if blob['pathname'].endswith('.csv')]
        except Exception as e:
            print(f"Error listing blob files: {e}")
            return []

    def read_csv(self, filename: str) -> Optional[pd.DataFrame]:
        """Read CSV file from storage"""
        if self.storage_type == 'local':
            return self._read_local_csv(filename)
        else:
            return self._read_blob_csv(filename)

    def _read_local_csv(self, filename: str) -> Optional[pd.DataFrame]:
        """Read CSV from local filesystem"""
        try:
            file_path = os.path.join(
                os.path.dirname(__file__),
                self.data_dir,
                filename
            )
            return pd.read_csv(file_path)
        except Exception as e:
            print(f"Error reading local CSV {filename}: {e}")
            return None

    def _read_blob_csv(self, filename: str) -> Optional[pd.DataFrame]:
        """Read CSV from Vercel Blob Storage"""
        try:
            # Construct blob URL
            url = f"https://blob.vercel-storage.com/{filename}"
            headers = {"Authorization": f"Bearer {self.blob_token}"}

            response = requests.get(url, headers=headers)
            response.raise_for_status()

            # Read CSV from response content
            csv_content = io.StringIO(response.text)
            return pd.read_csv(csv_content)
        except Exception as e:
            print(f"Error reading blob CSV {filename}: {e}")
            return None

    def upload_csv(self, filename: str, content: bytes) -> bool:
        """Upload CSV file to storage (only for Vercel Blob)"""
        if self.storage_type == 'local':
            return self._save_local_csv(filename, content)
        else:
            return self._upload_blob_csv(filename, content)

    def _save_local_csv(self, filename: str, content: bytes) -> bool:
        """Save CSV to local filesystem"""
        try:
            file_path = os.path.join(
                os.path.dirname(__file__),
                self.data_dir,
                filename
            )
            with open(file_path, 'wb') as f:
                f.write(content)
            return True
        except Exception as e:
            print(f"Error saving local CSV {filename}: {e}")
            return False

    def _upload_blob_csv(self, filename: str, content: bytes) -> bool:
        """Upload CSV to Vercel Blob Storage"""
        try:
            url = f"https://blob.vercel-storage.com/{filename}"
            headers = {
                "Authorization": f"Bearer {self.blob_token}",
                "Content-Type": "text/csv"
            }

            response = requests.put(url, headers=headers, data=content)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Error uploading blob CSV {filename}: {e}")
            return False

    def delete_file(self, filename: str) -> bool:
        """Delete file from storage"""
        if self.storage_type == 'local':
            return self._delete_local_file(filename)
        else:
            return self._delete_blob_file(filename)

    def _delete_local_file(self, filename: str) -> bool:
        """Delete file from local filesystem"""
        try:
            file_path = os.path.join(
                os.path.dirname(__file__),
                self.data_dir,
                filename
            )
            os.remove(file_path)
            return True
        except Exception as e:
            print(f"Error deleting local file {filename}: {e}")
            return False

    def _delete_blob_file(self, filename: str) -> bool:
        """Delete file from Vercel Blob Storage"""
        try:
            url = f"https://blob.vercel-storage.com/{filename}"
            headers = {"Authorization": f"Bearer {self.blob_token}"}

            response = requests.delete(url, headers=headers)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Error deleting blob file {filename}: {e}")
            return False

    def get_storage_info(self) -> Dict:
        """Get information about current storage configuration"""
        return {
            'storage_type': self.storage_type,
            'is_local': self.storage_type == 'local',
            'is_blob': self.storage_type == 'vercel_blob',
            'data_dir': self.data_dir if self.storage_type == 'local' else None,
            'has_blob_token': bool(self.blob_token) if self.storage_type == 'vercel_blob' else None
        }
