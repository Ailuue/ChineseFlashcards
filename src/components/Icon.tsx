interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
}

const PATHS: Record<string, JSX.Element> = {
  flame: <path d="M8 1c0 3-4 4-4 8a4 4 0 0 0 8 0c0-2-1-3-2-4 0 2-1 3-2 3 1-2 0-5 0-7z" />,
  book: <>
    <path d="M2 2h5a2 2 0 0 1 2 2v9a1.5 1.5 0 0 0-1.5-1.5H2z" />
    <path d="M14 2H9a2 2 0 0 0-2 2v9a1.5 1.5 0 0 1 1.5-1.5H14z" />
  </>,
  clock: <>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 5v3l2 1.5" />
  </>,
  check: <path d="M3 8l3.5 3.5L13 5" />,
  x: <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />,
  arrow: <path d="M3 8h10M9 4l4 4-4 4" />,
  bolt: <path d="M9 1L3 9h4l-1 6 6-8H8l1-6z" />,
  play: <path d="M5 3v10l8-5z" />,
  search: <>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5L14 14" />
  </>,
  plus: <path d="M8 3v10M3 8h10" />,
  sun: <>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1.5v1.5M8 13v1.5M3.5 3.5l1 1M11.5 11.5l1 1M1.5 8H3M13 8h1.5M3.5 12.5l1-1M11.5 4.5l1-1" />
  </>,
  moon: <path d="M13 9.5a5 5 0 1 1-6.5-6.5A5.5 5.5 0 0 0 13 9.5z" />,
  chart: <path d="M2 13h12M4 13V8M7.5 13V4M11 13V9" />,
  grid: <>
    <rect x="2" y="2" width="5" height="5" />
    <rect x="9" y="2" width="5" height="5" />
    <rect x="2" y="9" width="5" height="5" />
    <rect x="9" y="9" width="5" height="5" />
  </>,
  calendar: <>
    <rect x="2" y="3" width="12" height="11" />
    <path d="M2 6h12M5 1.5v3M11 1.5v3" />
  </>,
  trophy: <>
    <path d="M5 2h6v3a3 3 0 0 1-6 0z" />
    <path d="M3 3H2v2a2 2 0 0 0 3 2M13 3h1v2a2 2 0 0 1-3 2M6 10h4v2H6zM5 13h6" />
  </>,
  target: <>
    <circle cx="8" cy="8" r="6" />
    <circle cx="8" cy="8" r="3" />
    <circle cx="8" cy="8" r=".5" fill="currentColor" />
          </>,
  speaker: <>
    <path d="M3 6v4h2l3 2.5v-9L5 6H3z" />
    <path d="M11 5.5a4 4 0 0 1 0 5M13 3.5a7 7 0 0 1 0 9" />
  </>,
  shuffle: <>
    <path d="M2 3h3l8 10h1M14 13l-2-1M14 13l-1 2" />
    <path d="M2 13h3l3-3.5M10 5.5L13 3M14 3l-2-1M14 3l-1 2" />
  </>,
  pause: <>
    <rect x="4" y="3" width="3" height="10" />
    <rect x="9" y="3" width="3" height="10" />
  </>,
};

const Icon = ({ name, size = 14, stroke = 1.6 }: IconProps) => {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', flexShrink: 0 }}
    >
      {path}
    </svg>
  );
};

export default Icon;
