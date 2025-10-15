# 🚀 Quick Start Guide

Get your Mutual Fund Overlap Analyzer up and running in 3 simple steps!

## Option 1: Automated Setup (Recommended)

Run the automated start script:

```bash
./start.sh
```

This will:
- Install all Python dependencies
- Install all Node.js dependencies
- Start the backend server on port 5000
- Start the frontend server on port 3000
- Open automatically in your browser

## Option 2: Manual Setup

### Step 1: Start Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend will run on `http://localhost:5000`

### Step 2: Start Frontend (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

### Step 3: Open Browser

Navigate to `http://localhost:3000`

## First Time Usage

1. **Select First Fund**: Choose "Zerodha Nifty Largecap" from the first dropdown
2. **Select Second Fund**: Choose "Axis Midcap" from the second dropdown
3. **Click Compare**: Hit the "Compare Funds" button
4. **Explore Results**: Scroll through the beautiful visualizations!

## What You'll See

### 📊 Overview Dashboard
Four key metrics cards showing:
- Overlap Percentage
- Common Stocks Count
- Weighted Overlap
- Diversification Score

### 🎯 Venn Diagram
Visual representation of unique and overlapping stocks between the two funds

### 📈 Top Overlapping Stocks Chart
Bar chart showing the top 10 stocks that appear in both funds with their respective portfolio weights

### 🥧 Sector Comparison
Two pie charts comparing sector allocation between the funds

### 📑 Detailed Stock Table
Interactive, sortable, searchable table of all common stocks with:
- Company names
- Sectors
- Portfolio weights in each fund
- Minimum overlap weight

## Adding Your Own Funds

1. Export your mutual fund portfolio to CSV format
2. Place the file in the `data/` directory
3. Update `backend/app.py` to register the new fund (see README for details)
4. Restart the backend server
5. Your fund will appear in the dropdown!

## Tips

- Use the search box in the stock table to quickly find specific companies
- Click on column headers in the table to sort
- Charts are interactive - hover over them for detailed tooltips
- The system automatically caches fund data for faster comparisons

## Troubleshooting

**Backend won't start?**
- Make sure Python 3.8+ is installed: `python3 --version`
- Try: `pip3 install -r requirements.txt`

**Frontend won't start?**
- Make sure Node.js 18+ is installed: `node --version`
- Try: `rm -rf node_modules && npm install`

**Can't connect to backend?**
- Check if backend is running on port 5000
- Look for error messages in the terminal where you started the backend

**Port already in use?**
- Backend: Change port in `backend/app.py` (line: `app.run(debug=True, port=5000)`)
- Frontend: Change port in `frontend/vite.config.js` (line: `port: 3000`)

## Need Help?

Check the full [README.md](README.md) for detailed documentation!

---

**Happy Analyzing! 📈✨**
