import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Schedule } from './pages/Schedule';
import { Groups } from './pages/Groups';
import { Knockout } from './pages/Knockout';
import { More } from './pages/More';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-bg text-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/knockout" element={<Knockout />} />
          <Route path="/more" element={<More />} />
        </Routes>
        <BottomNav />
      </div>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
