import React, { useState, lazy, Suspense } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { useComparisonState } from './hooks/useComparisonState'
import UnifiedComparisonMap from './components/Map/UnifiedComparisonMap'
import './App.css'

const SummaryModal = lazy(() => import('./components/Map/SummaryModal'));

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reportConfig, setReportConfig] = useState({ isOpen: false, side: null });
  const {
    comparisonMode, setComparisonMode,
    activeSide, setActiveSide,
    sideA, sideB
  } = useComparisonState();

  const activeData = activeSide === 'A' ? sideA : sideB;

  return (
    <div className="app-container">
      <Navbar />
      <div className="content-container">
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          comparisonMode={comparisonMode}
          setComparisonMode={setComparisonMode}
          activeSide={activeSide}
          setActiveSide={setActiveSide}
          filters={activeData.filters}
          setFilters={activeData.setFilters}
          summary={activeData.summary}
          sideA={sideA}
          sideB={sideB}
          onOpenReport={(side) => setReportConfig({ isOpen: true, side })}
        />
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <UnifiedComparisonMap
            sideA={sideA}
            sideB={sideB}
            activeSide={activeSide}
            setActiveSide={setActiveSide}
            comparisonMode={comparisonMode}
            onOpenReport={(side) => setReportConfig({ isOpen: true, side })}
          />
        </main>
      </div>

      <Suspense fallback={null}>
        <SummaryModal
          isOpen={reportConfig.isOpen}
          onClose={() => setReportConfig({ isOpen: false, side: null })}
          summary={reportConfig.side === 'A' ? sideA.summary : sideB.summary}
          stats={reportConfig.side === 'A' ? sideA.stats : sideB.stats}
          regionName={reportConfig.side === 'A'
            ? (sideA.selection.blockName || sideA.selection.districtName || 'Rajasthan')
            : (sideB.selection.blockName || sideB.selection.districtName || 'Rajasthan')
          }
        />
      </Suspense>
    </div>
  )
}

export default App
