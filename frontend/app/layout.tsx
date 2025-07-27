import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'Algolia MCP Supermarket Chatbot',
  description: 'A Node.js backend project integrating Algolia MCP for a supermarket chatbot.',
  generator: 'algolia-mcp-supermarket',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
