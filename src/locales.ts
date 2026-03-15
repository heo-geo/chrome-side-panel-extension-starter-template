// Every user-facing string lives here. Components never contain hardcoded text.
// Import pattern in components: const l = locales.tabA; const lc = locales.common

export const locales = {
  mainTitle: 'My Extension',
  footer: {
    docUrl: 'https://developer.chrome.com/docs/extensions',
    docLabel: 'Chrome Extension Documentation',
  },
  errors: {
    notReady: 'Cannot access this page.',
    accessError: 'Could not inject into this page.',
    retryButtonLabel: 'Retry',
  },
  tabs: {
    tabA: 'Tab A',
    tabB: 'Tab B',
  },
  tabA: {
    title: "It's time to build your app"
  },
  tabB: {
    title: "Just do it!"
  },
}
