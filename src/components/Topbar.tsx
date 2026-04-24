import { useNavigate } from 'react-router-dom'
import { useTweaks } from '../context/TweaksContext'
import { useAuth } from '../context/AuthContext'
import Icon from './Icon'

interface TopbarProps {
  context?: string;
}

const Topbar = ({ context = '' }: TopbarProps) => {
  const { tweaks, toggleTheme } = useTweaks()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout()
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="topbar">
      <div className="cell logo">
        <span className="han" style={{ fontSize: 14, letterSpacing: 0 }}>汉</span>
        <span>hanzi.repeat</span>
      </div>
      <div className="cell muted topbar-desktop">v0.1.0</div>
      <div className="cell muted topbar-desktop" style={{ display: 'flex', gap: 6 }}>
        <span className="dot" />
        <span>session · active</span>
      </div>
      {context && <div className="cell muted topbar-desktop">{context}</div>}
      <div
        className="cell right muted"
        style={{ cursor: 'pointer' }}
        onClick={toggleTheme}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && toggleTheme()}
        title="toggle theme"
      >
        <Icon name={tweaks.theme === 'dark' ? 'sun' : 'moon'} size={12} />
        <span>{tweaks.theme === 'dark' ? 'light' : 'dark'}</span>
      </div>
      <div
        className="cell right muted topbar-desktop"
        style={{ cursor: 'pointer' }}
        onClick={handleAuthClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleAuthClick()}
        title={isAuthenticated ? 'sign out' : 'sign in'}
      >
        {isAuthenticated ? `@${user!.username}` : 'sign in'}
      </div>
    </div>
  )
}

export default Topbar
