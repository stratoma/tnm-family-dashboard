import type { CSSProperties } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const OUTCOMES = [
  { label: 'Community', start: 76, color: '#f8d86c' },
  { label: 'Content', start: 92, color: '#7bdff2' },
  { label: 'First paid offer', start: 108, color: '#ff9f8f' },
];

const SCRIPT_LINE =
  'A 6-week live session where I help professionals turn their experience into a community, content, and their first paid offer using AI.';

export const OfferScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const heroScale = spring({
    frame,
    fps,
    config: {
      damping: 18,
      stiffness: 120,
      mass: 0.8,
    },
  });

  const enter = (start: number, end = start + 16) =>
    interpolate(frame, [start, end], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

  const exit = interpolate(frame, [158, 174], [1, 0.92], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={styles.stage}>
      <div style={styles.noise} />
      <div style={styles.topLine} />
      <div style={styles.sideLine} />

      <div style={styles.scriptTag}>Offer script scene</div>

      <section style={{ ...styles.heroBlock, transform: `scale(${heroScale * exit})` }}>
        <div
          style={{
            ...styles.kicker,
            opacity: enter(4, 18),
            transform: `translateY(${interpolate(enter(4, 18), [0, 1], [18, 0])}px)`,
          }}
        >
          A
        </div>

        <h1 style={styles.headline}>
          <span
            style={{
              ...styles.headlineAccent,
              opacity: enter(0, 18),
              transform: `translateY(${interpolate(enter(0, 18), [0, 1], [42, 0])}px)`,
            }}
          >
            6-week
          </span>
          <span
            style={{
              opacity: enter(14, 28),
              transform: `translateY(${interpolate(enter(14, 28), [0, 1], [36, 0])}px)`,
            }}
          >
            live session
          </span>
        </h1>

        <p
          style={{
            ...styles.subhead,
            opacity: enter(38, 54),
            transform: `translateY(${interpolate(enter(38, 54), [0, 1], [28, 0])}px)`,
          }}
        >
          I help <strong>professionals</strong> turn their <strong>experience</strong> into:
        </p>

        <div style={styles.outcomeGrid}>
          {OUTCOMES.map((outcome) => {
            const progress = enter(outcome.start, outcome.start + 18);
            return (
              <div
                key={outcome.label}
                style={{
                  ...styles.outcomeCard,
                  backgroundColor: outcome.color,
                  opacity: progress,
                  transform: `translateY(${interpolate(progress, [0, 1], [38, 0])}px) scale(${interpolate(
                    progress,
                    [0, 1],
                    [0.94, 1],
                  )})`,
                }}
              >
                {outcome.label}
              </div>
            );
          })}
        </div>

        <div
          style={{
            ...styles.aiBadge,
            opacity: enter(132, 148),
            transform: `translateY(${interpolate(enter(132, 148), [0, 1], [30, 0])}px)`,
          }}
        >
          using AI
        </div>
      </section>

      <p
        style={{
          ...styles.caption,
          opacity: interpolate(frame, [128, 144, 170, 179], [0, 0.62, 0.62, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {SCRIPT_LINE}
      </p>
    </AbsoluteFill>
  );
};

const styles: Record<string, CSSProperties> = {
  stage: {
    backgroundColor: '#111114',
    color: '#fbfbf7',
    fontFamily: 'Inter, Arial, Helvetica, sans-serif',
    overflow: 'hidden',
  },
  noise: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(circle at 18% 26%, rgba(248,216,108,0.18), transparent 28%), radial-gradient(circle at 78% 68%, rgba(123,223,242,0.16), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 22px)',
  },
  topLine: {
    position: 'absolute',
    top: 76,
    left: 112,
    right: 112,
    height: 2,
    background: 'linear-gradient(90deg, #f8d86c, rgba(251,251,247,0.15), #7bdff2)',
  },
  sideLine: {
    position: 'absolute',
    top: 144,
    bottom: 144,
    right: 112,
    width: 2,
    background: 'linear-gradient(180deg, rgba(251,251,247,0.16), #ff9f8f)',
  },
  scriptTag: {
    position: 'absolute',
    top: 112,
    left: 112,
    color: 'rgba(251,251,247,0.58)',
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  heroBlock: {
    position: 'absolute',
    left: 180,
    right: 180,
    top: 210,
    transformOrigin: 'center center',
  },
  kicker: {
    width: 72,
    height: 72,
    border: '2px solid rgba(251,251,247,0.52)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 42,
    fontWeight: 900,
    marginBottom: 28,
  },
  headline: {
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontSize: 130,
    lineHeight: 0.92,
    fontWeight: 950,
    letterSpacing: 0,
    maxWidth: 1280,
  },
  headlineAccent: {
    color: '#f8d86c',
    display: 'inline-block',
    width: 'fit-content',
  },
  subhead: {
    margin: '46px 0 0',
    fontSize: 48,
    lineHeight: 1.15,
    color: 'rgba(251,251,247,0.86)',
    maxWidth: 1250,
  },
  outcomeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 22,
    marginTop: 54,
    width: 1250,
  },
  outcomeCard: {
    minHeight: 126,
    borderRadius: 8,
    color: '#111114',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '22px 28px',
    fontSize: 42,
    lineHeight: 1.05,
    fontWeight: 900,
    boxShadow: '0 22px 70px rgba(0,0,0,0.26)',
  },
  aiBadge: {
    marginTop: 44,
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 92,
    padding: '0 42px',
    borderRadius: 8,
    backgroundColor: '#fbfbf7',
    color: '#111114',
    fontSize: 62,
    fontWeight: 950,
    boxShadow: '0 22px 80px rgba(251,251,247,0.16)',
  },
  caption: {
    position: 'absolute',
    left: 112,
    right: 112,
    bottom: 74,
    margin: 0,
    color: 'rgba(251,251,247,0.74)',
    fontSize: 25,
    lineHeight: 1.35,
  },
};
