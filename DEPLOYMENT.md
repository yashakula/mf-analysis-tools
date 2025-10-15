# Vercel Deployment Guide

This guide walks you through deploying the Mutual Fund Portfolio Analyzer to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/cli) installed: `npm i -g vercel`
3. CSV data files in the `/data` folder

## Step 1: Upload Data to Vercel Blob

First, you need to upload your CSV files to Vercel Blob storage.

### 1.1 Create a Vercel Blob Store

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Create Database**
3. Select **Blob** and create a new store
4. Note your `BLOB_READ_WRITE_TOKEN` from the store settings

### 1.2 Upload CSV Files to Blob

You can upload files using the Vercel CLI or the web interface:

**Option A: Using Vercel CLI**

```bash
# Install vercel blob CLI
npm i -g @vercel/blob

# Upload each CSV file
vercel blob put data/zerodha_nifty_largecap.csv --token YOUR_BLOB_READ_WRITE_TOKEN
vercel blob put data/axis_midcap_portfolio_complete.csv --token YOUR_BLOB_READ_WRITE_TOKEN
```

**Option B: Using the Web Interface**

1. Go to your Blob store in the Vercel dashboard
2. Click **Upload**
3. Upload each CSV file with the prefix `data/`
   - `data/zerodha_nifty_largecap.csv`
   - `data/axis_midcap_portfolio_complete.csv`

## Step 2: Deploy to Vercel

### 2.1 Link Your Project

From the project root directory:

```bash
vercel link
```

Follow the prompts to link your project to Vercel.

### 2.2 Set Environment Variables

Add the Blob token as an environment variable:

```bash
vercel env add BLOB_READ_WRITE_TOKEN
```

Paste your token when prompted. Make sure to add it for all environments (Production, Preview, Development).

Alternatively, set it in the Vercel dashboard:
1. Go to **Project Settings** → **Environment Variables**
2. Add `BLOB_READ_WRITE_TOKEN` with your token value
3. Select all environments

### 2.3 Deploy

Deploy to production:

```bash
vercel --prod
```

Your app will be deployed and you'll receive a production URL!

## Step 3: Verify Deployment

1. Visit your Vercel deployment URL
2. Select two funds from the dropdowns
3. Click "Compare Portfolios"
4. Verify that:
   - Both fund portfolios load
   - Overlap calculation is displayed
   - All data is sorted alphabetically

## Project Structure

```
mf-analysis-tools/
├── backend/
│   ├── api/
│   │   ├── _data_loader.py    # Shared data loading logic
│   │   ├── funds.py            # Serverless function: GET /api/funds
│   │   ├── compare.py          # Serverless function: POST /api/compare
│   │   └── requirements.txt    # Python dependencies
│   ├── app.py                  # Local development Flask server
│   └── requirements.txt        # Local development dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Main React app
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
├── data/
│   └── *.csv                   # CSV files (upload to Vercel Blob)
├── vercel.json                 # Vercel configuration
└── .gitignore

```

## Local Development

For local development, the app uses the Flask backend and reads from local CSV files:

```bash
# Terminal 1: Start backend
cd backend
python3 app.py

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Visit `http://localhost:3001` to test locally.

## Architecture

### Frontend
- Built with React + TypeScript + Vite
- Deployed as static files
- Uses `/api` endpoints in production, `http://localhost:5001/api` in development

### Backend
- Serverless functions in `backend/api/`
- Each endpoint is a separate Python file
- Reads data from Vercel Blob in production
- Falls back to local files in development

### Data Storage
- CSV files stored in Vercel Blob
- Accessed via `vercel-blob` Python library
- Token stored as environment variable

## API Endpoints

### GET /api/funds
Returns list of available mutual funds

**Response:**
```json
{
  "funds": [
    {"id": "zerodha_nifty_largecap", "name": "Zerodha Nifty Largecap"},
    {"id": "axis_midcap_portfolio_complete", "name": "Axis Midcap Portfolio Complete"}
  ]
}
```

### POST /api/compare
Compares two mutual funds

**Request:**
```json
{
  "fund1_id": "zerodha_nifty_largecap",
  "fund2_id": "axis_midcap_portfolio_complete"
}
```

**Response:**
```json
{
  "success": true,
  "fund1": {
    "fund_name": "zerodha_nifty_largecap",
    "holdings": [...],
    "total_stocks": 99
  },
  "fund2": {
    "fund_name": "axis_midcap_portfolio_complete",
    "holdings": [...],
    "total_stocks": 97
  },
  "overlap": {
    "percentage": 12.34,
    "common_stocks_count": 5,
    "stocks": [...]
  }
}
```

## Troubleshooting

### "Module not found" errors
Make sure `backend/api/requirements.txt` contains `vercel-blob==0.23.0`

### Data not loading
1. Verify your `BLOB_READ_WRITE_TOKEN` is set correctly
2. Check that CSV files are uploaded to Blob with the `data/` prefix
3. View logs in Vercel dashboard under **Deployments** → **Functions**

### CORS errors
The serverless functions include CORS headers. If you still see errors, check that your API routes in `vercel.json` are configured correctly.

## Adding More Funds

To add more mutual fund CSV files:

1. Upload the new CSV to Vercel Blob with prefix `data/`
2. Ensure the CSV has columns: `Company Name` or `Holding Name`, and `% Portfolio Weight` or `% Portfolio`
3. The fund will automatically appear in the dropdown

No code changes needed!
