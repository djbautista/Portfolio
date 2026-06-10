import { ChevronLeft, ChevronRight } from './icons';
import { slideLabels } from './data';

interface SlideNavigationProps {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (index: number) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Bottom-center deck controls: prev / next, slide counter, and jump dots. */
export function SlideNavigation({ index, total, onPrev, onNext, onJump }: SlideNavigationProps) {
  return (
    <nav className="afil-nav" aria-label="Slide navigation">
      <button
        className="afil-nav-btn"
        type="button"
        aria-label="Previous slide"
        onClick={onPrev}
        disabled={index === 0}
      >
        <ChevronLeft />
      </button>

      <span className="afil-nav-count">
        <span className="now">{pad(index + 1)}</span>
        <span className="tot"> / {pad(total)}</span>
      </span>

      <div className="afil-nav-dots">
        {slideLabels.map((label, i) => (
          <button
            key={label}
            type="button"
            className={`afil-nav-dot${i === index ? ' on' : ''}`}
            aria-label={`Go to slide ${i + 1}: ${label}`}
            aria-current={i === index}
            onClick={() => onJump(i)}
          />
        ))}
      </div>

      <button
        className="afil-nav-btn"
        type="button"
        aria-label="Next slide"
        onClick={onNext}
        disabled={index === total - 1}
      >
        <ChevronRight />
      </button>
    </nav>
  );
}
