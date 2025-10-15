"""
Vercel Serverless Function: Compare two funds
"""
from http.server import BaseHTTPRequestHandler
import json
from _data_loader import load_csv_from_blob, parse_fund_simple

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            fund1_file = data['fund1_id'] + '.csv'
            fund2_file = data['fund2_id'] + '.csv'

            # Load data
            rows1 = load_csv_from_blob(fund1_file)
            rows2 = load_csv_from_blob(fund2_file)

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

            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {
                'success': True,
                'fund1': fund1,
                'fund2': fund2,
                'overlap': {
                    'percentage': round(overlap_percentage, 2),
                    'common_stocks_count': len(common_stocks),
                    'stocks': overlapping_stocks
                }
            }
            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            import traceback
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            error = {
                'success': False,
                'error': str(e),
                'trace': traceback.format_exc()
            }
            self.wfile.write(json.dumps(error).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
