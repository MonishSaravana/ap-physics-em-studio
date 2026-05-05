"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CEDAlignmentCard } from "@/components/simulations/CEDAlignmentCard";
import { CollapsibleSection } from "@/components/simulations/CollapsibleSection";
import { CommonMistakeCard } from "@/components/simulations/CommonMistakeCard";
import { FormulaCard } from "@/components/simulations/FormulaCard";
import { GraphPanel } from "@/components/simulations/GraphPanel";
import { GraphMathCard } from "@/components/simulations/GraphMathCard";
import { LiveValueCard } from "@/components/simulations/LiveValueCard";
import { ModelAssumptionsCard } from "@/components/simulations/ModelAssumptionsCard";
import { RelationshipSummaryCard } from "@/components/simulations/RelationshipSummaryCard";
import { SimulationLayout } from "@/components/simulations/SimulationLayout";
import { SliderControl } from "@/components/simulations/SliderControl";
import { ToggleControl } from "@/components/simulations/ToggleControl";
import { Tooltip } from "@/components/simulations/Tooltip";
import { WhatChangedCard } from "@/components/simulations/WhatChangedCard";
import { cedAlignments, defaultModelAssumptions } from "@/data/ced";
import { formatNumber } from "@/lib/format";

type Direction = "into" | "out";

type FaradayState = {
  B: number;
  v: number;
  loopWidth: number;
  loopHeight: number;
  N: number;
  fieldRegionWidth: number;
  fieldDirection: Direction;
  animationSpeed: number;
  playing: boolean;
  showCurrentArrows: boolean;
  showInducedField: boolean;
  showFluxGraph: boolean;
  showEmfGraph: boolean;
};

type DerivedState = {
  overlap: number;
  areaInside: number;
  flux: number;
  dFluxDt: number;
  emf: number;
  currentDirection: "clockwise" | "counterclockwise" | "none";
  reason: string;
  status: string;
  inducedFieldDirection: Direction | "none";
};

const defaults: FaradayState = {
  B: 2,
  v: 2,
  loopWidth: 1,
  loopHeight: 1.2,
  N: 35,
  fieldRegionWidth: 4,
  fieldDirection: "into",
  animationSpeed: 1,
  playing: true,
  showCurrentArrows: true,
  showInducedField: true,
  showFluxGraph: true,
  showEmfGraph: true,
};

const emptyDerived: DerivedState = {
  overlap: 0,
  areaInside: 0,
  flux: 0,
  dFluxDt: 0,
  emf: 0,
  currentDirection: "none",
  reason: "No changing flux, so no induced current.",
  status: "outside field → no flux",
  inducedFieldDirection: "none",
};

const graphWindowSeconds = 14;
const epsilon = 1e-5;

export function FaradayLenzSimulator() {
  const [state, setState] = useState<FaradayState>(defaults);
  const [time, setTime] = useState(0);
  const [position, setPosition] = useState(-defaults.loopWidth / 2);
  const [derived, setDerived] = useState<DerivedState>(emptyDerived);
  const [history, setHistory] = useState<Array<{ time: number; flux: number; emf: number }>>([
    { time: 0, flux: 0, emf: 0 },
  ]);
  const [lastChanged, setLastChanged] = useState<keyof FaradayState>("v");

  const lastFrameRef = useRef<number | null>(null);
  const previousFluxRef = useRef(0);
  const previousTimeRef = useRef(0);

  const fieldSign = state.fieldDirection === "out" ? 1 : -1;

  const computeFlux = useMemo(
    () => (centerPosition: number) => {
      const left = centerPosition - state.loopWidth / 2;
      const right = centerPosition + state.loopWidth / 2;
      const overlap = Math.max(0, Math.min(right, state.fieldRegionWidth) - Math.max(left, 0));
      const areaInside = overlap * state.loopHeight;
      const flux = fieldSign * state.B * areaInside;
      return { overlap, areaInside, flux };
    },
    [fieldSign, state.B, state.fieldRegionWidth, state.loopHeight, state.loopWidth]
  );

  useEffect(() => {
    if (!state.playing) {
      lastFrameRef.current = null;
      return;
    }

    let animationFrame = 0;

    const tick = (timestamp: number) => {
      if (lastFrameRef.current == null) {
        lastFrameRef.current = timestamp;
      }

      const elapsed = (timestamp - lastFrameRef.current) / 1000;
      lastFrameRef.current = timestamp;
      const dt = elapsed * state.animationSpeed;

      setTime((prev) => prev + dt);

      setPosition((prev) => {
        let next = prev + state.v * dt;
        const minCenter = -state.loopWidth / 2;
        const maxCenter = state.fieldRegionWidth + state.loopWidth / 2;

        if (state.v > 0 && next - state.loopWidth / 2 > state.fieldRegionWidth + state.loopWidth) {
          next = minCenter;
        }

        if (state.v < 0 && next + state.loopWidth / 2 < -state.loopWidth) {
          next = maxCenter;
        }

        return next;
      });

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
      lastFrameRef.current = null;
    };
  }, [
    state.animationSpeed,
    state.fieldRegionWidth,
    state.loopWidth,
    state.playing,
    state.v,
  ]);

  useEffect(() => {
    const { overlap, areaInside, flux } = computeFlux(position);
    const dt = Math.max(time - previousTimeRef.current, 1e-4);
    const dFluxDt = (flux - previousFluxRef.current) / dt;
    const emf = -state.N * dFluxDt;

    previousFluxRef.current = flux;
    previousTimeRef.current = time;

    const changingFlux = Math.abs(dFluxDt) > epsilon;
    const outside = overlap <= epsilon;

    const status = outside
      ? "outside field → no flux"
      : changingFlux
      ? "flux changing → induced emf"
      : "flux constant → no induced emf";

    let inducedFieldDirection: Direction | "none" = "none";
    if (changingFlux) {
      inducedFieldDirection = dFluxDt > 0 ? "into" : "out";
    }

    let currentDirection: DerivedState["currentDirection"] = "none";
    if (changingFlux) {
      currentDirection = inducedFieldDirection === "out" ? "counterclockwise" : "clockwise";
    }

    const reason = changingFlux
      ? `Induced field ${inducedFieldDirection}-of-page opposes the ${dFluxDt > 0 ? "increase" : "decrease"} in signed flux.`
      : "No changing magnetic flux through the loop, so induced emf is zero.";

    setDerived({
      overlap,
      areaInside,
      flux,
      dFluxDt,
      emf,
      currentDirection,
      reason,
      status,
      inducedFieldDirection,
    });

    setHistory((previous) => {
      const next = [...previous, { time, flux, emf }];
      return next.filter((point) => time - point.time <= graphWindowSeconds);
    });
  }, [computeFlux, position, state.N, time]);

  const reset = () => {
    const resetPosition = state.v >= 0 ? -state.loopWidth / 2 : state.fieldRegionWidth + state.loopWidth / 2;
    setTime(0);
    setPosition(resetPosition);
    setHistory([{ time: 0, flux: 0, emf: 0 }]);
    setDerived(emptyDerived);
    previousFluxRef.current = 0;
    previousTimeRef.current = 0;
    lastFrameRef.current = null;
  };

  const update = (key: keyof FaradayState, value: number | boolean | Direction) => {
    setState((previous) => {
      const next = { ...previous, [key]: value };

      if (
        key === "loopWidth" ||
        key === "fieldRegionWidth" ||
        key === "loopHeight" ||
        key === "fieldDirection" ||
        key === "v"
      ) {
        const resetPosition =
          next.v >= 0 ? -next.loopWidth / 2 : next.fieldRegionWidth + next.loopWidth / 2;
        setTime(0);
        setPosition(resetPosition);
        setHistory([{ time: 0, flux: 0, emf: 0 }]);
        setDerived(emptyDerived);
        previousFluxRef.current = 0;
        previousTimeRef.current = 0;
        lastFrameRef.current = null;
      }

      return next;
    });
    setLastChanged(key);
  };

  const whatChanged =
    lastChanged === "v"
      ? "Increasing speed increases |dΦB/dt|, so induced |emf| increases while entry/exit intervals get shorter."
      : lastChanged === "B"
      ? "Increasing B scales flux and induced emf magnitude during entry and exit."
      : lastChanged === "N"
      ? "Increasing N multiplies induced emf because each turn contributes to total flux linkage."
      : lastChanged === "fieldDirection"
      ? "Reversing field direction flips the sign of flux and reverses induced current direction for the same motion."
      : "Geometry and toggles changed the representation and overlap timing used in the induction model.";

  const relationshipSummary =
    "Induced emf depends on rate of flux change, not flux alone: larger |dΦB/dt| or larger N gives larger |ℰ|.";

  const worldMin = -2;
  const worldMax = state.fieldRegionWidth + 2;
  const worldSpan = Math.max(1, worldMax - worldMin);
  const canvasLeft = 70;
  const canvasRight = 530;

  const mapX = (meters: number) =>
    canvasLeft + ((meters - worldMin) / worldSpan) * (canvasRight - canvasLeft);

  const loopLeftX = mapX(position - state.loopWidth / 2);
  const loopRightX = mapX(position + state.loopWidth / 2);
  const loopWidthPx = Math.max(12, loopRightX - loopLeftX);

  const fieldLeftX = mapX(0);
  const fieldRightX = mapX(state.fieldRegionWidth);

  const drawCurrentArrow =
    state.showCurrentArrows && derived.currentDirection !== "none" ? derived.currentDirection : null;

  return (
    <SimulationLayout
      title="Faraday + Lenz Simulator"
      description="Move a loop into, through, and out of a magnetic field region to connect changing flux, induced emf, and current direction."
      visual={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <p className="inline-flex items-center gap-1.5">
              Faraday&apos;s law <Tooltip text="Emf is induced by changing magnetic flux, not by magnetic flux alone." />
            </p>
            <p className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-cyan-100">
              {derived.status}
            </p>
          </div>
          <label className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-900/55 px-3 py-2 text-xs text-slate-200">
            <span>Animation Speed</span>
            <input
              type="range"
              min={0.05}
              max={3}
              step={0.05}
              value={state.animationSpeed}
              onChange={(event) => update("animationSpeed", Number(event.target.value))}
              className="w-40 accent-cyan-400"
            />
            <span className="min-w-10 text-right text-cyan-200">{formatNumber(state.animationSpeed, 2)}×</span>
          </label>

          <svg viewBox="0 0 600 330" className="h-[320px] w-full rounded-xl bg-slate-950/75">
            <defs>
              <marker
                id="velocity-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#a5f3fc" />
              </marker>
              <marker
                id="current-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#f59e0b" />
              </marker>
            </defs>

            <rect
              x={fieldLeftX}
              y={40}
              width={Math.max(5, fieldRightX - fieldLeftX)}
              height={250}
              fill="rgba(8, 47, 73, 0.45)"
              stroke="rgba(56, 189, 248, 0.7)"
              strokeWidth={1.5}
            />

            {Array.from({ length: 42 }, (_, index) => {
              const col = index % 7;
              const row = Math.floor(index / 7);
              const x = fieldLeftX + 24 + col * 52;
              const y = 68 + row * 42;
              if (x > fieldRightX - 12) {
                return null;
              }
              return (
                <text
                  key={`symbol-${index}`}
                  x={x}
                  y={y}
                  fill="#7dd3fc"
                  opacity={0.85}
                  fontSize={16}
                  textAnchor="middle"
                >
                  {state.fieldDirection === "into" ? "×" : "•"}
                </text>
              );
            })}

            <rect
              x={loopLeftX}
              y={120}
              width={loopWidthPx}
              height={100}
              fill="rgba(251, 191, 36, 0.09)"
              stroke="#f8fafc"
              strokeWidth={2.4}
            />

            <line
              x1={loopLeftX + loopWidthPx / 2}
              y1={105}
              x2={loopLeftX + loopWidthPx / 2 + Math.sign(state.v || 1) * 55}
              y2={105}
              stroke="#a5f3fc"
              strokeWidth={2}
              markerEnd="url(#velocity-arrow)"
            />
            <text x={loopLeftX + loopWidthPx / 2 - 6} y={95} fill="#a5f3fc" fontSize={13}>
              v = {formatNumber(state.v, 2)} m/s
            </text>

            {drawCurrentArrow === "clockwise" ? (
              <>
                <path
                  d={`M ${loopLeftX + 12} 170 Q ${loopLeftX + loopWidthPx / 2} 235 ${
                    loopLeftX + loopWidthPx - 12
                  } 170`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={2.2}
                  markerEnd="url(#current-arrow)"
                />
                <text x={loopLeftX + loopWidthPx / 2 - 10} y={245} fill="#fbbf24" fontSize={12}>
                  CW
                </text>
              </>
            ) : null}

            {drawCurrentArrow === "counterclockwise" ? (
              <>
                <path
                  d={`M ${loopLeftX + loopWidthPx - 12} 170 Q ${loopLeftX + loopWidthPx / 2} 95 ${
                    loopLeftX + 12
                  } 170`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={2.2}
                  markerEnd="url(#current-arrow)"
                />
                <text x={loopLeftX + loopWidthPx / 2 - 14} y={85} fill="#fbbf24" fontSize={12}>
                  CCW
                </text>
              </>
            ) : null}

            {state.showInducedField && derived.inducedFieldDirection !== "none" ? (
              <text x={loopLeftX + loopWidthPx / 2} y={175} textAnchor="middle" fill="#e9d5ff" fontSize={18}>
                {derived.inducedFieldDirection === "into" ? "×" : "•"} Bᵢ
              </text>
            ) : null}

            <text x={20} y={25} fill="#cbd5e1" fontSize={13}>
              Field symbols: × into page, • out of page
            </text>
          </svg>

          <p className="text-xs text-slate-300">{derived.reason}</p>
        </div>
      }
      sidebar={
        <div className="space-y-3">
          <CEDAlignmentCard alignment={cedAlignments.faradayLenz} />

          <div className="grid grid-cols-2 gap-2">
            <LiveValueCard label="Flux Φ_B" value={formatNumber(derived.flux, 3)} unit="Wb" />
            <LiveValueCard label="dΦ_B/dt" value={formatNumber(derived.dFluxDt, 3)} unit="Wb/s" />
            <LiveValueCard label="Induced emf ℰ" value={formatNumber(derived.emf, 3)} unit="V" />
            <LiveValueCard
              label="Current Direction"
              value={
                derived.currentDirection === "none"
                  ? "none"
                  : derived.currentDirection === "clockwise"
                  ? "clockwise"
                  : "counterclockwise"
              }
            />
            <LiveValueCard label="Inside Area" value={formatNumber(derived.areaInside, 3)} unit="m²" />
            <LiveValueCard label="Time" value={formatNumber(time, 2)} unit="s" />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-3">
            <CollapsibleSection title="Field + Geometry" defaultOpen>
              <SliderControl id="faraday-b" label="Magnetic Field B" value={state.B} min={0} max={5} step={0.05} unit="T" onChange={(value) => update("B", value)} />
              <SliderControl id="faraday-v" label="Loop Velocity v" value={state.v} min={-5} max={5} step={0.05} unit="m/s" onChange={(value) => update("v", value)} />
              <SliderControl id="faraday-loop-width" label="Loop Width" value={state.loopWidth} min={0.2} max={3} step={0.05} unit="m" onChange={(value) => update("loopWidth", value)} />
              <SliderControl id="faraday-loop-height" label="Loop Height" value={state.loopHeight} min={0.2} max={3} step={0.05} unit="m" onChange={(value) => update("loopHeight", value)} />
              <SliderControl id="faraday-n" label="Turns N" value={state.N} min={1} max={100} step={1} digits={0} unit="turns" onChange={(value) => update("N", value)} />
              <SliderControl id="faraday-region" label="Field Region Width" value={state.fieldRegionWidth} min={1} max={8} step={0.1} unit="m" onChange={(value) => update("fieldRegionWidth", value)} />
              <label className="flex items-center justify-between gap-2 rounded-xl border border-slate-700/70 bg-slate-900/55 px-3 py-2 text-sm text-slate-200">
                <span>Field Direction</span>
                <select aria-label="Field direction" value={state.fieldDirection} onChange={(event) => update("fieldDirection", event.target.value as Direction)} className="rounded-lg border border-slate-600 bg-slate-950 px-2 py-1 text-xs">
                  <option value="into">Into Page (×)</option>
                  <option value="out">Out of Page (•)</option>
                </select>
              </label>
            </CollapsibleSection>
            <CollapsibleSection title="Time + Playback" defaultOpen>
              <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => update("playing", !state.playing)}
                className="rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-100"
              >
                {state.playing ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm text-slate-100"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  setHistory([{ time, flux: derived.flux, emf: derived.emf }]);
                }}
                className="rounded-xl border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm text-slate-100"
              >
                Clear Graph
              </button>
            </div>
            </CollapsibleSection>
            <CollapsibleSection title="Display Options">
              <div className="grid gap-2">
                <ToggleControl id="faraday-current" label="Show Induced Current Arrows" checked={state.showCurrentArrows} onChange={(checked) => update("showCurrentArrows", checked)} />
                <ToggleControl id="faraday-induced-field" label="Show Induced Field" checked={state.showInducedField} onChange={(checked) => update("showInducedField", checked)} />
                <ToggleControl id="faraday-show-flux" label="Show Flux Graph" checked={state.showFluxGraph} onChange={(checked) => update("showFluxGraph", checked)} />
                <ToggleControl id="faraday-show-emf" label="Show emf Graph" checked={state.showEmfGraph} onChange={(checked) => update("showEmfGraph", checked)} />
              </div>
            </CollapsibleSection>
          </div>

        </div>
      }
      bottom={
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
          {state.showFluxGraph ? (
            <div>
            <GraphPanel title="Magnetic Flux vs Time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 8, right: 12, left: 10, bottom: 10 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="time"
                    type="number"
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{
                      value: "Time t (s)",
                      fill: "#e2e8f0",
                      position: "insideBottom",
                      offset: -2,
                    }}
                    domain={["auto", "auto"]}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{
                      value: "Φ_B (Wb)",
                      fill: "#e2e8f0",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${formatNumber(Number(value), 3)} Wb`, "Flux"]}
                    labelFormatter={(label) => `t = ${formatNumber(Number(label), 2)} s`}
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: 10,
                      color: "#e2e8f0",
                    }}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="flux" stroke="#22d3ee" dot={false} strokeWidth={2.4} />
                </LineChart>
              </ResponsiveContainer>
            </GraphPanel>
            <GraphMathCard formula="ΦB(t)=B·Ainside(t)" derivative="dΦB/dt" derivativeMeaning="This slope tells how fast flux is changing and directly drives induction." integral="∫ΦB dt" integralMeaning="Area under flux-time is total signed flux accumulated over time." />
            </div>
          ) : null}

          {state.showEmfGraph ? (
            <div>
            <GraphPanel title="Induced emf vs Time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 8, right: 12, left: 10, bottom: 10 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="time"
                    type="number"
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{
                      value: "Time t (s)",
                      fill: "#e2e8f0",
                      position: "insideBottom",
                      offset: -2,
                    }}
                    domain={["auto", "auto"]}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    label={{
                      value: "ℰ (V)",
                      fill: "#e2e8f0",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`${formatNumber(Number(value), 3)} V`, "emf"]}
                    labelFormatter={(label) => `t = ${formatNumber(Number(label), 2)} s`}
                    contentStyle={{
                      background: "#020617",
                      border: "1px solid #334155",
                      borderRadius: 10,
                      color: "#e2e8f0",
                    }}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="emf" stroke="#f59e0b" dot={false} strokeWidth={2.4} />
                </LineChart>
              </ResponsiveContainer>
            </GraphPanel>
            <GraphMathCard formula="ℰ(t) = -N dΦB/dt" derivative="dℰ/dt" derivativeMeaning="This indicates how sharply induced emf itself is changing." integral="∫ℰ dt = -NΔΦB" integralMeaning="Area under emf-time gives net flux-linkage change." />
            </div>
          ) : null}
          </div>
          <div className="grid gap-3 xl:grid-cols-2">
            <FormulaCard title="Faraday's Law" equation={String.raw`\mathcal{E} = -N\frac{d\Phi_B}{dt}`} definitions={[{ symbol: String.raw`\mathcal{E}`, meaning: "induced emf", unit: "V" }, { symbol: String.raw`N`, meaning: "number of turns", unit: "turns" }, { symbol: String.raw`\Phi_B`, meaning: "magnetic flux", unit: "Wb" }]} physicalMeaning="An emf is induced only when magnetic flux changes with time." />
            <FormulaCard title="Uniform Region Flux" equation={String.raw`\Phi_B = BA_{\text{inside}},\quad |\mathcal{E}| = NB\frac{dA_{\text{inside}}}{dt}`} definitions={[{ symbol: String.raw`A_{\text{inside}}`, meaning: "loop area currently in the field region", unit: "m²" }]} physicalMeaning="As the loop enters or exits the field region, changing overlap area causes changing flux and induced emf." />
            <WhatChangedCard text={whatChanged} />
            <RelationshipSummaryCard summary={relationshipSummary} constants={[{ label: "B", value: `${formatNumber(state.B)} T` }, { label: "N", value: `${formatNumber(state.N, 0)}` }, { label: "v", value: `${formatNumber(state.v)} m/s` }, { label: "Region", value: `${formatNumber(state.fieldRegionWidth)} m` }]} />
            <CommonMistakeCard text="Common mistake: a strong magnetic field does not automatically create induced current. Magnetic flux must be changing." />
            <ModelAssumptionsCard assumptions={defaultModelAssumptions} />
          </div>
        </div>
      }
    />
  );
}
