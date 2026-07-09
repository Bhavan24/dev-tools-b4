'use client'

import { useState, useMemo } from 'react'
import { Loader2, AlertCircle, Copy, Check } from 'lucide-react'

interface ConverterToolsProps {
  toolId: string
}

const CURRENCY_LIST = [
  'AED',
  'AFN',
  'ALL',
  'AMD',
  'ANG',
  'AOA',
  'ARS',
  'AUD',
  'AWG',
  'AZN',
  'BAM',
  'BBD',
  'BDT',
  'BGN',
  'BHD',
  'BIF',
  'BMD',
  'BND',
  'BOB',
  'BRL',
  'BSD',
  'BTN',
  'BWP',
  'BYN',
  'BZD',
  'CAD',
  'CDF',
  'CHF',
  'CLP',
  'CNY',
  'COP',
  'CRC',
  'CUP',
  'CVE',
  'CZK',
  'DJF',
  'DKK',
  'DOP',
  'DZD',
  'EGP',
  'ERN',
  'ETB',
  'EUR',
  'FJD',
  'FKP',
  'FOK',
  'GBP',
  'GEL',
  'GGP',
  'GHS',
  'GIP',
  'GMD',
  'GNF',
  'GTQ',
  'GYD',
  'HKD',
  'HNL',
  'HTG',
  'HUF',
  'IDR',
  'ILS',
  'IMP',
  'INR',
  'IQD',
  'IRR',
  'ISK',
  'JEP',
  'JMD',
  'JOD',
  'JPY',
  'KES',
  'KGS',
  'KHR',
  'KID',
  'KMF',
  'KRW',
  'KWD',
  'KYD',
  'KZT',
  'LAK',
  'LBP',
  'LKR',
  'LRD',
  'LSL',
  'LYD',
  'MAD',
  'MDL',
  'MGA',
  'MKD',
  'MMK',
  'MNT',
  'MOP',
  'MRU',
  'MUR',
  'MVR',
  'MWK',
  'MXN',
  'MYR',
  'MZN',
  'NAD',
  'NGN',
  'NIO',
  'NOK',
  'NPR',
  'NZD',
  'OMR',
  'PAB',
  'PEN',
  'PGK',
  'PHP',
  'PKR',
  'PLN',
  'PYG',
  'QAR',
  'RON',
  'RSD',
  'RUB',
  'RWF',
  'SAR',
  'SBD',
  'SCR',
  'SDG',
  'SEK',
  'SGD',
  'SHP',
  'SLE',
  'SLL',
  'SOS',
  'SRD',
  'SSP',
  'STN',
  'SYP',
  'SZL',
  'THB',
  'TJS',
  'TMT',
  'TND',
  'TOP',
  'TRY',
  'TTD',
  'TVD',
  'TWD',
  'TZS',
  'UAH',
  'UGX',
  'USD',
  'UYU',
  'UZS',
  'VES',
  'VND',
  'VUV',
  'WST',
  'XAF',
  'XCD',
  'XDR',
  'XOF',
  'XPF',
  'YER',
  'ZAR',
  'ZMW',
  'ZWL',
]

export function ConverterTools({ toolId }: ConverterToolsProps) {
  const [amount, setAmount] = useState('1')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [toCurrency, setToCurrency] = useState('EUR')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const isCurrencyConverter = toolId === 'currency-converter'

  const handleExecute = async () => {
    setLoading(true)
    setError('')
    try {
      const numAmount = parseFloat(amount)
      if (isNaN(numAmount) || numAmount < 0) {
        throw new Error('Please enter a valid positive amount')
      }

      const body = {
        amount: numAmount,
        from: fromCurrency,
        to: toCurrency,
      }

      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Tool execution failed')
      }

      const data = await response.json()
      setResult(data.result)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result) {
      const text = `${result.converted} ${result.to}`
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="card-base p-6 space-y-4">
          <div>
            <label className="block font-medium text-foreground mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1.00"
              step="0.01"
              min="0"
              className="input-base"
            />
          </div>

          <div>
            <label className="block font-medium text-foreground mb-2">From Currency</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="input-base"
            >
              {CURRENCY_LIST.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-2">To Currency</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="input-base"
            >
              {CURRENCY_LIST.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              const temp = fromCurrency
              setFromCurrency(toCurrency)
              setToCurrency(temp)
            }}
            className="btn-secondary w-full text-sm"
          >
            ⇄ Swap Currencies
          </button>

          <button
            onClick={handleExecute}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Converting...
              </>
            ) : (
              'Convert'
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block font-medium text-foreground">Results</label>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="card-base p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Original Amount</p>
                <p className="text-2xl font-bold text-foreground">
                  {result.amount} {result.from}
                </p>
              </div>

              <div className="h-px bg-border"></div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Exchange Rate</p>
                <p className="text-lg font-mono text-foreground">
                  1 {result.from} = {result.rate} {result.to}
                </p>
              </div>

              <div className="h-px bg-border"></div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Converted Amount</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {result.converted} {result.to}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Updated: {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Result
                </>
              )}
            </button>
          </div>
        )}

        {!result && !error && (
          <div className="bg-secondary rounded-lg p-4 h-64 flex items-center justify-center text-muted-foreground">
            Results will appear here
          </div>
        )}
      </div>
    </div>
  )
}
