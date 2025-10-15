import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MF Portfolio Analyzer',
  description: 'Analyze mutual fund portfolio overlap',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f5f5f5' }}>
        {children}
      </body>
    </html>
  )
}
