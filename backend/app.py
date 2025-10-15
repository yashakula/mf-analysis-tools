from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
import csv

app = Flask(__name__)
CORS(app)

DATA_DIR = '../data'

def load_csv_simple(filename):
    """Load CSV using Python's csv module to handle embedded commas"""
    filepath = os.path.join(DATA_DIR, filename)

    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    return rows

def parse_fund_simple(rows, fund_name):
    """Parse fund data from CSV rows"""
    # Detect format by checking keys
    keys = rows[0].keys() if rows else []

    if 'Company Name' in keys:
        name_col = 'Company Name'
        weight_col = '% Portfolio Weight'
        sector_col = 'Sector'
    else:
        name_col = 'Holding Name'
        weight_col = '% Portfolio'
        sector_col = 'Sector'

    holdings = []
    for row in rows:
        try:
            name = row.get(name_col, '').strip()
            weight_str = row.get(weight_col, '0')
            sector = row.get(sector_col, 'Unknown')

            if not name or name == '':
                continue

            # Clean weight string
            weight_str = str(weight_str).replace('%', '').strip()
            if weight_str == '':
                continue

            weight = float(weight_str)

            holdings.append({
                'name': name,
                'weight': round(weight, 2),
                'sector': sector
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

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/funds')
def get_funds():
    files = [f for f in os.listdir(DATA_DIR) if f.endswith('.csv')]
    funds = [{'id': f.replace('.csv', ''), 'name': f.replace('.csv', '').replace('_', ' ').title()}
             for f in files]
    return jsonify({'funds': funds})

@app.route('/api/compare', methods=['POST'])
def compare():
    try:
        data = request.json
        fund1_file = data['fund1_id'] + '.csv'
        fund2_file = data['fund2_id'] + '.csv'

        # Load data
        rows1 = load_csv_simple(fund1_file)
        rows2 = load_csv_simple(fund2_file)

        # Parse
        fund1 = parse_fund_simple(rows1, data['fund1_id'])
        fund2 = parse_fund_simple(rows2, data['fund2_id'])

        # Calculate overlap
        fund1_holdings = {h['name']: h['weight'] for h in fund1['holdings']}
        fund2_holdings = {h['name']: h['weight'] for h in fund2['holdings']}

        common_stocks = set(fund1_holdings.keys()) & set(fund2_holdings.keys())

        overlap_percentage = 0.0
        overlapping_stocks = []

        for stock in common_stocks:
            min_weight = min(fund1_holdings[stock], fund2_holdings[stock])
            overlap_percentage += min_weight
            overlapping_stocks.append({
                'name': stock,
                'fund1_weight': fund1_holdings[stock],
                'fund2_weight': fund2_holdings[stock],
                'min_weight': round(min_weight, 2)
            })

        # Sort overlapping stocks alphabetically
        overlapping_stocks.sort(key=lambda x: x['name'])

        return jsonify({
            'success': True,
            'fund1': fund1,
            'fund2': fund2,
            'overlap': {
                'percentage': round(overlap_percentage, 2),
                'common_stocks_count': len(common_stocks),
                'stocks': overlapping_stocks
            }
        })
    except Exception as e:
        import traceback
        return jsonify({'success': False, 'error': str(e), 'trace': traceback.format_exc()}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)
