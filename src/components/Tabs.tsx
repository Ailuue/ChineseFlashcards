import { NavLink } from 'react-router-dom';
import Icon from './Icon';

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
];

const Tabs = () => (
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
  </div>
);

export default Tabs;
