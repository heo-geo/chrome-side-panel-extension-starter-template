import { useEffect, useState, useCallback } from 'react'

export type PageReadyStatus = 'loading' | 'ready' | 'not-ready' | 'error'

/**
 * Detects whether the active browser tab is a valid target for the extension.
 * Subscribes to tab updates and activation; replace the detection logic with your own.
 */
export const usePageReady = () => {
  const [status, setStatus] = useState<PageReadyStatus>('loading')

  const checkPage = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) {
        setStatus('error')
        return
      }
      if (tab.status !== 'complete') {
        setStatus('loading')
        return
      }

      setStatus('loading')

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // TODO: replace with your detection logic
          // Example: check for a meta tag, global variable, or URL pattern
          return { ready: true }
        },
      })

      if (result.result?.ready) {
        setStatus('ready')
      } else {
        setStatus('not-ready')
      }
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    checkPage()

    const onUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (changeInfo.status === 'complete') {
        chrome.tabs.query({ active: true, currentWindow: true }).then(([active]) => {
          if (active?.id === tabId) checkPage()
        })
      }
    }

    const onActivated = () => checkPage()

    chrome.tabs.onUpdated.addListener(onUpdated)
    chrome.tabs.onActivated.addListener(onActivated)

    return () => {
      chrome.tabs.onUpdated.removeListener(onUpdated)
      chrome.tabs.onActivated.removeListener(onActivated)
    }
  }, [checkPage])

  return { status, checkPage }
}
