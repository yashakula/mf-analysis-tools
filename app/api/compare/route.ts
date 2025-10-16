import { NextRequest, NextResponse } from 'next/server';
import { loadFund } from '../../../lib/dataLoader';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fund1_id, fund2_id } = body;

    if (!fund1_id || !fund2_id) {
      return NextResponse.json(
        { error: 'Missing fund IDs' },
        { status: 400 }
      );
    }

    // Load both funds
    const fund1 = await loadFund(fund1_id);
    const fund2 = await loadFund(fund2_id);

    // Calculate overlap
    const fund1Holdings = new Map(
      fund1.holdings.map((h) => [h.name, h.weight])
    );
    const fund2Holdings = new Map(
      fund2.holdings.map((h) => [h.name, h.weight])
    );

    const commonStocks = [...fund1Holdings.keys()].filter((name) =>
      fund2Holdings.has(name)
    );

    let overlapPercentage = 0;
    const overlappingStocks = commonStocks.map((stock) => {
      const fund1Weight = fund1Holdings.get(stock)!;
      const fund2Weight = fund2Holdings.get(stock)!;
      const minWeight = Math.min(fund1Weight, fund2Weight);
      overlapPercentage += minWeight;

      return {
        name: stock,
        fund1_weight: fund1Weight,
        fund2_weight: fund2Weight,
        min_weight: Math.round(minWeight * 100) / 100,
      };
    });

    // Sort overlapping stocks alphabetically
    overlappingStocks.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      fund1,
      fund2,
      overlap: {
        percentage: Math.round(overlapPercentage * 100) / 100,
        common_stocks_count: commonStocks.length,
        stocks: overlappingStocks,
      },
    });
  } catch (error) {
    console.error('Error in /api/compare:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compare funds' },
      { status: 500 }
    );
  }
}
