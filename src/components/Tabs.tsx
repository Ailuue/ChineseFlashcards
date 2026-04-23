import { NavLink } from 'react-router-dom';

interface TabDef {
  to: string;
  end?: boolean;
  label: string;
  num: string;
}

const TAB_LIST: TabDef[] = [
  {
    to: '/', end: true, label: 'Dashboard', num: '01',
  },
  { to: '/study', label: 'Study', num: '02' },
  { to: '/decks', label: 'Decks', num: '03' },
  { to: '/stats', label: 'Stats', num: '04' },
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
        <span className="num">{t.num}</span>
        <span>{t.label}</span>
      </NavLink>
    ))}
    <div className="tab spacer" />
  </div>
);

export default Tabs;
