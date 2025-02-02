import { Routes, Route } from 'react-router-dom';
import Upload from './views/Upload';
import Download  from './views/Download';
import Navbar from './views/Navbar';

function App() {
  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Upload />} />
        <Route path="/file/:id" element={<Download />} />
      </Routes>
    </div>
  );
}

export default App;
