import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useTweaks } from '../context/TweaksContext';
import Topbar from './Topbar';
import Tabs from './Tabs';

const CONTEXT_LABELS: Record<string, string> = {
  '/': 'user · dashboard',
  '/study': 'deck · daily mix',
  '/decks': 'decks',
  '/stats': 'stats',
};

const Layout = () => {
  const { tweaks } = useTweaks();
  const location = useLocation();
  const context = CONTEXT_LABELS[location.pathname];

  useEffect(() => {
    document.body.classList.toggle('theme-dark', tweaks.theme === 'dark');
    document.body.classList.toggle('theme-light', tweaks.theme !== 'dark');
  }, [tweaks.theme]);

  return (
    <div className={`app ${tweaks.gridBg ? 'grid-bg-dots' : ''}`}>
      <Topbar context={context} />
      <Tabs />
      <Outlet />
    </div>
  );
};

export default Layout;
