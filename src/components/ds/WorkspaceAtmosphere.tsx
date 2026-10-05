import { ArrowDown, Pause, Play } from "lucide-react";
import { MarketScene } from "@/components/landing/MarketScene";

const CHAPTERS: Record<string, readonly [string, string, string]> = {
  screener: ["The research workspace", "See the signal.", "Find your perspective."],
  exchange: ["Global markets", "One world.", "A clearer perspective."],
  stock: ["Company intelligence", "Beyond the price.", "Inside the business."],
  sector: ["Sector intelligence", "Explore the landscape.", "Find the distinction."],
  best: ["Research shortlists", "A world of companies.", "A focused shortlist."],
  portfolio: ["Your research, connected", "Follow the companies.", "Keep the context."],
  calendar: ["The market calendar", "Watch what matters.", "Stay in perspective."],
  "chart-reader": ["DeepChart", "Technical structure.", "Read with clarity."],
  trading: ["Trading education", "Risk before signal.", "Understand the instrument."],
  options: ["The strategy lab", "Explore the possibilities.", "Understand the risk."],
  "options-strategy": [
    "The strategy library",
    "Explore the possibilities.",
    "Understand the risk.",
  ],
  ipo: ["New market arrivals", "Meet what's next.", "Look a little deeper."],
  learn: ["The learning library", "Build your knowledge.", "Sharpen your perspective."],
  ratios: ["The fundamental framework", "Behind every number.", "A better question."],
  compare: ["Side by side", "See the differences.", "Understand the detail."],
  pricing: ["DeepScreen membership", "Go a little deeper.", "Research with clarity."],
  auth: ["Your DeepScreen", "Your next chapter.", "Starts with curiosity."],
};

export function WorkspaceAtmosphere({
  path,
  paused,
  onToggle,
}: {
  path: string;
  paused: boolean;
  onToggle: () => void;
}) {
  const [label, title, accent] = CHAPTERS[path.split("/")[1] ?? ""] ?? [
    "Inside DeepScreen",
    "Independent thinking.",
    "A clearer perspective.",
  ];
  return (
    <div className="ds-workspace-masthead">
      <div className="ds-workspace-masthead-inner">
        <div className="ds-workspace-intro">
          <p className="ds-eyebrow">
            <span aria-hidden="true" />
            {label}
          </p>
          <p className="ds-workspace-tagline">
            {title}
            <br />
            <em>{accent}</em>
          </p>
          <a href="#workspace-content" className="ds-workspace-explore">
            Explore this page <ArrowDown size={13} />
          </a>
        </div>
        <div className="ds-workspace-orbit">
          <MarketScene paused={paused} market={0} variant="compact" />
        </div>
        <button
          type="button"
          className="ds-motion-control"
          onClick={onToggle}
          aria-pressed={paused}
        >
          {paused ? <Play size={12} /> : <Pause size={12} />}
          {paused ? "Resume motion" : "Pause motion"}
        </button>
        <span className="ds-workspace-coordinate" aria-hidden="true">
          DEEPSCREEN ENGINE / 13 FACTORS
        </span>
      </div>
    </div>
  );
}
