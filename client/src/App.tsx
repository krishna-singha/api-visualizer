import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import NotFound from './pages/NotFound'
import DashBoard from './pages/Dashboard'
import Documentation from './pages/Documentation'
import LandingPage from './pages/Landing'
import Download from './pages/Download'
import ApiKey from './pages/ApiKey'
import { useAuth } from './context/AuthContext'
import { Navigate } from 'react-router-dom'
import Login from './pages/Login'

function App() {

  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="documentation" element={<Documentation />} />
        <Route path="download" element={<Download />} />
        <Route path="api-key" element={user ? <ApiKey /> : <Navigate to={"/login"} />} />
        <Route path="dashboard" element={user ? (user.apiKey ? <DashBoard /> : <ApiKey />) : <Navigate to={"/login"} />} />
        <Route path="login" element={user ? (user.apiKey ? <Navigate to={"/dashboard"} /> : <Navigate to={"/api-key"} />) : <Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
