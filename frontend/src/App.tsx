import { lazy, Suspense, useEffect, useState } from 'react';
import { LandingPage } from './components/Landing/LandingPage';

const ChatApp = lazy(() => import('./ChatApp'));

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  const inApp = hash.startsWith('#app/');
  useEffect(() => {
    if (inApp) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [inApp]);
  const [workspaceOpened, setWorkspaceOpened] = useState(inApp);
  useEffect(() => { if (inApp) setWorkspaceOpened(true); }, [inApp]);
  return <>
    {!inApp && <LandingPage />}
    {workspaceOpened && <div hidden={!inApp}>
      <Suspense fallback={<div className="app-loading" role="status">Opening your workspace…</div>}>
        <ChatApp visible={inApp} initialTab={hash === '#app/analytics' ? 'analytics' : 'chat'} />
      </Suspense>
    </div>}
  </>;
}
