import { postReleaseNodes, sdlcStages } from '@/app/presentations/ai-feature-intelligence-layer/data';

/**
 * Slide 1 diagram: the SDLC pipeline branching into post-release operations
 * through a vertical "AI Layer" spine. Rendered as a faint (opacity 0.2) teaser
 * of the deck to come, exactly as the prototype composes it. All geometry is
 * driven by the `sdlcStages` / `postReleaseNodes` data, not hand-repeated nodes.
 */
interface SDLCFlowProps {
  /** Index of the post-release node to spotlight (-1 = none / not walking). */
  activeNode?: number;
}

export function SDLCFlow({ activeNode = -1 }: SDLCFlowProps) {
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

        {/* pipeline baseline + release→layer connector. The connector is neutral
            until stage 2 (.reveal-layer) recolors it to its original red. */}
        <line x1="170" y1="600" x2="960" y2="600" stroke="var(--line-bright)" strokeWidth="2" />
        <line className="release-link" x1="960" y1="600" x2="1130" y2="600" strokeWidth="2" />

        {/* AI-layer spine: soft glow from a wide low-opacity stroke + a crisp core.
            Hidden until stage 2 reveals it alongside the "AI Layer" caption. */}
        <g className="spine">
          <line x1="1130" y1="306" x2="1130" y2="894" stroke="url(#afilSpineGrad)" strokeWidth="12" strokeOpacity="0.3" />
          <line x1="1130" y1="306" x2="1130" y2="894" stroke="url(#afilSpineGrad)" strokeWidth="3" />
        </g>

        {/* branch curves to each post-release node (static — not part of the walk) */}
        {postReleaseNodes.map((node) => (
          <path key={node.id} d={node.branch} stroke="var(--line-bright)" strokeWidth="2" />
        ))}

        {/* pre-release pipeline nodes */}
        {sdlcStages.map((stage) =>
          stage.emphasized ? (
            <g key={stage.id} className="release-node">
              <circle className="ring" cx={stage.cx} cy="600" r="20" strokeWidth="2" />
              <circle className="core" cx={stage.cx} cy="600" r="8" />
            </g>
          ) : (
            <circle key={stage.id} cx={stage.cx} cy="600" r="7" fill="#0A0C10" stroke="var(--ink-2)" strokeWidth="2" />
          ),
        )}

        {/* post-release nodes (static dots — not part of the walk) */}
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
      {postReleaseNodes.map((node, i) => (
        <div
          key={node.id}
          className={`lbl node-lbl${i === activeNode ? ' active' : ''}`}
          style={{ left: 1326, top: node.cy }}
        >
          {node.label}
        </div>
      ))}
    </div>
  );
}
