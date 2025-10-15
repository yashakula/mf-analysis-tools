from dataclasses import dataclass
from typing import List, Dict, Optional


@dataclass
class StockHolding:
    """Represents a single stock holding in a portfolio"""
    company_name: str
    portfolio_weight: float
    sector: str
    market_value: Optional[float] = None
    share_change: Optional[str] = None
    one_year_return: Optional[float] = None


@dataclass
class MutualFund:
    """Represents a mutual fund portfolio"""
    name: str
    holdings: List[StockHolding]
    total_stocks: int

    def get_stock_dict(self) -> Dict[str, StockHolding]:
        """Returns a dictionary mapping company names to holdings"""
        return {holding.company_name: holding for holding in self.holdings}

    def get_sector_allocation(self) -> Dict[str, float]:
        """Returns sector-wise allocation"""
        sector_dict = {}
        for holding in self.holdings:
            sector = holding.sector
            if sector in sector_dict:
                sector_dict[sector] += holding.portfolio_weight
            else:
                sector_dict[sector] = holding.portfolio_weight
        return sector_dict


@dataclass
class OverlapAnalysis:
    """Contains overlap analysis results between two funds"""
    fund1_name: str
    fund2_name: str
    common_stocks: List[Dict]
    overlap_percentage: float
    weighted_overlap: float
    common_stocks_count: int
    fund1_unique_count: int
    fund2_unique_count: int
    sector_overlap: Dict[str, Dict]
    diversification_score: float
