'use client';

import Link from 'next/link';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type SVGProps,
} from 'react';

import {
  hero as heroContent,
  interviewSections,
  interviewStories,
  leadershipRows,
  proudMoments,
  whyStrip,
  type InterviewStory,
  type StoryDiagramKind,
  type WhyCard,
  type WhyIcon,
} from '@/model/twilioInterviewContent';

import './twilio-interview.css';

// ============================================================================
// Inline icon set (feather-style, 1.6 stroke)
// ============================================================================
type IconName =
  | 'wave'
  | 'cube'
  | 'plug'
  | 'spark'
  | 'arrow'
  | 'arrow-up-right'
  | 'arrow-left'
  | 'close';

function Icon({
  name,
  size = 18,
  ...rest
}: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  const common: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...rest,
  };
  switch (name) {
    case 'wave':
      return (
        <svg {...common}>
          <path d="M2 12c2 0 2-5 4-5s2 10 4 10 2-10 4-10 2 10 4 10 2-5 4-5" />
        </svg>
      );
    case 'cube':
      return (
        <svg {...common}>
          <path d="M21 7l-9-5-9 5 9 5 9-5z" />
          <path d="M3 7v10l9 5" />
          <path d="M21 7v10l-9 5" />
        </svg>
      );
    case 'plug':
      return (
        <svg {...common}>
          <path d="M9 2v6" />
          <path d="M15 2v6" />
          <path d="M6 8h12v3a6 6 0 1 1-12 0z" />
          <path d="M12 17v5" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...common}>
          <path d="M12 2v6" />
          <path d="M12 16v6" />
          <path d="M2 12h6" />
          <path d="M16 12h6" />
          <path d="M5 5l4 4" />
          <path d="M15 15l4 4" />
          <path d="M5 19l4-4" />
          <path d="M15 9l4-4" />
        </svg>
      );
    case 'arrow':
      return (
        <svg {...common}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case 'arrow-up-right':
      return (
        <svg {...common}>
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg {...common}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
  }
}

// ============================================================================
// Per-story system diagrams (inline SVG)
// ============================================================================
function StoryDiagram({ kind }: { kind: StoryDiagramKind }) {
  const stroke = 'rgba(255,255,255,0.55)';
  const faint = 'rgba(255,255,255,0.18)';
  const accent = '#0ea5e9';
  const accent2 = '#d946ef';
  const viewProps = {
    viewBox: '0 0 320 180',
    preserveAspectRatio: 'xMidYMid slice',
  } as const;

  if (kind === 'multipart') {
    const chunks = Array.from({ length: 8 }, (_, i) => i);
    return (
      <svg {...viewProps}>
        <defs>
          <linearGradient id="mp-g" x1="0" x2="1">
            <stop offset="0" stopColor={accent} />
            <stop offset="1" stopColor={accent2} />
          </linearGradient>
        </defs>
        <g transform="translate(28, 60)" fill="none" stroke={stroke} strokeWidth="1">
          <rect width="50" height="56" rx="6" />
          <line x1="0" y1="12" x2="50" y2="12" />
          <circle cx="8" cy="6" r="1.4" fill={stroke} />
          <circle cx="14" cy="6" r="1.4" fill={stroke} />
          <circle cx="20" cy="6" r="1.4" fill={stroke} />
        </g>
        {chunks.map((i) => (
          <rect
            key={i}
            x={92 + i * 12}
            y={80 - (i % 2) * 4}
            width="9"
            height="16"
            rx="1.5"
            fill={i < 5 ? 'url(#mp-g)' : 'none'}
            stroke={i < 5 ? 'none' : faint}
          />
        ))}
        <line x1="200" y1="88" x2="234" y2="88" stroke={faint} strokeWidth="1" />
        <polyline
          points="230,84 234,88 230,92"
          stroke={faint}
          strokeWidth="1"
          fill="none"
        />
        <g transform="translate(238, 56)" fill="none" stroke="url(#mp-g)" strokeWidth="1.4">
          <path d="M 0 8 Q 28 0 56 8 L 50 60 Q 28 64 6 60 Z" />
          <path d="M 0 8 Q 28 16 56 8" stroke={stroke} strokeWidth="1" />
          <text x="22" y="46" fill={stroke} fontFamily="JetBrains Mono" fontSize="9">
            S3
          </text>
        </g>
        <text x="28" y="138" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
          CLIENT
        </text>
        <text x="120" y="138" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
          PARTS · 8MB
        </text>
        <text x="244" y="138" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
          BUCKET
        </text>
      </svg>
    );
  }

  if (kind === 'genie') {
    return (
      <svg {...viewProps}>
        <defs>
          <linearGradient id="gn-g" x1="0" x2="1">
            <stop offset="0" stopColor={accent} />
            <stop offset="1" stopColor={accent2} />
          </linearGradient>
        </defs>
        <g transform="translate(20, 56)">
          <rect width="74" height="34" rx="6" fill="none" stroke={stroke} strokeWidth="1" />
          <text x="10" y="22" fill={stroke} fontFamily="JetBrains Mono" fontSize="9">
            prompt →
          </text>
        </g>
        <line x1="110" y1="73" x2="300" y2="73" stroke={faint} strokeWidth="1" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`translate(${118 + i * 32}, 73)`}>
            <circle
              r="6"
              fill={i < 4 ? 'url(#gn-g)' : 'none'}
              stroke={i < 4 ? 'none' : faint}
              strokeWidth="1"
            />
            <line x1="0" y1="6" x2="0" y2="14" stroke={faint} strokeWidth="1" />
            <text x="-6" y="26" fill={faint} fontFamily="JetBrains Mono" fontSize="8">
              M{i + 1}
            </text>
          </g>
        ))}
        <rect x="110" y="108" width="186" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
        <rect x="110" y="108" width="115" height="4" rx="2" fill="url(#gn-g)" />
        <text x="110" y="130" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
          STREAMING · 62%
        </text>
      </svg>
    );
  }

  if (kind === 'rag') {
    return (
      <svg {...viewProps}>
        <defs>
          <linearGradient id="rg-g" x1="0" x2="1">
            <stop offset="0" stopColor={accent2} />
            <stop offset="1" stopColor={accent} />
          </linearGradient>
        </defs>
        <g transform="translate(16, 70)" fill="none" stroke={stroke} strokeWidth="1">
          <circle r="14" />
          <text x="-3" y="3" fill={stroke} fontFamily="JetBrains Mono" fontSize="11">
            ?
          </text>
        </g>
        <line x1="32" y1="70" x2="68" y2="70" stroke={faint} strokeWidth="1" />
        <g transform="translate(72, 30)">
          {Array.from({ length: 24 }, (_, i) => {
            const x = (i % 6) * 10;
            const y = Math.floor(i / 6) * 18;
            const isHot = [3, 9, 14, 20].includes(i);
            return (
              <circle
                key={i}
                cx={x + 4}
                cy={y + 9}
                r={isHot ? 3 : 1.6}
                fill={isHot ? 'url(#rg-g)' : faint}
              />
            );
          })}
        </g>
        <line x1="142" y1="70" x2="178" y2="70" stroke={faint} strokeWidth="1" />
        <g transform="translate(184, 40)" fill="none" stroke={stroke} strokeWidth="1">
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${i * 8}, ${i * 8})`}>
              <rect width="34" height="46" rx="3" />
              <line x1="4" y1="10" x2="28" y2="10" stroke={faint} />
              <line x1="4" y1="16" x2="22" y2="16" stroke={faint} />
              <line x1="4" y1="22" x2="26" y2="22" stroke={faint} />
            </g>
          ))}
        </g>
        <line x1="240" y1="70" x2="276" y2="70" stroke={faint} strokeWidth="1" />
        <g transform="translate(280, 60)">
          <rect width="28" height="22" rx="4" fill="url(#rg-g)" />
          <text x="4" y="14" fill="#0a0a0a" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700">
            A
          </text>
        </g>
        <text x="16" y="130" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
          QUERY
        </text>
        <text x="84" y="130" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
          VECTORS
        </text>
        <text x="192" y="130" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
          RETRIEVED
        </text>
        <text x="276" y="130" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
          ANSWER
        </text>
      </svg>
    );
  }

  if (kind === 'billing') {
    return (
      <svg {...viewProps}>
        <defs>
          <linearGradient id="bl-g" x1="0" x2="1">
            <stop offset="0" stopColor={accent} />
            <stop offset="1" stopColor={accent2} />
          </linearGradient>
        </defs>
        <g transform="translate(14, 64)" fill="none" stroke={stroke} strokeWidth="1">
          <rect width="58" height="48" rx="6" />
          <text x="6" y="18" fill={stroke} fontFamily="JetBrains Mono" fontSize="9">
            stripe
          </text>
          <text x="6" y="34" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
            webhook
          </text>
        </g>
        <path
          d="M76 88 Q 100 60 124 88 T 172 88"
          fill="none"
          stroke="url(#bl-g)"
          strokeWidth="1.4"
        />
        {['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELED'].map((s, i) => (
          <g
            key={s}
            transform={`translate(${178 + (i % 2) * 70}, ${60 + Math.floor(i / 2) * 40})`}
          >
            <rect
              width="58"
              height="22"
              rx="11"
              fill="none"
              stroke={i === 1 ? 'url(#bl-g)' : faint}
              strokeWidth={i === 1 ? 1.4 : 1}
            />
            <text x="6" y="14" fill={i === 1 ? stroke : faint} fontFamily="JetBrains Mono" fontSize="8">
              {s}
            </text>
          </g>
        ))}
        <line x1="208" y1="84" x2="244" y2="84" stroke={faint} strokeWidth="1" />
        <line x1="208" y1="124" x2="244" y2="124" stroke={faint} strokeWidth="1" />
        <line x1="208" y1="84" x2="208" y2="120" stroke={faint} strokeWidth="1" />
        <line x1="278" y1="84" x2="278" y2="120" stroke={faint} strokeWidth="1" />
        <text x="14" y="138" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
          EVENT IN
        </text>
        <text x="178" y="148" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
          STATE MACHINE
        </text>
      </svg>
    );
  }

  if (kind === 'torre') {
    return (
      <svg {...viewProps}>
        <defs>
          <linearGradient id="tr-g" x1="0" x2="1">
            <stop offset="0" stopColor={accent} />
            <stop offset="1" stopColor={accent2} />
          </linearGradient>
        </defs>
        <g transform="translate(160, 90)">
          <circle r="22" fill="none" stroke="url(#tr-g)" strokeWidth="1.4" />
          <text x="-12" y="4" fill={stroke} fontFamily="JetBrains Mono" fontSize="9">
            refer
          </text>
        </g>
        {[
          { x: 60, y: 38, l: 'click' },
          { x: 60, y: 142, l: 'invite' },
          { x: 260, y: 38, l: 'paid' },
          { x: 260, y: 142, l: 'credit' },
        ].map((p) => (
          <g key={p.l}>
            <line x1="160" y1="90" x2={p.x} y2={p.y} stroke={faint} strokeWidth="1" />
            <circle cx={p.x} cy={p.y} r="6" fill="url(#tr-g)" />
            <text
              x={p.x + 12}
              y={p.y + 3}
              fill={stroke}
              fontFamily="JetBrains Mono"
              fontSize="9"
            >
              {p.l}
            </text>
          </g>
        ))}
      </svg>
    );
  }

  // kind === 'perf'
  return (
    <svg {...viewProps}>
      <defs>
        <linearGradient id="pf-g" x1="0" x2="1">
          <stop offset="0" stopColor={accent2} />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
        <linearGradient id="pf-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity="0.35" />
          <stop offset="1" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="24"
          y1={36 + i * 28}
          x2="296"
          y2={36 + i * 28}
          stroke={faint}
          strokeWidth="0.6"
        />
      ))}
      <path
        d="M28 50 C 60 56, 90 62, 110 70 S 140 130, 168 132 S 220 138, 296 138"
        fill="none"
        stroke="url(#pf-g)"
        strokeWidth="1.6"
      />
      <path
        d="M28 50 C 60 56, 90 62, 110 70 S 140 130, 168 132 S 220 138, 296 138 L 296 144 L 28 144 Z"
        fill="url(#pf-fill)"
      />
      <circle cx="28" cy="50" r="3.5" fill={accent2} />
      <circle cx="296" cy="138" r="3.5" fill={accent} />
      <text x="34" y="40" fill={stroke} fontFamily="JetBrains Mono" fontSize="9">
        22s
      </text>
      <text x="276" y="132" fill={stroke} fontFamily="JetBrains Mono" fontSize="9">
        2s
      </text>
      <text x="24" y="160" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
        LCP TIMELINE
      </text>
    </svg>
  );
}

// ============================================================================
// Hero visual — animated system map
// ============================================================================
function HeroDiagram() {
  const stroke = 'rgba(255,255,255,0.55)';
  const faint = 'rgba(255,255,255,0.18)';
  const nodes: {
    x: number;
    y: number;
    label: string;
    a: 'top' | 'r' | 'b' | 'l';
  }[] = [
    { x: 240, y: 60, label: 'API', a: 'top' },
    { x: 420, y: 170, label: 'WEBHOOK', a: 'r' },
    { x: 400, y: 360, label: 'SMS', a: 'r' },
    { x: 240, y: 440, label: 'VOICE', a: 'b' },
    { x: 80, y: 360, label: 'WHATSAPP', a: 'l' },
    { x: 60, y: 170, label: 'EVENT BUS', a: 'l' },
  ];
  const pulses = [
    { x1: 240, y1: 250, x2: 240, y2: 60, d: '0s' },
    { x1: 240, y1: 250, x2: 420, y2: 170, d: '1.2s' },
    { x1: 240, y1: 250, x2: 80, y2: 360, d: '2.1s' },
    { x1: 240, y1: 250, x2: 60, y2: 170, d: '0.6s' },
  ];
  return (
    <svg viewBox="0 0 480 500" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="hero-g" x1="0" x2="1">
          <stop offset="0" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#d946ef" />
        </linearGradient>
        <radialGradient id="hero-glow" cx="0.5" cy="0.5">
          <stop offset="0" stopColor="#d946ef" stopOpacity="0.55" />
          <stop offset="1" stopColor="#d946ef" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="240" cy="250" rx="200" ry="190" fill="none" stroke={faint} strokeWidth="1" />
      <ellipse
        cx="240"
        cy="250"
        rx="150"
        ry="140"
        fill="none"
        stroke={faint}
        strokeWidth="1"
        strokeDasharray="2 4"
      />
      <ellipse cx="240" cy="250" rx="100" ry="90" fill="none" stroke={faint} strokeWidth="1" />
      <circle cx="240" cy="250" r="40" fill="url(#hero-glow)" />
      <circle cx="240" cy="250" r="14" fill="url(#hero-g)" />
      {nodes.map((n, i) => (
        <g key={n.label}>
          <line x1="240" y1="250" x2={n.x} y2={n.y} stroke={faint} strokeWidth="1" />
          <circle
            cx={n.x}
            cy={n.y}
            r="6"
            fill={i % 2 === 0 ? '#0ea5e9' : '#d946ef'}
            opacity="0.85"
          />
          <circle cx={n.x} cy={n.y} r="14" fill="none" stroke={faint} strokeWidth="1" />
          <text
            x={n.x + (n.a === 'l' ? -18 : n.a === 'r' ? 18 : 0)}
            y={n.y + (n.a === 'top' ? -18 : n.a === 'b' ? 26 : 4)}
            textAnchor={n.a === 'l' ? 'end' : n.a === 'r' ? 'start' : 'middle'}
            fill={stroke}
            fontFamily="JetBrains Mono"
            fontSize="10"
            letterSpacing="0.18em"
          >
            {n.label}
          </text>
        </g>
      ))}
      {pulses.map((p, i) => (
        <circle key={i} r="3" fill="#fff">
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            begin={p.d}
            path={`M ${p.x1} ${p.y1} L ${p.x2} ${p.y2}`}
          />
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="2.4s"
            repeatCount="indefinite"
            begin={p.d}
          />
        </circle>
      ))}
      <g fill="none" stroke={faint} strokeWidth="1">
        <path d="M14 14 L14 30 M14 14 L30 14" />
        <path d="M466 14 L466 30 M466 14 L450 14" />
        <path d="M14 486 L14 470 M14 486 L30 486" />
        <path d="M466 486 L466 470 M466 486 L450 486" />
      </g>
      <text x="14" y="498" fill={faint} fontFamily="JetBrains Mono" fontSize="9">
        {'// SYSTEMS · COMMUNICATION · APPLIED AI'}
      </text>
    </svg>
  );
}

// ============================================================================
// Section nav (sticky pill) + active-section hook
// ============================================================================
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState<string>(ids[0]!);
  useEffect(() => {
    const handler = () => {
      const middle = window.innerHeight * 0.35;
      let best = ids[0]!;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= middle) best = id;
      }
      setActive(best);
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, [ids]);
  return active;
}

function SectionNav({
  active,
  onJump,
}: {
  active: string;
  onJump: (id: string) => void;
}) {
  return (
    <nav className="tir-section-nav">
      <span className="brand">
        <span className="dot" />
        <span>INTERVIEW · ROOM</span>
      </span>
      <span className="pages" style={{ display: 'inline-flex', gap: 2 }}>
        {interviewSections.map((s) => (
          <a
            key={s.id}
            onClick={(e) => {
              e.preventDefault();
              onJump(s.id);
            }}
            className={active === s.id ? 'is-active' : ''}
            href={`#${s.id}`}
          >
            <span className="num">{s.n}</span>
            <span>{s.label}</span>
          </a>
        ))}
      </span>
    </nav>
  );
}

// ============================================================================
// Section heading helper
// ============================================================================
function SectionHead({
  n,
  eyebrow,
  title,
  lede,
}: {
  n: string;
  eyebrow: string;
  title: ReactNode;
  lede?: string;
}) {
  return (
    <div className="section-head">
      <div className="section-index">
        <span className="num">{n}</span>
        <span className="rule" />
        <span>{eyebrow}</span>
      </div>
      <h2>{title}</h2>
      {lede ? <p className="lede">{lede}</p> : null}
    </div>
  );
}

// ============================================================================
// Hero
// ============================================================================
function Hero({ onJump }: { onJump: (id: string) => void }) {
  // Render the date only after mount to avoid SSR/CSR locale-formatting drift.
  const [dateLabel, setDateLabel] = useState('');
  useEffect(() => {
    setDateLabel(
      new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    );
  }, []);

  return (
    <section id="hero" className="hero">
      <div className="page">
        <div className="hero-grid">
          <div className="reveal">
            <div className="eyebrow">
              {heroContent.eyebrowPrefix}
              {dateLabel || 'Today'}
              {heroContent.eyebrowSuffix}
            </div>
            <h1 className="hero-title">
              <span className="row">{heroContent.title.line1}</span>
              <span className="row accent">{heroContent.title.line2}</span>
              <span className="row muted">{heroContent.title.line3}</span>
            </h1>
            <p className="hero-sub">{heroContent.sub}</p>
            <p className="hero-intro">{heroContent.intro}</p>
            <div className="hero-meta">
              {heroContent.chips.map((c) => (
                <span
                  key={c.label}
                  className={`chip${c.variant === 'twilio' ? ' twilio' : ''}`}
                >
                  <span className="glyph" />
                  {c.label}
                </span>
              ))}
            </div>
            <div className="hero-actions">
              <a
                href="#stories"
                className="retro-btn retro-btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  onJump('stories');
                }}
              >
                <span>Jump to stories</span>
                <Icon name="arrow" size={14} />
              </a>
              <a
                href="#why"
                className="retro-btn retro-btn-ghost"
                onClick={(e) => {
                  e.preventDefault();
                  onJump('why');
                }}
              >
                <span>Why Twilio</span>
              </a>
            </div>
          </div>
          <div
            className="hero-visual reveal"
            style={{ animationDelay: '120ms' } as CSSProperties}
          >
            <div className="glow" />
            <div className="glow2" />
            <HeroDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Why
// ============================================================================
function Why() {
  return (
    <section id="why" className="section">
      <div className="page">
        <SectionHead
          n="01"
          eyebrow="Why Twilio"
          title={
            <>
              Four traits I bring to every team —{' '}
              <span className="hl-primary">the kind of teammate I&apos;d be at Twilio</span>
              .
            </>
          }
        />
        <div className="why-strip">
          {whyStrip.map((w, i) => (
            <WhyTile key={w.title} card={w} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyTile({ card, index }: { card: WhyCard; index: number }) {
  const iconName = useMemo<IconName>(() => card.icon as WhyIcon, [card.icon]);
  return (
    <div className={`why-card c${index + 1}`}>
      <div className="corner" />
      <div className="icon">
        <Icon name={iconName} size={18} />
      </div>
      <h4>{card.title}</h4>
      <p>{card.body}</p>
    </div>
  );
}

// ============================================================================
// Stories
// ============================================================================
function StoryCard({
  story,
  onOpen,
}: {
  story: InterviewStory;
  onOpen: (id: string) => void;
}) {
  return (
    <button className="story-card" type="button" onClick={() => onOpen(story.id)}>
      <div className="preview">
        <div className="topline" />
        <div className="scrim" />
        <span className="idx">{story.n}</span>
        <StoryDiagram kind={story.diagram} />
      </div>
      <div className="body">
        <h3>{story.title}</h3>
        <p className="summary">{story.summary}</p>
        <div className="tags">
          {story.tags.slice(0, 5).map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
        <div className="open-cue">
          Open story <Icon name="arrow" size={14} />
        </div>
      </div>
    </button>
  );
}

function Stories({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <section id="stories" className="section">
      <div className="page">
        <SectionHead
          n="03"
          eyebrow="Featured technical stories"
          title={
            <>
              The systems I&apos;d love to walk through.
              <br />
              <span className="hl-secondary">Pick any card</span> and we&apos;ll go deeper.
            </>
          }
          lede="Six chapters from the last few years of my work. Each card opens a focused view with context, technical decisions, impact, and how the shape of the work maps to Twilio."
        />
        <div className="story-grid">
          {interviewStories.map((s) => (
            <StoryCard key={s.id} story={s} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Leadership
// ============================================================================
function Leadership() {
  return (
    <section id="leadership" className="section">
      <div className="page">
        <SectionHead
          n="04"
          eyebrow="Leadership stories"
          title={<>How I lead in the room, not just on the org chart.</>}
          lede="Less architecture, more people. Four stories about decisions, influence, and the shape of teams I want to build."
        />
        <div className="lead-list">
          {leadershipRows.map((l) => (
            <div key={l.n} className="lead-row">
              <span className="n">{l.n}</span>
              <h3>{l.title}</h3>
              <p>{l.body}</p>
              <span className="meta">
                <span className="pill">{l.meta[0]}</span>
                <span>{l.meta[1]}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Proud Moments
// ============================================================================
function Proud({
  onOpenEvidence,
}: {
  onOpenEvidence: (src: string, alt: string) => void;
}) {
  const glyphs = ['★', '◆', '✦', '◐'];
  return (
    <section id="proud" className="section">
      <div className="page">
        <SectionHead
          n="02"
          eyebrow="Proud moments"
          title={<>The handful of things I&apos;d still tell a friend about over coffee.</>}
        />
        <div className="proud-grid">
          {proudMoments.map((p, i) => {
            const hasEvidence = Boolean(p.evidenceImage);
            const className = `proud-tile t${i + 1}${p.image ? ' has-photo' : ''}${hasEvidence ? ' has-evidence' : ''}`;
            const style = p.image ? { backgroundImage: `url('${p.image}')` } : undefined;
            const content = (
              <>
                <div className="wash" />
                <span className="glyph-bg">{glyphs[i]}</span>
                <span className="badge">{p.badge}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
                {hasEvidence ? (
                  <span className="evidence-cue" aria-hidden="true">
                    <Icon name="arrow-up-right" size={12} />
                    <span>View evidence</span>
                  </span>
                ) : null}
              </>
            );
            if (hasEvidence && p.evidenceImage) {
              return (
                <button
                  type="button"
                  key={p.n}
                  className={className}
                  style={style}
                  onClick={() =>
                    onOpenEvidence(p.evidenceImage!, p.evidenceAlt ?? p.title)
                  }
                  aria-label={`${p.title} — view evidence image`}
                >
                  {content}
                </button>
              );
            }
            return (
              <div key={p.n} className={className} style={style}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Evidence image modal (full-screen, dark backdrop, click-outside / Esc close)
// ============================================================================
function EvidenceModal({
  src,
  alt,
  onClose,
}: {
  src: string | null;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!src) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [src, onClose]);

  useEffect(() => {
    if (!src) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [src]);

  if (!src) return null;

  return (
    <div
      className="tir-evidence-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <button
        type="button"
        className="tir-evidence-close"
        onClick={onClose}
        aria-label="Close evidence image"
      >
        <Icon name="close" size={18} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="tir-evidence-img"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ============================================================================
// Story drawer
// ============================================================================
function StoryDrawer({
  openId,
  onClose,
  onNavigate,
}: {
  openId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const story = openId ? interviewStories.find((s) => s.id === openId) : null;
  const idx = openId ? interviewStories.findIndex((s) => s.id === openId) : -1;

  useEffect(() => {
    if (!openId) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [openId, onClose]);

  useEffect(() => {
    if (openId) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [openId]);

  return (
    <>
      <div
        className={`tir-drawer-scrim${openId ? ' open' : ''}`}
        onClick={onClose}
      />
      <aside
        className={`tir-drawer${openId ? ' open' : ''}`}
        aria-hidden={!openId}
      >
        {story ? (
          <>
            <div className="drawer-hd">
              <div className="crumbs">
                <span>Story</span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>
                  {story.n} / {interviewStories.length.toString().padStart(2, '0')}
                </span>
              </div>
              <button
                type="button"
                className="close"
                onClick={onClose}
                aria-label="Close"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="drawer-cover">
              <div className="scrim" />
              <StoryDiagram kind={story.diagram} />
            </div>

            <div className="drawer-body">
              <h1>{story.title}</h1>
              <p className="sum">{story.summary}</p>
              <div className="tags">
                {story.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>

              <div className="drawer-section">
                <span className="lbl">Context</span>
                <p>{story.context}</p>
              </div>

              <div className="drawer-section">
                <span className="lbl">Decisions</span>
                <ul>
                  {story.decisions.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="drawer-section">
                <span className="lbl">Impact</span>
                <ul>
                  {story.impact.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="drawer-section">
                <span className="lbl">Leadership</span>
                <p>{story.leadership}</p>
              </div>

              <div className="drawer-section">
                <span className="lbl">For Twilio</span>
                <div className="twilio-note">
                  <div className="head">Why this matters here</div>
                  {story.twilioRelevance}
                </div>
              </div>
            </div>

            <div className="drawer-foot">
              <button
                type="button"
                className="nav"
                disabled={idx === 0}
                onClick={() => {
                  const prev = interviewStories[idx - 1];
                  if (prev) onNavigate(prev.id);
                }}
              >
                <Icon name="arrow-left" size={14} />
                <span>Previous</span>
              </button>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  color: 'var(--color-neutral-500)',
                }}
              >
                {(idx + 1).toString().padStart(2, '0')} ·{' '}
                {interviewStories.length.toString().padStart(2, '0')}
              </span>
              <button
                type="button"
                className="nav"
                disabled={idx === interviewStories.length - 1}
                onClick={() => {
                  const next = interviewStories[idx + 1];
                  if (next) onNavigate(next.id);
                }}
              >
                <span>Next</span>
                <Icon name="arrow" size={14} />
              </button>
            </div>
          </>
        ) : null}
      </aside>
    </>
  );
}

// ============================================================================
// Top-level page
// ============================================================================
export function TwilioInterviewClient() {
  const [openStory, setOpenStory] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<{ src: string; alt: string } | null>(
    null,
  );
  const sectionIds = useMemo(() => interviewSections.map((s) => s.id), []);
  const active = useActiveSection(sectionIds);

  const jump = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="tir-root">
      <SectionNav active={active} onJump={jump} />

      <main>
        <Hero onJump={jump} />
        <Why />
        <Proud
          onOpenEvidence={(src, alt) => setEvidence({ src, alt })}
        />
        <Stories onOpen={setOpenStory} />
        <Leadership />

        <footer className="page foot">
          <div className="left">
            <span className="name">DAVID BAUTISTA</span>
            <span className="role">
              Senior Software Engineer · Applied AI &amp; Product Engineering
            </span>
          </div>
          <Link className="back" href="/">
            <Icon name="arrow-left" size={14} />
            <span>Back to portfolio</span>
          </Link>
        </footer>
      </main>

      <StoryDrawer
        openId={openStory}
        onClose={() => setOpenStory(null)}
        onNavigate={(id) => setOpenStory(id)}
      />

      <EvidenceModal
        src={evidence?.src ?? null}
        alt={evidence?.alt ?? ''}
        onClose={() => setEvidence(null)}
      />
    </div>
  );
}
