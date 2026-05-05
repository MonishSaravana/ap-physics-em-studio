"use client";

import { FaradayLenzSimulator } from "@/components/modules/FaradayLenzSimulator";
import { InductanceVisualizer } from "@/components/modules/InductanceVisualizer";
import { LCOscillatorLab } from "@/components/modules/LCOscillatorLab";
import { LenzDirectionTrainer } from "@/components/modules/LenzDirectionTrainer";
import { LRCircuitLab } from "@/components/modules/LRCircuitLab";
import { MagneticFluxLab } from "@/components/modules/MagneticFluxLab";
import { RCvsLRComparison } from "@/components/modules/RCvsLRComparison";

export type ModuleId =
  | "magnetic-flux"
  | "faraday-lenz"
  | "lenz-trainer"
  | "inductance"
  | "lr-circuit"
  | "lc-oscillator"
  | "rc-vs-lr";

export const moduleCards: Array<{
  id: ModuleId;
  title: string;
  summary: string;
}> = [
  {
    id: "magnetic-flux",
    title: "Magnetic Flux Lab",
    summary: "Model ΦB = BAcosθ with live loop geometry and angle graph.",
  },
  {
    id: "faraday-lenz",
    title: "Faraday + Lenz Simulator",
    summary: "Watch moving-loop induction and current reversal during entry/exit.",
  },
  {
    id: "lenz-trainer",
    title: "Lenz's Law Direction Trainer",
    summary: "Practice clockwise/counterclockwise reasoning from flux change.",
  },
  {
    id: "inductance",
    title: "Inductance Visualizer",
    summary: "Connect L, dI/dt, and magnetic energy in a solenoid model.",
  },
  {
    id: "lr-circuit",
    title: "LR Circuit Lab",
    summary: "Explore transient current, voltage split, and τ = L/R behavior.",
  },
  {
    id: "lc-oscillator",
    title: "LC Oscillator Lab",
    summary: "Track phase and energy exchange between capacitor and inductor.",
  },
  {
    id: "rc-vs-lr",
    title: "RC vs LR Comparison",
    summary: "Compare what can change instantly and how resistance affects τ.",
  },
];

type ModuleRendererProps = {
  moduleId: ModuleId;
};

export function ModuleRenderer({ moduleId }: ModuleRendererProps) {
  switch (moduleId) {
    case "magnetic-flux":
      return <MagneticFluxLab />;
    case "faraday-lenz":
      return <FaradayLenzSimulator />;
    case "lenz-trainer":
      return <LenzDirectionTrainer />;
    case "inductance":
      return <InductanceVisualizer />;
    case "lr-circuit":
      return <LRCircuitLab />;
    case "lc-oscillator":
      return <LCOscillatorLab />;
    case "rc-vs-lr":
      return <RCvsLRComparison />;
    default:
      return null;
  }
}
