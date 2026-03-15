import './scss/styles.scss'
import { Footer } from './components/Footer'
import { Spinner } from './components/Spinner'
import { NotReady } from './components/NotReady'
import { Tabs } from './components/Tabs'
import { usePageReady } from './hooks/usePageReady'

export default function App() {
  const { status, checkPage } = usePageReady()

  if (status === 'loading') return <Spinner />
  if (status === 'not-ready' || status === 'error') {
    return <NotReady isError={status === 'error'} onRetry={checkPage} />
  }

  return (
    <div className="screen">
      <Tabs />
      <Footer />
    </div>
  )
}
