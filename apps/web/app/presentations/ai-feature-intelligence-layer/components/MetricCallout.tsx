import type { PersonaMetric } from '@/app/presentations/ai-feature-intelligence-layer/data';

/**
 * The metric end-cap shown on a persona journey. Per spec, the prototype
 * renders this for Peter only — it is omitted for personas without a metric.
 */
export function MetricCallout({ label, value, caption }: PersonaMetric) {
  return (
    <div className="p-metric">
      <span className="arr">&rarr;</span>
      <div>
        <p className="m-label">{label}</p>
        <p className="m-value">{value}</p>
        <p className="m-cap">{caption}</p>
      </div>
    </div>
  );
}
