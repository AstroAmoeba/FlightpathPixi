import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BeeWorldMap from './components/BeeWorldMap';
import NodeListPage from './components/NodeListPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BeeWorldMap />} />
        <Route path="/lista-de-nodos" element={<NodeListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
