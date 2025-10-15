"""
Vercel Serverless Function: Get available funds
"""
from http.server import BaseHTTPRequestHandler
import json
from _data_loader import get_available_funds

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            funds = get_available_funds()

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            response = {'funds': funds}
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            error = {'error': str(e)}
            self.wfile.write(json.dumps(error).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
