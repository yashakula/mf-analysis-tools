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
    try:
        # Try to use Vercel Blob in production
        from vercel_blob import get

        # Construct blob URL from environment variable
        blob_token = os.environ.get('BLOB_READ_WRITE_TOKEN')
        if blob_token:
            # Fetch from Vercel Blob
            response = get(f"data/{filename}")
            content = response.decode('utf-8')
            reader = csv.DictReader(StringIO(content))
            return list(reader)
    except (ImportError, Exception):
        pass

    # Fallback to local files for development
    data_dir = os.path.join(os.path.dirname(__file__), '../../data')
    filepath = os.path.join(data_dir, filename)

    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

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
    try:
        from vercel_blob import list as blob_list

        blob_token = os.environ.get('BLOB_READ_WRITE_TOKEN')
        if blob_token:
            # List files in Vercel Blob
            blobs = blob_list(prefix="data/")
            funds = []
            for blob in blobs.get('blobs', []):
                filename = blob['pathname'].replace('data/', '')
                if filename.endswith('.csv'):
                    fund_id = filename.replace('.csv', '')
                    funds.append({
                        'id': fund_id,
                        'name': fund_id.replace('_', ' ').title()
                    })
            return funds
    except (ImportError, Exception):
        pass

    # Fallback to local files
    data_dir = os.path.join(os.path.dirname(__file__), '../../data')
    files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
    return [
        {
            'id': f.replace('.csv', ''),
            'name': f.replace('.csv', '').replace('_', ' ').title()
        }
        for f in files
    ]
