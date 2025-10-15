# Mutual Fund Portfolio Overlap Analyzer

A beautiful, interactive web application for analyzing portfolio overlap between mutual funds. Compare holdings, visualize common stocks, and make informed investment decisions.

![Portfolio Overlap Analysis](https://img.shields.io/badge/Status-Ready-green)

## Features

### 📊 Comprehensive Analysis
- **Overlap Percentage**: Calculate how much two funds overlap in terms of stocks
- **Weighted Overlap**: Account for portfolio weights in overlap calculation
- **Diversification Score**: Measure how diversified your combined portfolio would be

### 📈 Beautiful Visualizations
- **Venn Diagram**: Visual representation of unique and common stocks
- **Bar Charts**: Top overlapping stocks by portfolio weight
- **Pie Charts**: Sector allocation comparison
- **Interactive Tables**: Sortable, searchable stock lists

### 🎨 Modern UI
- Responsive design that works on all devices
- Smooth animations and transitions
- Gradient colors and glassmorphism effects
- TailwindCSS styling

## Tech Stack

### Backend
- Python 3.x
- Flask - REST API framework
- Pandas - Data analysis
- NumPy - Numerical computations

### Frontend
- React 18
- Vite - Build tool
- TailwindCSS - Styling
- Recharts - Charts and graphs
- Framer Motion - Animations
- Lucide React - Icons

## Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install npm dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Start Both Servers**: Make sure both backend and frontend servers are running
2. **Open Browser**: Navigate to `http://localhost:3000`
3. **Select Funds**: Choose two mutual funds from the dropdowns
4. **Compare**: Click "Compare Funds" to see the analysis
5. **Explore**: Scroll through various visualizations and tables

## Data Format

Place your mutual fund portfolio CSV files in the `data/` directory. The application supports two formats:

### Format 1 (Zerodha-style):
```csv
Company Name,% Portfolio Weight,Sector,Market Value,Share Change %,1-Year Return
HDFC Bank Ltd,5.38,Financial Services,592173000,2.58% Increase,17.78
```

### Format 2 (Axis-style):
```csv
Holding Name,% Portfolio,Sector,Market Value (INR),Share Change %,1Yr Return (%)
Fortis Healthcare Ltd,4.14,Healthcare,12897730000,0.00,82.75
```

## API Endpoints

### GET `/api/funds`
List all available funds

### GET `/api/fund/<fund_id>`
Get details for a specific fund

### POST `/api/compare`
Compare two funds
```json
{
  "fund1_id": "zerodha_nifty_largecap",
  "fund2_id": "axis_midcap"
}
```

## Project Structure

```
mf-analysis-tools/
├── backend/
│   ├── app.py                 # Flask application
│   ├── models.py              # Data models
│   ├── requirements.txt       # Python dependencies
│   └── analysis/
│       └── portfolio_analyzer.py  # Core analysis logic
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── FundSelector.jsx
│   │   │   ├── OverviewDashboard.jsx
│   │   │   ├── VennDiagram.jsx
│   │   │   ├── OverlapBarChart.jsx
│   │   │   ├── SectorComparison.jsx
│   │   │   └── StockTable.jsx
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── data/
    ├── zerodha_nifty_largecap.csv
    └── axis_midcap_portfolio_complete.csv
```

## Analysis Metrics

### Overlap Percentage
Calculated as: `(Common Stocks / Total Unique Stocks) × 100`

### Weighted Overlap
Sum of minimum portfolio weights for common stocks. This gives a more accurate picture as it accounts for how much each fund actually invests in common stocks.

### Diversification Score
`100 - Overlap Percentage`. Higher score means more diversified when combining both funds.

### Sector Overlap
Breakdown of which sectors have the most overlap between funds.

## Adding New Funds

1. Place CSV file in `data/` directory
2. Open `backend/app.py`
3. Add entry to `AVAILABLE_FUNDS` dictionary:
```python
'your_fund_id': {
    'id': 'your_fund_id',
    'name': 'Your Fund Name',
    'file': 'your_fund_file.csv'
}
```

## Building for Production

### Frontend Build
```bash
cd frontend
npm run build
```

The production files will be in `frontend/dist/`

### Backend Production
Use a WSGI server like Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Troubleshooting

### Backend Issues
- **Port 5000 already in use**: Change the port in `app.py` and update `frontend/vite.config.js`
- **CSV parsing errors**: Ensure CSV files are properly formatted with headers
- **CORS errors**: Check Flask-CORS configuration in `app.py`

### Frontend Issues
- **API connection errors**: Verify backend is running on `http://localhost:5000`
- **Build errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- **Chart not rendering**: Check browser console for Recharts errors

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Future Enhancements

- [ ] Upload custom CSV files via UI
- [ ] Compare more than 2 funds simultaneously
- [ ] Historical overlap tracking
- [ ] Export analysis reports to PDF
- [ ] Mobile app version
- [ ] Integration with live fund data APIs
- [ ] Portfolio optimization suggestions

## Contact

For questions or feedback, please open an issue on the GitHub repository.

---

**Built with ❤️ for smarter investment decisions**
