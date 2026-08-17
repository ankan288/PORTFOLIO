import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Portfolio from './pages/Portfolio';
import DesignTab from './pages/DesignTab';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/design" element={<DesignTab />} />
    </Routes>
  );
}
