import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { useTweaks } from '../context/TweaksContext'

interface TabDef {
  to: string;
  end?: boolean;
  label: string;
  num: string;
  icon: string;
}

const TAB_LIST: TabDef[] = [
  {
    to: '/', end: true, label: 'Dashboard', num: '01', icon: 'grid',
  },
  {
    to: '/study', label: 'Study', num: '02', icon: 'play',
  },
  {
    to: '/decks', label: 'Decks', num: '03', icon: 'book',
  },
  {
    to: '/stats', label: 'Stats', num: '04', icon: 'chart',
  },
]

const Tabs = () => {
  const { tweaks, toggleScript } = useTweaks()
  return (
    <div className="tabs">
      {TAB_LIST.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => `tab${isActive ? ' active' : ''}`}
        >
          <span className="tab-icon"><Icon name={t.icon} size={16} /></span>
          <span className="tab-num">{t.num}</span>
          <span>{t.label}</span>
        </NavLink>
      ))}
      <div className="tab spacer" />
      <button
        type="button"
        className="script-toggle"
        onClick={toggleScript}
        title={`switch to ${tweaks.script === 'simplified' ? 'traditional' : 'simplified'}`}
      >
        <span style={{ color: tweaks.script === 'simplified' ? 'var(--fg)' : 'var(--fg-dim)' }}>简</span>
        <span style={{ color: 'var(--fg-dim)', fontSize: '0.6em' }}>·</span>
        <span style={{ color: tweaks.script === 'traditional' ? 'var(--fg)' : 'var(--fg-dim)' }}>繁</span>
      </button>
    </div>
  )
}

export default Tabs
