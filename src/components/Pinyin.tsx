interface PinyinProps {
  pinyin: string;
  tones: number[];
  size?: number;
}

const Pinyin = ({ pinyin, tones, size = 20 }: PinyinProps) => {
  const syllables = pinyin.split(' ');
  return (
    <span style={{
      fontFamily: 'var(--font-sans)', fontSize: size, letterSpacing: '0.02em', fontWeight: 500,
    }}
    >
      {syllables.map((s, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className={`t${tones[i] ?? 5}`}>
          {s}
          {i < syllables.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
};

export default Pinyin;
