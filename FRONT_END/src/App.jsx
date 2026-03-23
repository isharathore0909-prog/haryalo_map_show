import React, { useState, lazy, Suspense } from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import MapViewer from './components/Map/MapViewer'
import SelectionPanel from './components/Map/SelectionPanel'

const SummaryModal = lazy(() => import('./components/Map/SummaryModal'));
import { useComparisonState } from './hooks/useComparisonState'
import './App.css'

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
          <div className={`dashboard-grid ${comparisonMode ? 'comparison-mode' : 'single-mode'}`}>
            <div
              className={`map-main-container side-a ${activeSide === 'A' ? 'active-focus' : ''}`}
              onClick={() => setActiveSide('A')}
            >
              <MapViewer
                externalFilters={sideA.filters}
                notifySummary={sideA.setSummary}
                notifyStats={sideA.setStats}
                setSelectionInfo={sideA.setSelectionInfo}
                viewLevel={sideA.viewLevel}
                setViewLevel={sideA.setViewLevel}
                selection={sideA.selection}
                setSelection={sideA.setSelection}
                label={comparisonMode ? "Side A" : null}
                comparisonMode={comparisonMode}
              />
              <SelectionPanel
                info={sideA.selectionInfo ? { ...sideA.selectionInfo, onOpenReport: () => setReportConfig({ isOpen: true, side: 'A' }) } : null}
                setInfo={sideA.setSelectionInfo}
                side="A"
                comparisonMode={comparisonMode}
              />
            </div>

            {comparisonMode && (
              <div
                className={`map-main-container side-b ${activeSide === 'B' ? 'active-focus' : ''}`}
                onClick={() => setActiveSide('B')}
              >
                <MapViewer
                  externalFilters={sideB.filters}
                  notifySummary={sideB.setSummary}
                  notifyStats={sideB.setStats}
                  setSelectionInfo={sideB.setSelectionInfo}
                  viewLevel={sideB.viewLevel}
                  setViewLevel={sideB.setViewLevel}
                  selection={sideB.selection}
                  setSelection={sideB.setSelection}
                  label="Side B"
                  comparisonMode={comparisonMode}
                />
                <SelectionPanel
                  info={sideB.selectionInfo ? { ...sideB.selectionInfo, onOpenReport: () => setReportConfig({ isOpen: true, side: 'B' }) } : null}
                  setInfo={sideB.setSelectionInfo}
                  side="B"
                  comparisonMode={comparisonMode}
                />
              </div>
            )}
          </div>
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
