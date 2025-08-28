import MagicProvider from '@/hooks/MagicProvider';

import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from '@/components/magic/Login';
import Dashboard from '@/components/ui/Dashboard';
import RhinestoneDashboard from '@/components/ui/RhinestoneDashboard';
import MagicDashboardRedirect from '@/components/ui/MagicDashboardRedirect';

export default function Home() {
  const [token, setToken] = useState('');
  const [showRhinestone, setShowRhinestone] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('token') ?? '');
    // Check URL parameter for Rhinestone demo
    const urlParams = new URLSearchParams(window.location.search);
    setShowRhinestone(urlParams.get('demo') === 'rhinestone');
  }, [setToken]);

  return (
    <MagicProvider>
      <ToastContainer />
      {process.env.NEXT_PUBLIC_MAGIC_API_KEY ? (
        token.length > 0 ? (
          showRhinestone ? (
            <RhinestoneDashboard token={token} setToken={setToken} />
          ) : (
            <Dashboard token={token} setToken={setToken} />
          )
        ) : (
          <Login token={token} setToken={setToken} />
        )
      ) : (
        <MagicDashboardRedirect />
      )}
    </MagicProvider>
  );
}
