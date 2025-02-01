import { Routes, Route } from 'react-router-dom';
import Upload from './views/Upload';
import Download  from './views/Download';

function App() {
  return (
    <Routes>
      <Route path='/' element={<Upload />} />
      <Route path="/file/:id" element={<Download />} />
    </Routes>
  );
}

export default App;
