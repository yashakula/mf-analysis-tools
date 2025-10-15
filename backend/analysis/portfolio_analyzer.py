import pandas as pd
import numpy as np
from typing import Tuple, List, Dict
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import MutualFund, StockHolding, OverlapAnalysis


class PortfolioAnalyzer:
    """Analyzes mutual fund portfolios and calculates overlap metrics"""

    @staticmethod
    def load_fund_from_csv(file_path: str, fund_name: str) -> MutualFund:
        """Load mutual fund data from CSV file"""
        df = pd.read_csv(file_path)
        return PortfolioAnalyzer.load_fund_from_dataframe(df, fund_name)

    @staticmethod
    def load_fund_from_dataframe(df: pd.DataFrame, fund_name: str) -> MutualFund:
        """Load mutual fund data from pandas DataFrame"""

        # Detect column format (different CSV formats)
        if 'Company Name' in df.columns:
            # Zerodha format
            company_col = 'Company Name'
            weight_col = '% Portfolio Weight'
            sector_col = 'Sector'
            market_value_col = 'Market Value'
            share_change_col = 'Share Change %'
            return_col = '1-Year Return'
        else:
            # Axis format
            company_col = 'Holding Name'
            weight_col = '% Portfolio'
            sector_col = 'Sector'
            market_value_col = 'Market Value (INR)'
            share_change_col = 'Share Change %'
            return_col = '1Yr Return (%)'

        holdings = []
        for _, row in df.iterrows():
            # Skip rows with missing essential data
            if pd.isna(row[company_col]) or pd.isna(row[weight_col]):
                continue

            # Parse percentage weight
            weight = row[weight_col]
            if isinstance(weight, str):
                weight = float(weight.replace('%', ''))

            # Parse market value (remove commas)
            market_value = None
            if market_value_col in df.columns and not pd.isna(row[market_value_col]):
                market_value_str = str(row[market_value_col]).replace(',', '')
                try:
                    market_value = float(market_value_str)
                except:
                    pass

            # Parse return
            one_year_return = None
            if return_col in df.columns and not pd.isna(row[return_col]):
                try:
                    one_year_return = float(row[return_col])
                except:
                    pass

            holding = StockHolding(
                company_name=row[company_col].strip(),
                portfolio_weight=weight,
                sector=row[sector_col] if not pd.isna(row[sector_col]) else 'Unknown',
                market_value=market_value,
                share_change=str(row[share_change_col]) if share_change_col in df.columns and not pd.isna(row[share_change_col]) else None,
                one_year_return=one_year_return
            )
            holdings.append(holding)

        return MutualFund(
            name=fund_name,
            holdings=holdings,
            total_stocks=len(holdings)
        )

    @staticmethod
    def normalize_company_name(name: str) -> str:
        """Normalize company names for better matching"""
        # Remove common suffixes
        suffixes = ['Ltd', 'Limited', 'Ordinary Shares', 'Inc', 'Corp', 'Corporation']
        normalized = name.strip()
        for suffix in suffixes:
            if normalized.endswith(suffix):
                normalized = normalized[:-len(suffix)].strip()
        return normalized.lower()

    @staticmethod
    def calculate_overlap(fund1: MutualFund, fund2: MutualFund) -> OverlapAnalysis:
        """Calculate overlap between two mutual funds"""

        # Create normalized name mappings
        fund1_dict = {}
        fund2_dict = {}

        for holding in fund1.holdings:
            norm_name = PortfolioAnalyzer.normalize_company_name(holding.company_name)
            fund1_dict[norm_name] = holding

        for holding in fund2.holdings:
            norm_name = PortfolioAnalyzer.normalize_company_name(holding.company_name)
            fund2_dict[norm_name] = holding

        # Find common stocks
        common_stock_names = set(fund1_dict.keys()) & set(fund2_dict.keys())

        common_stocks = []
        weighted_overlap_sum = 0.0
        sector_overlap = {}

        for norm_name in common_stock_names:
            holding1 = fund1_dict[norm_name]
            holding2 = fund2_dict[norm_name]

            # Calculate weighted overlap (minimum of the two weights)
            min_weight = min(holding1.portfolio_weight, holding2.portfolio_weight)
            weighted_overlap_sum += min_weight

            common_stocks.append({
                'company_name': holding1.company_name,
                'fund1_weight': holding1.portfolio_weight,
                'fund2_weight': holding2.portfolio_weight,
                'min_weight': min_weight,
                'sector': holding1.sector,
                'fund1_return': holding1.one_year_return,
                'fund2_return': holding2.one_year_return
            })

            # Track sector overlap
            sector = holding1.sector
            if sector not in sector_overlap:
                sector_overlap[sector] = {
                    'count': 0,
                    'fund1_weight': 0,
                    'fund2_weight': 0
                }
            sector_overlap[sector]['count'] += 1
            sector_overlap[sector]['fund1_weight'] += holding1.portfolio_weight
            sector_overlap[sector]['fund2_weight'] += holding2.portfolio_weight

        # Calculate metrics
        common_count = len(common_stock_names)
        total_unique_stocks = len(set(fund1_dict.keys()) | set(fund2_dict.keys()))
        overlap_percentage = (common_count / total_unique_stocks * 100) if total_unique_stocks > 0 else 0

        # Diversification score (0-100, higher means more diversified)
        diversification_score = 100 - overlap_percentage

        # Sort common stocks by minimum weight
        common_stocks.sort(key=lambda x: x['min_weight'], reverse=True)

        return OverlapAnalysis(
            fund1_name=fund1.name,
            fund2_name=fund2.name,
            common_stocks=common_stocks,
            overlap_percentage=round(overlap_percentage, 2),
            weighted_overlap=round(weighted_overlap_sum, 2),
            common_stocks_count=common_count,
            fund1_unique_count=len(fund1_dict) - common_count,
            fund2_unique_count=len(fund2_dict) - common_count,
            sector_overlap=sector_overlap,
            diversification_score=round(diversification_score, 2)
        )

    @staticmethod
    def get_fund_summary(fund: MutualFund) -> Dict:
        """Get summary statistics for a fund"""
        sector_allocation = fund.get_sector_allocation()

        # Top holdings
        top_holdings = sorted(fund.holdings, key=lambda x: x.portfolio_weight, reverse=True)[:10]

        return {
            'name': fund.name,
            'total_stocks': fund.total_stocks,
            'sector_allocation': sector_allocation,
            'top_holdings': [
                {
                    'company_name': h.company_name,
                    'weight': h.portfolio_weight,
                    'sector': h.sector
                }
                for h in top_holdings
            ],
            'top_sectors': sorted(
                sector_allocation.items(),
                key=lambda x: x[1],
                reverse=True
            )[:5]
        }
