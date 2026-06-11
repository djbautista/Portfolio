import type { CSSProperties } from 'react';

import { ghostProfiles } from '@/app/presentations/ai-feature-intelligence-layer/data';

/**
 * The synthesis-beat backdrop: a scattered field of anonymous persona
 * silhouettes that fade in (dimmed, staggered) behind the three centered
 * profiles. Always rendered but invisible until the slide canvas gains
 * `.synthesis`; positions/opacities are data-driven from {@link ghostProfiles}.
 */
export function GhostCrowd() {
  return (
    <div className="p-ghosts" aria-hidden="true">
      {ghostProfiles.map((g) => (
        <span
          key={g.id}
          className="p-ghost"
          style={
            {
              left: g.x,
              top: g.y,
              width: g.size,
              height: g.size,
              '--gop': g.op,
              '--gd': `${g.delay}s`,
            } as CSSProperties
          }
        >
          <svg className="p-ghost-svg" viewBox="0 0 100 100">
            <circle cx="50" cy="37" r="16" />
            <path d="M22 86c0-16 12.5-26 28-26s28 10 28 26v6H22z" />
          </svg>
        </span>
      ))}
    </div>
  );
}
