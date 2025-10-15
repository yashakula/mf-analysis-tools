'use client'

import { useState, useEffect } from 'react'

interface Holding {
  name: string
  weight: number
}

interface FundData {
  fund_name: string
  holdings: Holding[]
  total_stocks: number
}

interface Fund {
  id: string
  name: string
}

interface OverlappingStock {
  name: string
  fund1_weight: number
  fund2_weight: number
  min_weight: number
}

interface OverlapData {
  percentage: number
  common_stocks_count: number
  stocks: OverlappingStock[]
}

interface CompareResponse {
  success: boolean
  fund1: FundData
  fund2: FundData
  overlap: OverlapData
}

export default function Home() {
  const [funds, setFunds] = useState<Fund[]>([])
  const [fund1Id, setFund1Id] = useState('')
  const [fund2Id, setFund2Id] = useState('')
  const [data, setData] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/funds')
      .then(r => r.json())
      .then(d => setFunds(d.funds))
  }, [])

  const compare = async () => {
    if (!fund1Id || !fund2Id) return
    setLoading(true)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fund1_id: fund1Id, fund2_id: fund2Id })
      })
      const result = await res.json()
      setData(result)
    } catch (e) {
      alert('Error: ' + (e as Error).message)
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px', textAlign: 'center' }}>
        📊 Mutual Fund Portfolio Analyzer
      </h1>

      {/* Fund Selection */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Fund 1</label>
            <select
              value={fund1Id}
              onChange={(e) => setFund1Id(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">Select fund...</option>
              {funds.map(f => <option key={f.id} value={f.id} disabled={f.id === fund2Id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Fund 2</label>
            <select
              value={fund2Id}
              onChange={(e) => setFund2Id(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">Select fund...</option>
              {funds.map(f => <option key={f.id} value={f.id} disabled={f.id === fund1Id}>{f.name}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={compare}
          disabled={!fund1Id || !fund2Id || loading}
          style={{
            padding: '12px 30px',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            opacity: (!fund1Id || !fund2Id || loading) ? 0.5 : 1
          }}
        >
          {loading ? 'Loading...' : 'Compare Portfolios'}
        </button>
      </div>

      {/* Overlap Summary */}
      {data && data.success && (
        <>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#333' }}>Portfolio Overlap</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#ff6b35' }}>{data.overlap.percentage}%</div>
                <div style={{ fontSize: '16px', color: '#666', marginTop: '5px' }}>Min Weight Overlap</div>
              </div>
              <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4a90e2' }}>{data.overlap.common_stocks_count}</div>
                <div style={{ fontSize: '16px', color: '#666', marginTop: '5px' }}>Common Stocks</div>
              </div>
            </div>
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#666' }}>Overlapping Holdings</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f0f0f0' }}>
                  <tr>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Company</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Fund 1 Weight</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Fund 2 Weight</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Min Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {data.overlap.stocks.map((s, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px', fontSize: '14px' }}>{s.name}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#0066cc' }}>{s.fund1_weight}%</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#009933' }}>{s.fund2_weight}%</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#ff6b35' }}>{s.min_weight}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Fund 1 */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#0066cc' }}>
              {data.fund1.fund_name.replace(/_/g, ' ').toUpperCase()}
            </h2>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Total Stocks: <strong>{data.fund1.total_stocks}</strong>
            </p>
            <div style={{ maxHeight: '600px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f0f0f0' }}>
                  <tr>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Company</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {data.fund1.holdings.map((h, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px', fontSize: '14px' }}>{h.name}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#0066cc' }}>{h.weight}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fund 2 */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#009933' }}>
              {data.fund2.fund_name.replace(/_/g, ' ').toUpperCase()}
            </h2>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Total Stocks: <strong>{data.fund2.total_stocks}</strong>
            </p>
            <div style={{ maxHeight: '600px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f0f0f0' }}>
                  <tr>
                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Company</th>
                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {data.fund2.holdings.map((h, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px', fontSize: '14px' }}>{h.name}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#009933' }}>{h.weight}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  )
}
