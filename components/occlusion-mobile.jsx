"use client";

import React from "react";
import { IOSDevice } from "./ios-frame";

// Resolves an asset path to an inlined data URI when the build is self-contained.
// Falls back to a root-absolute public path (e.g. /assets/...).
const MEDIA = (p) => {
  if (p && typeof window !== "undefined" && window.__M && window.__M[p]) return window.__M[p];
  if (!p) return p;
  if (p.startsWith("/") || p.startsWith("http") || p.startsWith("blob:") || p.startsWith("data:")) return p;
  return `/${p}`;
};

// iOS Safari/Chrome often show a black frame until play. Prefer real poster images;
// keep video URLs clean (no #t= fragment) so playback isn't truncated or restarted.
const posterOf = (p) => {
  if (!p || typeof p !== "string") return undefined;
  if (p.startsWith("blob:") || p.startsWith("data:")) return undefined;
  return MEDIA(p.replace(/\.(mp4|webm|mov)(\?.*)?$/i, ".jpg"));
};
const videoSrc = (p) => MEDIA(p);

// Occlusion Training — Train section of the Trajekt player app (mobile).

// Temporarily hide Reaction Time (tap-the-dots) from Train / Home.
const ENABLE_REACTION_TIME = false;

// Shared tokens/primitives — project copy of the uploaded shared.jsx.
// Edits: Inter for both text and numerics.

// Shared tokens, icons, primitives for Occlusion Training app
// Globals: T, Icon, Btn, Chip, Avatar, Sparkline, useLocal

const T = {
  bg: '#030303',
  bg1: '#0A0A0A',
  bg2: '#121212',
  bg3: '#1A1A1A',
  bg4: '#222222',
  border: '#1F1F1F',
  borderStrong: '#2B2B2B',
  fg: '#EBEBEF',
  fg2: '#A8A8AD',
  fg3: '#6E6E73',
  fg4: '#4A4A4D',
  accent: '#3E63DD',
  accentHover: '#4F76E0',
  accentSoft: 'rgba(62,99,221,0.12)',
  accentSofter: 'rgba(62,99,221,0.06)',
  accentBorder: 'rgba(62,99,221,0.35)',
  green: '#30A46C',
  greenSoft: 'rgba(48,164,108,0.14)',
  red: '#E5484D',
  redSoft: 'rgba(229,72,77,0.14)',
  orange: '#F76B15',
  yellow: '#EAB308',
  purple: '#8E4EC6',
  cyan: '#0EA5E9',
  teal: '#14B8A6',
  mono: "'Inter', -apple-system, sans-serif", // numerics: Inter with tabular figures
  sans: "'Inter', -apple-system, sans-serif",
};

// 9 pitch types (full set)
const PITCH_TYPES = [
  { code: 'FF', name: '4-Seam',    color: '#E5484D' },
  { code: 'FT', name: '2-Seam',    color: '#F76B15' },
  { code: 'FC', name: 'Cutter',    color: '#EAB308' },
  { code: 'SL', name: 'Slider',    color: '#3E63DD' },
  { code: 'CU', name: 'Curveball', color: '#8E4EC6' },
  { code: 'CH', name: 'Changeup',  color: '#30A46C' },
  { code: 'FS', name: 'Splitter',  color: '#14B8A6' },
  { code: 'SI', name: 'Sinker',    color: '#0EA5E9' },
  { code: 'SW', name: 'Sweeper',   color: '#F472B6' },
];
const byCode = (c) => PITCH_TYPES.find(p => p.code === c) || PITCH_TYPES[0];

// 13-zone model: 1-9 are 3x3 strike zones, 11-14 are ball corner quadrants
const ZONE_LABELS = {
  1: 'High In',    2: 'High Mid',  3: 'High Out',
  4: 'Mid In',     5: 'Middle',    6: 'Mid Out',
  7: 'Low In',     8: 'Low Mid',   9: 'Low Out',
  11: 'Up & In',  12: 'Up & Out',
  13: 'Down In',  14: 'Down Out',
};
const isBallZone = (z) => z >= 11;

// ─────────────────────────────────────────────────────────
// Icon set — thin, Radix-style
const Icon = ({ name, size = 14, color = 'currentColor', sw = 1.4 }) => {
  const p = { width: size, height: size, viewBox: '0 0 15 15', fill: 'none' };
  const s = { stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const icons = {
    home:    <svg {...p}><path d="M2 6.5L7.5 2l5.5 4.5V13H2V6.5z" {...s}/><path d="M6 13V9h3v4" {...s}/></svg>,
    target:  <svg {...p}><circle cx="7.5" cy="7.5" r="5.5" {...s}/><circle cx="7.5" cy="7.5" r="3" {...s}/><circle cx="7.5" cy="7.5" r="1" fill={color}/></svg>,
    play:    <svg {...p}><path d="M4 2.5L13 7.5L4 12.5V2.5z" fill={color}/></svg>,
    pause:   <svg {...p}><rect x="3.5" y="3" width="3" height="9" rx="0.5" fill={color}/><rect x="8.5" y="3" width="3" height="9" rx="0.5" fill={color}/></svg>,
    chart:   <svg {...p}><path d="M2 13V3M2 13h11" {...s}/><path d="M4 10l2-3 2 2 3-5" {...s}/></svg>,
    trophy:  <svg {...p}><path d="M5 2h5v3.5a2.5 2.5 0 11-5 0V2zM3 3.5h2v1A1.5 1.5 0 113.5 3M12 3.5h-2v1A1.5 1.5 0 1011.5 3M5.5 11.5h4M6 13h3M7.5 8v3.5" {...s}/></svg>,
    user:    <svg {...p}><circle cx="7.5" cy="5" r="2.5" {...s}/><path d="M3 13c0-2.5 2-4 4.5-4S12 10.5 12 13" {...s}/></svg>,
    settings:<svg {...p}><circle cx="7.5" cy="7.5" r="2" {...s}/><path d="M7.5 1.5v1.5M7.5 12v1.5M1.5 7.5H3M12 7.5h1.5M3.3 3.3l1 1M10.7 10.7l1 1M3.3 11.7l1-1M10.7 4.3l1-1" {...s}/></svg>,
    bolt:    <svg {...p}><path d="M8.5 1L3 8.5h3.5L6 14l5.5-7.5H8L8.5 1z" {...s} fill={color} fillOpacity="0.15"/></svg>,
    flame:   <svg {...p}><path d="M7.5 1.5C7.5 4 5 4.5 5 7.5a2.5 2.5 0 005 0c0-.7-.2-1.4-.5-2 .5.4.8 1 .8 1.7 0 1.5-1.3 2.8-2.8 2.8M4.5 9.5c0 1.7 1.3 3 3 3s3-1.3 3-3" {...s}/></svg>,
    check:   <svg {...p}><path d="M3 7.5L6.5 11L12 4.5" {...s} strokeWidth="1.8"/></svg>,
    x:       <svg {...p}><path d="M3.5 3.5l8 8M11.5 3.5l-8 8" {...s} strokeWidth="1.6"/></svg>,
    arrow:   <svg {...p}><path d="M3 7.5h9M8.5 4L12 7.5L8.5 11" {...s}/></svg>,
    arrowL:  <svg {...p}><path d="M12 7.5H3M6.5 4L3 7.5L6.5 11" {...s}/></svg>,
    plus:    <svg {...p}><path d="M7.5 2v11M2 7.5h11" {...s} strokeWidth="1.5"/></svg>,
    eye:     <svg {...p}><path d="M1.5 7.5C3 5 5 3.5 7.5 3.5s4.5 1.5 6 4c-1.5 2.5-3.5 4-6 4s-4.5-1.5-6-4z" {...s}/><circle cx="7.5" cy="7.5" r="1.5" {...s}/></svg>,
    eyeOff:  <svg {...p}><path d="M3 4l9 7M2 8c.6-1 1.4-1.8 2.3-2.4M6.5 4.5C6.8 4.4 7.1 4.4 7.5 4.4c2.5 0 4.5 1.5 6 4-.4.7-.9 1.3-1.5 1.8" {...s}/></svg>,
    google:  <svg width={size} height={size} viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
    apple:   <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M17.05 12.04c-.03-3 2.45-4.45 2.56-4.52-1.4-2.04-3.57-2.32-4.34-2.35-1.84-.19-3.6 1.09-4.54 1.09-.95 0-2.39-1.07-3.94-1.04-2.02.03-3.9 1.18-4.94 2.99-2.11 3.66-.54 9.06 1.51 12.03 1 1.45 2.19 3.07 3.74 3.02 1.51-.06 2.08-.97 3.9-.97s2.34.97 3.93.94c1.62-.03 2.65-1.46 3.65-2.93 1.15-1.68 1.62-3.31 1.65-3.39-.04-.02-3.16-1.21-3.18-4.87zM14.36 4.05c.83-1 1.39-2.4 1.24-3.79-1.2.05-2.65.8-3.51 1.8-.77.88-1.45 2.3-1.27 3.66 1.34.1 2.71-.68 3.54-1.67z"/></svg>,
    logout:  <svg {...p}><path d="M9 11v1.5H3v-10h6V4M11 5l2.5 2.5L11 10M6 7.5h7.5" {...s}/></svg>,
    wifi:    <svg {...p}><path d="M1.5 5.5C3 4 5 3 7.5 3s4.5 1 6 2.5" {...s}/><path d="M3.5 7.5C4.5 6.5 6 6 7.5 6s3 0.5 4 1.5" {...s}/><circle cx="7.5" cy="11" r="1" fill={color}/></svg>,
    calendar:<svg {...p}><rect x="2" y="3" width="11" height="10" rx="1" {...s}/><path d="M5 1.5v3M10 1.5v3M2 6h11" {...s}/></svg>,
    clock:   <svg {...p}><circle cx="7.5" cy="7.5" r="5.5" {...s}/><path d="M7.5 4.5v3l2 1.5" {...s}/></svg>,
    refresh: <svg {...p}><path d="M2.5 8a5 5 0 019-3M12.5 7a5 5 0 01-9 3M11 4l1.5 1L13.5 3M4 11L2.5 10L1.5 12" {...s}/></svg>,
    lock:    <svg {...p}><rect x="3" y="6.5" width="9" height="6.5" rx="1" {...s}/><path d="M5 6.5V4.5a2.5 2.5 0 015 0v2" {...s}/></svg>,
    mail:    <svg {...p}><rect x="2" y="3.5" width="11" height="8" rx="1" {...s}/><path d="M2.5 4l5 4 5-4" {...s}/></svg>,
    medal:   <svg {...p}><circle cx="7.5" cy="9.5" r="3.5" {...s}/><path d="M5 6.5L4 1.5h7L10 6.5" {...s}/></svg>,
    sparkle: <svg {...p}><path d="M7.5 1.5L8.7 5.8L13 7L8.7 8.2L7.5 12.5L6.3 8.2L2 7L6.3 5.8z" {...s} strokeWidth="1.2"/></svg>,
    fire:    <svg {...p}><path d="M7.5 1.5c-1 1.5-3 3-3 5.5a3 3 0 006 0c0-1-.3-1.7-.7-2.3.3.4.4 1 .4 1.5 0 1-.7 1.7-1.7 1.7M5 9.5c0 1.5 1.1 2.5 2.5 2.5s2.5-1 2.5-2.5" {...s}/></svg>,
  };
  return icons[name] || null;
};

// ─────────────────────────────────────────────────────────
const Btn = ({ children, variant = 'primary', size = 'md', icon, iconRight, onClick, disabled, style = {}, full }) => {
  const variants = {
    primary:   { bg: T.fg, color: T.bg, border: 'transparent', hover: '#fff' },
    accent:    { bg: T.accent, color: '#fff', border: 'transparent', hover: T.accentHover },
    secondary: { bg: T.bg2, color: T.fg, border: T.borderStrong, hover: T.bg3 },
    outline:   { bg: 'transparent', color: T.fg, border: T.borderStrong, hover: T.bg2 },
    ghost:     { bg: 'transparent', color: T.fg2, border: 'transparent', hover: T.bg2 },
    danger:    { bg: T.red, color: '#fff', border: 'transparent', hover: '#EC5D62' },
  };
  const sz = { sm: { p: '7px 12px', fs: 12, r: 6 }, md: { p: '9px 16px', fs: 13, r: 8 }, lg: { p: '12px 22px', fs: 14, r: 10 }, xl: { p: '16px 28px', fs: 15, r: 12 } }[size];
  const [hover, setHover] = React.useState(false);
  const c = variants[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, justifyContent: 'center',
        background: disabled ? T.bg2 : (hover ? c.hover : c.bg),
        color: disabled ? T.fg4 : c.color,
        border: `1px solid ${c.border === 'transparent' ? 'transparent' : c.border}`,
        padding: sz.p, fontSize: sz.fs, fontWeight: 600, borderRadius: sz.r,
        cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all .12s', letterSpacing: '-0.005em',
        width: full ? '100%' : 'auto',
        ...style,
      }}>
      {icon}{children}{iconRight}
    </button>
  );
};

const Chip = ({ children, variant = 'default', icon, style = {} }) => {
  const variants = {
    default: { bg: T.bg2, color: T.fg2, border: T.border },
    accent:  { bg: T.accentSoft, color: '#96B9F8', border: T.accentBorder },
    green:   { bg: T.greenSoft, color: '#5BB98B', border: 'rgba(48,164,108,0.3)' },
    red:     { bg: T.redSoft, color: '#F16A6E', border: 'rgba(229,72,77,0.3)' },
    live:    { bg: T.accentSoft, color: '#96B9F8', border: T.accentBorder },
    solid:   { bg: T.fg, color: T.bg, border: 'transparent' },
  };
  const s = variants[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, borderRadius: 9999,
      fontSize: 10, fontWeight: 700, padding: '4px 10px',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.25,
      whiteSpace: 'nowrap', flexShrink: 0, ...style,
    }}>
      {variant === 'live' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: T.accent, boxShadow: `0 0 6px ${T.accent}` }}/>}
      {icon}{children}
    </span>
  );
};

const Avatar = ({ name = 'Player', size = 32, color = T.accent, color2 = T.purple, src }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const squircle = Math.round(size * 0.32);
  if (src) return <img src={MEDIA(src)} alt={name} style={{ width: size, height: size, borderRadius: squircle, objectFit: 'cover', flexShrink: 0 }}/>;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, ${color2})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: '#fff', flexShrink: 0,
      letterSpacing: '0.02em',
    }}>{initials}</div>
  );
};

const Sparkline = ({ data, color = T.accent, w = 100, h = 28, fill = true }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const xs = data.map((_, i) => (i / (data.length - 1)) * w);
  const ys = data.map(d => h - ((d - min) / range) * h * 0.85 - h * 0.075);
  const path = 'M ' + xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' L ');
  const area = path + ` L ${w},${h} L 0,${h} Z`;
  const id = 'g_' + Math.random().toString(36).slice(2, 8);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      {fill && <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>}
      {fill && <path d={area} fill={`url(#${id})`}/>}
      <path d={path} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// Stamp small label component for section headers
const Eyebrow = ({ children, color = T.fg3, style = {} }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.12em', ...style }}>{children}</div>
);

// Persistent useState backed by localStorage
const useLocal = (key, initial) => {
  const [val, setVal] = React.useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v === null ? initial : JSON.parse(v);
    } catch { return initial; }
  });
  React.useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
};

// ─────────────────────────────────────────────────────────
// Mock pitches dataset — what the player will be quizzed on
// Each has a video file + ground-truth zone + ground-truth pitch type + meta
const MOCK_PITCHES = [
  { id: 1, video: 'assets/pitch-1.mp4', code: 'FF', zone: 5,  velo: 95.4, spin: 2410, pitcher: 'R. Cole',     handedness: 'RHP' },
  { id: 2, video: 'assets/pitch-2.mp4', code: 'SL', zone: 9,  velo: 87.1, spin: 2640, pitcher: 'C. Sale',     handedness: 'LHP' },
  { id: 3, video: 'assets/pitch-3.mp4', code: 'CU', zone: 14, velo: 79.6, spin: 3010, pitcher: 'C. Burnes',   handedness: 'RHP' },
  { id: 4, video: 'assets/pitch-1.mp4', code: 'CH', zone: 8,  velo: 84.2, spin: 1820, pitcher: 'D. Bauer',    handedness: 'RHP' },
  { id: 5, video: 'assets/pitch-2.mp4', code: 'FC', zone: 4,  velo: 91.0, spin: 2350, pitcher: 'M. Rivera',   handedness: 'RHP' },
  { id: 6, video: 'assets/pitch-3.mp4', code: 'SW', zone: 11, velo: 83.5, spin: 2780, pitcher: 'A. Ottavino', handedness: 'RHP' },
  { id: 7, video: 'assets/pitch-1.mp4', code: 'SI', zone: 7,  velo: 92.8, spin: 2210, pitcher: 'F. Hernandez',handedness: 'RHP' },
  { id: 8, video: 'assets/pitch-2.mp4', code: 'FS', zone: 13, velo: 86.7, spin: 1450, pitcher: 'K. Senga',    handedness: 'RHP' },
  { id: 9, video: 'assets/pitch-3.mp4', code: 'FT', zone: 6,  velo: 93.2, spin: 2280, pitcher: 'L. McCullers',handedness: 'RHP' },
  { id: 10,video: 'assets/pitch-1.mp4', code: 'FF', zone: 2,  velo: 96.8, spin: 2520, pitcher: 'J. deGrom',   handedness: 'RHP' },
  { id: 11,video: 'assets/pitch-2.mp4', code: 'SL', zone: 12, velo: 88.4, spin: 2700, pitcher: 'S. Strider',  handedness: 'RHP' },
  { id: 12,video: 'assets/pitch-3.mp4', code: 'CU', zone: 1,  velo: 77.9, spin: 2950, pitcher: 'A. Heaney',   handedness: 'LHP' },
  { id: 13,video: 'assets/pitch-1.mp4', code: 'CH', zone: 3,  velo: 82.5, spin: 1780, pitcher: 'L. Castillo', handedness: 'RHP' },
  { id: 14,video: 'assets/pitch-2.mp4', code: 'SI', zone: 5,  velo: 90.1, spin: 2180, pitcher: 'B. Webb',     handedness: 'RHP' },
  { id: 15,video: 'assets/pitch-3.mp4', code: 'FC', zone: 6,  velo: 92.4, spin: 2460, pitcher: 'K. Jansen',   handedness: 'RHP' },
];

const LEADERBOARD = [
  { rank: 1, name: 'Marcus Garcia',   handle: 'mgarcia',   pts: 14820, sessions: 42, accuracy: 78, you: false },
  { rank: 2, name: 'Jordan Okoye',    handle: 'okoye7',    pts: 13990, sessions: 38, accuracy: 76, you: false },
  { rank: 3, name: 'Riley Chen',      handle: 'rchen',     pts: 12410, sessions: 31, accuracy: 74, you: false },
  { rank: 4, name: 'Sam Hayes',       handle: 'samh',      pts: 11020, sessions: 29, accuracy: 71, you: false },
  { rank: 5, name: 'Avery Patel',     handle: 'apatel',    pts: 10240, sessions: 26, accuracy: 70, you: true  },
  { rank: 6, name: 'Drew Kim',        handle: 'dkim',      pts:  9810, sessions: 28, accuracy: 68, you: false },
  { rank: 7, name: 'Tyler Brooks',    handle: 'tbrooks',   pts:  9105, sessions: 22, accuracy: 67, you: false },
  { rank: 8, name: 'Casey Morales',   handle: 'cmorales',  pts:  8650, sessions: 24, accuracy: 65, you: false },
  { rank: 9, name: 'Logan Reeves',    handle: 'lreeves',   pts:  8120, sessions: 19, accuracy: 64, you: false },
  { rank: 10,name: 'Quinn Davila',    handle: 'qdavila',   pts:  7780, sessions: 21, accuracy: 62, you: false },
];

const HISTORY = [
  { id: 's-12', date: 'May 6',  pitches: 15, score: 1840, accuracy: 73, streak: 7, mix: 'Mixed · Off-speed' },
  { id: 's-11', date: 'May 4',  pitches: 20, score: 2310, accuracy: 75, streak: 9, mix: 'Mixed · All' },
  { id: 's-10', date: 'May 3',  pitches: 10, score: 1120, accuracy: 70, streak: 5, mix: 'Fastballs' },
  { id: 's-09', date: 'May 1',  pitches: 15, score: 1660, accuracy: 67, streak: 4, mix: 'Sliders + Curve' },
  { id: 's-08', date: 'Apr 28', pitches: 25, score: 2840, accuracy: 71, streak: 8, mix: 'Mixed · All' },
  { id: 's-07', date: 'Apr 25', pitches: 15, score: 1490, accuracy: 64, streak: 3, mix: 'Mixed · Off-speed' },
  { id: 's-06', date: 'Apr 22', pitches: 10, score:  980, accuracy: 60, streak: 4, mix: 'Fastballs' },
];


// Zone picker — project copy of the uploaded zone.jsx.
// Edits: dot grid removed, larger reset hit area.

// Free-placement zone picker — click anywhere on the catcher-view diagram
// to drop a baseball where you think the pitch crossed.
//
// Value is { x, y } in normalized coords [0..1]. The strike box occupies
// the inner 60% of the frame (0.2 → 0.8). Anything outside is a ball.
//
// Globals: ZonePicker, ZoneDisplay, classifyZone, zoneToCoord

const ZONE_GEOMETRY = (size) => {
  const pad = size * 0.18;
  const sz  = size - pad * 2;
  const cellSz = sz / 3;
  return { pad, sz, cellSz };
};

// Strike-box edges in normalized coords
const SX0 = 0.18, SX1 = 0.82;

// Classify a placement → legacy zone code (1-9 strike, 11-14 ball corners)
const classifyZone = ({ x, y }) => {
  const inX = x >= SX0 && x <= SX1;
  const inY = y >= SX0 && y <= SX1;
  if (inX && inY) {
    const col = Math.min(2, Math.max(0, Math.floor((x - SX0) / ((SX1 - SX0) / 3))));
    const row = Math.min(2, Math.max(0, Math.floor((y - SX0) / ((SX1 - SX0) / 3))));
    return row * 3 + col + 1; // 1..9
  }
  const left = x < 0.5, top = y < 0.5;
  if (top && left)  return 11; // Up & In
  if (top && !left) return 12; // Up & Out
  if (!top && left) return 13; // Down In
  return 14;                    // Down Out
};

// Inverse — center coord for a zone code (used to render truth)
const zoneToCoord = (z) => {
  if (z >= 1 && z <= 9) {
    const i = z - 1;
    const c = i % 3, r = Math.floor(i / 3);
    const w = (SX1 - SX0) / 3;
    return { x: SX0 + w * (c + 0.5), y: SX0 + w * (r + 0.5) };
  }
  switch (z) {
    case 11: return { x: 0.09, y: 0.09 };
    case 12: return { x: 0.91, y: 0.09 };
    case 13: return { x: 0.09, y: 0.91 };
    case 14: return { x: 0.91, y: 0.91 };
    default: return { x: 0.5, y: 0.5 };
  }
};

const Baseball = ({ size = 22, color = '#fff', stitch = '#E54B4B', shadow = false, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{
    filter: shadow ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))' : 'none',
    ...style,
  }}>
    <circle cx="12" cy="12" r="10.5" fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth="0.6"/>
    <path d="M3.6 8 Q12 12 20.4 8" fill="none" stroke={stitch} strokeWidth="1.1" strokeLinecap="round"/>
    <path d="M3.6 16 Q12 12 20.4 16" fill="none" stroke={stitch} strokeWidth="1.1" strokeLinecap="round"/>
    <g stroke={stitch} strokeWidth="0.6" strokeLinecap="round">
      <line x1="5" y1="6.4" x2="5.7" y2="7.4"/>
      <line x1="7" y1="5.4" x2="7.6" y2="6.5"/>
      <line x1="9" y1="4.9" x2="9.5" y2="6.0"/>
      <line x1="11" y1="4.7" x2="11.4" y2="5.9"/>
      <line x1="13" y1="4.7" x2="12.6" y2="5.9"/>
      <line x1="15" y1="4.9" x2="14.5" y2="6.0"/>
      <line x1="17" y1="5.4" x2="16.4" y2="6.5"/>
      <line x1="19" y1="6.4" x2="18.3" y2="7.4"/>

      <line x1="5" y1="17.6" x2="5.7" y2="16.6"/>
      <line x1="7" y1="18.6" x2="7.6" y2="17.5"/>
      <line x1="9" y1="19.1" x2="9.5" y2="18.0"/>
      <line x1="11" y1="19.3" x2="11.4" y2="18.1"/>
      <line x1="13" y1="19.3" x2="12.6" y2="18.1"/>
      <line x1="15" y1="19.1" x2="14.5" y2="18.0"/>
      <line x1="17" y1="18.6" x2="16.4" y2="17.5"/>
      <line x1="19" y1="17.6" x2="18.3" y2="16.6"/>
    </g>
  </svg>
);

const ZonePicker = ({ value, onChange, size = 320, truth = null, locked = false }) => {
  const G = ZONE_GEOMETRY(size);
  const planeRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const truthCoord = truth != null ? zoneToCoord(truth) : null;

  const handlePoint = (e) => {
    if (locked || !planeRef.current) return;
    const rect = planeRef.current.getBoundingClientRect();
    const cx = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left;
    const cy = (e.touches?.[0]?.clientY ?? e.clientY) - rect.top;
    const x = Math.max(0.02, Math.min(0.98, cx / rect.width));
    const y = Math.max(0.02, Math.min(0.98, cy / rect.height));
    onChange({ x, y });
  };

  const onDown = (e) => { setDragging(true); handlePoint(e); };
  const onMove = (e) => { if (dragging) handlePoint(e); };
  const onUp   = () => setDragging(false);

  const z = value ? classifyZone(value) : null;
  const truthZ = truth;
  const isCorrect = locked && z != null && truthZ != null && z === truthZ;

  // Place an extra "your pick vs truth" tone state when locked
  const pickColor = locked ? (isCorrect ? T.green : T.red) : T.accent;

  return (
    <div style={{ width: size, userSelect: 'none' }}>
      {/* Frame */}
      <div
        ref={planeRef}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        style={{
          position: 'relative', width: size, height: size,
          background: 'radial-gradient(circle at 50% 35%, rgba(62,99,221,0.05), rgba(3,3,3,0) 60%)',
          border: `1px solid ${T.border}`, borderRadius: 12,
          cursor: locked ? 'default' : (dragging ? 'grabbing' : 'crosshair'),
          touchAction: 'none', overflow: 'hidden',
        }}>

        {/* Catcher's-view labels */}
        <div style={{
          position: 'absolute', top: 8, left: 0, right: 0, textAlign: 'center',
          fontSize: 8, fontWeight: 700, color: T.fg4, letterSpacing: '0.22em',
        }}>CATCHER VIEW · RHB</div>
        <div style={{
          position: 'absolute', bottom: 6, left: 12, fontSize: 8, fontWeight: 700,
          color: T.fg4, letterSpacing: '0.16em',
        }}>INSIDE</div>
        <div style={{
          position: 'absolute', bottom: 6, right: 12, fontSize: 8, fontWeight: 700,
          color: T.fg4, letterSpacing: '0.16em',
        }}>OUTSIDE</div>

        {/* Home plate silhouette under the strike box */}
        <svg width={size} height={size} viewBox="0 0 100 100" preserveAspectRatio="none" style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
        }}>
          {/* Strike box */}
          <rect x="18" y="18" width="64" height="64" fill="rgba(255,255,255,0.015)" stroke="#3D3D3D" strokeWidth="0.6"/>
          {/* 3x3 grid lines */}
          <line x1="18" y1="39.33" x2="82" y2="39.33" stroke="#262626" strokeWidth="0.4" strokeDasharray="1.2 1.4"/>
          <line x1="18" y1="60.66" x2="82" y2="60.66" stroke="#262626" strokeWidth="0.4" strokeDasharray="1.2 1.4"/>
          <line x1="39.33" y1="18" x2="39.33" y2="82" stroke="#262626" strokeWidth="0.4" strokeDasharray="1.2 1.4"/>
          <line x1="60.66" y1="18" x2="60.66" y2="82" stroke="#262626" strokeWidth="0.4" strokeDasharray="1.2 1.4"/>
          {/* "Plate" pentagon under */}
          <polygon points="35,86 65,86 70,90 50,94 30,90" fill="#0c0c0c" stroke="#1F1F1F" strokeWidth="0.4"/>
          {/* Center reticle */}
          <circle cx="50" cy="50" r="0.7" fill="#3D3D3D"/>
          {/* Rule-of-thirds tick marks on edges */}
          {[39.33, 60.66].map(p => (
            <React.Fragment key={p}>
              <line x1={p} y1="16" x2={p} y2="20" stroke="#3D3D3D" strokeWidth="0.6"/>
              <line x1={p} y1="80" x2={p} y2="84" stroke="#3D3D3D" strokeWidth="0.6"/>
              <line x1="16" y1={p} x2="20" y2={p} stroke="#3D3D3D" strokeWidth="0.6"/>
              <line x1="80" y1={p} x2="84" y2={p} stroke="#3D3D3D" strokeWidth="0.6"/>
            </React.Fragment>
          ))}
        </svg>

        {/* Hover hint when no value yet */}
        {!value && !locked && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          }}>
            <div style={{
              fontSize: 11, color: T.fg3, letterSpacing: '0.14em',
              fontWeight: 600, textTransform: 'uppercase', textAlign: 'center',
              padding: '8px 14px', borderRadius: 8,
              background: 'rgba(3,3,3,0.6)', border: `1px dashed ${T.border}`,
            }}>
              Click to place the pitch
            </div>
          </div>
        )}

        {/* Truth ball (revealed on lock) */}
        {locked && truthCoord && (
          <>
            {/* Connector line from pick → truth, only if missed */}
            {value && !isCorrect && (
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <line
                  x1={value.x * size} y1={value.y * size}
                  x2={truthCoord.x * size} y2={truthCoord.y * size}
                  stroke={T.red} strokeWidth="1.5" strokeDasharray="3 4" opacity="0.6"/>
              </svg>
            )}
            <div style={{
              position: 'absolute',
              left: truthCoord.x * size, top: truthCoord.y * size,
              transform: 'translate(-50%, -50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              pointerEvents: 'none',
            }}>
              <Baseball size={26} shadow/>
              <span style={{
                fontSize: 8, fontWeight: 700, color: T.green, letterSpacing: '0.14em',
                background: 'rgba(48,164,108,0.18)', padding: '1px 5px', borderRadius: 3,
                marginTop: 2, border: `1px solid ${T.green}66`,
              }}>TRUTH</span>
            </div>
          </>
        )}

        {/* User's placed ball */}
        {value && (
          <div style={{
            position: 'absolute',
            left: value.x * size, top: value.y * size,
            transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            pointerEvents: 'none',
            transition: dragging ? 'none' : 'left .12s, top .12s',
          }}>
            {/* Halo */}
            <div style={{
              position: 'absolute', width: 46, height: 46, borderRadius: '50%',
              border: `1.5px solid ${pickColor}`, opacity: 0.5,
              animation: locked ? 'none' : 'ringPulse 1.6s ease-out infinite',
            }}/>
            <Baseball size={22} shadow/>
            {!locked && (
              <span style={{
                fontSize: 8, fontWeight: 700, color: pickColor, letterSpacing: '0.14em',
                background: 'rgba(62,99,221,0.16)', padding: '1px 5px', borderRadius: 3,
                marginTop: 2, border: `1px solid ${pickColor}66`,
              }}>YOUR CALL</span>
            )}
          </div>
        )}
      </div>

      {/* Live readout */}
      <div style={{
        marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: T.mono, fontSize: 10, color: T.fg3, letterSpacing: '0.08em',
      }}>
        <span>
          {value
            ? <>CALL: <span style={{ color: classifyZone(value) >= 11 ? T.yellow : T.green, fontWeight: 700 }}>
                {classifyZone(value) >= 11 ? 'BALL' : 'STRIKE'}
              </span> · <span style={{ color: T.fg2 }}>{ZONE_LABELS[classifyZone(value)]}</span></>
            : <span style={{ color: T.fg4 }}>NO PLACEMENT YET</span>}
        </span>
        {value && !locked && (
          <button onClick={() => onChange(null)} style={{
            background: 'transparent', border: 'none', color: T.fg3,
            fontSize: 10, fontFamily: T.mono, letterSpacing: '0.08em',
            cursor: 'pointer', padding: '6px 4px',
          }}>↺ RESET</button>
        )}
      </div>
    </div>
  );
};

// Compact display: shows pick + truth on the diagram
const ZoneDisplay = ({ pick, truth, size = 140 }) => {
  // pick may be a {x,y} placement OR (legacy) a zone-code number
  const pickCoord = pick == null ? null
    : (typeof pick === 'number' ? zoneToCoord(pick) : pick);
  const truthCoord = truth != null ? zoneToCoord(truth) : null;
  const pickZ = pick == null ? null
    : (typeof pick === 'number' ? pick : classifyZone(pick));
  const correct = pickZ != null && truth != null && pickZ === truth;
  const pickTone = correct ? T.green : T.red;

  return (
    <div style={{ position: 'relative', width: size, height: size, background: '#0a0a0a', border: `1px solid ${T.border}`, borderRadius: 8 }}>
      <svg width={size} height={size} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
        <rect x="18" y="18" width="64" height="64" fill="rgba(255,255,255,0.02)" stroke="#3D3D3D" strokeWidth="0.6"/>
        <line x1="18" y1="39.33" x2="82" y2="39.33" stroke="#262626" strokeWidth="0.4" strokeDasharray="1 1.5"/>
        <line x1="18" y1="60.66" x2="82" y2="60.66" stroke="#262626" strokeWidth="0.4" strokeDasharray="1 1.5"/>
        <line x1="39.33" y1="18" x2="39.33" y2="82" stroke="#262626" strokeWidth="0.4" strokeDasharray="1 1.5"/>
        <line x1="60.66" y1="18" x2="60.66" y2="82" stroke="#262626" strokeWidth="0.4" strokeDasharray="1 1.5"/>
        <polygon points="35,86 65,86 70,90 50,94 30,90" fill="#0c0c0c" stroke="#1F1F1F" strokeWidth="0.4"/>
        {/* connector */}
        {pickCoord && truthCoord && !correct && (
          <line
            x1={pickCoord.x * 100} y1={pickCoord.y * 100}
            x2={truthCoord.x * 100} y2={truthCoord.y * 100}
            stroke={T.red} strokeWidth="0.6" strokeDasharray="1.6 2" opacity="0.6"/>
        )}
      </svg>

      {truthCoord && (
        <div style={{
          position: 'absolute',
          left: truthCoord.x * size, top: truthCoord.y * size,
          transform: 'translate(-50%, -50%)',
          width: 12, height: 12, borderRadius: '50%',
          border: `2px solid ${T.green}`, background: 'rgba(48,164,108,0.25)',
        }}/>
      )}
      {pickCoord && (
        <div style={{
          position: 'absolute',
          left: pickCoord.x * size, top: pickCoord.y * size,
          transform: 'translate(-50%, -50%)',
          width: 10, height: 10, borderRadius: '50%',
          background: pickTone, boxShadow: `0 0 0 2px ${pickTone}33`,
        }}/>
      )}
    </div>
  );
};


// ───────── Occlusion Training — mobile app ─────────
// Phone-first: bottom tabs, full-bleed drill, thumb-reachable CTAs.

const SIMPLE_CODES = ['FF', 'SI', 'FC', 'SL', 'CU', 'CH', 'FS'];
const SIMPLE_TYPES = SIMPLE_CODES.map(byCode);
const SESSION_LEN = 10;
const AVATAR_SRC = 'assets/avatar.png';
// Rolling 30-day pitch-ID record, per type — drives the personalized session title.
const RECOGNITION = [
  { code: 'FF', right: 41, seen: 50 },
  { code: 'SI', right: 25, seen: 34 },
  { code: 'FC', right: 19, seen: 28 },
  { code: 'SL', right: 31, seen: 44 },
  { code: 'CU', right: 20, seen: 31 },
  { code: 'CH', right: 21, seen: 26 },
  { code: 'FS', right: 7,  seen: 12 },
];
const recAcc = (d) => Math.round(d.right / d.seen * 100);
const weakestType = () => RECOGNITION.slice().sort((a, b) => recAcc(a) - recAcc(b))[0];
const TOP = 10;   // no device bezel — just breathing room
const BOT = 8;

const CALL_MODES = [
  { id: 'zone',  label: 'Ball or strike', sub: 'Call the zone only' },
  { id: 'type',  label: 'Pitch type',     sub: 'Name the pitch only' },
  { id: 'both',  label: 'Zone + type',    sub: 'Both calls' },
  { id: 'spot',  label: 'Pin the spot',   sub: 'Place the ball + name it' },
];
const modeOf = (id) => CALL_MODES.find(m => m.id === id) || CALL_MODES[2];

const DEFAULT_CFG = { difficulty: 'Standard', hand: 'Both', mix: SIMPLE_CODES, length: 10, call: 'both' };
const HANDS = [
  { id: 'Both', label: 'Both', sub: 'RHP + LHP' },
  { id: 'RHP',  label: 'RHP',  sub: 'Right-handed' },
  { id: 'LHP',  label: 'LHP',  sub: 'Left-handed' },
];
const poolFor = (cfg) => {
  const mix = (cfg.mix && cfg.mix.length) ? cfg.mix : SIMPLE_CODES;
  let pool = MOCK_PITCHES.filter(p => mix.includes(p.code));
  if (cfg.hand !== 'Both') {
    const handed = pool.filter(p => p.handedness === cfg.hand);
    if (handed.length) pool = handed;
  }
  return pool.length ? pool : MOCK_PITCHES.filter(p => SIMPLE_CODES.includes(p.code));
};

const DIFFICULTIES = [
  { id: 'Rookie',   ms: 2000, blurb: 'Long look. Learn the shapes.' },
  { id: 'Standard', ms: 1400, blurb: 'Cuts at release. Game speed.' },
  { id: 'Pro',      ms: 900,  blurb: 'Cuts mid-load. Elite only.' },
];
const diffOf = (id) => DIFFICULTIES.find(d => d.id === id) || DIFFICULTIES[1];

// Release timestamps (seconds) measured from each clip. Everything the hitter
// needs — leg lift, arm action, release — is the beat just before this, so
// playback is windowed to END at the release rather than starting at frame 0.
const RELEASE_AT = {
  'assets/pitch-1.mp4': 10.05,
  'assets/pitch-2.mp4': 4.22,
  'assets/pitch-3.mp4': 5.92,
};
const CUT_OFFSET = { Rookie: 0.28, Standard: 0.02, Pro: -0.16 };
const clipWindow = (video, difficulty) => {
  const d = diffOf(difficulty);
  const rel = RELEASE_AT[video];
  const end = Math.max(0.5, (rel == null ? d.ms / 1000 : rel) + (CUT_OFFSET[d.id] || 0));
  const start = Math.max(0, end - d.ms / 1000);
  return { start, ms: Math.max(300, (end - start) * 1000) };
};

const BellIcon = ({ dot }) => (
  <span style={{ position: 'relative', display: 'inline-flex' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.fg} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8"/>
      <path d="M13.7 21a2 2 0 0 1-3.4 0"/>
    </svg>
    {dot && (
      <span style={{
        position: 'absolute', top: -3, right: -4, minWidth: 14, height: 14, borderRadius: 7,
        background: T.red, color: '#fff', fontSize: 9, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
      }}>1</span>
    )}
  </span>
);

const BatIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M13.9268 2.19123C14.9744 0.991994 16.8182 0.929852 17.9442 2.05583C19.0702 3.18182 19.008 5.02563 17.8088 6.07325L7.15104 15.3835L4.73468 17.7999C4.83641 18.0491 4.78614 18.3458 4.58385 18.5481C4.31466 18.8173 3.87822 18.8173 3.60903 18.5481L1.45189 16.391C1.1827 16.1218 1.1827 15.6853 1.45189 15.4162C1.65418 15.2139 1.95091 15.1636 2.20014 15.2653L4.61651 12.849L13.9268 2.19123ZM3.21284 16.2023L3.79773 16.7872L6.19266 14.3922C6.2036 14.3813 6.21492 14.3707 6.22658 14.3605L16.9018 5.035C17.5001 4.51233 17.5311 3.59242 16.9693 3.03066C16.4076 2.46889 15.4877 2.49989 14.965 3.09821L5.63947 13.7734C5.62929 13.7851 5.61871 13.7964 5.60776 13.8074L3.21284 16.2023ZM16.1025 15.0643C15.5695 15.0643 15.1374 15.4964 15.1374 16.0294C15.1374 16.5623 15.5695 16.9944 16.1025 16.9944C16.6354 16.9944 17.0675 16.5623 17.0675 16.0294C17.0675 15.4964 16.6354 15.0643 16.1025 15.0643ZM13.7588 16.0294C13.7588 14.735 14.8081 13.6857 16.1025 13.6857C17.3968 13.6857 18.4461 14.735 18.4461 16.0294C18.4461 17.3237 17.3968 18.373 16.1025 18.373C14.8081 18.373 13.7588 17.3237 13.7588 16.0294Z" fill={color}/>
  </svg>
);

const BallIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
    <path d="M4.64129 6.27714C4.99028 6.14625 5.3793 6.32306 5.51019 6.67205C5.6177 6.95872 5.71226 7.25306 5.79305 7.55456C5.87383 7.85605 5.93911 8.15825 5.98934 8.46027C6.05048 8.82794 5.80198 9.17557 5.43431 9.23671C5.06663 9.29785 4.71901 9.04936 4.65786 8.68168C4.61479 8.42266 4.55875 8.16316 4.48928 7.9039C4.41982 7.64464 4.3386 7.39189 4.24639 7.14603C4.1155 6.79705 4.2923 6.40803 4.64129 6.27714Z" fill={color}/>
    <path d="M5.43538 10.7638C5.80309 10.8247 6.05177 11.1722 5.99084 11.5399C5.88908 12.1539 5.72717 12.7529 5.50987 13.3288C5.37828 13.6775 4.98892 13.8536 4.64019 13.722C4.29146 13.5904 4.11543 13.201 4.24701 12.8523C4.43337 12.3584 4.57209 11.8451 4.65924 11.3192C4.72018 10.9515 5.06767 10.7028 5.43538 10.7638Z" fill={color}/>
    <path d="M15.3587 6.27714C15.0097 6.14625 14.6207 6.32306 14.4898 6.67205C14.3823 6.95872 14.2877 7.25306 14.207 7.55456C14.1262 7.85605 14.0609 8.15825 14.0107 8.46027C13.9495 8.82794 14.198 9.17557 14.5657 9.23671C14.9334 9.29785 15.281 9.04936 15.3421 8.68168C15.3852 8.42266 15.4412 8.16316 15.5107 7.9039C15.5802 7.64464 15.6614 7.39189 15.7536 7.14603C15.8845 6.79705 15.7077 6.40803 15.3587 6.27714Z" fill={color}/>
    <path d="M14.5646 10.7638C14.1969 10.8247 13.9482 11.1722 14.0092 11.5399C14.1109 12.1539 14.2728 12.7529 14.4901 13.3288C14.6217 13.6775 15.0111 13.8536 15.3598 13.722C15.7085 13.5904 15.8846 13.201 15.753 12.8523C15.5666 12.3584 15.4279 11.8451 15.3408 11.3192C15.2798 10.9515 14.9323 10.7028 14.5646 10.7638Z" fill={color}/>
    <path fillRule="evenodd" clipRule="evenodd" d="M0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10ZM3.86579 3.87769C5.43462 2.30584 7.60374 1.33333 10 1.33333C12.3963 1.33333 14.5654 2.30584 16.1342 3.87769C16.0986 3.91954 16.0633 3.96174 16.0283 4.00426C15.7917 4.29224 15.8333 4.71752 16.1213 4.95415C16.3896 5.17461 16.7771 5.15354 17.0201 4.91674C18.0559 6.34471 18.6667 8.10103 18.6667 10C18.6667 11.8984 18.0563 13.6543 17.0211 15.082C16.7783 14.8457 16.3915 14.8244 16.1232 15.0442C15.8349 15.2804 15.7926 15.7056 16.0289 15.9939C16.0639 16.0367 16.0993 16.0792 16.1351 16.1214C14.5662 17.6938 12.3967 18.6667 10 18.6667C7.60327 18.6667 5.43377 17.6938 3.86487 16.1214C3.90068 16.0792 3.93611 16.0367 3.97115 15.9939C4.20736 15.7056 4.16513 15.2804 3.87681 15.0442C3.60853 14.8244 3.22173 14.8457 2.97895 15.082C1.94372 13.6543 1.33333 11.8984 1.33333 10C1.33333 8.10103 1.94408 6.34471 2.97986 4.91674C3.22292 5.15354 3.6104 5.17461 3.8787 4.95415C4.16668 4.71752 4.2083 4.29224 3.97167 4.00426C3.93672 3.96174 3.90143 3.91954 3.86579 3.87769Z" fill={color}/>
  </svg>
);

const CastIcon = ({ color, on }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 20h.01"/>
    <path d="M7 20a4 4 0 0 0-4-4"/>
    <path d="M11 20a8 8 0 0 0-8-8"/>
    <path d="M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"/>
    {on && <rect x="6.5" y="7.5" width="11" height="7" rx="1" fill={color} stroke="none"/>}
  </svg>
);

// Cast the clip to a TV and keep calling pitches on the phone.
const CastSheet = ({ device, setDevice, onClose }) => {
  const DEVICES = ['Cage TV', 'Clubhouse Display', 'AirPlay · Living Room'];
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(3,3,3,0.6)',
      backdropFilter: 'blur(3px)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      <div onClick={e => e.stopPropagation()} className="fade-in" style={{
        background: T.bg1, borderTop: `1px solid ${T.border}`, borderRadius: '20px 20px 0 0',
        padding: `16px 20px ${BOT + 16}px`,
      }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: T.bg3, margin: '0 auto 16px' }}/>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Cast to a screen</div>
        <div style={{ fontSize: 13, color: T.fg3, marginTop: 4, lineHeight: 1.45 }}>
          Clips play on the TV. You keep calling location and pitch here on your phone.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {DEVICES.map(d => {
            const on = device === d;
            return (
              <button key={d} onClick={() => { setDevice(on ? null : d); onClose(); }} style={{
                display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, padding: '12px 14px',
                background: on ? T.accentSoft : T.bg2, border: `1px solid ${on ? T.accent : T.border}`,
                borderRadius: 14, cursor: 'pointer', fontFamily: T.sans, textAlign: 'left',
              }}>
                <CastIcon color={on ? '#96B9F8' : T.fg3} on={on}/>
                <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: on ? '#96B9F8' : T.fg }}>{d}</span>
                {on && <span style={{ fontSize: 11, fontWeight: 700, color: '#96B9F8', letterSpacing: '0.08em' }}>CONNECTED</span>}
              </button>
            );
          })}
        </div>
        {device && (
          <div style={{ marginTop: 12 }}>
            <BigBtn tone="ghost" onClick={() => { setDevice(null); onClose(); }}>Stop casting</BigBtn>
          </div>
        )}
      </div>
    </div>
  );
};

// Viewport width, so the phone-first layout can breathe up to tablet size.
const useVW = () => {
  const get = () => (typeof window === 'undefined' ? 402 : window.innerWidth);
  const [w, setW] = React.useState(get);
  React.useEffect(() => {
    const on = () => setW(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
};
const COL = 440;          // phone-width content column
const isWide = (w) => w >= 700;

const AppHeader = ({ user, cast, onCast }) => (
  <div style={{
    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '4px 16px 12px',
    position: 'relative', zIndex: 1, width: '100%', maxWidth: COL, margin: '0 auto',
  }}>
    <Avatar name={user?.name || 'JW'} size={34} src={AVATAR_SRC}/>
    <span style={{ flex: 1 }}/>
    <img src={MEDIA('assets/trajekt-lockup.svg')} alt="Trajekt" style={{ height: 25, display: 'block' }}/>
    <span style={{ flex: 1 }}/>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {onCast && (
        <button onClick={onCast} aria-label="Cast to a screen" style={{
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <CastIcon color={cast ? T.accent : T.fg} on={!!cast}/>
        </button>
      )}
      <BellIcon dot/>
    </div>
  </div>
);

const Page = ({ children, tabs, user, header = true, cast, onCast }) => {
  const [scrolled, setScrolled] = React.useState(false);
  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: TOP, background: T.bg, color: T.fg,
      fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {header && (
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 190, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(180deg, rgba(38,56,110,0.60) 0%, rgba(34,50,100,0.52) 28%, rgba(24,35,72,0.34) 52%, rgba(12,18,38,0.14) 74%, rgba(3,3,3,0) 100%)',
        }}/>
      )}
      {header && (
        <div style={{
          position: 'relative', zIndex: 2,
          filter: scrolled ? 'drop-shadow(0 8px 14px rgba(0,0,0,0.55))' : 'none',
          clipPath: 'inset(0 -40px -40px -40px)',
          transition: 'filter .18s ease-out',
        }}>
          <AppHeader user={user} cast={cast} onCast={onCast}/>
        </div>
      )}
      <div onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
        style={{ flex: 1, position: 'relative', zIndex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ width: '100%', maxWidth: COL, margin: '0 auto' }}>
          {children}
          <div style={{ height: tabs ? 8 : BOT + 8 }}/>
        </div>
      </div>
      {tabs}
    </div>
  );
};

// Section header used by every screen: 24/700 title, 14px secondary sub.
const PageHead = ({ title, sub, right, onBack, children }) => (
  <div style={{ padding: '4px 20px 18px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {onBack && (
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: 11, background: T.bg2, border: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
        }}><Icon name="arrowL" size={15} color={T.fg2}/></button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em' }}>{title}</div>
        {sub && <div style={{ fontSize: 14, color: T.fg2, marginTop: 3 }}>{sub}</div>}
      </div>
      {right}
    </div>
    {children}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, ...style }}>{children}</div>
);

// Thumb-height primary action
const BigBtn = ({ children, onClick, disabled, tone = 'accent', icon }) => {
  const bg = tone === 'accent' ? (disabled ? T.bg2 : T.accent) : T.bg2;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', minHeight: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
      background: bg, color: disabled ? T.fg4 : (tone === 'accent' ? '#fff' : T.fg),
      border: `1px solid ${tone === 'accent' ? 'transparent' : T.borderStrong}`,
      borderRadius: 14, fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em',
      cursor: disabled ? 'default' : 'pointer', fontFamily: T.sans, padding: '0 18px',
    }}>{icon}{children}</button>
  );
};

const HomeIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10.5 12 4l8 6.5V20H4v-9.5z"/><path d="M9.5 20v-5.5h5V20"/>
  </svg>
);

const TabBar = ({ tab, setTab }) => {
  const items = [
    { id: 'home',     label: 'Home' },
    { id: 'sessions', label: 'Sessions' },
    { id: 'train',    label: 'Train' },
  ];
  const INACTIVE = '#B0B4BA';
  return (
    <div style={{
      flexShrink: 0, display: 'flex', paddingBottom: BOT,
      borderTop: `1px solid ${T.border}`, background: '#0A0A0A',
    }}>
      {items.map(i => {
        const on = tab === i.id;
        const c = on ? T.accent : INACTIVE;
        return (
          <button key={i.id} onClick={() => setTab(i.id)} style={{
            flex: 1, minHeight: 58, position: 'relative', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 6, background: 'transparent',
            border: 'none', cursor: 'pointer', fontFamily: T.sans, padding: '10px 0 12px',
          }}>
            {i.id === 'home' ? <HomeIcon color={c}/> : i.id === 'sessions' ? <BatIcon color={c}/> : <BallIcon color={c}/>}
            <span style={{ fontSize: 13, fontWeight: 600, color: on ? T.fg : INACTIVE, letterSpacing: '-0.01em' }}>{i.label}</span>
            {on && <span style={{
              position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              width: 56, height: 4, borderRadius: '3px 3px 0 0', background: T.accent,
            }}/>}
          </button>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────── SIGN IN
const AuthM = ({ onLogin }) => {
  const [loading, setLoading] = React.useState(false);
  const go = () => {
    setLoading(true);
    setTimeout(() => onLogin({ name: 'Jason Whitman', email: 'jason@trajekt.io', handle: 'jwhitman' }), 550);
  };
  const CheckRing = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.5"/><path d="m8 12.3 2.7 2.7L16 9.6"/>
    </svg>
  );
  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: TOP, background: '#000', color: T.fg, fontFamily: T.sans,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      backgroundImage: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(20,29,64,0.55) 88%, rgba(30,42,92,0.7) 100%)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 18 }}>
        <img src={MEDIA('assets/trajekt-lockup.svg')} alt="Trajekt" style={{ height: 34, display: 'block' }}/>
      </div>

      <div style={{ flex: 1 }}/>

      <div style={{ padding: '0 22px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.16 }}>
          Every Swing off the Arc.<br/>In your Pocket.
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
          {['Replay every swing with Trajekt Vision™', 'Track full pitch-by-pitch and outcome'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckRing/>
              <span style={{ fontSize: 15, color: T.fg, lineHeight: 1.35 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1.15 }}/>

      <div style={{ padding: `0 22px ${BOT + 14}px` }}>
        <button onClick={go} disabled={loading} style={{
          width: '100%', minHeight: 56, borderRadius: 14, border: 'none', cursor: 'pointer',
          background: T.accent, color: '#fff', fontSize: 17, fontWeight: 700, fontFamily: T.sans,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          {loading && <span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }}/>}
          {loading ? 'Signing in…' : 'Log In'}
        </button>
        <div style={{ fontSize: 14, color: T.fg3, textAlign: 'center', marginTop: 14, lineHeight: 1.45 }}>
          Confirm your organization has granted you access to the Player Portal
        </div>
      </div>
    </div>
  );
};


// ── usage / bests / readiness on the Pitch Recognition home ──
const USAGE_7D = [
  { d: 'Mon', arc: 42, pr: 20, rx: 12, iq: 8 },
  { d: 'Tue', arc: 0,  pr: 15, rx: 0,  iq: 12 },
  { d: 'Wed', arc: 58, pr: 25, rx: 18, iq: 0 },
  { d: 'Thu', arc: 34, pr: 0,  rx: 10, iq: 6 },
  { d: 'Fri', arc: 0,  pr: 10, rx: 0,  iq: 14 },
  { d: 'Sat', arc: 66, pr: 30, rx: 22, iq: 10 },
  { d: 'Sun', arc: 38, pr: 20, rx: 8,  iq: 4 },
];
const USAGE_SERIES = [
  { k: 'arc', label: 'Arc', c: '#3E63DD' },
  { k: 'pr',  label: 'Pitch rec.', c: '#5C82E8' },
  ...(ENABLE_REACTION_TIME ? [{ k: 'rx',  label: 'Reaction', c: '#8FAEF5' }] : []),
  { k: 'iq',  label: 'Game IQ', c: '#C2D6FA' },
];

const UsageChart = () => {
  const totals = USAGE_7D.map(d => USAGE_SERIES.reduce((a, sr) => a + (d[sr.k] || 0), 0));
  const max = Math.max(...totals);
  const week = totals.reduce((a, b) => a + b, 0);
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow>Last 7 days</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>{week}</span>
            <span style={{ fontSize: 12, color: T.fg3, whiteSpace: 'nowrap' }}>reps logged</span>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#96B9F8', paddingTop: 2, whiteSpace: 'nowrap' }}>+18%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100, marginTop: 16 }}>
        {USAGE_7D.map((d, i) => (
          <div key={d.d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
            <div style={{ width: '100%', maxWidth: 26, height: 82, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
              {USAGE_SERIES.map(sr => d[sr.k] ? (
                <div key={sr.k} style={{ height: `${(d[sr.k] / max) * 100}%`, background: sr.c, borderRadius: 3, minHeight: 3 }}/>
              ) : null)}
              {!totals[i] && <div style={{ height: 3, background: T.bg3, borderRadius: 3 }}/>}
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, color: T.fg4 }}>{d.d}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
        {USAGE_SERIES.map(sr => (
          <span key={sr.k} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: sr.c, flexShrink: 0 }}/>
            <span style={{ fontSize: 11, color: T.fg2, whiteSpace: 'nowrap' }}>{sr.label}</span>
          </span>
        ))}
      </div>
    </Card>
  );
};

const BESTS = [
  { label: 'Max exit velo', value: '107.2', unit: 'mph', when: 'Today' },
  { label: 'Max distance', value: '402', unit: 'ft', when: 'Today' },
  { label: 'Most hits', value: '19', unit: 'in a session', when: 'Jul 2' },
  { label: 'Most barrels', value: '7', unit: 'in a session', when: 'Jun 28' },
];

const BestEfforts = () => {
  return (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
    {BESTS.map(b => (
      <Card key={b.label} style={{ padding: 16 }}>
        <div style={{ fontSize: 11, color: T.fg3, fontWeight: 500 }}>{b.label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 7 }}>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>{b.value}</span>
          <span style={{ fontSize: 11, color: T.fg2, fontWeight: 500 }}>{b.unit}</span>
        </div>
        <div style={{ fontSize: 10.5, color: T.fg4, marginTop: 5 }}>{b.when}</div>
      </Card>
    ))}
  </div>
  );
};

const READY_DRIVERS = [
  { label: 'Arc volume', pct: 82, detail: '238 of 290 pitches', cta: 'Book an Arc session · 20 min' },
  { label: 'Pitch recognition', pct: 54, detail: '120 of 220 reps', cta: 'Train pitch recognition · 10 min' },
  ...(ENABLE_REACTION_TIME ? [{ label: 'Reaction time', pct: 61, detail: '70 of 115 targets', cta: 'Run a reaction time set · 5 min' }] : []),
  { label: 'Game IQ', pct: 38, detail: '54 of 140 questions', cta: 'Answer Game IQ questions · 10 min' },
];
const readyBand = (n) => n >= 70 ? { c: '#30A46C', name: 'Game ready' }
  : n >= 50 ? { c: '#FFC53D', name: 'Building' }
  : { c: '#F76B15', name: 'Needs work' };

const ReadinessCard = ({ onTrain }) => {
  const score = Math.round(READY_DRIVERS.reduce((a, d) => a + d.pct, 0) / READY_DRIVERS.length);
  const R = 34, C = 2 * Math.PI * R;
  const weakest = READY_DRIVERS.reduce((a, b) => (b.pct < a.pct ? b : a));
  const band = readyBand(score);
  return (
    <Card style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 82, height: 82, flexShrink: 0 }}>
          <svg width="82" height="82" viewBox="0 0 82 82">
            <circle cx="41" cy="41" r={R} fill="none" stroke={T.bg3} strokeWidth="5"/>
            <circle cx="41" cy="41" r={R} fill="none" stroke={band.c} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={`${(score / 100) * C} ${C}`} transform="rotate(-90 41 41)"/>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.03em' }}>{score}</span>
            <span style={{ fontSize: 9, color: T.fg4, fontWeight: 600, letterSpacing: '0.06em' }}>/100</span>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Eyebrow>Game readiness</Eyebrow>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 6 }}>{band.name}</div>
          <div style={{ fontSize: 11.5, color: T.fg3, lineHeight: 1.45, marginTop: 4 }}>
            {weakest.label} is your lowest input — {weakest.detail} against this week's target.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        {READY_DRIVERS.map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11.5, color: T.fg2, width: 108, flexShrink: 0 }}>{d.label}</span>
            <span style={{ flex: 1, height: 5, borderRadius: 3, background: T.bg3, overflow: 'hidden' }}>
              <span style={{ display: 'block', width: `${d.pct}%`, height: '100%', borderRadius: 3, background: readyBand(d.pct).c }}/>
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.fg2, width: 28, textAlign: 'right' }}>{d.pct}</span>
          </div>
        ))}
      </div>
      <button onClick={onTrain} style={{
        width: '100%', minHeight: 46, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: T.bg2, color: T.fg, border: `1px solid ${T.borderStrong}`, borderRadius: 12,
        fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em', cursor: 'pointer', fontFamily: T.sans, padding: '0 14px',
      }}>{weakest.cta}</button>
    </Card>
  );
};

const PlayerHomeM = ({ user, tabs, cast, onCast, onTrain }) => {
  return (
    <Page tabs={tabs} user={user} cast={cast} onCast={onCast}>
      <PageHead title={`Hi, ${(user?.name || 'Player').split(' ')[0]}`} sub="Your week at a glance"/>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, alignItems: 'start' }}>
          <ReadinessCard onTrain={onTrain}/>
          <div>
            <Eyebrow style={{ marginBottom: 10 }}>Training volume</Eyebrow>
            <UsageChart/>
          </div>
        </div>
        <div>
          <Eyebrow style={{ marginBottom: 10 }}>Best efforts</Eyebrow>
          <BestEfforts/>
        </div>
      </div>
    </Page>
  );
};

// ─────────────────────────────────────────── HOME
const HomeM = ({ user, cfg, onQuick, onCustom, onRanks, onProgress, onOpenSession, occSessions = [], tabs, cast, onCast, onBack }) => {
  const me = LEADERBOARD.find(p => p.you) || { rank: 5, accuracy: 70, pts: 10240, sessions: 26 };
  const weakD = weakestType();
  const weak = byCode(weakD.code);
  const weakAcc = recAcc(weakD);
  const weakSeen = `${weakD.seen} looks`;
  const last = occSessions[0];
  const lastLine = last
    ? `, and your last session scored ${last.score.toLocaleString()}`
    : '';
  return (
    <Page tabs={tabs} user={user} cast={cast} onCast={onCast}>
      <PageHead title="Pitch Recognition" sub="Prepare against real pitchers" onBack={onBack}/>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card style={{ padding: 20, backgroundImage: 'radial-gradient(ellipse at 100% 0%, rgba(62,99,221,0.22), transparent 62%)' }}>
          <Eyebrow color={T.accent}>Today's focus</Eyebrow>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2, marginTop: 8 }}>
            {weak.name} recognition
          </div>
          <div style={{ fontSize: 14, color: T.fg2, lineHeight: 1.5, marginTop: 8 }}>
            {weak.name}s are your weakest read — {weakAcc}% over your last {weakSeen}.
          </div>

          {cast && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9, marginTop: 16, padding: '10px 12px',
              background: T.accentSofter, border: `1px solid ${T.accent}55`, borderRadius: 12,
            }}>
              <CastIcon color="#96B9F8" on/>
              <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: '#96B9F8', fontWeight: 600 }}>
                Casting to {cast}
              </span>
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <BigBtn onClick={onQuick}>Start today's session</BigBtn>
          </div>

          <div style={{ marginTop: 10 }}>
            <BigBtn tone="ghost" onClick={onCustom}>Custom session</BigBtn>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 10 }}>
          <Stat3 label="Streak" value="12" unit="days"/>
          <Stat3 label="Accuracy" value={`${me.accuracy}%`}/>
          <Stat3 label="Sessions" value={occSessions.length || me.sessions}/>
        </div>

        <button onClick={onRanks} style={{
          background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16,
          textAlign: 'left', cursor: 'pointer', fontFamily: T.sans, color: T.fg,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1, fontSize: 12, color: T.fg3, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Pitch recognition percentile
            </span>
            <Icon name="arrow" size={13} color={T.fg4}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
            <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1 }}>{MY_PCTL}</span>
            <span style={{ fontSize: 13, color: T.fg3, fontWeight: 600 }}>th</span>
            <span style={{ flex: 1 }}/>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: bandOf(MY_PCTL).color, background: `${bandOf(MY_PCTL).color}1F`,
              border: `1px solid ${bandOf(MY_PCTL).color}55`, padding: '4px 9px', borderRadius: 9999,
            }}>{bandOf(MY_PCTL).name}</span>
          </div>
          <div style={{ marginTop: 12 }}><PctlBar value={MY_PCTL} height={7}/></div>
        </button>

        <Card style={{ overflow: 'hidden' }}>
          <div style={{
            padding: '14px 16px', borderBottom: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}>
            <Eyebrow>Your pitch recognition sessions</Eyebrow>
            <button onClick={onProgress} style={{
              background: 'transparent', border: 'none', color: '#96B9F8', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', fontFamily: T.sans, padding: 0,
            }}>View all →</button>
          </div>
          {occSessions.length === 0 ? (
            <div style={{ padding: '20px 16px', fontSize: 13, color: T.fg3 }}>
              No sessions yet — your first one shows up here.
            </div>
          ) : occSessions.slice(0, 3).map(x => (
            <button key={x.id} onClick={() => onOpenSession(x)} style={{
              width: '100%', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10,
              alignItems: 'center', padding: '13px 16px', borderBottom: `1px solid ${T.bg2}`,
              background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: T.sans,
              color: T.fg, textAlign: 'left',
            }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{x.pitches} pitches</span>
                <span style={{ display: 'block', fontSize: 11, color: T.fg3, marginTop: 2 }}>
                  {x.when} · {modeOf(x.cfg?.call).label}
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{x.score.toLocaleString()}</span>
                <span style={{ fontSize: 10, color: T.fg3 }}>pts</span>
              </span>
              <Icon name="arrow" size={13} color={T.fg4}/>
            </button>
          ))}
        </Card>

        <Card style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>Pitch ID accuracy</div>
            <div style={{ fontSize: 12, color: T.fg3, marginTop: 3, lineHeight: 1.45 }}>
              How well you read each pitch type — last 30 days.
            </div>
          </div>
          <div style={{ padding: '10px 16px 6px' }}>
            {SIMPLE_TYPES.map((p, i) => {
              const d = RECOGNITION[i];
              const acc = recAcc(d);
              return (
                <div key={p.code} style={{ display: 'grid', gridTemplateColumns: '86px 1fr 66px', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 12, color: T.fg2, whiteSpace: 'nowrap' }}>{p.name}</span>
                  </div>
                  <div style={{ height: 5, background: T.bg3, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${acc}%`, height: '100%', background: p.color, borderRadius: 3 }}/>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, color: T.fg2, whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 700 }}>{acc}%</span>
                    <span style={{ color: T.fg4 }}> · {d.right}/{d.seen}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ padding: '4px 16px 14px', fontSize: 11, color: T.fg4 }}>
            Correct calls / pitches seen.
          </div>
        </Card>
      </div>
    </Page>
  );
};

const TrainLink = ({ icon, label, sub, onClick }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 11, minHeight: 62, padding: '12px 16px',
    background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14,
    cursor: 'pointer', textAlign: 'left', fontFamily: T.sans,
  }}>
    <Icon name={icon} size={16} color={T.fg3}/>
    <span style={{ flex: 1, minWidth: 0 }}>
      <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: T.fg }}>{label}</span>
      <span style={{ display: 'block', fontSize: 11, color: T.fg3, marginTop: 2 }}>{sub}</span>
    </span>
    <Icon name="arrow" size={13} color={T.fg4}/>
  </button>
);

const Stat3 = ({ label, value, unit }) => (
  <div style={{ flex: 1, background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: '13px 12px' }}>
    <div style={{ fontSize: 9, fontWeight: 700, color: T.fg3, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
      <span style={{ fontSize: 22, fontWeight: 800, fontFamily: T.mono, letterSpacing: '-0.03em' }}>{value}</span>
      {unit && <span style={{ fontSize: 10, color: T.fg3 }}>{unit}</span>}
    </div>
  </div>
);

// ─────────────────────────────────────────── CUSTOM SETUP
const SetupM = ({ cfg, setCfg, onBack, onStart }) => {
  const set = (patch) => setCfg({ ...cfg, ...patch });
  const toggle = (code) => {
    const has = cfg.mix.includes(code);
    const next = has ? cfg.mix.filter(c => c !== code) : [...cfg.mix, code];
    set({ mix: next.length ? next : cfg.mix });
  };
  const presets = [
    { name: 'All', codes: SIMPLE_CODES },
    { name: 'Fastballs', codes: ['FF', 'SI', 'FC'] },
    { name: 'Off-speed', codes: ['SL', 'CU', 'CH', 'FS'] },
  ];
  const count = poolFor(cfg).length;

  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: TOP, background: T.bg, color: T.fg,
      fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
        <PageHead title="Custom session" sub="Set it up how you want it" onBack={onBack}/>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card style={{ padding: 16 }}>
            <Eyebrow style={{ marginBottom: 12 }}>Pitcher handedness</Eyebrow>
            <div style={{ display: 'flex', gap: 8 }}>
              {HANDS.map(h => {
                const on = cfg.hand === h.id;
                return (
                  <button key={h.id} onClick={() => set({ hand: h.id })} style={{
                    flex: 1, minHeight: 62, padding: '10px 6px', cursor: 'pointer', fontFamily: T.sans,
                    background: on ? T.accentSoft : T.bg2, border: `1px solid ${on ? T.accent : T.border}`,
                    borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: on ? '#96B9F8' : T.fg }}>{h.label}</span>
                    <span style={{ fontSize: 10, color: T.fg3 }}>{h.sub}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card style={{ padding: 16 }}>
            <Eyebrow style={{ marginBottom: 12 }}>What you call</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {CALL_MODES.map(m => {
                const on = (cfg.call || 'both') === m.id;
                return (
                  <button key={m.id} onClick={() => set({ call: m.id })} style={{
                    minHeight: 62, padding: '11px 12px', cursor: 'pointer', fontFamily: T.sans, textAlign: 'left',
                    background: on ? T.accentSoft : T.bg2, border: `1px solid ${on ? T.accent : T.border}`,
                    borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: on ? '#96B9F8' : T.fg }}>{m.label}</span>
                    <span style={{ fontSize: 11, color: T.fg3 }}>{m.sub}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card style={{ padding: 16 }}>
            <Eyebrow style={{ marginBottom: 12 }}>Occlusion window</Eyebrow>
            <div style={{ display: 'flex', gap: 8 }}>
              {DIFFICULTIES.map(o => {
                const on = o.id === cfg.difficulty;
                return (
                  <button key={o.id} onClick={() => set({ difficulty: o.id })} style={{
                    flex: 1, minHeight: 62, padding: '10px 6px', cursor: 'pointer', fontFamily: T.sans,
                    background: on ? T.accentSoft : T.bg2, border: `1px solid ${on ? T.accent : T.border}`,
                    borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: on ? '#96B9F8' : T.fg }}>{o.id}</span>
                    <span style={{ fontSize: 10, fontFamily: T.mono, color: T.fg3 }}>{(o.ms / 1000).toFixed(1)}s</span>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: T.fg3, marginTop: 10 }}>{diffOf(cfg.difficulty).blurb}</div>
          </Card>

          <Card style={{ padding: 16 }}>
            <Eyebrow style={{ marginBottom: 12 }}>Reps</Eyebrow>
            <div style={{ display: 'flex', gap: 8 }}>
              {[5, 10, 15, 20].map(n => {
                const on = cfg.length === n;
                return (
                  <button key={n} onClick={() => set({ length: n })} style={{
                    flex: 1, minHeight: 50, cursor: 'pointer', fontFamily: T.sans,
                    background: on ? T.accentSoft : T.bg2, border: `1px solid ${on ? T.accent : T.border}`,
                    borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: T.mono,
                    color: on ? '#96B9F8' : T.fg2,
                  }}>{n}</button>
                );
              })}
            </div>
          </Card>

          <Card style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 8 }}>
              <Eyebrow>Pitch mix</Eyebrow>
              <div style={{ display: 'flex', gap: 6 }}>
                {presets.map(p => (
                  <button key={p.name} onClick={() => set({ mix: p.codes })} style={{
                    background: T.bg2, border: `1px solid ${T.border}`, color: T.fg2, minHeight: 30,
                    padding: '6px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: T.sans,
                  }}>{p.name}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {SIMPLE_TYPES.map(p => {
                const on = cfg.mix.includes(p.code);
                return (
                  <button key={p.code} onClick={() => toggle(p.code)} style={{
                    display: 'flex', alignItems: 'center', gap: 9, minHeight: 52, padding: '12px 12px',
                    background: on ? `${p.color}1A` : T.bg2, border: `1px solid ${on ? p.color : T.border}`,
                    borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: T.sans, opacity: on ? 1 : 0.6,
                  }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.fg }}>{p.name}</span>
                    {on && <span style={{ marginLeft: 'auto' }}><Icon name="check" size={12} color={p.color} sw={2.2}/></span>}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: T.fg4, fontFamily: T.mono, marginTop: 12, letterSpacing: '0.06em' }}>
              {count} CLIPS MATCH · {cfg.hand === 'Both' ? 'RHP + LHP' : cfg.hand} · {modeOf(cfg.call).label.toUpperCase()}
            </div>
          </Card>
        </div>
      </div>

      <div style={{
        flexShrink: 0, padding: `10px 16px ${BOT + 6}px`,
        borderTop: `1px solid ${T.border}`, background: 'rgba(3,3,3,0.9)', backdropFilter: 'blur(14px)',
      }}>
        <BigBtn onClick={onStart}>Start · {cfg.length} reps</BigBtn>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────── DRILL
const DrillM = ({ cfg, onComplete, onExit, cast, onCast }) => {
  const difficulty = cfg.difficulty;
  const queue = React.useMemo(() => {
    const pool = poolFor(cfg);
    const n = cfg.length || SESSION_LEN;
    const out = [];
    while (out.length < n) out.push(...[...pool].sort(() => Math.random() - 0.5));
    return out.slice(0, n);
  }, []);

  const [idx, setIdx] = React.useState(0);
  const [stage, setStage] = React.useState('ready');
  const [zonePick, setZonePick] = React.useState(null);
  const [typePick, setTypePick] = React.useState(null);
  const [bsPick, setBsPick] = React.useState(null);
  const callMode = cfg.call || 'both';
  const needsZone = callMode === 'zone' || callMode === 'both';
  const needsSpot = callMode === 'spot';
  const needsType = callMode === 'type' || callMode === 'both' || callMode === 'spot';
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [results, setResults] = React.useState([]);
  const [floatPts, setFloatPts] = React.useState(null);
  const callStart = React.useRef(0);
  const videoRef = React.useRef(null);
  const cutTimer = React.useRef(null);
  const current = queue[idx];
  const windowMs = diffOf(difficulty).ms;
  const clip = clipWindow(current.video, difficulty);
  const startRef = React.useRef(clip.start);
  startRef.current = clip.start;

  const uniqueVideos = React.useMemo(() => [...new Set(queue.map(p => p.video))], [queue]);
  const [blobUrls, setBlobUrls] = React.useState({});
  React.useEffect(() => {
    let dead = false; const made = [];
    uniqueVideos.forEach(src => {
      fetch(MEDIA(src)).then(r => r.blob()).then(b => {
        if (dead) return;
        const url = URL.createObjectURL(b); made.push(url);
        setBlobUrls(prev => (prev[src] ? prev : { ...prev, [src]: url }));
      }).catch(() => { if (!dead) setBlobUrls(prev => (prev[src] ? prev : { ...prev, [src]: src })); });
    });
    return () => { dead = true; made.forEach(u => URL.revokeObjectURL(u)); };
  }, [uniqueVideos]);
  const ready = !!blobUrls[current.video];

  const cut = React.useCallback(() => {
    clearTimeout(cutTimer.current);
    const v = videoRef.current;
    if (v) { try { v.pause(); } catch (_) {} } // hold on the last frame
    setStage(st => {
      if (st !== 'playing') return st;
      callStart.current = Date.now();
      return 'call';
    });
  }, []);
  React.useEffect(() => () => clearTimeout(cutTimer.current), []);

  // Play the full delivery through to the end of the clip, then prompt for the call.
  const play = () => {
    setStage('playing');
    clearTimeout(cutTimer.current);
    const v = videoRef.current;
    if (!v) return;
    const go = () => {
      try { v.currentTime = 0; } catch (_) {}
      v.play().catch(() => {});
    };
    try { v.pause(); } catch (_) {}
    if (v.readyState >= 1) go();
    else v.addEventListener('loadeddata', go, { once: true });
  };

  const [count, setCount] = React.useState(null);
  const countTimer = React.useRef(null);
  React.useEffect(() => () => clearInterval(countTimer.current), []);
  const needsConfirm = idx === 0 && results.length === 0;

  // Hitter taps "I'm ready", then a 3-2-1 count-in before the delivery.
  const beginCountIn = () => {
    if (!ready) return;
    setStage('count');
    setCount(3);
    clearInterval(countTimer.current);
    countTimer.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(countTimer.current);
          play();
          return null;
        }
        return c - 1;
      });
    }, 700);
  };

  // Only the first pitch waits for confirmation; the rest count in on their own.
  React.useEffect(() => {
    if (stage !== 'ready' || !ready || needsConfirm) return;
    const t = setTimeout(beginCountIn, 700);
    return () => clearTimeout(t);
  }, [stage, ready, idx, needsConfirm]);

  const submit = (code) => {
    const truthStrike = current.zone < 11;
    const picked = needsSpot ? classifyZone(zonePick) : null;
    // In spot mode the exact placement must land in the right zone; otherwise it's ball/strike.
    // A dimension the mode didn't ask for is null, not "correct".
    const zoneRight = needsSpot ? picked === current.zone
      : needsZone ? (bsPick === 'strike') === truthStrike
      : null;
    const pitchRight = needsType ? code === current.code : null;
    const base = (needsZone || needsSpot ? (zoneRight ? (needsSpot ? 100 : 50) : 0) : 0)
      + (needsType ? (pitchRight ? 100 : 0) : 0)
      + ((needsZone || needsSpot) && needsType && zoneRight && pitchRight ? 50 : 0);
    const newStreak = (zoneRight !== false && pitchRight !== false) ? streak + 1 : 0;
    // Timing bonus — a correct call inside 1.5s is worth the most, decaying to zero by 5s.
    const ms = callStart.current ? Date.now() - callStart.current : null;
    const clean = zoneRight !== false && pitchRight !== false;
    const timeBonus = (clean && ms != null)
      ? Math.round(50 * Math.max(0, Math.min(1, (5000 - ms) / 3500)))
      : 0;
    const total = Math.round(base * (1 + Math.min(newStreak, 5) * 0.1)) + timeBonus;
    setScore(s => s + total);
    setStreak(newStreak);
    setResults(r => [...r, {
      pitch: current, pickedZone: picked, bsPick, pitchPick: code,
      zoneRight, pitchRight, points: total, streak: newStreak, callMode,
      ms, timeBonus,
    }]);
    setFloatPts(total);
    setTimeout(() => setFloatPts(null), 900);
    setStage('review');
  };

  const next = () => {
    clearTimeout(cutTimer.current);
    if (idx + 1 >= queue.length) return onComplete({ score, results });
    setIdx(i => i + 1); setZonePick(null); setTypePick(null); setBsPick(null); setStage('ready');
  };

  const last = results[results.length - 1];
  const step = {
    ready:   ['Get set', needsConfirm ? 'Take your stance, then tap ready.' : 'Here it comes…'],
    count:   ['Get set', 'Here it comes…'],
    playing: ['Watch', ''],
    call:    ['Make the call', {
      zone: 'Ball or strike?',
      type: 'What did he throw?',
      both: 'Ball or strike, and what it was.',
      spot: 'Place the ball, then name it.',
    }[callMode]],
    review:  ['Result', ''],
  }[stage];

  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: TOP, background: T.bg, color: T.fg,
      fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* HUD */}
      <div style={{ flexShrink: 0, padding: '6px 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onExit} style={{
            width: 36, height: 36, borderRadius: 11, background: T.bg2, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}><Icon name="x" size={14} color={T.fg2}/></button>
          <button onClick={onCast} aria-label="Cast to a screen" style={{
            minHeight: 36, padding: '0 10px', borderRadius: 11, cursor: 'pointer', fontFamily: T.sans,
            background: cast ? T.accentSoft : T.bg2, border: `1px solid ${cast ? T.accent : T.border}`,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <CastIcon color={cast ? '#96B9F8' : T.fg2} on={!!cast}/>
            {cast && <span style={{ fontSize: 11, fontWeight: 700, color: '#96B9F8', letterSpacing: '0.04em' }}>TV</span>}
          </button>
          <span style={{ flex: 1 }}/>
          <span style={{ fontSize: 12, color: T.fg3, fontWeight: 600 }}>
            Pitch {idx + 1}<span style={{ color: T.fg4 }}>/{queue.length}</span>
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 4, padding: '5px 10px',
            background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 9999,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{score.toLocaleString()}</span>
            <span style={{ fontSize: 10, color: T.fg3, fontWeight: 600, letterSpacing: '0.06em' }}>PTS</span>
          </span>
          {streak >= 3 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: T.orange, fontFamily: T.mono, fontSize: 13, fontWeight: 700 }}>
              <Icon name="fire" size={13} color={T.orange}/>{streak}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
          {queue.map((_, i) => {
            const r = results[i];
            const bg = r ? (isPerfect(r) ? T.green : isPartial(r) ? T.yellow : T.red) : T.bg3;
            return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: bg, opacity: r ? 0.9 : i === idx ? 0.7 : 0.28 }}/>;
          })}
        </div>
      </div>

      {/* Video */}
      <div style={{
        display: stage === 'call' ? 'none' : 'block',
        position: 'relative', margin: '0 16px', aspectRatio: '4 / 3', background: '#000',
        borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.border}`, flexShrink: 0,
      }}>
        <video ref={videoRef} src={blobUrls[current.video] || undefined} playsInline muted preload="auto"
          data-casting={cast ? 'true' : undefined}
          onEnded={cut} onError={cut}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: stage === 'playing' ? 1 : 0.14,
            filter: stage === 'playing' ? 'none' : 'blur(3px) saturate(0.4)',
            transition: 'opacity .25s, filter .25s',
          }}/>

        <svg viewBox="0 0 100 75" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.28 }}>
          <rect x="3" y="3" width="94" height="69" fill="none" stroke={T.fg3} strokeWidth="0.2" strokeDasharray="1 1"/>
          <line x1="50" y1="0" x2="50" y2="75" stroke={T.fg3} strokeWidth="0.12"/>
          <line x1="0" y1="37.5" x2="100" y2="37.5" stroke={T.fg3} strokeWidth="0.12"/>
        </svg>

        <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', gap: 12, fontFamily: T.mono }}>
          <TelemM label="REL" v="6.2 ft"/>
          <TelemM label="EXT" v={`${(current.velo * 0.07).toFixed(1)} ft`}/>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: stage === 'playing' ? T.red : T.fg4, boxShadow: stage === 'playing' ? `0 0 8px ${T.red}` : 'none' }}/>
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.fg2 }}>REC</span>
        </div>
        <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 10, fontFamily: T.mono, color: T.fg3, letterSpacing: '0.06em' }}>
          {current.pitcher} · {current.handedness}
        </div>

        {floatPts != null && (
          <div style={{
            position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 3,
            fontSize: 46, fontWeight: 800, color: T.accent, fontFamily: T.mono, letterSpacing: '-0.03em',
            pointerEvents: 'none', animation: 'scoreFly .9s ease-out forwards', textShadow: `0 0 24px ${T.accent}`,
          }}>+{floatPts}</div>
        )}

        {cast && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3, background: '#030303',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 20, textAlign: 'center',
          }}>
            <CastIcon color={T.accent} on/>
            {stage === 'count' ? (
              <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 }}>{count}</div>
            ) : (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {stage === 'playing' ? `Playing on ${cast}` : `Pitch ${idx + 1} of ${queue.length} · on ${cast}`}
                </div>
                <div style={{ fontSize: 12, color: T.fg3, lineHeight: 1.45, maxWidth: 260 }}>
                  {stage === 'playing'
                    ? 'Watch the TV — make your call down here.'
                    : `${diffOf(difficulty).id} window · ${(windowMs / 1000).toFixed(1)}s look`}
                </div>
              </>
            )}
          </div>
        )}

        {stage !== 'playing' && !cast && (
          <div className="fade-in" style={{
            position: 'absolute', inset: 0, zIndex: 2, background: 'rgba(3,3,3,0.55)', backdropFilter: 'blur(2px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, textAlign: 'center',
          }}>
            {stage === 'count' ? (
              <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1, color: T.fg }}>
                {count}
              </div>
            ) : stage === 'ready' ? (
              <>
                <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {ready ? `Pitch ${idx + 1} of ${queue.length}` : 'Loading clip…'}
                </div>

              </>
            ) : (
              <div style={{ fontSize: 12, color: T.fg3, fontFamily: T.mono, letterSpacing: '0.12em' }}>CLIP OCCLUDED</div>
            )}
          </div>
        )}
      </div>

      {/* Step area */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 16px 4px' }}>
        <div style={{ marginBottom: 14 }}>
          <Eyebrow color={stage === 'review' ? T.fg3 : T.accent}>{step[0]}</Eyebrow>
          {step[1] && <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 5 }}>{step[1]}</div>}
        </div>

        {stage === 'call' && <CallTimer startedAt={callStart.current}/>}

        {stage === 'call' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {needsSpot && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ZonePicker value={zonePick} onChange={setZonePick} size={296}/>
              </div>
            )}

            {needsZone && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { id: 'strike', label: 'Strike', color: T.accent },
                  { id: 'ball',   label: 'Ball',   color: T.accent },
                ].map(o => {
                  const on = bsPick === o.id;
                  return (
                    <button key={o.id} onClick={() => setBsPick(o.id)} style={{
                      minHeight: 76, borderRadius: 14, cursor: 'pointer', fontFamily: T.sans,
                      background: on ? `${o.color}1F` : T.bg2,
                      border: `1px solid ${on ? o.color : T.border}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}>
                      <span style={{ fontSize: 19, fontWeight: 700, color: on ? o.color : T.fg, letterSpacing: '-0.02em' }}>{o.label}</span>
                      {on && <Icon name="check" size={14} color={o.color} sw={2.2}/>}
                    </button>
                  );
                })}
              </div>
            )}

            {needsType && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {SIMPLE_TYPES.map(p => {
                  const on = typePick === p.code;
                  return (
                    <button key={p.code} onClick={() => setTypePick(p.code)} style={{
                      display: 'flex', alignItems: 'center', gap: 9, minHeight: 54, padding: '12px 12px',
                      background: on ? `${p.color}1A` : T.bg2, border: `1px solid ${on ? p.color : T.border}`,
                      borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontFamily: T.sans,
                    }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }}/>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.fg }}>{p.name}</span>
                      {on && <span style={{ marginLeft: 'auto' }}><Icon name="check" size={12} color={p.color} sw={2.2}/></span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {stage === 'review' && last && <div className="fade-in"><ResultM r={last}/></div>}
      </div>

      {/* Sticky thumb bar */}
      <div style={{
        flexShrink: 0, padding: `10px 16px ${BOT + 6}px`,
        borderTop: `1px solid ${T.border}`, background: 'rgba(3,3,3,0.9)', backdropFilter: 'blur(14px)',
      }}>
        {stage === 'call' && (() => {
          const missZone = needsSpot ? zonePick == null : needsZone ? !bsPick : false;
          const missType = needsType && !typePick;
          const blocked = missZone || missType;
          return (
            <BigBtn onClick={() => submit(typePick)} disabled={blocked}>
              {missZone ? (needsSpot ? 'Place the ball' : 'Ball or strike?') : missType ? 'Pick a pitch type' : 'Lock in call'}
            </BigBtn>
          );
        })()}
        {stage === 'review' && (
          <BigBtn onClick={next}>
            {idx + 1 >= queue.length ? 'See your recap' : `Next pitch · ${idx + 2}/${queue.length}`}
          </BigBtn>
        )}
        {stage === 'ready' && needsConfirm && (
          <BigBtn onClick={beginCountIn} disabled={!ready}>
            {ready ? "I'm ready" : 'Loading clip…'}
          </BigBtn>
        )}
        {((stage === 'ready' && !needsConfirm) || stage === 'count' || stage === 'playing') && (
          <div style={{ textAlign: 'center', fontSize: 12, color: T.fg4, letterSpacing: '0.08em', padding: '19px 0', fontWeight: 600 }}>
            {stage === 'playing' ? 'EYES UP' : 'SET…'}
          </div>
        )}
      </div>
    </div>
  );
};

// Only dimensions the mode actually asked for count toward a result.
const calledFlags = (r) => [r.zoneRight, r.pitchRight].filter(v => v === true || v === false);
const isPerfect = (r) => { const c = calledFlags(r); return c.length > 0 && c.every(Boolean); };
const isPartial = (r) => calledFlags(r).some(Boolean);
const pctOf = (rows, key) => {
  const asked = rows.filter(r => r[key] === true || r[key] === false);
  return asked.length ? Math.round(asked.filter(r => r[key]).length / asked.length * 100) : null;
};

// Counts up while the hitter decides; the bar drains as the timing bonus does.
const CallTimer = ({ startedAt }) => {
  const [ms, setMs] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setMs(Date.now() - startedAt), 80);
    return () => clearInterval(id);
  }, [startedAt]);
  const left = Math.max(0, Math.min(1, (5000 - ms) / 3500));
  const bonus = Math.round(50 * left);
  const tone = left > 0.6 ? T.green : left > 0.25 ? T.yellow : T.fg4;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 12, color: T.fg3, fontWeight: 500 }}>Timing bonus</span>
        <span style={{ flex: 1 }}/>
        <span style={{ fontSize: 13, fontWeight: 700, color: tone }}>+{bonus}</span>
        <span style={{ fontSize: 11, color: T.fg4 }}>{(ms / 1000).toFixed(1)}s</span>
      </div>
      <div style={{ height: 4, background: T.bg3, borderRadius: 2, overflow: 'hidden', marginTop: 6 }}>
        <div style={{ width: `${left * 100}%`, height: '100%', background: tone, transition: 'width .1s linear' }}/>
      </div>
    </div>
  );
};

const TelemM = ({ label, v }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <span style={{ fontSize: 8, color: T.fg3, letterSpacing: '0.14em', fontWeight: 700 }}>{label}</span>
    <span style={{ fontSize: 11, color: T.fg, fontWeight: 600 }}>{v}</span>
  </div>
);

const ResultM = ({ r }) => {
  const all = isPerfect(r);
  const some = isPartial(r);
  const single = calledFlags(r).length === 1;
  const tone = all ? T.green : some ? T.yellow : T.red;
  return (
    <div style={{ background: T.bg1, border: `1px solid ${tone}44`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{
          width: 42, height: 42, borderRadius: '50%', background: `${tone}22`, border: `2px solid ${tone}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}><Icon name={all ? 'check' : some ? 'sparkle' : 'x'} size={19} color={tone} sw={2.2}/></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: tone, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {all ? (single ? 'Correct' : 'Perfect call') : some ? 'Half credit' : 'Missed'}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>
            {byCode(r.pitch.code).name} · {ZONE_LABELS[r.pitch.zone]}
          </div>
          <div style={{ fontSize: 11, color: T.fg3, fontFamily: T.mono, marginTop: 2 }}>
            {r.pitch.velo.toFixed(1)} mph · {r.pitch.spin} rpm
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: T.mono, color: r.points ? T.accent : T.fg4, letterSpacing: '-0.03em' }}>+{r.points}</div>
      </div>
      {r.timeBonus > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: T.fg2 }}>
          <span style={{ color: T.green, fontWeight: 700 }}>+{r.timeBonus} timing</span>
          <span style={{ color: T.fg4 }}>· called in {(r.ms / 1000).toFixed(1)}s</span>
        </div>
      )}
      {r.streak >= 3 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.orange, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <Icon name="fire" size={13} color={T.orange}/> {r.streak}-pitch streak · ×{(1 + Math.min(r.streak, 5) * 0.1).toFixed(1)}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {r.callMode === 'spot' && (
          <CmpM label="Spot" you={ZONE_LABELS[r.pickedZone]} truth={ZONE_LABELS[r.pitch.zone]} right={r.zoneRight}/>
        )}
        {(r.callMode === 'zone' || r.callMode === 'both') && (
          <CmpM label="Zone"
            you={r.bsPick === 'strike' ? 'Strike' : 'Ball'}
            truth={r.pitch.zone < 11 ? 'Strike' : 'Ball'}
            right={r.zoneRight}/>
        )}
        {r.callMode !== 'zone' && (
          <CmpM label="Pitch" you={byCode(r.pitchPick).name} truth={byCode(r.pitch.code).name} right={r.pitchRight}/>
        )}
      </div>
    </div>
  );
};

const CmpM = ({ label, you, truth, right }) => (
  <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 12px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 700, color: T.fg3, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
      {label} {right ? <Icon name="check" size={11} color={T.green} sw={2.2}/> : <Icon name="x" size={11} color={T.red} sw={2}/>}
    </div>
    <div style={{ fontSize: 12, color: T.fg2, marginTop: 6 }}>You: <span style={{ color: right ? T.green : T.red, fontWeight: 600 }}>{you}</span></div>
    {!right && <div style={{ fontSize: 12, color: T.fg2, marginTop: 2 }}>Truth: <span style={{ color: T.fg, fontWeight: 600 }}>{truth}</span></div>}
  </div>
);

// ─────────────────────────────────────────── RECAP
const RecapM = ({ result, onAgain, onDone }) => {
  const { score, results } = result;
  const total = results.length;
  const perfect = results.filter(isPerfect).length;
  const zoneAcc = pctOf(results, 'zoneRight');
  const pitchAcc = pctOf(results, 'pitchRight');
  const best = results.reduce((a, r) => {
    const cur = isPerfect(r) ? a.cur + 1 : 0;
    return { cur, max: Math.max(a.max, cur) };
  }, { cur: 0, max: 0 }).max;
  const spotMode = results[0]?.callMode === 'spot';
  const timed = results.filter(r => r.ms != null);
  const avgMs = timed.length ? timed.reduce((a, r) => a + r.ms, 0) / timed.length : null;
  const timingPts = results.reduce((a, r) => a + (r.timeBonus || 0), 0);

  const byType = {};
  results.filter(r => r.pitchRight === true || r.pitchRight === false).forEach(r => {
    const c = r.pitch.code;
    byType[c] = byType[c] || { total: 0, right: 0 };
    byType[c].total += 1;
    if (r.pitchRight) byType[c].right += 1;
  });

  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: TOP, background: T.bg, color: T.fg,
      fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card style={{ padding: 22, textAlign: 'center', backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(62,99,221,0.2), transparent 65%)' }}>
            <Eyebrow color={T.accent}>Session complete</Eyebrow>
            <div style={{ fontSize: 58, fontWeight: 800, fontFamily: T.mono, letterSpacing: '-0.05em', lineHeight: 1.05, marginTop: 8 }}>
              {score.toLocaleString()}
            </div>
            <div style={{ fontSize: 13, color: T.fg3, marginTop: 6 }}>
              {perfect} perfect {perfect === 1 ? 'call' : 'calls'} out of {total}
              {timingPts > 0 && ` · +${timingPts} timing`}
            </div>
          </Card>

          <ReadinessGain from={58} to={62}/>

          <div style={{ display: 'flex', gap: 10 }}>
            {zoneAcc !== null && <Stat3 label={spotMode ? 'Spot' : 'Zone'} value={`${zoneAcc}%`}/>}
            {pitchAcc !== null && <Stat3 label="Pitch ID" value={`${pitchAcc}%`}/>}
            {avgMs != null && <Stat3 label="Avg call" value={(avgMs / 1000).toFixed(1)} unit="s"/>}
            <Stat3 label="Best run" value={best}/>
          </div>

          {Object.keys(byType).length > 0 && <Card style={{ padding: 16 }}>
            <Eyebrow style={{ marginBottom: 12 }}>What you saw</Eyebrow>
            {Object.entries(byType).sort((a, b) => b[1].total - a[1].total).map(([code, d]) => {
              const pct = Math.round(d.right / d.total * 100);
              const pt = byCode(code);
              return (
                <div key={code} style={{ display: 'grid', gridTemplateColumns: '92px 1fr 40px', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: pt.color }}/>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{pt.name}</span>
                  </div>
                  <div style={{ height: 5, background: T.bg3, borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pt.color }}/>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: T.mono, color: T.fg2, textAlign: 'right' }}>{d.right}/{d.total}</div>
                </div>
              );
            })}
          </Card>}

          <Card style={{ overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: `1px solid ${T.border}` }}><Eyebrow>Pitch by pitch</Eyebrow></div>
            {results.map((r, i) => {
              const pt = byCode(r.pitch.code);
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 20px 20px 46px', gap: 8, padding: '11px 16px', alignItems: 'center', borderBottom: `1px solid ${T.bg2}` }}>
                  <span style={{ fontSize: 11, fontFamily: T.mono, color: T.fg4 }}>{String(i + 1).padStart(2, '0')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: pt.color, flexShrink: 0 }}/>
                    <span style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pt.name}</span>
                  </div>
                  <span style={{ textAlign: 'center' }}>
                    {r.zoneRight === null || r.zoneRight === undefined
                      ? <span style={{ color: T.fg4, fontSize: 11 }}>–</span>
                      : <Icon name={r.zoneRight ? 'check' : 'x'} size={11} color={r.zoneRight ? T.green : T.red} sw={2.2}/>}
                  </span>
                  <span style={{ textAlign: 'center' }}>
                    {r.pitchRight === null || r.pitchRight === undefined
                      ? <span style={{ color: T.fg4, fontSize: 11 }}>–</span>
                      : <Icon name={r.pitchRight ? 'check' : 'x'} size={11} color={r.pitchRight ? T.green : T.red} sw={2.2}/>}
                  </span>
                  <span style={{ textAlign: 'right', fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: r.points >= 200 ? T.accent : T.fg2 }}>+{r.points}</span>
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      <div style={{
        flexShrink: 0, padding: `10px 16px ${BOT + 6}px`, display: 'flex', flexDirection: 'column', gap: 8,
        borderTop: `1px solid ${T.border}`, background: 'rgba(3,3,3,0.9)', backdropFilter: 'blur(14px)',
      }}>
        <BigBtn onClick={onAgain}>Train again</BigBtn>
        <BigBtn tone="ghost" onClick={onDone}>Back to home</BigBtn>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────── PROGRESS / RANKS
const ProgressM = ({ user, tabs, onBack, onLogout, occSessions = [], onOpenSession }) => {
  const me = LEADERBOARD.find(p => p.you) || { rank: 5, pts: 10240, accuracy: 70, sessions: 26 };
  return (
    <Page tabs={tabs} user={user}>
      <PageHead title="Progress" sub="Your training history" onBack={onBack}/>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={user?.name || 'JW'} size={52} src={AVATAR_SRC}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>{user?.name || 'Jason Whitman'}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <Chip variant="accent">{MY_PCTL}th percentile</Chip>
              <Chip variant="green">12-day streak</Chip>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 10 }}>
          <Stat3 label="Sessions" value={occSessions.length || me.sessions}/>
          <Stat3 label="Accuracy" value={`${me.accuracy}%`}/>
          <Stat3 label="Points" value={(occSessions.reduce((a, x) => a + x.score, 0) || me.pts).toLocaleString()}/>
        </div>

        <Card style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <Eyebrow>All pitch recognition sessions</Eyebrow>
            <Sparkline data={(occSessions.length ? occSessions.slice(0, 8).map(x => x.pitchAcc ?? x.zoneAcc ?? 0).reverse() : [58, 62, 66, 64, 71, 69, 76])} color={T.accent} w={80} h={22}/>
          </div>
          {occSessions.length === 0 ? (
            <div style={{ padding: '22px 16px', fontSize: 13, color: T.fg3 }}>
              No sessions yet — train once and it lands here.
            </div>
          ) : occSessions.map(x => (
            <button key={x.id} onClick={() => onOpenSession && onOpenSession(x)} style={{
              width: '100%', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10,
              alignItems: 'center', padding: '13px 16px', borderBottom: `1px solid ${T.bg2}`,
              background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: T.sans,
              color: T.fg, textAlign: 'left',
            }}>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{x.pitches} pitches</span>
                <span style={{ display: 'block', fontSize: 11, color: T.fg3, marginTop: 2 }}>
                  {x.when} · {modeOf(x.cfg?.call).label}
                </span>
              </span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{x.score.toLocaleString()}</span>
                <span style={{ fontSize: 10, color: T.fg3 }}>pts</span>
              </span>
              <Icon name="arrow" size={13} color={T.fg4}/>
            </button>
          ))}
        </Card>

        <button onClick={onLogout} style={{
          alignSelf: 'center', background: 'transparent', border: 'none', color: T.fg4,
          fontSize: 12, cursor: 'pointer', fontFamily: T.sans, padding: 12,
        }}>Sign out</button>
      </div>
    </Page>
  );
};

const BANDS = [
  { max: 25,  name: 'Developing', color: T.red },
  { max: 50,  name: 'Fair',       color: T.orange },
  { max: 75,  name: 'Good',       color: T.yellow },
  { max: 90,  name: 'Excellent',  color: T.green },
  { max: 100, name: 'Elite',      color: T.accent },
];
const bandOf = (p) => BANDS.find(b => p <= b.max) || BANDS[BANDS.length - 1];

const COHORTS = [
  { id: 'all',   label: 'All hitters', n: '12,480' },
  { id: 'level', label: 'My level',    n: '1,940' },
  { id: 'age',   label: 'My age',      n: '860' },
];
const MY_PCTL = 78;
const RANK_MODES = [
  { id: 'occ', label: 'Pitch Rec.', title: 'Pitch recognition percentile', blurb: 'read pitches better than',
    skills: [['Location accuracy', 'location'], ['Pitch identification', 'pitchId'], ['Decision speed', 'speed']] },
  ...(ENABLE_REACTION_TIME ? [{ id: 'rx', label: 'Reaction', title: 'Reaction time percentile', blurb: 'react faster than',
    skills: [['Average reaction', 'location'], ['Best reaction', 'pitchId'], ['Consistency', 'speed']] }] : []),
  { id: 'iq', label: 'Game IQ', title: 'Game IQ percentile', blurb: 'read the game better than',
    skills: [['Base running reads', 'location'], ['Count awareness', 'pitchId'], ['Answer speed', 'speed']] },
];
const MODE_PCTL = {
  occ: { all: 0, level: 0, age: 0 },
  rx:  { all: -12, level: -9, age: -6 },
  iq:  { all: -21, level: -17, age: -14 },
};
const shiftP = (p, delta) => { const d = delta || 0; return ({
  overall: Math.max(1, Math.min(99, p.overall + d)),
  location: Math.max(1, Math.min(99, p.location + d)),
  pitchId: Math.max(1, Math.min(99, p.pitchId + d)),
  speed: Math.max(1, Math.min(99, p.speed + d)),
}); };
const PCTL = {
  all:   { overall: MY_PCTL, location: 71, pitchId: 84, speed: 66 },
  level: { overall: 64, location: 58, pitchId: 72, speed: 55 },
  age:   { overall: 81, location: 76, pitchId: 88, speed: 70 },
};

// Garmin-style percentile scale: five bands, your marker on the line.
const PctlBar = ({ value, height = 10 }) => (
  <div style={{ position: 'relative', paddingTop: 4 }}>
    <div style={{ display: 'flex', gap: 2, height, borderRadius: 5, overflow: 'hidden' }}>
      {BANDS.map((b, i) => (
        <div key={b.name} style={{
          flex: [25, 25, 25, 15, 10][i],
          background: b.color,
          opacity: (value <= b.max && value > (i === 0 ? -1 : BANDS[i - 1].max)) ? 0.95 : 0.2,
        }}/>
      ))}
    </div>
    <div style={{
      position: 'absolute', left: `${value}%`, top: 0, transform: 'translateX(-50%)',
      width: 3, height: height + 8, borderRadius: 2, background: T.fg,
      boxShadow: '0 0 0 2px rgba(3,3,3,0.9)',
    }}/>
  </div>
);

const PctlRow = ({ label, value }) => {
  const b = bandOf(value);
  return (
    <div style={{ padding: '12px 0', borderBottom: `1px solid ${T.bg2}` }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 10, color: b.color, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{b.name}</span>
        <span style={{ fontSize: 14, fontFamily: T.mono, fontWeight: 700, minWidth: 30, textAlign: 'right' }}>{value}</span>
      </div>
      <PctlBar value={value} height={7}/>
    </div>
  );
};

const RanksM = ({ tabs, user, onBack }) => {
  const [cohort, setCohort] = React.useState('all');
  const [gameMode, setGameMode] = React.useState('occ');
  const m = RANK_MODES.find(x => x.id === gameMode);
  const p = shiftP(PCTL[cohort], MODE_PCTL[gameMode][cohort]);
  const b = bandOf(p.overall);
  const c = COHORTS.find(x => x.id === cohort);
  return (
    <Page tabs={tabs} user={user}>
      <PageHead title="Ranks" sub="Where you sit against other hitters" onBack={onBack}/>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
          {RANK_MODES.map(o => {
            const on = gameMode === o.id;
            return (
              <button key={o.id} onClick={() => setGameMode(o.id)} style={{
                flex: 1, minHeight: 44, background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: T.sans, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
                color: on ? T.fg : T.fg3, borderBottom: `2px solid ${on ? T.accent : 'transparent'}`,
              }}>{o.label}</button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 6, background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, padding: 4 }}>
          {COHORTS.map(o => {
            const on = cohort === o.id;
            return (
              <button key={o.id} onClick={() => setCohort(o.id)} style={{
                flex: 1, minHeight: 40, borderRadius: 9, cursor: 'pointer', fontFamily: T.sans,
                background: on ? T.bg3 : 'transparent', border: 'none',
                color: on ? T.fg : T.fg3, fontSize: 12, fontWeight: 600,
              }}>{o.label}</button>
            );
          })}
        </div>

        <Card style={{ padding: '20px 16px 8px' }}>
          <div style={{ padding: '0 4px' }}>
          <Eyebrow>{m.title}</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 56, fontWeight: 800, fontFamily: T.mono, letterSpacing: '-0.05em', lineHeight: 1 }}>{p.overall}</span>
            <span style={{ fontSize: 14, color: T.fg3, fontWeight: 600 }}>th</span>
            <span style={{ flex: 1 }}/>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: b.color, background: `${b.color}1F`, border: `1px solid ${b.color}55`,
              padding: '5px 10px', borderRadius: 9999,
            }}>{b.name}</span>
          </div>
          <div style={{ marginTop: 16 }}><PctlBar value={p.overall}/></div>
          <div style={{ position: 'relative', height: 14, marginTop: 6 }}>
            {[0, 25, 50, 75, 90, 100].map(t => (
              <span key={t} style={{
                position: 'absolute', left: `${t}%`, transform: 'translateX(-50%)',
                fontSize: 9, fontFamily: T.mono, color: T.fg4, letterSpacing: '0.06em',
              }}>{t}</span>
            ))}
          </div>
          <div style={{ fontSize: 12, color: T.fg2, marginTop: 14, lineHeight: 1.5 }}>
            You {m.blurb} <span style={{ color: T.fg, fontWeight: 600 }}>{p.overall}%</span> of {c.label.toLowerCase()} — {c.n} hitters, last 30 days.
          </div>
          <div style={{ height: 1, background: T.border, margin: '18px -16px 0' }}/>
          <div style={{ padding: '14px 0 2px' }}><Eyebrow>By skill</Eyebrow></div>
          </div>
          <div style={{ padding: '0 4px' }}>
            {m.skills.map(([label, key]) => <PctlRow key={label} label={label} value={p[key]}/>)}
          </div>
        </Card>

      </div>
    </Page>
  );
};

// ─────────────────────────────────────────── SESSIONS
// Occlusion sessions land here alongside the Arc sessions the player already has.
const ARC_SESSIONS = [
  { id: 'arc-1', kind: 'arc', title: 'Lunch Session', when: 'Today at 12:30 PM', pitches: 38, mins: 28, types: 6, maxEv: '107.2', record: true,
    clips: [
      { src: 'assets/swing-1.mp4', code: 'FF', pitch: 'Four-Seam', velo: 95.4, spin: 2410, ev: 107.2, la: 24, dist: 402, result: 'Home Run', sx: 0.76, sy: 0.035 },
      { src: 'assets/swing-2.mp4', code: 'SL', pitch: 'Slider', velo: 87.6, spin: 2640, ev: 104.1, la: 12, dist: 318, result: 'Double' },
      { src: 'assets/swing-3.mp4', code: 'SI', pitch: 'Sinker', velo: 93.0, spin: 2180, ev: 101.8, la: 8, dist: 246, result: 'Single' },
      { src: 'assets/swing-4.mp4', code: 'CH', pitch: 'Changeup', velo: 84.3, spin: 1790, ev: 98.6, la: 31, dist: 361, result: 'Field Out' },
    ] },
  { id: 'arc-2', kind: 'arc', title: 'Lunch Session', when: 'Yesterday at 11:45 AM', pitches: 34, mins: 35, types: 6, maxEv: '104.6',
    clips: [
      { src: 'assets/swing-5.mp4', code: 'FF', pitch: 'Four-Seam', velo: 96.1, spin: 2470, ev: 104.6, la: 21, dist: 379, result: 'Home Run', sx: 0.25, sy: 0.03 },
      { src: 'assets/swing-6.mp4', code: 'CU', pitch: 'Curveball', velo: 79.8, spin: 2980, ev: 99.4, la: 15, dist: 302, result: 'Triple' },
      { src: 'assets/swing-7.mp4', code: 'FC', pitch: 'Cutter', velo: 91.2, spin: 2350, ev: 97.2, la: 6, dist: 214, result: 'Single' },
    ] },
  { id: 'arc-3', kind: 'arc', title: 'Afternoon Session', when: 'Jul 5, 2026 at 2:03 PM', pitches: 22, mins: 18, types: 3, maxEv: '99.1',
    clips: [
      { src: 'assets/swing-8.mp4', code: 'FF', pitch: 'Four-Seam', velo: 94.0, spin: 2390, ev: 99.1, la: 19, dist: 341, result: 'Double' },
      { src: 'assets/swing-9.mp4', code: 'SL', pitch: 'Slider', velo: 86.4, spin: 2610, ev: 95.7, la: 27, dist: 318, result: 'Field Out' },
    ] },
];

const PITCHER_OVERLAY = 'assets/pitcher-overlay.mp4';

// Drives the hit clip and the pitcher feed off one clock: both start together and the
// pitcher is time-scaled so its delivery spans exactly the hit clip's length, so the
// two loop in lockstep instead of drifting apart.
// Only one clip plays at a time in the session feed.
const clipBus = { current: null };

const useHitSync = (src, manual = false) => {
  const hitRef = React.useRef(null);
  const pitcherRef = React.useRef(null);
  const ctl = React.useRef(null);
  React.useEffect(() => {
    const v = hitRef.current;
    if (!v) return;
    let active = false;
    let ignoreEndedUntil = 0;
    let seekToken = 0;

    const syncPitcher = () => {
      const p = pitcherRef.current;
      if (!p || !active) return;
      const hd = v.duration && isFinite(v.duration) && v.duration > 0.2 ? v.duration : 3;
      const pd = p.duration && isFinite(p.duration) && p.duration > 0.2 ? p.duration : hd;
      try { p.currentTime = 0; } catch (_) {}
      p.playbackRate = Math.max(0.1, Math.min(4, pd / hd));
      p.play().catch(() => {});
    };

    const playFromStart = () => {
      if (!active) return;
      ignoreEndedUntil = performance.now() + 400;
      const token = ++seekToken;
      const start = () => {
        if (!active || token !== seekToken) return;
        const playHit = v.play();
        if (playHit && playHit.catch) playHit.catch(() => {});
        syncPitcher();
      };
      // Seek first, then play after seek completes — avoids the iOS "flash then restart" from
      // play()+seek racing, and from starting under a poster then revealing.
      if (v.currentTime > 0.05) {
        const onSeeked = () => {
          v.removeEventListener('seeked', onSeeked);
          start();
        };
        v.addEventListener('seeked', onSeeked);
        try { v.currentTime = 0; } catch (_) { start(); }
        setTimeout(() => {
          v.removeEventListener('seeked', onSeeked);
          if (active && token === seekToken && v.paused) start();
        }, 250);
      } else {
        try { v.currentTime = 0; } catch (_) {}
        start();
      }
    };

    const cycle = () => {
      active = true;
      playFromStart();
    };

    const stop = () => {
      active = false;
      seekToken += 1;
      v.pause();
      const p = pitcherRef.current;
      if (p) p.pause();
    };

    const onEnded = () => {
      if (!active) return;
      if (performance.now() < ignoreEndedUntil) return;
      // Genuine end-of-clip → loop
      playFromStart();
    };

    v.addEventListener('ended', onEnded);
    ctl.current = { cycle, stop };
    if (manual) {
      return () => {
        active = false;
        seekToken += 1;
        v.removeEventListener('ended', onEnded);
      };
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!active) cycle();
      } else {
        stop();
      }
    }, { threshold: 0.4 });
    const attach = () => io.observe(v);
    if (v.readyState >= 1) attach();
    else v.addEventListener('loadedmetadata', attach, { once: true });
    return () => {
      active = false;
      seekToken += 1;
      io.disconnect();
      v.removeEventListener('ended', onEnded);
    };
  }, [src, manual]);
  return { hitRef, pitcherRef, ctl };
};

// Hit clip with the pitcher feed picture-in-picture, top right.
// On iOS WebKit (Safari + Chrome), <video> often paints black until play — use <img>
// posters while idle. Never start playback under the poster (that causes a visible restart).
const HitClip = ({ clip, radius = 0, overlay = true, manual = false, still = false, children }) => {
  const { hitRef, pitcherRef, ctl } = useHitSync(clip.src, manual || still);
  const [playing, setPlaying] = React.useState(false);
  const self = React.useRef({});
  const hitPoster = posterOf(clip.src);
  const pitcherPoster = posterOf(PITCHER_OVERLAY);
  const showPoster = still || (manual && !playing);
  self.current.stop = () => { ctl.current && ctl.current.stop(); setPlaying(false); };

  const toggle = () => {
    if (playing) {
      self.current.stop();
      if (clipBus.current === self.current) clipBus.current = null;
      return;
    }
    if (clipBus.current && clipBus.current !== self.current) clipBus.current.stop();
    clipBus.current = self.current;
    // Hide poster first; playback starts in the effect after paint.
    setPlaying(true);
  };

  React.useEffect(() => {
    if (!playing || still) return;
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) ctl.current && ctl.current.cycle();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [playing, still]);

  React.useEffect(() => () => { if (clipBus.current === self.current) clipBus.current = null; }, []);
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '750 / 429', background: '#000',
      borderRadius: radius, overflow: 'hidden',
    }}>
      {still ? (
        hitPoster ? (
          <img src={hitPoster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
        ) : null
      ) : (
        <>
          <video ref={hitRef} src={videoSrc(clip.src)} poster={hitPoster} muted playsInline preload="auto"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#000' }}/>
          {showPoster && hitPoster && (
            <img src={hitPoster} alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              pointerEvents: 'none', zIndex: 1,
            }}/>
          )}
        </>
      )}
      {overlay && (
        <div style={{
          position: 'absolute', top: 10, right: 10, width: '21%', aspectRatio: '3 / 4',
          borderRadius: 8, overflow: 'hidden', background: '#000', zIndex: 2,
          border: '1px solid rgba(235,235,239,0.22)', boxShadow: '0 8px 20px rgba(0,0,0,0.55)',
        }}>
          {still ? (
            pitcherPoster ? (
              <img src={pitcherPoster} alt="" style={{
                width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 45%', display: 'block',
              }}/>
            ) : null
          ) : (
            <>
              <video ref={pitcherRef} src={videoSrc(PITCHER_OVERLAY)} poster={pitcherPoster} muted playsInline preload="auto"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 45%', display: 'block', background: '#000' }}/>
              {showPoster && pitcherPoster && (
                <img src={pitcherPoster} alt="" style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: '55% 45%', pointerEvents: 'none',
                }}/>
              )}
            </>
          )}
        </div>
      )}
      {manual && !still && (
        <button onClick={toggle} aria-label={playing ? 'Pause clip' : 'Play clip'} style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', cursor: 'pointer',
          background: playing ? 'transparent' : 'rgba(0,0,0,0.28)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: 0, zIndex: 3,
        }}>
          {!playing && (
            <span style={{
              width: 52, height: 52, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(3,3,3,0.55)', border: '1px solid rgba(235,235,239,0.28)',
              backdropFilter: 'blur(6px)',
            }}>
              <svg width="16" height="18" viewBox="0 0 16 18" fill="#EDEEF0"><path d="M0 0l16 9L0 18z"/></svg>
            </span>
          )}
        </button>
      )}
      {children}
    </div>
  );
};

const ClipTag = ({ clip }) => (
  <div style={{
    position: 'absolute', left: 10, bottom: 10, display: 'flex', alignItems: 'center', gap: 7,
    padding: '5px 9px', borderRadius: 9999, background: 'rgba(3,3,3,0.62)',
    backdropFilter: 'blur(8px)', border: `1px solid ${T.border}`,
  }}>
    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em' }}>{clip.ev}</span>
    <span style={{ fontSize: 10, color: T.fg3 }}>mph EV</span>
    <span style={{ width: 1, height: 11, background: T.borderStrong }}/>
    <span style={{ fontSize: 10, color: T.fg2 }}>{clip.pitch} · {clip.velo}</span>
  </div>
);

const Metric = ({ label, value, unit }) => (
  <div style={{ minWidth: 0 }}>
    <div style={{ fontSize: 12, color: T.fg3, fontWeight: 400 }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 3 }}>
      <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</span>
      {unit && <span style={{ fontSize: 11, color: T.fg2, fontWeight: 400 }}>{unit}</span>}
    </div>
  </div>
);

const ChevronDown = ({ color, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const CalendarIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);

const RecordBatIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M10.3914 1.00298C11.2295 0.0435931 12.7045 -0.00612026 13.6053 0.894665C14.5061 1.79545 14.4564 3.2705 13.497 4.10859C7.31625 8.92093 4.05458 11.4761 2.80304 13.2552C2.88443 13.4546 3.07891 13.9267 2.91708 14.0885C2.70173 14.3038 2.35258 14.3038 2.13723 14.0885L0.411514 12.3628C0.196162 12.1474 0.196162 11.7983 0.411514 11.5829C0.573342 11.4211 1.04394 11.6141 1.24332 11.6955C2.75 10.75 4.05615 9.37297 10.3914 1.00298Z" fill="black" fillOpacity="0.95" stroke="url(#recBatA)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.25 11.75C10.25 10.9216 10.9216 10.25 11.75 10.25C12.5784 10.25 13.25 10.9216 13.25 11.75C13.25 12.5784 12.5784 13.25 11.75 13.25C10.9216 13.25 10.25 12.5784 10.25 11.75Z" fill="black" fillOpacity="0.95" stroke="url(#recBatB)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="recBatA" x1="12.1547" y1="14.6416" x2="0.335027" y2="3.37434" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" stopOpacity="0.4"/><stop offset="1" stopColor="white" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="recBatB" x1="12.1547" y1="14.6416" x2="0.335027" y2="3.37434" gradientUnits="userSpaceOnUse">
        <stop stopColor="white" stopOpacity="0.4"/><stop offset="1" stopColor="white" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

const Kebab = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
    <circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/>
  </svg>
);

const FilterChip = ({ label, icon, on, onClick }) => (
  <button onClick={onClick} style={{
    minHeight: 36, padding: '8px 13px', borderRadius: 9999, cursor: 'pointer', fontFamily: T.sans,
    background: on ? T.accentSoft : 'transparent', border: `1px solid ${on ? T.accent : T.borderStrong}`,
    color: on ? '#96B9F8' : T.fg, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
    display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
  }}>
    {label}
    {icon === 'calendar' ? <CalendarIcon color={on ? '#96B9F8' : T.fg2}/> : <ChevronDown color={on ? '#96B9F8' : T.fg2}/>}
  </button>
);

const SessionsM = ({ user, tabs, cast, onCast, onOpen }) => {
  const [filter, setFilter] = React.useState(null);
  const list = ARC_SESSIONS;

  return (
    <Page tabs={tabs} user={user} cast={cast} onCast={onCast}>
      <PageHead title="Sessions" sub="Your latest sessions on the Arc">
        <div style={{ display: 'flex', gap: 8, marginTop: 14, overflowX: 'auto', paddingBottom: 2 }}>
          <FilterChip label="Date" icon="calendar" on={filter === 'date'} onClick={() => setFilter(filter === 'date' ? null : 'date')}/>
          <FilterChip label="Pitches" on={filter === 'pitches'} onClick={() => setFilter(filter === 'pitches' ? null : 'pitches')}/>
          <FilterChip label="Pitch Types" on={filter === 'types'} onClick={() => setFilter(filter === 'types' ? null : 'types')}/>
        </div>
      </PageHead>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {list.map(x => (
          <div key={x.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => onOpen && onOpen(x)} style={{
              background: 'transparent', border: 'none', padding: '0 20px 14px', textAlign: 'left',
              cursor: 'pointer', fontFamily: T.sans, color: T.fg, width: '100%',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: T.fg2 }}>{x.when}</span>
                    {x.kind === 'occ' && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: '#96B9F8', background: T.accentSofter, border: `1px solid ${T.accent}55`,
                        padding: '3px 9px', borderRadius: 9999,
                      }}>Pitch Rec</span>
                    )}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 2 }}>{x.title}</div>
                </div>
                <span style={{ padding: '4px 0 0' }}><Kebab color={T.fg2}/></span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 14 }}>
                {x.kind === 'occ' ? (
                  <>
                    <Metric label="Pitches" value={x.pitches}/>
                    <Metric label="Score" value={x.score.toLocaleString()} unit="pts"/>
                    <Metric label="Pitch ID" value={x.pitchAcc == null ? '–' : x.pitchAcc} unit={x.pitchAcc == null ? '' : '%'}/>
                    <Metric label={x.cfg?.call === 'spot' ? 'Spot' : 'Zone'} value={x.zoneAcc == null ? '–' : x.zoneAcc} unit={x.zoneAcc == null ? '' : '%'}/>
                  </>
                ) : (
                  <>
                    <Metric label="Pitches" value={x.pitches}/>
                    <Metric label="Duration" value={x.mins} unit="min"/>
                    <Metric label="Pitch Types" value={x.types}/>
                    <Metric label="Max EV" value={x.maxEv} unit="mph"/>
                  </>
                )}
              </div>

              {x.kind === 'occ' && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginTop: 14,
                  color: '#96B9F8', fontSize: 13, fontWeight: 600,
                }}>
                  Pitch by pitch <Icon name="arrow" size={13} color="#96B9F8"/>
                </div>
              )}

              {x.record && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 11, marginTop: 14, padding: '10px 12px',
                  border: `1px solid ${T.border}`, borderRadius: 12,
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(140deg, #F7E08A, #C9971F)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><RecordBatIcon/></span>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>New Max EV Record!</span>
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: '#2A1F03', borderRadius: 7, padding: '4px 9px',
                    background: 'linear-gradient(140deg, #F9E79A, #D9A72A)',
                  }}>{x.maxEv} mph</span>
                </div>
              )}
            </button>

            {x.kind === 'occ'
              ? <div style={{ height: 1, background: T.border, margin: '0 20px 4px' }}/>
              : (
                <button onClick={() => onOpen && onOpen(x)} style={{
                  padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', display: 'block', width: '100%',
                }}>
                  <HitClip clip={x.clips[0]} still/>
                </button>
              )}
          </div>
        ))}
      </div>
    </Page>
  );
};

const SessionDetailM = ({ session, onBack }) => {
  const [tab, setTab] = React.useState('pitches');
  const rows = session.results || [];
  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: TOP, background: T.bg, color: T.fg,
      fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flexShrink: 0, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px 10px' }}>
          <button onClick={onBack} style={{
            width: 40, height: 40, borderRadius: 12, background: 'transparent', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}><Icon name="arrowL" size={17} color={T.fg}/></button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{session.title}</div>
            <div style={{ fontSize: 12, color: T.fg3, marginTop: 1 }}>{session.when}</div>
          </div>
          <span style={{ width: 40 }}/>
        </div>
        <div style={{ display: 'flex', padding: '0 12px' }}>
          {[{ id: 'pitches', label: 'Pitches' }, { id: 'overview', label: 'Overview' }].map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, minHeight: 44, background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: on ? T.fg : T.fg3,
                borderBottom: `2px solid ${on ? T.accent : 'transparent'}`,
              }}>{t.label}</button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: `14px 16px ${BOT + 16}px` }}>
        {tab === 'pitches' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map((r, i) => {
              const pt = byCode(r.pitch.code);
              const all = isPerfect(r);
              const tone = all ? T.green : isPartial(r) ? T.yellow : T.red;
              return (
                <div key={i} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{i + 1}. {r.pitch.handedness} {r.pitch.code}</span>
                    <span style={{ fontSize: 13, color: T.fg2, fontFamily: T.mono }}>· {r.pitch.velo.toFixed(1)} mph</span>
                    <span style={{ flex: 1 }}/>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: tone, background: `${tone}1F`,
                      border: `1px solid ${tone}55`, padding: '4px 9px', borderRadius: 9999,
                    }}>{all ? (calledFlags(r).length === 1 ? 'Correct' : 'Perfect') : isPartial(r) ? 'Half' : 'Missed'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                    {r.callMode === 'spot' && (
                      <CmpM label="Spot" you={ZONE_LABELS[r.pickedZone]} truth={ZONE_LABELS[r.pitch.zone]} right={r.zoneRight}/>
                    )}
                    {(r.callMode === 'zone' || r.callMode === 'both') && (
                      <CmpM label="Zone"
                        you={r.bsPick === 'strike' ? 'Strike' : 'Ball'}
                        truth={r.pitch.zone < 11 ? 'Strike' : 'Ball'}
                        right={r.zoneRight}/>
                    )}
                    {r.callMode !== 'zone' && (
                      <CmpM label="Pitch" you={byCode(r.pitchPick).name} truth={pt.name} right={r.pitchRight}/>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, fontSize: 11, fontFamily: T.mono, color: T.fg3 }}>
                    <span>{r.pitch.pitcher}</span>
                    <span>{r.pitch.spin} rpm</span>
                    <span style={{ flex: 1 }}/>
                    <span style={{ color: r.points >= 200 ? T.accent : T.fg2, fontWeight: 700 }}>+{r.points}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Card style={{ padding: 20, textAlign: 'center' }}>
              <Eyebrow color={T.accent}>Total score</Eyebrow>
              <div style={{ fontSize: 52, fontWeight: 800, fontFamily: T.mono, letterSpacing: '-0.05em', lineHeight: 1.05, marginTop: 8 }}>
                {session.score.toLocaleString()}
              </div>
            </Card>
            <div style={{ display: 'flex', gap: 10 }}>
              <Stat3 label="Pitches" value={session.pitches}/>
              {session.zoneAcc != null && <Stat3 label={session.cfg?.call === 'spot' ? 'Spot' : 'Zone'} value={`${session.zoneAcc}%`}/>}
              {session.pitchAcc != null && <Stat3 label="Pitch ID" value={`${session.pitchAcc}%`}/>}
            </div>
            <Card style={{ padding: 16 }}>
              <Eyebrow style={{ marginBottom: 10 }}>Setup</Eyebrow>
              <div style={{ fontSize: 13, color: T.fg2, lineHeight: 1.7 }}>
                {modeOf(session.cfg.call).label} · {session.cfg.difficulty} window · {session.cfg.hand === 'Both' ? 'RHP + LHP' : session.cfg.hand} · {session.cfg.mix.length} pitch types
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────── ARC SESSION DETAIL
// Story view: the hit clip sits centered with a feathered mask, pitcher feed pinned to
// the bottom right of the hit frame itself.
const StoryPair = ({ clip, children }) => {
  const { hitRef, pitcherRef } = useHitSync(clip.src);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-54%)',
        width: '100%', aspectRatio: '4 / 3',
      }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <video ref={hitRef} src={videoSrc(clip.src)} poster={posterOf(clip.src)} muted playsInline preload="auto"
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', transform: 'scale(1.15)', background: '#000' }}/>
        </div>
        <div style={{
          position: 'absolute', right: 12, bottom: 12, width: 92, aspectRatio: '3 / 4',
          borderRadius: 14, overflow: 'hidden', background: '#000',
          border: '1px solid rgba(235,235,239,0.28)', boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
        }}>
          <video ref={pitcherRef} src={videoSrc(PITCHER_OVERLAY)} poster={posterOf(PITCHER_OVERLAY)} muted playsInline preload="auto"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '55% 45%', display: 'block', background: '#000' }}/>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, padding: `40px 16px ${BOT + 16}px`,
      }}>
        {children}
      </div>
    </div>
  );
};

const ClipMetrics = ({ clip }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
    <Metric label="Exit velo" value={clip.ev} unit="mph"/>
    <Metric label="Launch" value={clip.la} unit="°"/>
    <Metric label="Distance" value={clip.dist} unit="ft"/>
    <Metric label="Pitch" value={clip.velo} unit="mph"/>
  </div>
);

const ResultChip = ({ text }) => (
  <span style={{
    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: '#96B9F8', background: T.accentSofter, border: `1px solid ${T.accent}55`,
    padding: '4px 9px', borderRadius: 9999, whiteSpace: 'nowrap',
  }}>{text}</span>
);


const RESULT_COLORS = {
  single: '#F76B15', double: '#6E56CF', triple: '#FFC53D', 'home run': '#AB4ABA',
  'field out': '#E5484D', foul: '#7C7C7C', strike: '#E5484D', ball: '#0091FF',
};
const resultColor = (r = '') => {
  const k = String(r).toLowerCase();
  if (RESULT_COLORS[k]) return RESULT_COLORS[k];
  if (k.includes('home')) return RESULT_COLORS['home run'];
  if (k.includes('triple')) return RESULT_COLORS.triple;
  if (k.includes('double')) return RESULT_COLORS.double;
  if (k.includes('single') || k.includes('line drive')) return RESULT_COLORS.single;
  if (k.includes('foul')) return RESULT_COLORS.foul;
  if (k.includes('out') || k.includes('fly') || k.includes('ground') || k.includes('pop') || k.includes('lineout')) return RESULT_COLORS['field out'];
  if (k.includes('strike') || k.includes('swing') || k.includes('miss')) return RESULT_COLORS.strike;
  if (k === 'ball' || k === 'called ball') return RESULT_COLORS.ball;
  return T.fg3;
};

// ── Pitch clip card: title over the video, details behind an expander ──────────
const clipExtras = (c) => {
  const seed = Math.round(c.velo * 10 + c.spin);
  return {
    hand: c.hand || (seed % 2 ? 'LHP' : 'RHP'),
    vb: c.vb ?? +(c.spin / 220).toFixed(1),
    hb: c.hb ?? +(((seed % 11) - 5.5) / 1.6).toFixed(1),
    abs: c.abs || (seed % 3 === 0 ? 'Ball' : 'Strike'),
    xwoba: c.xwoba ?? +(Math.min(0.98, c.ev / 152)).toFixed(2),
    zx: c.zx ?? 0.28 + ((seed % 9) / 9) * 0.46,
    zy: c.zy ?? 0.26 + ((seed % 7) / 7) * 0.44,
    sx: c.sx ?? 0.18 + ((seed % 13) / 13) * 0.66,
    sy: c.sy ?? 0.08 + ((seed % 5) / 5) * 0.3,
  };
};

const PlotFrame = ({ w, h, children }) => {
  const k = Math.min(140 / w, 136 / h);
  return (
    <div style={{ flex: 1, minWidth: 0, height: 136, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: w, height: h, transform: `scale(${k})` }}>{children}</div>
    </div>
  );
};

const FieldPlot = ({ x, y, color }) => (
  <PlotFrame w={141} h={133}>
    <img src={MEDIA('assets/field-chart.svg')} alt="" width={141} height={133} style={{ display: 'block' }}/>
    <span style={{
      position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 11, height: 11,
      marginLeft: -5.5, marginTop: -5.5, borderRadius: 9999, background: color || T.accent,
      boxShadow: '0 0 0 2px rgba(3,3,3,0.5)',
    }}/>
  </PlotFrame>
);

const ZonePlot = ({ x, y }) => (
  <PlotFrame w={160} h={146}>
    <svg width="160" height="146" viewBox="0 0 160 146" fill="none">
      <path d="M46.3438 137.029L48.5152 131.802H111.487L113.658 137.029L80.0009 142.28L46.3438 137.029Z" fill="#43484E"/>
      <rect x="46" y="23.1924" width="68" height="68.5779" fill="#D6EBFD" fillOpacity="0.05"/>
      <g stroke="white" strokeOpacity="0.28">
        <path d="M69 23.19V91.77M92 23.19V91.77M46 46.38H114M46 69.58H114"/>
      </g>
      <rect x="46.5" y="23.6924" width="67" height="67.5779" stroke="white" strokeOpacity="0.392157"/>
      <rect x="23.5" y="0.5" width="113" height="113.963" stroke="white" strokeOpacity="0.333333"/>
    </svg>
    <span style={{
      position: 'absolute', left: `${(23 + x * 114) / 160 * 100}%`, top: `${(y * 114) / 146 * 100}%`,
      width: 12, height: 12, marginLeft: -6, marginTop: -6, borderRadius: 9999,
      background: 'rgba(255,62,86,0.41)', border: '1px solid rgba(254,78,84,0.9)',
    }}/>
  </PlotFrame>
);

const StatRow = ({ label, value, unit, dot, dotColor, arrow }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
    <span style={{ fontSize: 13, color: T.fg3, whiteSpace: 'nowrap', flexShrink: 0 }}>{label}</span>
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, flex: 1, minWidth: 0 }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: 9999, background: dotColor || T.accent }}/>}
      <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{value}</span>
      {unit && <span style={{ fontSize: 11, color: T.fg2, fontWeight: 500 }}>{unit}</span>}
      {arrow && <span style={{ fontSize: 11, color: T.fg3 }}>{arrow}</span>}
    </span>
  </div>
);

const PitchClip = ({ clip, n }) => {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState('hit');
  const x = clipExtras(clip);
  return (
    <div style={{ background: 'transparent', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px' }}>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', flex: 1, minWidth: 0 }}>
          {n + 1}. {x.hand} {clip.code} <span style={{ color: T.fg2, fontWeight: 500 }}>·</span> {clip.velo.toFixed(1)} mph
        </span>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0,
          padding: '4px 9px', borderRadius: 9, border: `1px solid ${T.borderStrong}`,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: 9999, background: resultColor(clip.result) }}/>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{clip.result}</span>
        </span>
      </div>

      <HitClip clip={clip} manual/>

      {open && (
        <div style={{ padding: '14px 16px 0' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{ id: 'hit', label: 'Hit' }, { id: 'pitch', label: 'Pitch' }].map(t => {
              const on = view === t.id;
              return (
                <button key={t.id} onClick={() => setView(t.id)} style={{
                  flex: 1, minHeight: 34, borderRadius: 9, cursor: 'pointer', fontFamily: T.sans,
                  fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
                  color: on ? T.fg : T.fg2,
                  background: on ? 'rgba(235,235,239,0.07)' : 'transparent',
                  border: `1px solid ${on ? T.borderStrong : T.border}`,
                }}>{t.label}</button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 0 2px' }}>
            {view === 'hit' ? <FieldPlot x={x.sx} y={x.sy} color={resultColor(clip.result)}/> : <ZonePlot x={x.zx} y={x.zy}/>}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {view === 'hit' ? (
                <>
                  <StatRow label="Result" value={clip.result} dot dotColor={resultColor(clip.result)}/>
                  <StatRow label="Exit Velo." value={clip.ev} unit="mph"/>
                  <StatRow label="Launch Ang." value={`${clip.la}°`}/>
                  <StatRow label="Distance" value={clip.dist} unit="ft"/>
                  <StatRow label="xwoBACON" value={x.xwoba.toFixed(2)}/>
                </>
              ) : (
                <>
                  <StatRow label="Type" value={clip.code}/>
                  <StatRow label="Velo." value={clip.velo.toFixed(1)} unit="mph"/>
                  <StatRow label="V. Break" value={x.vb.toFixed(1)} arrow="↑"/>
                  <StatRow label="H. Break" value={x.hb.toFixed(1)} arrow="←"/>
                  <StatRow label="ABS Result" value={x.abs}/>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!open)} style={{
        width: '100%', minHeight: 44, background: 'transparent', border: 'none', cursor: 'pointer',
        fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.fg2, letterSpacing: '-0.01em',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        {open ? 'Hide Details' : 'Pitch Details'}
        <span style={{ display: 'flex', transform: open ? 'rotate(180deg)' : 'none' }}>
          <ChevronDown color={T.fg2} size={12}/>
        </span>
      </button>
    </div>
  );
};

const ArcHighlights = ({ session, onClose }) => {
  const clips = session.clips || [];
  const [i, setI] = React.useState(0);
  const clip = clips[i];
  const next = () => (i + 1 >= clips.length ? onClose() : setI(i + 1));
  const prev = () => setI(Math.max(0, i - 1));
  if (!clip) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: TOP, background: '#000', color: T.fg,
      fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <StoryPair key={clip.src} clip={clip}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{ fontSize: 34, fontWeight: 800, fontFamily: T.mono, letterSpacing: '-0.04em', lineHeight: 1 }}>{clip.ev}</span>
            <span style={{ fontSize: 12, color: T.fg2 }}>mph EV</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <ResultChip text={clip.result}/>
            <span style={{ fontSize: 12, color: T.fg2 }}>{clip.la}° · {clip.dist} ft</span>
          </div>
          <div style={{ fontSize: 12, color: T.fg2, marginTop: 8 }}>{clip.pitch} · {clip.velo} mph · {clip.spin} rpm</div>
        </StoryPair>

        {/* Story tap zones */}
        <button onClick={prev} aria-label="Previous" style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%',
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}/>
        <button onClick={next} aria-label="Next" style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '70%',
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}/>

        {/* Header, over the video */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0, padding: '8px 14px 20px',
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {clips.map((_, n) => (
              <span key={n} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: n <= i ? T.fg : 'rgba(235,235,239,0.28)',
              }}/>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 2px 0' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{session.title}</div>
              <div style={{ fontSize: 11, color: T.fg2, marginTop: 1 }}>Highlight {i + 1} of {clips.length} · {session.when}</div>
            </div>
            <button onClick={onClose} aria-label="Close" style={{
              width: 34, height: 34, borderRadius: 11, background: 'rgba(3,3,3,0.5)', border: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              pointerEvents: 'auto', flexShrink: 0,
            }}><Icon name="x" size={14} color={T.fg}/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArcDetailM = ({ session, onBack }) => {
  const [tab, setTab] = React.useState('feed');
  const clips = session.clips || [];

  if (tab === 'highlights') return <ArcHighlights session={session} onClose={() => setTab('feed')}/>;

  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: TOP, background: T.bg, color: T.fg,
      fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flexShrink: 0, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px 10px' }}>
          <button onClick={onBack} style={{
            width: 40, height: 40, borderRadius: 12, background: 'transparent', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}><Icon name="arrowL" size={17} color={T.fg}/></button>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{session.title}</div>
            <div style={{ fontSize: 12, color: T.fg3, marginTop: 1 }}>{session.when}</div>
          </div>
          <span style={{ width: 40 }}/>
        </div>
        <div style={{ display: 'flex', padding: '0 12px' }}>
          {[{ id: 'feed', label: 'Feed' }, { id: 'highlights', label: 'Highlights' }].map(t => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, minHeight: 44, background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: on ? T.fg : T.fg3,
                borderBottom: `2px solid ${on ? T.accent : 'transparent'}`,
              }}>{t.label}</button>
            );
          })}
        </div>
      </div>

      {tab === 'feed' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: `0 0 ${BOT + 16}px` }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {clips.map((c, n) => <PitchClip key={c.src} clip={c} n={n}/>)}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────── TRAIN: MODE PICKER
const MODE_CARDS = [
  { id: 'occ', icon: 'eye', name: 'Pitch Recognition', c: '#3E63DD',
    sub: 'The clip cuts at release. Call the location, call the pitch.',
    trains: 'Trains: pitch ID · zone reads', len: '5–10 min' },
  ...(ENABLE_REACTION_TIME ? [{ id: 'rx', icon: 'bolt', name: 'Reaction Time', c: '#5C82E8',
    sub: 'Targets flash on the screen. Tap them as fast as your hands go.',
    trains: 'Trains: raw reaction speed', len: '3–5 min' }] : []),
  { id: 'iq', icon: 'sparkle', name: 'Game IQ', c: '#8FAEF5',
    sub: 'Base running reads and counts. The decisions you get once a game.',
    trains: 'Trains: in-game decisions', len: '5 min' },
];

const ModeCard = ({ card, meta, onClick }) => (
  <button onClick={onClick} style={{
    display: 'block', padding: 16, width: '100%', position: 'relative', overflow: 'hidden',
    background: T.bg1, border: `1px solid ${card.c}44`, borderRadius: 18,
    backgroundImage: `radial-gradient(ellipse at 100% 0%, ${card.c}26, transparent 62%)`,
    cursor: 'pointer', textAlign: 'left', fontFamily: T.sans, color: T.fg,
  }}>
    <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: `${card.c}2E`,
        border: `1px solid ${card.c}66`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icon name={card.icon} size={20} color="#C2D6FA"/></span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 19, fontWeight: 700, letterSpacing: '-0.025em' }}>{card.name}</span>
      <Icon name="arrow" size={15} color={T.fg3}/>
    </span>

    <span style={{ display: 'block', fontSize: 13.5, color: T.fg2, lineHeight: 1.5, marginTop: 12 }}>{card.sub}</span>

    <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
      {[card.trains, card.len].map(t => (
        <span key={t} style={{
          fontSize: 11, fontWeight: 600, color: T.fg2, background: T.bg2,
          border: `1px solid ${T.border}`, padding: '5px 10px', borderRadius: 9999, whiteSpace: 'nowrap',
        }}>{t}</span>
      ))}
    </span>

    <span style={{
      display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 12,
      borderTop: `1px solid ${T.border}`,
    }}>
      <span style={{ flex: 1, minWidth: 0, fontSize: 11, color: T.fg3, fontFamily: T.mono }}>{meta}</span>
    </span>
  </button>
);

const TrainPickerM = ({ user, tabs, cast, onCast, onPick, onRanks, totals }) => {
  const all = totals.occ.pts + (ENABLE_REACTION_TIME ? totals.rx.pts : 0) + totals.iq.pts;
  const metaOf = (t) => t.n ? `${t.n} sessions · ${t.pts.toLocaleString()} pts` : 'Not run yet';
  const meta = { occ: metaOf(totals.occ), rx: metaOf(totals.rx), iq: metaOf(totals.iq) };
  const split = [
    { id: 'occ', label: 'Pitch Recognition', pts: totals.occ.pts, c: '#3E63DD' },
    ...(ENABLE_REACTION_TIME ? [{ id: 'rx',  label: 'Reaction Time',     pts: totals.rx.pts,  c: '#7C9CF0' }] : []),
    { id: 'iq',  label: 'Game IQ',           pts: totals.iq.pts,  c: '#B8CDF8' },
  ];
  const [scoreOpen, setScoreOpen] = React.useState(false);
  const modeCount = MODE_CARDS.length;
  return (
    <Page tabs={tabs} user={user} cast={cast} onCast={onCast}>
      <PageHead title="Train" sub={modeCount === 1 ? 'Sharpen up' : `${modeCount === 2 ? 'Two' : 'Three'} ways to sharpen up`}/>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{
          background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 16,
        }}>
          <button onClick={() => setScoreOpen(!scoreOpen)} style={{
            width: '100%', background: 'transparent', border: 'none', padding: 0,
            textAlign: 'left', cursor: 'pointer', fontFamily: T.sans, color: T.fg,
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Eyebrow color={T.fg3} style={{ flex: 1 }}>Training score</Eyebrow>
            <span style={{ display: 'flex', transform: scoreOpen ? 'rotate(180deg)' : 'none' }}>
              <ChevronDown color={T.fg3} size={13}/>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 9 }}>
            <span style={{ fontSize: 28, fontWeight: 800, fontFamily: T.mono, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {all.toLocaleString()}
            </span>
            <span style={{ fontSize: 12, color: T.fg3, fontWeight: 600 }}>pts</span>
            <span style={{ flex: 1 }}/>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: bandOf(MY_PCTL).color, background: `${bandOf(MY_PCTL).color}1F`,
              border: `1px solid ${bandOf(MY_PCTL).color}55`, padding: '4px 9px', borderRadius: 9999,
            }}>{MY_PCTL}th</span>
          </div>
          <div style={{ display: 'flex', gap: 3, marginTop: 12, height: 7, borderRadius: 4, overflow: 'hidden', background: T.bg3 }}>
            {split.map(m => (
              <span key={m.id} style={{ flex: all ? m.pts : 1, minWidth: m.pts ? 6 : 0, background: m.c }}/>
            ))}
          </div>
          </button>

          {scoreOpen && (
            <div>
              <div style={{ fontSize: 12, color: T.fg3, marginTop: 16, lineHeight: 1.5 }}>
                {ENABLE_REACTION_TIME ? 'All three modes feed one score and one percentile.' : 'Modes feed one score and one percentile.'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                {split.map(m => (
                  <span key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: m.c, flexShrink: 0 }}/>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 11.5, color: T.fg2, whiteSpace: 'nowrap' }}>{m.label}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: T.fg, whiteSpace: 'nowrap' }}>{m.pts.toLocaleString()}</span>
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 16 }}><PctlBar value={MY_PCTL} height={7}/></div>
              <button onClick={onRanks} style={{
                width: '100%', minHeight: 44, marginTop: 16, borderRadius: 12, cursor: 'pointer',
                background: T.bg2, border: `1px solid ${T.borderStrong}`, color: T.fg,
                fontFamily: T.sans, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em',
              }}>View ranks</button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
          {MODE_CARDS.map(c => (
            <ModeCard key={c.id} card={c} meta={meta[c.id]} onClick={() => onPick(c.id)}/>
          ))}
        </div>
      </div>
    </Page>
  );
};

// ─────────────────────────────────────────── REACTION TIME
const RX_SPEED = {
  Rookie:   { win: 1500, size: 80, gap: [430, 820] },
  Standard: { win: 1050, size: 66, gap: [330, 700] },
  Pro:      { win: 750,  size: 54, gap: [230, 560] },
};
const RX_REPS = [15, 25, 40];
const rxPoints = (ms, win) => 60 + Math.max(0, Math.round((1 - ms / win) * 220));
const rxStats = (results) => {
  const hits = results.filter(r => r.hit);
  const avg = hits.length ? Math.round(hits.reduce((a, r) => a + r.ms, 0) / hits.length) : null;
  const best = hits.length ? Math.min(...hits.map(r => r.ms)) : null;
  return {
    hits: hits.length, misses: results.length - hits.length, avg, best,
    acc: results.length ? Math.round(hits.length / results.length * 100) : 0,
  };
};

const SegRow = ({ label, options, value, onChange, fmt }) => (
  <div>
    <Eyebrow style={{ marginBottom: 9 }}>{label}</Eyebrow>
    <div style={{ display: 'flex', gap: 8 }}>
      {options.map(o => {
        const on = o === value;
        return (
          <button key={o} onClick={() => onChange(o)} style={{
            flex: 1, minHeight: 46, borderRadius: 12, cursor: 'pointer', fontFamily: T.sans,
            background: on ? T.accentSoft : T.bg2, border: `1px solid ${on ? T.accent : T.border}`,
            color: on ? '#96B9F8' : T.fg, fontSize: 14, fontWeight: 600,
          }}>{fmt ? fmt(o) : o}</button>
        );
      })}
    </div>
  </div>
);

const ReactionSetupM = ({ cfg, setCfg, onBack, onStart, last }) => (
  <div style={{
    position: 'absolute', inset: 0, paddingTop: TOP, background: T.bg, color: T.fg,
    fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  }}>
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <PageHead title="Reaction Time" sub="Tap every target the moment it lands" onBack={onBack}/>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SegRow label="Targets" options={RX_REPS} value={cfg.reps} onChange={(v) => setCfg({ ...cfg, reps: v })}/>
          <SegRow label="Speed" options={['Rookie', 'Standard', 'Pro']} value={cfg.speed} onChange={(v) => setCfg({ ...cfg, speed: v })}/>
          <div style={{ fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
            {RX_SPEED[cfg.speed].win} ms to reach each target. Miss it and it counts against you.
          </div>
        </Card>
        {last && (
          <div style={{ display: 'flex', gap: 10 }}>
            <Stat3 label="Last avg" value={last.avg == null ? '–' : last.avg} unit="ms"/>
            <Stat3 label="Best rep" value={last.best == null ? '–' : last.best} unit="ms"/>
            <Stat3 label="Accuracy" value={`${last.acc}%`}/>
          </div>
        )}
      </div>
    </div>
    <div style={{
      flexShrink: 0, padding: `10px 16px ${BOT + 6}px`,
      borderTop: `1px solid ${T.border}`, background: 'rgba(3,3,3,0.9)', backdropFilter: 'blur(14px)',
    }}>
      <BigBtn onClick={onStart}>Start</BigBtn>
    </div>
  </div>
);

const ReactionDrillM = ({ cfg, onComplete, onExit }) => {
  const sp = RX_SPEED[cfg.speed] || RX_SPEED.Standard;
  const total = cfg.reps;
  const [count, setCount] = React.useState(3);
  const [dot, setDot] = React.useState(null);
  const [done, setDone] = React.useState([]);
  const [flash, setFlash] = React.useState(null);
  const resRef = React.useRef([]);
  const dotRef = React.useRef(null);
  const nRef = React.useRef(0);
  const timers = React.useRef([]);
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; };

  const finish = () => {
    const results = resRef.current;
    const score = results.reduce((a, r) => a + r.points, 0);
    onComplete({ results, score, cfg });
  };

  const record = (r) => {
    resRef.current = [...resRef.current, r];
    setDone(resRef.current);
    dotRef.current = null;
    setDot(null);
    setFlash(r);
    later(() => setFlash(null), 460);
    if (resRef.current.length >= total) later(finish, 620);
    else later(spawnRef.current, sp.gap[0] + Math.random() * (sp.gap[1] - sp.gap[0]));
  };

  const spawn = () => {
    const n = nRef.current + 1;
    nRef.current = n;
    const d = { n, x: 10 + Math.random() * 80, y: 10 + Math.random() * 80, at: performance.now() };
    dotRef.current = d;
    setDot(d);
    later(() => {
      if (dotRef.current && dotRef.current.n === d.n) {
        record({ n, hit: false, ms: sp.win, points: 0 });
      }
    }, sp.win);
  };
  const spawnRef = React.useRef(spawn);
  spawnRef.current = spawn;

  const hit = () => {
    const d = dotRef.current;
    if (!d) return;
    const ms = Math.max(90, Math.round(performance.now() - d.at));
    record({ n: d.n, hit: true, ms, points: rxPoints(ms, sp.win) });
  };

  React.useEffect(() => {
    let c = 3;
    const tick = () => {
      c -= 1;
      setCount(c);
      if (c > 0) later(tick, 700);
      else later(spawnRef.current, 500);
    };
    later(tick, 700);
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const st = rxStats(done);
  const score = done.reduce((a, r) => a + r.points, 0);

  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: TOP, background: T.bg, color: T.fg,
      fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flexShrink: 0, padding: '6px 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onExit} style={{
            width: 36, height: 36, borderRadius: 11, background: T.bg2, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}><Icon name="x" size={14} color={T.fg2}/></button>
          <span style={{ flex: 1 }}/>
          <span style={{ fontSize: 12, color: T.fg3, fontWeight: 600 }}>
            Target {Math.min(done.length + 1, total)}<span style={{ color: T.fg4 }}>/{total}</span>
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 4, padding: '5px 10px',
            background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 9999,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{score.toLocaleString()}</span>
            <span style={{ fontSize: 10, color: T.fg3, fontWeight: 600, letterSpacing: '0.06em' }}>PTS</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
          {Array.from({ length: total }).map((_, i) => {
            const r = done[i];
            const bg = r ? (r.hit ? T.green : T.red) : T.bg3;
            return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: bg, opacity: r ? 0.9 : i === done.length ? 0.7 : 0.28 }}/>;
          })}
        </div>
      </div>

      <div style={{
        flex: 1, position: 'relative', margin: '0 16px 12px', borderRadius: 18, overflow: 'hidden',
        background: '#07070A', border: `1px solid ${T.border}`,
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(62,99,221,0.14), transparent 60%)',
      }}>
        {count > 0 && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <div style={{ fontSize: 72, fontWeight: 800, fontFamily: T.mono, letterSpacing: '-0.05em' }}>{count}</div>
            <div style={{ fontSize: 13, color: T.fg3 }}>Hands ready</div>
          </div>
        )}

        {dot && (
          <button onPointerDown={hit} aria-label="Target" style={{
            position: 'absolute', left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%, -50%)',
            width: sp.size, height: sp.size, borderRadius: '50%', padding: 0, cursor: 'pointer',
            background: T.accent, border: '2px solid rgba(235,235,239,0.85)',
            boxShadow: '0 0 0 6px rgba(62,99,221,0.18), 0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span aria-hidden="true" style={{
              position: 'absolute', inset: -10, borderRadius: '50%',
              border: `2px solid ${T.accent}`, animation: 'ringPulse .7s ease-out infinite',
            }}/>
          </button>
        )}

        {flash && (
          <div className="fade-in" style={{
            position: 'absolute', left: 0, right: 0, bottom: 16, display: 'flex', justifyContent: 'center',
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'baseline', gap: 6, padding: '7px 14px', borderRadius: 9999,
              background: flash.hit ? 'rgba(31,168,102,0.16)' : 'rgba(214,69,69,0.16)',
              border: `1px solid ${flash.hit ? T.green : T.red}66`,
            }}>
              {flash.hit ? (
                <>
                  <span style={{ fontSize: 18, fontWeight: 800, fontFamily: T.mono, color: T.green }}>{flash.ms}</span>
                  <span style={{ fontSize: 11, color: T.fg2 }}>ms · +{flash.points}</span>
                </>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: T.red }}>Missed</span>
              )}
            </span>
          </div>
        )}
      </div>

      <div style={{
        flexShrink: 0, padding: `0 20px ${BOT + 10}px`, display: 'flex', gap: 10,
      }}>
        <Stat3 label="Avg" value={st.avg == null ? '–' : st.avg} unit="ms"/>
        <Stat3 label="Best" value={st.best == null ? '–' : st.best} unit="ms"/>
        <Stat3 label="Hits" value={`${st.hits}/${done.length}`}/>
      </div>
    </div>
  );
};

const ReactionRecapM = ({ result, onAgain, onDone }) => {
  const { score, results } = result;
  const st = rxStats(results);
  const slowest = Math.max(...results.map(r => r.ms), 1);
  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: TOP, background: T.bg, color: T.fg,
      fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card style={{ padding: 22, textAlign: 'center', backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(62,99,221,0.2), transparent 65%)' }}>
            <Eyebrow color={T.accent}>Set complete</Eyebrow>
            <div style={{ fontSize: 58, fontWeight: 800, fontFamily: T.mono, letterSpacing: '-0.05em', lineHeight: 1.05, marginTop: 8 }}>
              {score.toLocaleString()}
            </div>
            <div style={{ fontSize: 13, color: T.fg3, marginTop: 6 }}>
              {st.hits} of {results.length} targets · {result.cfg.speed} speed
            </div>
          </Card>

          <ReadinessGain from={58} to={61}/>

          <div style={{ display: 'flex', gap: 10 }}>
            <Stat3 label="Avg reaction" value={st.avg == null ? '–' : st.avg} unit="ms"/>
            <Stat3 label="Best rep" value={st.best == null ? '–' : st.best} unit="ms"/>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Stat3 label="Hits / miss" value={`${st.hits}/${st.misses}`}/>
            <Stat3 label="Accuracy" value={`${st.acc}%`}/>
          </div>

          <Card style={{ overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: `1px solid ${T.border}` }}><Eyebrow>Rep by rep</Eyebrow></div>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 54px 44px', gap: 9, padding: '10px 16px', alignItems: 'center', borderBottom: `1px solid ${T.bg2}` }}>
                <span style={{ fontSize: 11, fontFamily: T.mono, color: T.fg4 }}>{String(i + 1).padStart(2, '0')}</span>
                <div style={{ height: 5, background: T.bg3, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round(r.ms / slowest * 100)}%`, height: '100%', background: r.hit ? T.accent : T.red, opacity: r.hit ? 1 : 0.5 }}/>
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 12, color: r.hit ? T.fg : T.red, textAlign: 'right' }}>
                  {r.hit ? `${r.ms} ms` : 'miss'}
                </span>
                <span style={{ textAlign: 'right', fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: r.points >= 200 ? T.accent : T.fg2 }}>+{r.points}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
      <div style={{
        flexShrink: 0, padding: `10px 16px ${BOT + 6}px`, display: 'flex', flexDirection: 'column', gap: 8,
        borderTop: `1px solid ${T.border}`, background: 'rgba(3,3,3,0.9)', backdropFilter: 'blur(14px)',
      }}>
        <BigBtn onClick={onAgain}>Go again</BigBtn>
        <BigBtn tone="ghost" onClick={onDone}>Back to Train</BigBtn>
      </div>
    </div>
  );
};

// Animated game-readiness gain, shown at the end of a training module.
const ReadinessGain = ({ from = 55, to = 58, label = 'Game readiness' }) => {
  const [v, setV] = React.useState(from);
  const [pop, setPop] = React.useState(false);
  React.useEffect(() => {
    const t0 = performance.now(), dur = 1400, delay = 420;
    let raf;
    const tick = (t) => {
      const p = Math.max(0, Math.min(1, (t - t0 - delay) / dur));
      const e = 1 - Math.pow(1 - p, 3);
      setV(from + (to - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick); else setPop(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to]);
  const R = 46, C = 2 * Math.PI * R;
  const band = readyBand(Math.round(v));
  return (
    <Card style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 18 }}>
      <div style={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
        <svg width="104" height="104" viewBox="0 0 104 104">
          <circle cx="52" cy="52" r={R} fill="none" stroke={T.bg3} strokeWidth="5"/>
          <circle cx="52" cy="52" r={R} fill="none" stroke={band.c} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={`${(v / 100) * C} ${C}`} transform="rotate(-90 52 52)"
            style={{ transition: 'stroke .3s linear' }}/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{Math.round(v)}</span>
          <span style={{ fontSize: 9, color: T.fg4, fontWeight: 600, letterSpacing: '0.06em', marginTop: 2 }}>/100</span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Eyebrow>{label}</Eyebrow>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{band.name}</span>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#5BB98B',
            opacity: pop ? 1 : 0, transform: pop ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity .35s ease-out, transform .35s ease-out',
          }}>+{to - from}</span>
        </div>
        <div style={{ fontSize: 12.5, color: T.fg3, lineHeight: 1.5, marginTop: 7 }}>
          This set moved your readiness from {from} to {to}.
        </div>
      </div>
    </Card>
  );
};

// ─────────────────────────────────────────── PLAYER IQ
const IQ_QUESTIONS = [
  { id: 'iq1', kind: 'situation', tag: 'Base running', count: '1-1', runners: [1], outs: 0, hit: { x: 0.86, y: 0.30, label: 'Base hit RF' },
    setup: 'No outs, you\'re on first. Base hit to right field — the right fielder is deep and takes a bad angle to the ball.',
    q: 'Do you go for third?',
    choices: ['Hold at second', 'Wait for the coach', 'Go — the ball is behind you and misplayed', 'Go only if the throw goes to second'],
    answer: 2,
    why: 'The ball is behind you, the fielder is deep and took a bad angle — that is a read you make out of the box. Get to third hard and pick up the coach; on a real misplay you can score.' },
  { id: 'iq2', kind: 'approach', tag: 'Approach', count: '1-2',
    setup: 'RHP, 1-2 count. He has landed two sliders on the outer edge and missed up with the fastball.',
    q: 'What are you sitting on?',
    choices: ['Fastball up', 'Changeup in', 'Nothing — pure react', 'Slider away'],
    answer: 3,
    why: 'With two strikes he goes to the pitch he can already land. Sit soft and away, stay on the plate, and you can still adjust up to the fastball.' },
  { id: 'iq3', kind: 'situation', tag: 'Base running', count: '2-1', runners: [2], outs: 2, hit: { x: 0.30, y: 0.42, label: 'Fly ball LF' },
    setup: 'Two outs, you\'re on second. The ball is hit in the air to left.',
    q: 'What do you do off second?',
    choices: ['Freeze until it lands', 'Go on contact', 'Halfway and look', 'Read the third baseman first'],
    answer: 1,
    why: 'Two outs, you run on contact. There is no double-up risk and nothing behind you to score the run.' },
  { id: 'iq4', kind: 'situation', tag: 'Base running', count: '0-1', runners: [3], outs: 1, hit: { x: 0.32, y: 0.66, label: 'Ground ball SS' },
    setup: 'One out, you\'re on third, infield in. Sharp ground ball hit right at the shortstop.',
    q: 'Do you break for home?',
    choices: ['Go on contact', 'Go if it\'s on the third-base side', 'Hold — hit too hard and right at him', 'Go only if it gets through'],
    answer: 2,
    why: 'Infield in means he is throwing home. Hit hard and right at him, you are out by a step. Stay at third and let the next hitter drive you in.' },
  { id: 'iq5', kind: 'situation', tag: 'Base running', count: '3-2', runners: [1], outs: 2,
    setup: 'Two outs, full count, you\'re on first.',
    q: 'When do you go?',
    choices: ['On contact only', 'Halfway', 'Freeze and read the ball', 'On the pitch'],
    answer: 3,
    why: 'Two outs and a full count: the hitter is either walking, striking out, or swinging. You run on the pitch so a base hit scores you from first.' },
  { id: 'iq6', kind: 'approach', tag: 'Approach', count: '2-0',
    setup: 'RHP has missed with two fastballs. Runner on second, 2-0 count.',
    q: 'What are you looking for?',
    choices: ['Slider — he\'ll steal one', 'Fastball in the middle third', 'Anything, expand the zone', 'Take and hope for the walk'],
    answer: 1,
    why: 'He has to throw a strike and his slider is not in the zone yet. Narrow the zone to the middle third and do damage on the pitch you can handle.' },
  { id: 'iq7', kind: 'situation', tag: 'Base running', count: '1-0', runners: [1, 2], outs: 1, hit: { x: 0.42, y: 0.24, label: 'Line drive LCF' },
    setup: 'First and second, one out. The ball goes up on a line to left-center.',
    q: 'What is your job from first?',
    choices: ['Full sprint — you can score from first', 'Stay on first until it lands', 'Tag up and hold', 'Get to second and read the catch'],
    answer: 3,
    why: 'On a line drive you get far enough to advance if it drops but stay close enough to retouch. Getting doubled up is the one outcome that kills the inning.' },
  { id: 'iq8', kind: 'situation', tag: 'Base running', count: '2-2', runners: [1, 2, 3], outs: 1, hit: { x: 0.66, y: 0.68, label: 'Ground ball 2B' },
    setup: 'Bases loaded, one out. Ground ball to the second baseman.',
    q: 'What do you do from third?',
    choices: ['Hold', 'Go — you\'re forced', 'Read the throw first', 'Halfway'],
    answer: 1,
    why: 'With the bases loaded every runner is forced. Get down the line hard — the play at the plate is a force, so hesitation is the only way you are out.' },
  { id: 'iq9', kind: 'situation', tag: 'Base running', count: '1-0', runners: [1], outs: 0,
    setup: 'You\'re on first. The pitcher is 1.5 seconds to the plate from the stretch. The catcher\'s pop time is 2.05.',
    q: 'Do you steal?',
    choices: ['No — that pop time shuts it down', 'Only on a breaking ball', 'Only with a righty at the plate', 'Yes — 3.55 total, the base is yours'],
    answer: 3,
    why: 'Delivery plus pop time over about 3.3 seconds means an average runner gets there. 1.5 and 2.05 is 3.55 — go on first movement.' },
];
// Normalized base coords on assets/field-no-foul.svg (141×124)
const BASES = {
  home:  { x: 0.498, y: 0.961 },
  1:     { x: 0.603, y: 0.815 },
  2:     { x: 0.498, y: 0.697 },
  3:     { x: 0.393, y: 0.815 },
};

const IQField = ({ runners = [], outs = 0, hit, count }) => (
  <div style={{
    background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: 14,
    display: 'flex', alignItems: 'center', gap: 14,
  }}>
    <div style={{ position: 'relative', width: 141, height: 124, flexShrink: 0 }}>
      <img src={MEDIA('assets/field-no-foul.svg')} alt="" width={141} height={124} style={{ display: 'block' }}/>
      {hit && (
        <svg width="141" height="124" viewBox="0 0 141 124" style={{ position: 'absolute', inset: 0 }}>
          <path d={`M ${BASES.home.x * 141} ${BASES.home.y * 124} Q ${(BASES.home.x + hit.x) / 2 * 141 + (hit.x - BASES.home.x) * 18} ${(BASES.home.y + hit.y) / 2 * 124 - 20} ${hit.x * 141} ${hit.y * 124}`}
            fill="none" stroke="#D7DADF" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.8"/>
          <circle cx={hit.x * 141} cy={hit.y * 124} r="3.6" fill="#EDEEF0"/>
        </svg>
      )}
      {runners.map(b => (
        <span key={b} style={{
          position: 'absolute', left: `${BASES[b].x * 100}%`, top: `${BASES[b].y * 100}%`,
          width: 11, height: 11, marginLeft: -5.5, marginTop: -5.5, transform: 'rotate(45deg)',
          background: T.accent, border: `1.5px solid ${T.accent}`, borderRadius: 2,
        }}/>
      ))}
    </div>

    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <Eyebrow>Outs</Eyebrow>
        <div style={{ display: 'flex', gap: 6, marginTop: 7 }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              width: 11, height: 11, borderRadius: 9999,
              background: i < outs ? '#E5484D' : 'transparent',
              border: `1.5px solid ${i < outs ? '#E5484D' : 'rgba(235,235,239,0.28)'}`,
            }}/>
          ))}
        </div>
      </div>
      {count && (
        <div>
          <Eyebrow>Count</Eyebrow>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: T.mono, color: T.fg, marginTop: 6 }}>{count}</div>
        </div>
      )}
      <div>
        <Eyebrow>Runners</Eyebrow>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.fg, marginTop: 6 }}>
          {runners.length === 0 ? 'Bases empty'
            : runners.length === 3 ? 'Bases loaded'
            : runners.map(r => r === 1 ? '1st' : r === 2 ? '2nd' : '3rd').join(' & ')}
        </div>
      </div>
      {hit && (
        <div>
          <Eyebrow>Ball</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#EDEEF0' }}/>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{hit.label}</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

const IQ_REPS = [6, 9];
const iqPoints = (ms) => 200 + Math.max(0, Math.round((1 - Math.min(ms, 12000) / 12000) * 100));
const iqStats = (results) => {
  const right = results.filter(r => r.correct).length;
  const avg = results.length ? Math.round(results.reduce((a, r) => a + r.ms, 0) / results.length / 100) / 10 : null;
  return { right, wrong: results.length - right, acc: results.length ? Math.round(right / results.length * 100) : 0, avg };
};

const IQSetupM = ({ cfg, setCfg, onBack, onStart, last }) => (
  <div style={{
    position: 'absolute', inset: 0, paddingTop: TOP, background: T.bg, color: T.fg,
    fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
  }}>
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <PageHead title="Game IQ" sub="Situations, counts and reads" onBack={onBack}/>
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SegRow label="Questions" options={IQ_REPS} value={cfg.reps} onChange={(v) => setCfg({ ...cfg, reps: v })}/>
          <div>
            <Eyebrow style={{ marginBottom: 9 }}>Topic</Eyebrow>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['Base running', 'Approach'].map(t => (
                <span key={t} style={{
                  fontSize: 12, fontWeight: 600, color: '#96B9F8', background: T.accentSofter,
                  border: `1px solid ${T.accent}55`, padding: '7px 12px', borderRadius: 9999,
                }}>{t}</span>
              ))}
            </div>
          </div>
        </Card>
        {last && (
          <div style={{ display: 'flex', gap: 10 }}>
            <Stat3 label="Last correct" value={`${last.right}/${last.right + last.wrong}`}/>
            <Stat3 label="Accuracy" value={`${last.acc}%`}/>
            <Stat3 label="Avg call" value={last.avg == null ? '–' : last.avg} unit="s"/>
          </div>
        )}
      </div>
    </div>
    <div style={{
      flexShrink: 0, padding: `10px 16px ${BOT + 6}px`,
      borderTop: `1px solid ${T.border}`, background: 'rgba(3,3,3,0.9)', backdropFilter: 'blur(14px)',
    }}>
      <BigBtn onClick={onStart}>Start</BigBtn>
    </div>
  </div>
);

const IQDrillM = ({ cfg, onComplete, onExit }) => {
  const queue = React.useMemo(() => {
    const pool = IQ_QUESTIONS;
    return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(cfg.reps, pool.length));
  }, [cfg.reps]);
  const [idx, setIdx] = React.useState(0);
  const [sel, setSel] = React.useState(null);
  const [pick, setPick] = React.useState(null);
  const [results, setResults] = React.useState([]);
  const askedAt = React.useRef(performance.now());
  React.useEffect(() => { askedAt.current = performance.now(); }, [idx]);

  const q = queue[idx];
  const score = results.reduce((a, r) => a + r.points, 0);

  const choose = (i) => { if (pick == null) setSel(i); };

  const confirm = () => {
    if (pick != null || sel == null) return;
    const ms = Math.round(performance.now() - askedAt.current);
    const correct = sel === q.answer;
    setPick(sel);
    setResults(rs => [...rs, { id: q.id, q: q.q, tag: q.tag, correct, ms, points: correct ? iqPoints(ms) : 0 }]);
  };

  const next = () => {
    if (idx + 1 >= queue.length) {
      const total = results.reduce((a, r) => a + r.points, 0);
      onComplete({ results, score: total, cfg });
      return;
    }
    setPick(null);
    setSel(null);
    setIdx(idx + 1);
  };

  const last = results[results.length - 1];

  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: TOP, background: T.bg, color: T.fg,
      fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flexShrink: 0, padding: '6px 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onExit} style={{
            width: 36, height: 36, borderRadius: 11, background: T.bg2, border: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}><Icon name="x" size={14} color={T.fg2}/></button>
          <span style={{ flex: 1 }}/>
          <span style={{ fontSize: 12, color: T.fg3, fontWeight: 600 }}>
            Question {idx + 1}<span style={{ color: T.fg4 }}>/{queue.length}</span>
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 4, padding: '5px 10px',
            background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 9999,
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{score.toLocaleString()}</span>
            <span style={{ fontSize: 10, color: T.fg3, fontWeight: 600, letterSpacing: '0.06em' }}>PTS</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 3, marginTop: 10 }}>
          {queue.map((_, i) => {
            const r = results[i];
            const bg = r ? (r.correct ? T.green : T.red) : T.bg3;
            return <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: bg, opacity: r ? 0.9 : i === idx ? 0.7 : 0.28 }}/>;
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#96B9F8', background: T.accentSofter, border: `1px solid ${T.accent}55`,
              padding: '4px 9px', borderRadius: 9999,
            }}>{q.tag}</span>
          </div>

          {q.runners !== undefined && <IQField runners={q.runners} outs={q.outs} hit={q.hit} count={q.count}/>}

          <div>
            <div style={{ fontSize: 15, color: T.fg2, lineHeight: 1.55 }}>{q.setup}</div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.3, marginTop: 10 }}>{q.q}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {q.choices.map((c, i) => {
              const chosen = (pick != null ? pick : sel) === i;
              const right = pick != null && i === q.answer;
              const wrong = pick != null && chosen && !right;
              const bd = right ? T.green : wrong ? T.red : chosen ? T.accent : T.border;
              const bg = right ? 'rgba(31,168,102,0.13)' : wrong ? 'rgba(214,69,69,0.13)' : chosen ? T.accentSofter : T.bg1;
              return (
                <button key={i} onClick={() => choose(i)} style={{
                  display: 'flex', alignItems: 'center', gap: 11, minHeight: 54, padding: '12px 14px',
                  background: bg, border: `1px solid ${bd}`, borderRadius: 13, textAlign: 'left',
                  cursor: pick == null ? 'pointer' : 'default', fontFamily: T.sans, color: T.fg,
                }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{c}</span>
                  {right && <Icon name="check" size={14} color={T.green} sw={2.2}/>}
                  {wrong && <Icon name="x" size={14} color={T.red} sw={2.2}/>}
                  {pick == null && chosen && <Icon name="check" size={14} color={T.accent} sw={2.2}/>}
                </button>
              );
            })}
          </div>

        </div>
      </div>

      <div style={{
        flexShrink: 0, padding: `10px 16px ${BOT + 6}px`,
        borderTop: `1px solid ${T.border}`, background: 'rgba(3,3,3,0.9)', backdropFilter: 'blur(14px)',
      }}>
        <BigBtn onClick={confirm} disabled={sel == null || pick != null}>
          {sel == null ? 'Pick an answer' : 'Lock in answer'}
        </BigBtn>
      </div>

      {pick != null && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,3,3,0.62)' }}/>
          <div style={{
            position: 'relative', background: T.bg1, borderTop: `1px solid ${T.borderStrong}`,
            borderRadius: '20px 20px 0 0', padding: `18px 20px ${BOT + 14}px`,
            boxShadow: '0 -20px 50px rgba(0,0,0,0.6)',
          }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: T.bg3, margin: '0 auto 16px' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{
                width: 26, height: 26, borderRadius: 9999, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: last && last.correct ? 'rgba(48,164,108,0.16)' : 'rgba(229,72,77,0.16)',
                border: `1px solid ${last && last.correct ? T.green : T.red}66`,
              }}>
                <Icon name={last && last.correct ? 'check' : 'x'} size={13} color={last && last.correct ? T.green : T.red} sw={2.4}/>
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>
                {last && last.correct ? 'Right call' : 'Not this one'}
              </span>
              {last && last.correct && (
                <span style={{ fontSize: 13, fontWeight: 700, color: '#96B9F8' }}>+{last.points}</span>
              )}
            </div>
            {last && !last.correct && (
              <div style={{ fontSize: 13, color: T.fg2, marginTop: 12 }}>
                Correct answer: <span style={{ color: T.fg, fontWeight: 600 }}>{q.choices[q.answer]}</span>
              </div>
            )}
            <div style={{ fontSize: 14, color: T.fg2, lineHeight: 1.6, marginTop: 12 }}>{q.why}</div>
            <div style={{ marginTop: 18 }}>
              <BigBtn onClick={next}>{idx + 1 >= queue.length ? 'See results' : 'Next situation'}</BigBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const IQRecapM = ({ result, onAgain, onDone }) => {
  const { score, results } = result;
  const st = iqStats(results);
  return (
    <div style={{
      position: 'absolute', inset: 0, paddingTop: TOP, background: T.bg, color: T.fg,
      fontFamily: T.sans, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card style={{ padding: 22, textAlign: 'center', backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(62,99,221,0.2), transparent 65%)' }}>
            <Eyebrow color={T.accent}>Set complete</Eyebrow>
            <div style={{ fontSize: 58, fontWeight: 800, fontFamily: T.mono, letterSpacing: '-0.05em', lineHeight: 1.05, marginTop: 8 }}>
              {score.toLocaleString()}
            </div>
            <div style={{ fontSize: 13, color: T.fg3, marginTop: 6 }}>
              {st.right} of {results.length} calls right
            </div>
          </Card>

          <ReadinessGain from={58} to={63}/>

          <div style={{ display: 'flex', gap: 10 }}>
            <Stat3 label="Accuracy" value={`${st.acc}%`}/>
            <Stat3 label="Avg call" value={st.avg == null ? '–' : st.avg} unit="s"/>
            <Stat3 label="Missed" value={st.wrong}/>
          </div>

          <Card style={{ overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: `1px solid ${T.border}` }}><Eyebrow>Call by call</Eyebrow></div>
            {results.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 18px 46px', gap: 9, padding: '11px 16px', alignItems: 'center', borderBottom: `1px solid ${T.bg2}` }}>
                <span style={{ fontSize: 11, fontFamily: T.mono, color: T.fg4 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.q}</span>
                  <span style={{ display: 'block', fontSize: 11, color: T.fg3, marginTop: 2 }}>{r.tag} · {(r.ms / 1000).toFixed(1)}s</span>
                </span>
                <span style={{ textAlign: 'center' }}>
                  <Icon name={r.correct ? 'check' : 'x'} size={12} color={r.correct ? T.green : T.red} sw={2.2}/>
                </span>
                <span style={{ textAlign: 'right', fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: r.points >= 250 ? T.accent : T.fg2 }}>+{r.points}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
      <div style={{
        flexShrink: 0, padding: `10px 16px ${BOT + 6}px`, display: 'flex', flexDirection: 'column', gap: 8,
        borderTop: `1px solid ${T.border}`, background: 'rgba(3,3,3,0.9)', backdropFilter: 'blur(14px)',
      }}>
        <BigBtn onClick={onAgain}>Go again</BigBtn>
        <BigBtn tone="ghost" onClick={onDone}>Back to Train</BigBtn>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────── ROOT
const AppMobile = ({ defaultDifficulty = 'Standard', skipAuth = false }) => {
  const [user, setUser] = useLocal('occm-user-v3', null);
  const [cfg, setCfg] = useLocal('occm-cfg', { ...DEFAULT_CFG, difficulty: defaultDifficulty });
  const [sessions, setSessions] = useLocal('occm-sessions', []);
  const [tab, setTab] = React.useState('home');
  const [mode, setMode] = React.useState('tabs'); // tabs | setup | drill | recap | ranks | progress | detail | arc | rx-* | iq-*
  const [trainView, setTrainView] = React.useState('picker'); // picker | occ
  const [rxCfg, setRxCfg] = useLocal('occm-rx-cfg', { reps: 25, speed: 'Standard' });
  const [iqCfg, setIqCfg] = useLocal('occm-iq-cfg', { reps: 6 });
  const [rxSessions, setRxSessions] = useLocal('occm-rx-sessions', []);
  const [iqSessions, setIqSessions] = useLocal('occm-iq-sessions', []);
  const [rxResult, setRxResult] = React.useState(null);
  const [iqResult, setIqResult] = React.useState(null);
  const [arcSession, setArcSession] = React.useState(null);
  const [runCfg, setRunCfg] = React.useState(null);
  const [result, setResult] = React.useState(null);
  const [openSession, setOpenSession] = React.useState(null);
  const [detailFrom, setDetailFrom] = React.useState('tabs');
  const [cast, setCast] = useLocal('occm-cast', null);
  const [castOpen, setCastOpen] = React.useState(false);
  const castSheet = castOpen ? <CastSheet device={cast} setDevice={setCast} onClose={() => setCastOpen(false)}/> : null;
  const openCast = () => setCastOpen(true);

  const saveSession = (r, usedCfg) => {
    const total = r.results.length;
    const rec = {
      id: 'occ-' + Date.now(),
      title: 'Pitch Recognition Session',
      when: 'Just now',
      pitches: total,
      score: r.score,
      zoneAcc: pctOf(r.results, 'zoneRight'),
      pitchAcc: pctOf(r.results, 'pitchRight'),
      cfg: usedCfg,
      results: r.results,
    };
    setSessions([rec, ...sessions].slice(0, 20));
  };

  const saveRx = (r) => {
    const st = rxStats(r.results);
    setRxSessions([{ id: 'rx-' + Date.now(), when: 'Just now', score: r.score, cfg: r.cfg, ...st }, ...rxSessions].slice(0, 20));
  };
  const saveIq = (r) => {
    const st = iqStats(r.results);
    setIqSessions([{ id: 'iq-' + Date.now(), when: 'Just now', score: r.score, cfg: r.cfg, ...st }, ...iqSessions].slice(0, 20));
  };

  const board = LEADERBOARD.find(p => p.you) || { pts: 10240, sessions: 26 };
  const rxBest = rxSessions.length ? Math.min(...rxSessions.map(s => s.best == null ? 9999 : s.best)) : null;
  const iqAcc = iqSessions.length
    ? Math.round(iqSessions.reduce((a, s) => a + s.acc, 0) / iqSessions.length)
    : null;
  const totals = {
    occ: { n: sessions.length + board.sessions, pts: board.pts + sessions.reduce((a, s) => a + (s.score || 0), 0) },
    rx: { n: rxSessions.length, pts: rxSessions.reduce((a, s) => a + s.score, 0), best: rxBest },
    iq: { n: iqSessions.length, pts: iqSessions.reduce((a, s) => a + s.score, 0), acc: iqAcc },
  };

  if (!user && !skipAuth) return <AuthM onLogin={setUser}/>;
  const me = user || { name: 'Jason Whitman', email: 'jason@trajekt.io', handle: 'jwhitman' };

  if (mode === 'setup') return (
    <div data-screen-label="Custom setup" style={{ position: 'absolute', inset: 0 }}>
      <SetupM cfg={cfg} setCfg={setCfg} onBack={() => setMode('tabs')}
        onStart={() => { setRunCfg(cfg); setMode('drill'); }}/>
    </div>
  );
  if (mode === 'drill') return (
    <div data-screen-label="Drill" style={{ position: 'absolute', inset: 0 }}>
      <DrillM cfg={runCfg || cfg} cast={cast} onCast={openCast}
        onComplete={(r) => { setResult(r); saveSession(r, runCfg || cfg); setMode('recap'); }}
        onExit={() => setMode('tabs')}/>
      {castSheet}
    </div>
  );
  if (mode === 'recap') return (
    <div data-screen-label="Recap" style={{ position: 'absolute', inset: 0 }}>
      <RecapM result={result} onAgain={() => setMode('drill')} onDone={() => { setMode('tabs'); setTab('train'); setTrainView('occ'); }}/>
    </div>
  );

  if (ENABLE_REACTION_TIME && mode === 'rx-setup') return (
    <div data-screen-label="Reaction setup" style={{ position: 'absolute', inset: 0 }}>
      <ReactionSetupM cfg={rxCfg} setCfg={setRxCfg} last={rxSessions[0]}
        onBack={() => setMode('tabs')} onStart={() => setMode('rx-drill')}/>
    </div>
  );
  if (ENABLE_REACTION_TIME && mode === 'rx-drill') return (
    <div data-screen-label="Reaction drill" style={{ position: 'absolute', inset: 0 }}>
      <ReactionDrillM cfg={rxCfg} onExit={() => setMode('rx-setup')}
        onComplete={(r) => { setRxResult(r); saveRx(r); setMode('rx-recap'); }}/>
    </div>
  );
  if (ENABLE_REACTION_TIME && mode === 'rx-recap') return (
    <div data-screen-label="Reaction recap" style={{ position: 'absolute', inset: 0 }}>
      <ReactionRecapM result={rxResult} onAgain={() => setMode('rx-drill')}
        onDone={() => { setMode('tabs'); setTab('train'); setTrainView('picker'); }}/>
    </div>
  );

  if (mode === 'iq-setup') return (
    <div data-screen-label="Game IQ setup" style={{ position: 'absolute', inset: 0 }}>
      <IQSetupM cfg={iqCfg} setCfg={setIqCfg} last={iqSessions[0]}
        onBack={() => setMode('tabs')} onStart={() => setMode('iq-drill')}/>
    </div>
  );
  if (mode === 'iq-drill') return (
    <div data-screen-label="Game IQ drill" style={{ position: 'absolute', inset: 0 }}>
      <IQDrillM cfg={iqCfg} onExit={() => setMode('iq-setup')}
        onComplete={(r) => { setIqResult(r); saveIq(r); setMode('iq-recap'); }}/>
    </div>
  );
  if (mode === 'iq-recap') return (
    <div data-screen-label="Game IQ recap" style={{ position: 'absolute', inset: 0 }}>
      <IQRecapM result={iqResult} onAgain={() => setMode('iq-drill')}
        onDone={() => { setMode('tabs'); setTab('train'); setTrainView('picker'); }}/>
    </div>
  );

  if (mode === 'arc' && arcSession) return (
    <div data-screen-label="Arc session detail" style={{ position: 'absolute', inset: 0 }}>
      <ArcDetailM session={arcSession} onBack={() => setMode('tabs')}/>
    </div>
  );

  if (mode === 'detail' && openSession) return (
    <div data-screen-label="Session detail" style={{ position: 'absolute', inset: 0 }}>
      <SessionDetailM session={openSession} onBack={() => setMode(detailFrom)}/>
    </div>
  );

  // Tabs must also leave any detour screen (Ranks/Progress), not just switch tab.
  const tabs = <TabBar tab={tab} setTab={(t) => { setMode('tabs'); setTab(t); if (t === 'train') setTrainView('picker'); }}/>;

  if (mode === 'progress') return <div data-screen-label="Progress" style={{ position: 'absolute', inset: 0 }}><ProgressM user={me} tabs={tabs} onBack={() => setMode('tabs')} onLogout={() => setUser(null)} occSessions={sessions} onOpenSession={(x) => { setOpenSession(x); setDetailFrom('progress'); setMode('detail'); }}/></div>;
  if (mode === 'ranks') return <div data-screen-label="Ranks" style={{ position: 'absolute', inset: 0 }}><RanksM tabs={tabs} user={me} onBack={() => setMode('tabs')}/></div>;

  if (tab === 'home') return (
    <div data-screen-label="Home" style={{ position: 'absolute', inset: 0 }}>
      <PlayerHomeM user={me} tabs={tabs} cast={cast} onCast={openCast}
        onTrain={() => { setTab('train'); setTrainView('picker'); }}/>
      {castSheet}
    </div>
  );

  if (tab === 'sessions') return (
    <div data-screen-label="Sessions" style={{ position: 'absolute', inset: 0 }}>
      <SessionsM user={me} tabs={tabs} cast={cast} onCast={openCast}
        onOpen={(x) => {
          if (x.kind === 'occ') { setOpenSession(x); setDetailFrom('tabs'); setMode('detail'); }
          else { setArcSession(x); setMode('arc'); }
        }}/>
      {castSheet}
    </div>
  );

  if (trainView === 'picker') return (
    <div data-screen-label="Train" style={{ position: 'absolute', inset: 0 }}>
      <TrainPickerM user={me} tabs={tabs} cast={cast} onCast={openCast} totals={totals}
        onRanks={() => setMode('ranks')}
        onPick={(id) => {
          if (id === 'occ') setTrainView('occ');
          else if (id === 'rx' && ENABLE_REACTION_TIME) setMode('rx-setup');
          else if (id === 'iq') setMode('iq-setup');
        }}/>
      {castSheet}
    </div>
  );

  return (
    <div data-screen-label="Pitch recognition home" style={{ position: 'absolute', inset: 0 }}>
      <HomeM user={me} cfg={cfg} tabs={tabs} cast={cast} onCast={openCast} onBack={() => setTrainView('picker')}
        occSessions={sessions} onOpenSession={(x) => { setOpenSession(x); setDetailFrom('tabs'); setMode('detail'); }}
        onQuick={() => { setRunCfg({ ...DEFAULT_CFG, difficulty: cfg.difficulty }); setMode('drill'); }}
        onCustom={() => setMode('setup')}
        onRanks={() => setMode('ranks')}
        onProgress={() => setMode('progress')}/>
      {castSheet}
    </div>
  );
};

const OccMobileApp = ({ defaultDifficulty, skipAuth }) => (
  <IOSDevice dark width={402} height={874}>
    <div style={{ position: 'absolute', inset: 0, background: '#030303' }}>
      <AppMobile defaultDifficulty={defaultDifficulty} skipAuth={skipAuth}/>
    </div>
  </IOSDevice>
);

// Full-bleed mobile build: fills the viewport on a phone, caps at a phone-width
// column on anything larger. No device bezel — this is the shipping app surface.
const PlayerApp = ({ defaultDifficulty, skipAuth }) => (
  <div style={{
    position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center',
    background: '#030303', overflow: 'hidden',
  }}>
    <div style={{
      position: 'relative', width: '100%', maxWidth: 440, height: '100%',
      background: '#030303', overflow: 'hidden',
      borderLeft: '1px solid rgba(235,235,239,0.06)', borderRight: '1px solid rgba(235,235,239,0.06)',
    }}>
      <AppMobile defaultDifficulty={defaultDifficulty} skipAuth={skipAuth}/>
    </div>
  </div>
);

export { OccMobileApp, PlayerApp };
