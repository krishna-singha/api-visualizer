import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import DashBoard from './pages/Dashboard'
import Documentation from './pages/Documentation'

function App() {

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashBoard />} />
        <Route path="dashboard" element={<DashBoard />} />
        <Route path="documentation" element={<Documentation />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
