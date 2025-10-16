import { list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface Holding {
  name: string;
  weight: number;
}

export interface FundData {
  fund_name: string;
  holdings: Holding[];
  total_stocks: number;
}

export interface Fund {
  id: string;
  name: string;
}

async function loadCsvFromBlob(filename: string): Promise<any[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    try {
      // List blobs to find the file
      const { blobs } = await list({
        prefix: `data/${filename}`,
        token,
      });

      if (blobs && blobs.length > 0) {
        const blobUrl = blobs[0].url;

        // Fetch CSV content
        const response = await fetch(blobUrl);
        if (response.ok) {
          const content = await response.text();
          const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true,
            trim: true,
          });
          return records;
        }
      }
    } catch (error) {
      console.error(`Blob loading error for ${filename}:`, error);
    }
  }

  // Fallback to local files for development
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const filepath = path.join(dataDir, filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
    });
    return records;
  } catch (error) {
    console.error(`Local file loading error for ${filename}:`, error);
    return [];
  }
}

function parseFund(rows: any[], fundName: string): FundData {
  if (!rows || rows.length === 0) {
    return { fund_name: fundName, holdings: [], total_stocks: 0 };
  }

  const keys = Object.keys(rows[0]);
  const nameCol = keys.includes('Company Name') ? 'Company Name' : 'Holding Name';
  const weightCol = keys.includes('% Portfolio Weight') ? '% Portfolio Weight' : '% Portfolio';

  const holdings: Holding[] = [];

  for (const row of rows) {
    try {
      const name = row[nameCol]?.trim();
      let weightStr = row[weightCol];

      if (!name) continue;

      weightStr = String(weightStr).replace('%', '').trim();
      if (!weightStr) continue;

      const weight = parseFloat(weightStr);
      holdings.push({
        name,
        weight: Math.round(weight * 100) / 100,
      });
    } catch (error) {
      continue;
    }
  }

  // Sort alphabetically by name
  holdings.sort((a, b) => a.name.localeCompare(b.name));

  return {
    fund_name: fundName,
    holdings,
    total_stocks: holdings.length,
  };
}

export async function getAvailableFunds(): Promise<Fund[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    try {
      // List all blobs with 'data/' prefix
      const { blobs } = await list({
        prefix: 'data/',
        token,
      });

      const funds: Fund[] = [];
      for (const blob of blobs) {
        const pathname = blob.pathname;
        if (pathname.startsWith('data/') && pathname.endsWith('.csv')) {
          const filename = pathname.replace('data/', '');
          const fundId = filename.replace('.csv', '');
          funds.push({
            id: fundId,
            name: fundId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          });
        }
      }

      return funds;
    } catch (error) {
      console.error('Error listing funds from blob:', error);
    }
  }

  // Fallback to local files for development
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.csv'));
    return files.map((f) => ({
      id: f.replace('.csv', ''),
      name: f.replace('.csv', '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    }));
  } catch (error) {
    console.error('Error listing local files:', error);
    return [];
  }
}

export async function loadFund(fundId: string): Promise<FundData> {
  const filename = `${fundId}.csv`;
  const rows = await loadCsvFromBlob(filename);
  return parseFund(rows, fundId);
}
