from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from analysis.portfolio_analyzer import PortfolioAnalyzer
from storage_handler import StorageHandler
from models import MutualFund
import io

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize storage handler
storage = StorageHandler()

# Cache for loaded funds
fund_cache = {}


def discover_available_funds():
    """Dynamically discover available funds from storage"""
    files = storage.list_available_files()
    funds = {}

    for filename in files:
        # Generate fund ID from filename
        fund_id = filename.replace('.csv', '').replace('_', '-')
        fund_name = filename.replace('.csv', '').replace('_', ' ').title()

        funds[fund_id] = {
            'id': fund_id,
            'name': fund_name,
            'file': filename
        }

    return funds


def get_fund(fund_id: str) -> MutualFund:
    """Load fund from cache or storage"""
    if fund_id in fund_cache:
        return fund_cache[fund_id]

    # Discover available funds
    available_funds = discover_available_funds()

    if fund_id not in available_funds:
        raise ValueError(f"Fund {fund_id} not found")

    fund_info = available_funds[fund_id]
    filename = fund_info['file']

    # Read CSV from storage (local or blob)
    df = storage.read_csv(filename)

    if df is None:
        raise ValueError(f"Could not read fund data for {fund_id}")

    # Load fund from dataframe
    fund = PortfolioAnalyzer.load_fund_from_dataframe(df, fund_info['name'])
    fund_cache[fund_id] = fund

    return fund


@app.route('/api/funds', methods=['GET'])
def list_funds():
    """List all available funds"""
    available_funds = discover_available_funds()
    return jsonify({
        'funds': list(available_funds.values()),
        'storage': storage.get_storage_info()
    })


@app.route('/api/fund/<fund_id>', methods=['GET'])
def get_fund_details(fund_id):
    """Get details for a specific fund"""
    try:
        fund = get_fund(fund_id)
        summary = PortfolioAnalyzer.get_fund_summary(fund)

        return jsonify({
            'success': True,
            'fund': summary
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400


@app.route('/api/compare', methods=['POST'])
def compare_funds():
    """Compare two mutual funds"""
    try:
        data = request.json
        fund1_id = data.get('fund1_id')
        fund2_id = data.get('fund2_id')

        if not fund1_id or not fund2_id:
            return jsonify({
                'success': False,
                'error': 'Both fund1_id and fund2_id are required'
            }), 400

        if fund1_id == fund2_id:
            return jsonify({
                'success': False,
                'error': 'Cannot compare a fund with itself'
            }), 400

        # Load funds
        fund1 = get_fund(fund1_id)
        fund2 = get_fund(fund2_id)

        # Calculate overlap
        overlap = PortfolioAnalyzer.calculate_overlap(fund1, fund2)

        # Get fund summaries
        fund1_summary = PortfolioAnalyzer.get_fund_summary(fund1)
        fund2_summary = PortfolioAnalyzer.get_fund_summary(fund2)

        return jsonify({
            'success': True,
            'overlap': {
                'fund1_name': overlap.fund1_name,
                'fund2_name': overlap.fund2_name,
                'common_stocks': overlap.common_stocks,
                'overlap_percentage': overlap.overlap_percentage,
                'weighted_overlap': overlap.weighted_overlap,
                'common_stocks_count': overlap.common_stocks_count,
                'fund1_unique_count': overlap.fund1_unique_count,
                'fund2_unique_count': overlap.fund2_unique_count,
                'sector_overlap': overlap.sector_overlap,
                'diversification_score': overlap.diversification_score
            },
            'fund1': fund1_summary,
            'fund2': fund2_summary
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/upload', methods=['POST'])
def upload_fund():
    """Upload a new fund CSV file"""
    try:
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400

        file = request.files['file']
        fund_name = request.form.get('fund_name', file.filename.replace('.csv', ''))

        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400

        if not file.filename.endswith('.csv'):
            return jsonify({
                'success': False,
                'error': 'Only CSV files are allowed'
            }), 400

        # Read file content
        content = file.read()

        # Upload to storage
        success = storage.upload_csv(file.filename, content)

        if success:
            # Clear cache to refresh available funds
            fund_cache.clear()

            return jsonify({
                'success': True,
                'message': f'Fund {fund_name} uploaded successfully',
                'filename': file.filename
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to upload file'
            }), 500

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/storage/info', methods=['GET'])
def storage_info():
    """Get storage configuration information"""
    return jsonify({
        'success': True,
        'storage': storage.get_storage_info()
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    storage_info = storage.get_storage_info()
    return jsonify({
        'status': 'healthy',
        'message': 'MF Analysis API is running',
        'storage': storage_info
    })


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    app.run(debug=debug, port=port)
