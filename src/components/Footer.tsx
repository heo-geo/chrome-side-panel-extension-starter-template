import { locales } from '../locales'

export const Footer = () => {
  const openDocs = () => {
    chrome.tabs.create({ url: locales.footer.docUrl })
  }

  return (
    <footer className="footer">
      <button className="footer__link" onClick={openDocs}>
        {locales.footer.docLabel}
      </button>
    </footer>
  )
}
