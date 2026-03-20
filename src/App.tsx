/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Curriculum from './pages/Curriculum';
import Practice from './pages/Practice';
import TopicDetail from './pages/TopicDetail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="curriculum" element={<Curriculum />} />
          <Route path="practice" element={<Practice />} />
          <Route path="topic/:topicId" element={<TopicDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

