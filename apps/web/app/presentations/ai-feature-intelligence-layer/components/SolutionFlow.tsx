import {
  solutionInputs,
  solutionOutputs,
  solutionZones,
} from '@/app/presentations/ai-feature-intelligence-layer/data';

/**
 * Slide 5 diagram: fragmented SDLC artifacts (left) funnel through a glowing
 * central "AI Layer" gateway node and fan out as reusable operational knowledge
 * (right). Echoes the Title slide's red spine motif. Static by design — the
 * resting state is fully visible; entrance polish is the deck-level / FadeIn
 * crossfade, not in-diagram motion.
 *
 * All node positions derive from the array order via the constants below, so the
 * `data.ts` arrays stay free of pixel coordinates.
 */

// Left column (inputs): 9 nodes converging into the layer.
const INPUT_X = 505;
const INPUT_LABEL_X = 478;
const INPUT_TOP = 452;
const INPUT_GAP = 47;

// Right column (outputs): 5 nodes fanning out of the layer.
const OUTPUT_X = 1415;
const OUTPUT_LABEL_X = 1444;
const OUTPUT_TOP = 470;
const OUTPUT_GAP = 85;

// The intelligence-layer gateway sits at the center of the plane.
const CORE_X = 960;
const CORE_Y = 640;

const inputY = (i: number) => INPUT_TOP + i * INPUT_GAP;
const outputY = (i: number) => OUTPUT_TOP + i * OUTPUT_GAP;

export function SolutionFlow() {
  return (
    <>
      <div className="core-halo" />

      <svg
        className="wires"
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="solutionSpineGrad"
            x1="0"
            y1="412"
            x2="0"
            y2="868"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#F22F46" stopOpacity="0" />
            <stop offset="0.5" stopColor="#F22F46" stopOpacity="0.9" />
            <stop offset="1" stopColor="#F22F46" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* funnel: fragmented artifacts converge into the layer */}
        {solutionInputs.map((node, i) => (
          <path
            key={node.label}
            d={`M${INPUT_X} ${inputY(i)} C 705 ${inputY(i)}, 780 ${CORE_Y}, 950 ${CORE_Y}`}
            stroke="var(--line-bright)"
            strokeWidth="1.4"
            strokeOpacity="0.5"
          />
        ))}

        {/* fan: the layer emits structured operational knowledge */}
        {solutionOutputs.map((node, i) => (
          <path
            key={node.label}
            d={`M970 ${CORE_Y} C 1180 ${CORE_Y}, 1210 ${outputY(i)}, 1405 ${outputY(i)}`}
            stroke="var(--red)"
            strokeWidth="2"
            strokeOpacity="0.8"
          />
        ))}

        {/* the intelligence-layer spine: wide low-opacity glow + crisp core */}
        <line x1={CORE_X} y1="412" x2={CORE_X} y2="868" stroke="url(#solutionSpineGrad)" strokeWidth="12" strokeOpacity="0.3" />
        <line x1={CORE_X} y1="412" x2={CORE_X} y2="868" stroke="url(#solutionSpineGrad)" strokeWidth="3" />

        {/* fragmented artifact nodes (muted) */}
        {solutionInputs.map((node, i) => (
          <circle key={node.label} cx={INPUT_X} cy={inputY(i)} r="4.5" fill="#0A0C10" stroke="var(--ink-3)" strokeWidth="2" />
        ))}

        {/* operational outcome nodes (bright) */}
        {solutionOutputs.map((node, i) => (
          <circle key={node.label} cx={OUTPUT_X} cy={outputY(i)} r="6" fill="var(--red)" />
        ))}

        {/* central gateway node */}
        <circle cx={CORE_X} cy={CORE_Y} r="24" fill="rgba(242,47,70,0.10)" stroke="var(--red)" strokeWidth="2" />
        <circle cx={CORE_X} cy={CORE_Y} r="9" fill="var(--red)" />
      </svg>

      {/* fragmented artifact labels (right-aligned, feeding in) */}
      {solutionInputs.map((node, i) => (
        <div key={node.label} className="input-label" style={{ left: INPUT_LABEL_X, top: inputY(i) }}>
          {node.label}
        </div>
      ))}

      {/* operational outcome labels (left-aligned, emitted) */}
      {solutionOutputs.map((node, i) => (
        <div key={node.label} className="output-label" style={{ left: OUTPUT_LABEL_X, top: outputY(i) }}>
          {node.label}
        </div>
      ))}

      {/* transformation caption row + derived arrows between captions */}
      {solutionZones.map((zone) => (
        <div
          key={zone.label}
          className={`zone-caption${zone.layer ? ' layer' : ''}`}
          style={{ left: zone.x }}
        >
          {zone.label}
        </div>
      ))}
      {solutionZones.slice(1).map((zone, i) => (
        <div
          key={`arrow-${zone.label}`}
          className="zone-arrow"
          style={{ left: (solutionZones[i]!.x + zone.x) / 2 }}
        >
          &rarr;
        </div>
      ))}
    </>
  );
}
