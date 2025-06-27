import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import DashBoard from './pages/Dashboard'
import Documentation from './pages/Documentation'
import LandingPage from './pages/Landing'
import Download from './pages/Download'
import ApiKey from './pages/ApiKey'

function App() {

  return (
    <Routes>
      <Route path="/" element={ <Layout /> }>
        <Route index element={ <LandingPage /> } />
        <Route path="documentation" element={ <Documentation /> } />
        <Route path="api-key" element={ <ApiKey /> } />
        <Route path="dashboard" element={ <DashBoard /> } />
        <Route path="download" element={ <Download />} />
        <Route path="*" element={ <NotFound /> } />
      </Route>
    </Routes>
  )
}

export default App
