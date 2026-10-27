import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';
import CpuScheduling from './pages/CpuScheduling';
import Paging from './pages/Paging';
import Memory from './pages/Memory';
import Deadlock from './pages/Deadlock';
import Disk from './pages/Disk';
import Sync from './pages/Sync';
import AlgorithmLab from './pages/AlgorithmLab';
import Docs from './pages/Docs';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar />
          <main style={{ flex: 1, overflowY: 'auto', background: 'var(--color-bg-primary)' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/cpu" element={<CpuScheduling />} />
              <Route path="/paging" element={<Paging />} />
              <Route path="/memory" element={<Memory />} />
              <Route path="/deadlock" element={<Deadlock />} />
              <Route path="/disk" element={<Disk />} />
              <Route path="/sync" element={<Sync />} />
              <Route path="/lab" element={<AlgorithmLab />} />
              <Route path="/docs" element={<Docs />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
