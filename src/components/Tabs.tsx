import { useState } from 'react'
import type { TabId } from '../types'
import { locales } from '../locales'
import { TabA } from './tabs/TabA'
import { TabB } from './tabs/TabB'

const TABS: { id: TabId; label: string }[] = [
  { id: 'tabA', label: locales.tabs.tabA },
  { id: 'tabB', label: locales.tabs.tabB },
]

export const Tabs = () => {
  const [activeTab, setActiveTab] = useState<TabId>('tabA')

  return (
    <>
      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-nav__item${activeTab === tab.id ? ' tab-nav__item--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <main className="tab-content">
        {activeTab === 'tabA' && <TabA />}
        {activeTab === 'tabB' && <TabB />}
      </main>
    </>
  )
}
