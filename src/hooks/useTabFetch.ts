// CORS-safe fetch via chrome.scripting.executeScript.
//
// The panel runs on chrome-extension:// origin. Direct fetch() to page APIs is
// blocked by CORS. This hook injects fetch into the active tab's page context,
// where it runs under the page's origin.
//
//   Panel (chrome-extension://)  →  executeScript  →  page context  →  API
//   (our code)                                      (example.com)    (example.com/api)
//
// Only JSON-serializable values can cross the args boundary. Stringify body
// before passing; parse inside the injected function.
//
// Example:
//
//   const { loading, result, send } = useTabFetch()
//
//   const handleSubmit = () => {
//     send('POST', '/api/endpoint', { key: 'value' })
//   }
//
//   {result && <pre>{JSON.stringify(result.data, null, 2)}</pre>}

import { useState, useCallback } from 'react'

export interface TabFetchResult {
  status: number
  statusText: string
  data: unknown
  time: number
  error?: string
}

export const useTabFetch = () => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TabFetchResult | null>(null)

  const send = useCallback(
    async (method: string, path: string, body?: unknown): Promise<TabFetchResult | null> => {
      setLoading(true)
      setResult(null)
      const start = Date.now()

      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (!tab?.id) throw new Error('No active tab')

        const [injected] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: async (m: string, p: string, b: string | null) => {
            try {
              const res = await fetch(p, {
                method: m,
                headers: b ? { 'Content-Type': 'application/json' } : {},
                body: b ?? undefined,
              })
              const data = await res.json().catch(() => null)
              return { status: res.status, statusText: res.statusText, data, error: undefined }
            } catch (e: unknown) {
              return {
                status: 0,
                statusText: 'Network Error',
                data: null,
                error: String(e),
              }
            }
          },
          args: [method, path, body !== undefined ? JSON.stringify(body) : null],
        })

        const fetchResult: TabFetchResult = {
          ...(injected.result as Omit<TabFetchResult, 'time'>),
          time: Date.now() - start,
        }
        setResult(fetchResult)
        return fetchResult
      } catch (e: unknown) {
        const fetchResult: TabFetchResult = {
          status: 0,
          statusText: 'Error',
          data: null,
          time: Date.now() - start,
          error: String(e),
        }
        setResult(fetchResult)
        return fetchResult
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { loading, result, send }
}
