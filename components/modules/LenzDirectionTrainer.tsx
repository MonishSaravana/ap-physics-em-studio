"use client";

import { useMemo, useState } from "react";
import { CEDAlignmentCard } from "@/components/simulations/CEDAlignmentCard";
import { CommonMistakeCard } from "@/components/simulations/CommonMistakeCard";
import { FormulaCard } from "@/components/simulations/FormulaCard";
import { LiveValueCard } from "@/components/simulations/LiveValueCard";
import { ModelAssumptionsCard } from "@/components/simulations/ModelAssumptionsCard";
import { RelationshipSummaryCard } from "@/components/simulations/RelationshipSummaryCard";
import { SimulationLayout } from "@/components/simulations/SimulationLayout";
import { ToggleControl } from "@/components/simulations/ToggleControl";
import { Tooltip } from "@/components/simulations/Tooltip";
import { WhatChangedCard } from "@/components/simulations/WhatChangedCard";
import { cedAlignments, defaultModelAssumptions } from "@/data/ced";

type FieldDirection = "into" | "out";
type FluxChange = "increasing" | "decreasing" | "constant";
type CurrentDirection = "clockwise" | "counterclockwise" | "none";

type Scenario = {
  id: string;
  label: string;
  externalField: FieldDirection;
  fluxChange: FluxChange;
  context: string;
};

const scenarios: Scenario[] = [
  {
    id: "magnet-n-approach",
    label: "Magnet approaching loop (north pole approaching)",
    externalField: "into",
    fluxChange: "increasing",
    context: "Approaching north pole produces increasing into-page flux through the loop.",
  },
  {
    id: "magnet-n-away",
    label: "Magnet moving away (north pole moving away)",
    externalField: "into",
    fluxChange: "decreasing",
    context: "Retreating north pole reduces into-page flux through the loop.",
  },
  {
    id: "magnet-s-approach",
    label: "Magnet approaching loop (south pole approaching)",
    externalField: "out",
    fluxChange: "increasing",
    context: "Approaching south pole produces increasing out-of-page flux.",
  },
  {
    id: "magnet-s-away",
    label: "Magnet moving away (south pole moving away)",
    externalField: "out",
    fluxChange: "decreasing",
    context: "Retreating south pole reduces out-of-page flux.",
  },
  {
    id: "enter-into",
    label: "Loop enters into-page field",
    externalField: "into",
    fluxChange: "increasing",
    context: "The portion of loop in the into-page field region increases.",
  },
  {
    id: "leave-into",
    label: "Loop leaves into-page field",
    externalField: "into",
    fluxChange: "decreasing",
    context: "The portion of loop in the into-page field region decreases.",
  },
  {
    id: "enter-out",
    label: "Loop enters out-of-page field",
    externalField: "out",
    fluxChange: "increasing",
    context: "The portion of loop in the out-of-page field region increases.",
  },
  {
    id: "leave-out",
    label: "Loop leaves out-of-page field",
    externalField: "out",
    fluxChange: "decreasing",
    context: "The portion of loop in the out-of-page field region decreases.",
  },
  {
    id: "into-increasing",
    label: "Into-page field increasing",
    externalField: "into",
    fluxChange: "increasing",
    context: "Field magnitude into the page increases with time.",
  },
  {
    id: "into-decreasing",
    label: "Into-page field decreasing",
    externalField: "into",
    fluxChange: "decreasing",
    context: "Field magnitude into the page decreases with time.",
  },
  {
    id: "out-increasing",
    label: "Out-of-page field increasing",
    externalField: "out",
    fluxChange: "increasing",
    context: "Field magnitude out of the page increases with time.",
  },
  {
    id: "out-decreasing",
    label: "Out-of-page field decreasing",
    externalField: "out",
    fluxChange: "decreasing",
    context: "Field magnitude out of the page decreases with time.",
  },
  {
    id: "constant-flux",
    label: "Loop stationary in uniform constant field",
    externalField: "into",
    fluxChange: "constant",
    context: "Flux is present but not changing.",
  },
];

function getCurrentDirection(scenario: Scenario): CurrentDirection {
  if (scenario.fluxChange === "constant") {
    return "none";
  }

  const inducedField =
    scenario.fluxChange === "increasing"
      ? scenario.externalField === "into"
        ? "out"
        : "into"
      : scenario.externalField === "into"
      ? "into"
      : "out";

  return inducedField === "out" ? "counterclockwise" : "clockwise";
}

function currentLabel(direction: CurrentDirection): string {
  if (direction === "clockwise") {
    return "clockwise";
  }
  if (direction === "counterclockwise") {
    return "counterclockwise";
  }
  return "no induced current";
}

export function LenzDirectionTrainer() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id);
  const [answer, setAnswer] = useState<CurrentDirection | null>(null);
  const [revealReasoning, setRevealReasoning] = useState(false);
  const [showInducedField, setShowInducedField] = useState(true);
  const [showRightHandHint, setShowRightHandHint] = useState(true);

  const scenario = useMemo(
    () => scenarios.find((item) => item.id === scenarioId) ?? scenarios[0],
    [scenarioId]
  );

  const correctDirection = getCurrentDirection(scenario);
  const isCorrect = answer != null ? answer === correctDirection : null;

  const inducedFieldDirection: FieldDirection | "none" =
    correctDirection === "none"
      ? "none"
      : correctDirection === "counterclockwise"
      ? "out"
      : "into";

  const reasoningSteps = [
    `Step 1: External magnetic field direction is ${scenario.externalField}-of-page (${scenario.externalField === "into" ? "×" : "•"}).`,
    `Step 2: External flux is ${scenario.fluxChange}${
      scenario.fluxChange === "constant" ? ", so dΦ/dt = 0." : "."
    }`,
    `Step 3: ${
      inducedFieldDirection === "none"
        ? "No induced field is needed because flux is not changing."
        : `Induced field must point ${inducedFieldDirection}-of-page to oppose that change.`
    }`,
    `Step 4: By the right-hand rule, current is ${currentLabel(correctDirection)}.`,
  ];

  const whatChanged =
    answer == null
      ? "Choose a direction to test your Lenz's law reasoning chain."
      : isCorrect
      ? "Your direction is consistent with opposing the change in magnetic flux."
      : `Your selected direction does not oppose the flux change. Correct direction is ${currentLabel(
          correctDirection
        )}.`;

  const relationshipSummary =
    "Lenz's law sets direction by opposing flux change: identify external field, identify whether flux is increasing/decreasing, then choose the current that creates the opposing induced field.";

  const randomizeScenario = () => {
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    setScenarioId(scenarios[randomIndex].id);
    setAnswer(null);
    setRevealReasoning(false);
  };

  return (
    <SimulationLayout
      title="Lenz's Law Direction Trainer"
      description="Quick direction-checker for induced current using field direction, flux change, and right-hand-rule reasoning."
      visual={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <p className="inline-flex items-center gap-1.5">
              Lenz&apos;s law <Tooltip text="The induced current opposes the change in magnetic flux, not necessarily the original magnetic field." />
            </p>
          </div>

          <svg viewBox="0 0 600 330" className="h-[320px] w-full rounded-xl bg-slate-950/75">
            <defs>
              <marker
                id="lenz-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#f59e0b" />
              </marker>
              <marker
                id="lenz-correct-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#4ade80" />
              </marker>
            </defs>

            <circle
              cx="300"
              cy="165"
              r="88"
              fill="rgba(56, 189, 248, 0.06)"
              stroke="rgba(226, 232, 240, 0.95)"
              strokeWidth="2.3"
            />

            {Array.from({ length: 25 }, (_, index) => {
              const col = index % 5;
              const row = Math.floor(index / 5);
              const x = 120 + col * 90;
              const y = 70 + row * 45;
              return (
                <text key={index} x={x} y={y} fill="#7dd3fc" opacity={0.75} fontSize={20} textAnchor="middle">
                  {scenario.externalField === "into" ? "×" : "•"}
                </text>
              );
            })}

            <text x="300" y="35" textAnchor="middle" fill="#f8fafc" fontSize={14}>
              External flux is {scenario.fluxChange}
            </text>

            {answer && answer !== "none" ? (
              <path
                d={
                  answer === "clockwise"
                    ? "M 212 165 A 88 88 0 1 0 388 165"
                    : "M 388 165 A 88 88 0 1 0 212 165"
                }
                fill="none"
                stroke={isCorrect ? "#4ade80" : "#f59e0b"}
                strokeWidth="3"
                strokeDasharray={isCorrect ? "0" : "6 6"}
                markerEnd={isCorrect ? "url(#lenz-correct-arrow)" : "url(#lenz-arrow)"}
              />
            ) : null}

            {answer && !isCorrect && correctDirection !== "none" ? (
              <path
                d={
                  correctDirection === "clockwise"
                    ? "M 212 165 A 88 88 0 1 0 388 165"
                    : "M 388 165 A 88 88 0 1 0 212 165"
                }
                fill="none"
                stroke="#4ade80"
                strokeWidth="3"
                markerEnd="url(#lenz-correct-arrow)"
              />
            ) : null}

            {showInducedField && inducedFieldDirection !== "none" ? (
              <text x="300" y="170" textAnchor="middle" fill="#c4b5fd" fontSize={24}>
                {inducedFieldDirection === "into" ? "×" : "•"} Bᵢ
              </text>
            ) : null}

            {showRightHandHint ? (
              <text x="300" y="302" textAnchor="middle" fill="#cbd5e1" fontSize={12}>
                Right-hand rule: curl fingers with current, thumb points through loop field.
              </text>
            ) : null}
          </svg>

          <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-3 text-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">Scenario</p>
            <p className="mt-1 text-slate-100">{scenario.context}</p>
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-slate-900/50 p-3 text-sm">
            <p className="text-slate-100">Answer status: {answer ? (isCorrect ? "Correct" : "Try again") : "Not answered"}</p>
            {answer && !isCorrect ? (
              <p className="mt-1 text-rose-200">Correct direction: {currentLabel(correctDirection)}.</p>
            ) : null}
          </div>
        </div>
      }
      sidebar={
        <div className="space-y-3">
          <CEDAlignmentCard alignment={cedAlignments.lenzTrainer} />

          <div className="grid grid-cols-2 gap-2">
            <LiveValueCard label="External Field" value={`${scenario.externalField}-of-page`} />
            <LiveValueCard label="Flux Change" value={scenario.fluxChange} />
            <LiveValueCard label="Your Answer" value={answer ? currentLabel(answer) : "none yet"} />
            <LiveValueCard label="Correct" value={currentLabel(correctDirection)} />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-3">
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Scenario</span>
              <select
                value={scenario.id}
                onChange={(event) => {
                  setScenarioId(event.target.value);
                  setAnswer(null);
                  setRevealReasoning(false);
                }}
                className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-xs"
              >
                {scenarios.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={randomizeScenario}
              className="w-full rounded-xl border border-slate-600 bg-slate-800/65 px-3 py-2 text-sm text-slate-100"
            >
              Randomize Scenario
            </button>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setAnswer("clockwise")}
                className="rounded-xl border border-amber-400/45 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
              >
                Clockwise
              </button>
              <button
                type="button"
                onClick={() => setAnswer("counterclockwise")}
                className="rounded-xl border border-amber-400/45 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
              >
                Counterclockwise
              </button>
              <button
                type="button"
                onClick={() => setAnswer("none")}
                className="rounded-xl border border-amber-400/45 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
              >
                No Induced Current
              </button>
            </div>

            <button
              type="button"
              onClick={() => setRevealReasoning((previous) => !previous)}
              className="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-100"
            >
              {revealReasoning ? "Hide Reasoning" : "Reveal Reasoning"}
            </button>

            <ToggleControl
              id="lenz-induced-field"
              label="Show Induced Magnetic Field"
              checked={showInducedField}
              onChange={setShowInducedField}
            />
            <ToggleControl
              id="lenz-rhr"
              label="Show Right-Hand Rule Hint"
              checked={showRightHandHint}
              onChange={setShowRightHandHint}
            />
          </div>

          {revealReasoning ? (
            <section className="rounded-2xl border border-slate-700/70 bg-slate-900/65 p-4 text-sm text-slate-100">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-cyan-200">Reasoning Chain</h3>
              <div className="mt-2 space-y-2 text-xs leading-relaxed text-slate-200">
                {reasoningSteps.map((step) => (
                  <p key={step}>{step}</p>
                ))}
              </div>
            </section>
          ) : null}

          <FormulaCard
            title="Lenz Direction Rule"
            equation={String.raw`\mathcal{E} = -\frac{d\Phi_B}{dt}`}
            definitions={[
              {
                symbol: String.raw`-`,
                meaning: "sign enforcing opposition to flux change",
                unit: "directional",
              },
              {
                symbol: String.raw`\Phi_B`,
                meaning: "magnetic flux through loop",
                unit: "Wb",
              },
            ]}
            physicalMeaning="Induced current direction is set by opposing the change in flux, not by opposing the original field itself."
          />

          <WhatChangedCard text={whatChanged} />
          <RelationshipSummaryCard
            summary={relationshipSummary}
            constants={[
              { label: "External Field", value: scenario.externalField === "into" ? "into page" : "out of page" },
              { label: "Flux", value: scenario.fluxChange },
            ]}
          />
          <CommonMistakeCard text="Common mistake: induced current does not oppose flux itself. It opposes the change in flux." />
          <ModelAssumptionsCard assumptions={defaultModelAssumptions} />
        </div>
      }
    />
  );
}
