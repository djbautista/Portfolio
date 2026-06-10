import { postReleaseNodes, sdlcStages } from '@/app/presentations/ai-feature-intelligence-layer/data';

/**
 * Slide 1 diagram: the SDLC pipeline branching into post-release operations
 * through a vertical "AI Layer" spine. Rendered as a faint (opacity 0.2) teaser
 * of the deck to come, exactly as the prototype composes it. All geometry is
 * driven by the `sdlcStages` / `postReleaseNodes` data, not hand-repeated nodes.
 */
export function SDLCFlow() {
  return (
    <div className="graph">
      <svg
        className="afil-canvas"
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="afilSpineGrad"
            x1="0"
            y1="300"
            x2="0"
            y2="900"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#F22F46" stopOpacity="0" />
            <stop offset="0.5" stopColor="#F22F46" stopOpacity="0.85" />
            <stop offset="1" stopColor="#F22F46" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* pipeline baseline + release→layer connector */}
        <line x1="170" y1="600" x2="960" y2="600" stroke="var(--line-bright)" strokeWidth="2" />
        <line x1="960" y1="600" x2="1130" y2="600" stroke="var(--red)" strokeWidth="2" strokeOpacity="0.7" />

        {/* AI-layer spine: soft glow from a wide low-opacity stroke + a crisp core */}
        <line x1="1130" y1="306" x2="1130" y2="894" stroke="url(#afilSpineGrad)" strokeWidth="12" strokeOpacity="0.3" />
        <line x1="1130" y1="306" x2="1130" y2="894" stroke="url(#afilSpineGrad)" strokeWidth="3" />

        {/* branch curves to each post-release node */}
        {postReleaseNodes.map((node) => (
          <path key={node.id} d={node.branch} stroke="var(--line-bright)" strokeWidth="2" />
        ))}

        {/* pre-release pipeline nodes */}
        {sdlcStages.map((stage) =>
          stage.emphasized ? (
            <g key={stage.id}>
              <circle cx={stage.cx} cy="600" r="20" fill="rgba(242,47,70,0.12)" stroke="var(--red)" strokeWidth="2" />
              <circle cx={stage.cx} cy="600" r="8" fill="var(--red)" />
            </g>
          ) : (
            <circle key={stage.id} cx={stage.cx} cy="600" r="7" fill="#0A0C10" stroke="var(--ink-2)" strokeWidth="2" />
          ),
        )}

        {/* post-release nodes */}
        {postReleaseNodes.map((node) => (
          <circle key={node.id} cx="1300" cy={node.cy} r="5.5" fill="#0A0C10" stroke="var(--ink-2)" strokeWidth="2" />
        ))}
      </svg>

      {/* axis tags */}
      <div className="lbl axis-tag pre" style={{ left: 565, top: 512 }}>
        SDLC Pipeline
      </div>
      <div className="lbl axis-tag" style={{ left: 1345, top: 240 }}>
        Post-Release Operations
      </div>

      {/* pipeline stage labels */}
      {sdlcStages.map((stage) => (
        <div
          key={stage.id}
          className={`lbl stage-lbl${stage.emphasized ? ' release' : ''}`}
          style={{ left: stage.cx, top: stage.labelTop }}
        >
          {stage.label}
        </div>
      ))}

      {/* vertical AI-layer caption */}
      <div className="layer-cap">AI Layer</div>

      {/* post-release node labels */}
      {postReleaseNodes.map((node) => (
        <div key={node.id} className="lbl node-lbl" style={{ left: 1326, top: node.cy }}>
          {node.label}
        </div>
      ))}
    </div>
  );
}
