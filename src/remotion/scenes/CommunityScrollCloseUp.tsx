import type { CSSProperties } from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import ambientAudio from '../assets/audio/stratoma-ambient.wav';
import buttonChimeAudio from '../assets/audio/stratoma-button-chime.wav';
import scrollWhooshAudio from '../assets/audio/stratoma-scroll-whoosh.wav';
import uiPopAudio from '../assets/audio/stratoma-ui-pop.wav';
import stratomaIcon from '../assets/stratoma-icon-transparent.png';
import stratomaLogo from '../assets/stratoma-logo-transparent.png';
import skoolRecording from '../assets/video/skool-screen-recording.mp4';

export const CommunityScrollCloseUp = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneIntro = spring({
    frame,
    fps,
    config: {
      damping: 20,
      stiffness: 95,
      mass: 0.9,
    },
  });

  const logoIntro = spring({
    frame: frame - 4,
    fps,
    config: {
      damping: 16,
      stiffness: 115,
      mass: 0.82,
    },
  });

  const logoSweep = interpolate(frame, [16, 58], [-150, 430], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const logoGlow = interpolate(frame, [0, 20, 58, 82], [0, 0.42, 0.2, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badgePulse = interpolate(frame, [126, 138, 150, 162], [1, 1.035, 1, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const badgeIconSpin = interpolate(frame, [124, 162], [0, 360], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const glareX = interpolate(frame, [18, 160], [-380, 620], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={styles.stage}>
      <Audio src={ambientAudio} volume={0.32} />
      <Sequence from={6}>
        <Audio src={uiPopAudio} volume={0.28} />
      </Sequence>
      <Sequence from={28}>
        <Audio src={scrollWhooshAudio} volume={0.42} playbackRate={0.92} />
      </Sequence>
      <Sequence from={76}>
        <Audio src={uiPopAudio} volume={0.18} />
      </Sequence>
      <Sequence from={92}>
        <Audio src={uiPopAudio} volume={0.16} />
      </Sequence>
      <Sequence from={118}>
        <Audio src={scrollWhooshAudio} volume={0.24} playbackRate={1.08} />
      </Sequence>
      <Sequence from={132}>
        <Audio src={buttonChimeAudio} volume={0.34} />
      </Sequence>

      <div style={styles.backgroundTexture} />
      <div style={styles.leftCopy}>
        <div
          style={{
            ...styles.brandLogoWrap,
            opacity: interpolate(logoIntro, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(logoIntro, [0, 1], [28, 0])}px) scale(${interpolate(
              logoIntro,
              [0, 1],
              [0.92, 1],
            )})`,
          }}
        >
          <div style={{ ...styles.brandLogoGlow, opacity: logoGlow }} />
          <img src={stratomaLogo} style={styles.brandLogo} />
          <div style={{ ...styles.brandLogoSweep, transform: `translateX(${logoSweep}px) rotate(18deg)` }} />
        </div>
        <div style={styles.eyebrow}>Stratoma Academy</div>
        <h1 style={styles.title}>Community feed in motion</h1>
        <p style={styles.subtitle}>A polished close-up of members, live sessions, AI prompts, and offer wins moving through the Academy app.</p>
      </div>

      <div
        style={{
          ...styles.phoneWrap,
          opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          transform: `translateX(120px) rotate(-5deg) scale(${interpolate(phoneIntro, [0, 1], [0.92, 1])})`,
        }}
      >
        <div style={styles.phoneShadow} />
        <div style={styles.phone}>
          <div style={styles.recordingMask}>
            <OffthreadVideo src={skoolRecording} style={styles.recordingVideo} volume={0} />
            <div style={{ ...styles.glare, transform: `translateX(${glareX}px) rotate(18deg)` }} />
          </div>
          <div style={{ ...styles.phoneBadge, transform: `scale(${badgePulse})` }}>
            <img src={stratomaIcon} style={{ ...styles.badgeIcon, transform: `rotate(${badgeIconSpin}deg)` }} />
            <span>Stratoma Academy</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const styles: Record<string, CSSProperties> = {
  stage: {
    backgroundColor: '#07111f',
    color: '#f5f5f5',
    fontFamily: 'Inter, Arial, Helvetica, sans-serif',
    overflow: 'hidden',
  },
  backgroundTexture: {
    position: 'absolute',
    inset: 0,
    background:
      'radial-gradient(circle at 72% 24%, rgba(0,174,239,0.24), transparent 30%), radial-gradient(circle at 28% 72%, rgba(3,78,162,0.34), transparent 34%), linear-gradient(135deg, rgba(245,245,245,0.06) 0 1px, transparent 1px 24px)',
  },
  leftCopy: {
    position: 'absolute',
    top: 160,
    left: 116,
    width: 690,
  },
  brandLogoWrap: {
    position: 'relative',
    width: 360,
    height: 82,
    marginBottom: 44,
    overflow: 'hidden',
    transformOrigin: 'left center',
  },
  brandLogo: {
    position: 'relative',
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'left center',
    filter: 'drop-shadow(0 18px 34px rgba(0,0,0,0.26))',
    zIndex: 2,
  },
  brandLogoGlow: {
    position: 'absolute',
    left: 18,
    top: 8,
    width: 100,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#00aeef',
    filter: 'blur(24px)',
    zIndex: 1,
  },
  brandLogoSweep: {
    position: 'absolute',
    top: -36,
    bottom: -36,
    width: 72,
    background: 'linear-gradient(90deg, transparent, rgba(245,245,245,0.42), transparent)',
    zIndex: 3,
  },
  eyebrow: {
    color: '#00aeef',
    fontSize: 30,
    fontWeight: 900,
    textTransform: 'uppercase',
  },
  title: {
    margin: '24px 0 0',
    fontSize: 104,
    lineHeight: 0.96,
    letterSpacing: 0,
    fontWeight: 950,
  },
  subtitle: {
    margin: '34px 0 0',
    color: 'rgba(245,245,245,0.76)',
    fontSize: 36,
    lineHeight: 1.2,
  },
  phoneWrap: {
    position: 'absolute',
    top: 78,
    right: 270,
    width: 585,
    height: 940,
    transformOrigin: 'center center',
  },
  phoneShadow: {
    position: 'absolute',
    inset: '58px -42px -40px 52px',
    borderRadius: 72,
    background: 'rgba(0,0,0,0.34)',
    filter: 'blur(42px)',
  },
  phone: {
    position: 'absolute',
    inset: 0,
    borderRadius: 66,
    backgroundColor: '#061326',
    border: '16px solid #12305a',
    boxShadow: 'inset 0 0 0 2px rgba(245,245,245,0.08), 0 30px 90px rgba(0,0,0,0.34)',
    overflow: 'hidden',
  },
  recordingMask: {
    position: 'absolute',
    inset: 18,
    overflow: 'hidden',
    borderRadius: 50,
    backgroundColor: '#050b16',
  },
  recordingVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
  },
  glare: {
    position: 'absolute',
    top: -120,
    bottom: -120,
    width: 110,
    background: 'linear-gradient(90deg, transparent, rgba(245,245,245,0.18), transparent)',
  },
  phoneBadge: {
    position: 'absolute',
    left: 52,
    right: 52,
    bottom: 38,
    height: 58,
    borderRadius: 8,
    backgroundColor: 'rgba(6,19,38,0.78)',
    color: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    fontSize: 20,
    fontWeight: 950,
    boxShadow: '0 18px 44px rgba(0,0,0,0.24)',
    backdropFilter: 'blur(14px)',
    transformOrigin: 'center center',
  },
  badgeIcon: {
    width: 34,
    height: 34,
    objectFit: 'contain',
  },
};
