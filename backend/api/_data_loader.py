"""
Shared data loading module that works with Vercel Blob
"""
import csv
import os
from io import StringIO

def load_csv_from_blob(filename):
    """
    Load CSV from Vercel Blob storage
    In production, this will fetch from Vercel Blob
    In development, falls back to local files
    """
    blob_token = os.environ.get('BLOB_READ_WRITE_TOKEN')

    if blob_token:
        try:
            import requests

            # Vercel Blob API endpoint
            api_url = "https://blob.vercel-storage.com"
            headers = {"Authorization": f"Bearer {blob_token}"}

            # First, list blobs to find the one we want
            list_response = requests.get(
                api_url,
                headers=headers,
                params={"prefix": f"data/{filename}"}
            )

            if list_response.status_code == 200:
                data = list_response.json()
                blobs = data.get('blobs', [])

                if blobs and len(blobs) > 0:
                    # Get the download URL from the blob
                    blob_url = blobs[0].get('downloadUrl') or blobs[0].get('url')

                    if blob_url:
                        # Fetch the CSV content
                        download_response = requests.get(blob_url)
                        if download_response.status_code == 200:
                            content = download_response.text
                            reader = csv.DictReader(StringIO(content))
                            return list(reader)

        except Exception as e:
            # Log error for debugging
            print(f"Blob loading error for {filename}: {e}")
            import traceback
            traceback.print_exc()

    # Fallback to local files for development
    try:
        data_dir = os.path.join(os.path.dirname(__file__), '../../data')
        filepath = os.path.join(data_dir, filename)

        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            return list(reader)
    except Exception as e:
        print(f"Local file loading error for {filename}: {e}")
        return []

def parse_fund_simple(rows, fund_name):
    """Parse fund data from CSV rows"""
    if not rows:
        return {'fund_name': fund_name, 'holdings': [], 'total_stocks': 0}

    keys = rows[0].keys()

    if 'Company Name' in keys:
        name_col = 'Company Name'
        weight_col = '% Portfolio Weight'
    else:
        name_col = 'Holding Name'
        weight_col = '% Portfolio'

    holdings = []
    for row in rows:
        try:
            name = row.get(name_col, '').strip()
            weight_str = row.get(weight_col, '0')

            if not name or name == '':
                continue

            weight_str = str(weight_str).replace('%', '').strip()
            if weight_str == '':
                continue

            weight = float(weight_str)

            holdings.append({
                'name': name,
                'weight': round(weight, 2)
            })
        except:
            continue

    # Sort alphabetically by name
    holdings.sort(key=lambda x: x['name'])

    return {
        'fund_name': fund_name,
        'holdings': holdings,
        'total_stocks': len(holdings)
    }

def get_available_funds():
    """Get list of available funds"""
    blob_token = os.environ.get('BLOB_READ_WRITE_TOKEN')

    if blob_token:
        try:
            import requests

            # Vercel Blob API endpoint
            api_url = "https://blob.vercel-storage.com"
            headers = {"Authorization": f"Bearer {blob_token}"}

            # List all blobs with 'data/' prefix
            list_response = requests.get(
                api_url,
                headers=headers,
                params={"prefix": "data/", "limit": "1000"}
            )

            if list_response.status_code == 200:
                data = list_response.json()
                blobs = data.get('blobs', [])

                funds = []
                for blob in blobs:
                    pathname = blob.get('pathname', '')
                    # Extract filename from pathname (e.g., 'data/fund.csv' -> 'fund.csv')
                    if pathname.startswith('data/') and pathname.endswith('.csv'):
                        filename = pathname.replace('data/', '', 1)
                        fund_id = filename.replace('.csv', '')
                        funds.append({
                            'id': fund_id,
                            'name': fund_id.replace('_', ' ').title()
                        })

                return funds
            else:
                print(f"Blob API error: {list_response.status_code} - {list_response.text}")

        except Exception as e:
            print(f"Error listing funds from blob: {e}")
            import traceback
            traceback.print_exc()

    # Fallback to local files for development
    try:
        data_dir = os.path.join(os.path.dirname(__file__), '../../data')
        files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
        return [
            {
                'id': f.replace('.csv', ''),
                'name': f.replace('.csv', '').replace('_', ' ').title()
            }
            for f in files
        ]
    except Exception as e:
        print(f"Error listing local files: {e}")
        return []
