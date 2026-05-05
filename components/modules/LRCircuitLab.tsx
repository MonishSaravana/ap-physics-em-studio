"use client";

import { useEffect, useMemo, useState } from "react";
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
import { CommonMistakeCard } from "@/components/simulations/CommonMistakeCard";
import { FormulaCard } from "@/components/simulations/FormulaCard";
import { GraphPanel } from "@/components/simulations/GraphPanel";
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

type LRMode = "rise" | "decay";
type SwitchState = "open" | "closed";

type LRState = {
  V: number;
  R: number;
  L: number;
  mode: LRMode;
  switchState: SwitchState;
  I0: number;
  animationSpeed: number;
  playing: boolean;
  showCurrentParticles: boolean;
  showMagField: boolean;
  showLabels: boolean;
  showVoltageSplit: boolean;
};

const defaults: LRState = {
  V: 12,
  R: 16,
  L: 2.4,
  mode: "rise",
  switchState: "closed",
  I0: 2.2,
  animationSpeed: 1,
  playing: true,
  showCurrentParticles: true,
  showMagField: true,
  showLabels: true,
  showVoltageSplit: true,
};

export function LRCircuitLab() {
  const [state, setState] = useState<LRState>(defaults);
  const [time, setTime] = useState(0);
  const [lastChanged, setLastChanged] = useState<keyof LRState>("L");

  const tau = state.L / Math.max(0.001, state.R);
  const maxTime = Math.max(0.5, 6 * tau);

  useEffect(() => {
    if (!state.playing || state.switchState === "open") {
      return;
    }

    let frameId = 0;
    let last: number | null = null;

    const step = (timestamp: number) => {
      if (last == null) {
        last = timestamp;
      }

      const dt = ((timestamp - last) / 1000) * state.animationSpeed;
      last = timestamp;

      setTime((previous) => {
        const next = Math.min(maxTime, previous + dt);
        if (next >= maxTime) {
          setState((previousState) =>
            previousState.playing ? { ...previousState, playing: false } : previousState
          );
        }
        return next;
      });

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [maxTime, state.animationSpeed, state.playing, state.switchState]);

  const derived = useMemo(() => {
    const closed = state.switchState === "closed";
    const IInfinity = state.R > 0 ? state.V / state.R : 0;

    if (!closed) {
      return {
        I: 0,
        dIdt: 0,
        VR: 0,
        VL: 0,
        IInfinity,
      };
    }

    if (state.mode === "rise") {
      const expTerm = Math.exp(-time / Math.max(1e-6, tau));
      const I = IInfinity * (1 - expTerm);
      const dIdt = (IInfinity / Math.max(1e-6, tau)) * expTerm;
      const VR = I * state.R;
      const VL = state.L * dIdt;
      return {
        I,
        dIdt,
        VR,
        VL,
        IInfinity,
      };
    }

    const expTerm = Math.exp(-time / Math.max(1e-6, tau));
    const I = state.I0 * expTerm;
    const dIdt = -(state.I0 / Math.max(1e-6, tau)) * expTerm;
    const VR = I * state.R;
    const VL = state.L * dIdt;
    return {
      I,
      dIdt,
      VR,
      VL,
      IInfinity,
    };
  }, [state.I0, state.L, state.R, state.V, state.mode, state.switchState, tau, time]);

  const magneticEnergy = 0.5 * state.L * derived.I * derived.I;
  const resistorPower = derived.I * derived.I * state.R;

  const phaseLabel =
    time < 0.05 * tau
      ? "immediately after switching"
      : time < 3 * tau
      ? "transient"
      : "long time behavior";

  const graphData = useMemo(() => {
    return Array.from({ length: 180 }, (_, index) => {
      const t = (index / 179) * maxTime;
      const IInfinity = state.R > 0 ? state.V / state.R : 0;

      let I = 0;
      let VR = 0;
      let VL = 0;

      if (state.switchState === "closed") {
        if (state.mode === "rise") {
          const expTerm = Math.exp(-t / Math.max(1e-6, tau));
          I = IInfinity * (1 - expTerm);
          VR = I * state.R;
          VL = state.V * expTerm;
        } else {
          const expTerm = Math.exp(-t / Math.max(1e-6, tau));
          I = state.I0 * expTerm;
          VR = I * state.R;
          VL = -VR;
        }
      }

      const U = 0.5 * state.L * I * I;
      return { t, I, VR, VL, U };
    });
  }, [maxTime, state.I0, state.L, state.R, state.V, state.mode, state.switchState, tau]);

  const update = (key: keyof LRState, value: number | boolean | LRMode | SwitchState) => {
    setState((previous) => ({ ...previous, [key]: value }));
    setLastChanged(key);
  };

  const reset = () => {
    setTime(0);
    setState((previous) => ({ ...previous, playing: true }));
  };

  const whatChanged =
    lastChanged === "L"
      ? "Increasing L increases τ = L/R, so current changes more slowly."
      : lastChanged === "R"
      ? "Increasing R decreases final current V/R and decreases τ = L/R."
      : lastChanged === "V"
      ? "Increasing battery voltage increases final current and scales voltage drops during transient behavior."
      : lastChanged === "mode"
      ? "Rise mode approaches V/R from 0, while decay mode exponentially drops from I0 toward 0."
      : lastChanged === "switchState"
      ? "Opening the switch stops the driven transient in this idealized model."
      : "Animation or display controls changed the representation of the same LR transient relationships.";

  const relationshipSummary =
    "LR time constant τ = L/R: larger L slows response, larger R speeds the transient but lowers final current.";

  const currentStrength = Math.min(1, Math.abs(derived.I) / Math.max(0.2, derived.IInfinity || state.I0 || 1));

  return (
    <SimulationLayout
      title="LR Circuit Lab"
      description="Model current rise and decay in resistor-inductor circuits, including time constant, voltage split, and magnetic energy build/decay."
      visual={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <p className="inline-flex items-center gap-1.5">
              Time constant <Tooltip text="τ = L/R sets how quickly current approaches its final value." />
            </p>
            <p className="rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-cyan-100">
              {phaseLabel}
            </p>
          </div>

          <svg viewBox="0 0 620 330" className="h-[320px] w-full rounded-xl bg-slate-950/75">
            <defs>
              <marker
                id="lr-current-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#f8fafc" />
              </marker>
            </defs>

            <line x1="90" y1="70" x2="190" y2="70" stroke="#e2e8f0" strokeWidth="3" />

            <line x1="190" y1="70" x2={state.switchState === "closed" ? "225" : "208"} y2="70" stroke="#e2e8f0" strokeWidth="3" />
            {state.switchState === "closed" ? (
              <line x1="225" y1="70" x2="240" y2="70" stroke="#e2e8f0" strokeWidth="3" />
            ) : (
              <line x1="208" y1="70" x2="240" y2="53" stroke="#e2e8f0" strokeWidth="3" />
            )}

            <rect x="240" y="52" width="115" height="36" rx="6" fill="#7c2d12" opacity={0.35 + currentStrength * 0.45} />
            <line x1="355" y1="70" x2="390" y2="70" stroke="#e2e8f0" strokeWidth="3" />

            {Array.from({ length: 9 }, (_, index) => {
              const x = 390 + index * 22;
              return <path key={x} d={`M ${x} 70 q 11 -26 22 0`} fill="none" stroke="#93c5fd" strokeWidth="3" />;
            })}

            <line x1="588" y1="70" x2="588" y2="250" stroke="#e2e8f0" strokeWidth="3" />
            <line x1="588" y1="250" x2="90" y2="250" stroke="#e2e8f0" strokeWidth="3" />
            <line x1="90" y1="250" x2="90" y2="70" stroke="#e2e8f0" strokeWidth="3" />

            <line x1="75" y1="110" x2="105" y2="110" stroke="#f8fafc" strokeWidth="3" />
            <line x1="80" y1="130" x2="100" y2="130" stroke="#f8fafc" strokeWidth="2" />

            <text x="57" y="99" fill="#cbd5e1" fontSize={12}>
              +
            </text>
            <text x="57" y="137" fill="#cbd5e1" fontSize={12}>
              -
            </text>

            {state.showCurrentParticles
              ? Array.from({ length: 9 }, (_, index) => {
                  const loopLength = 2 * ((588 - 90) + (250 - 70));
                  const travel = ((time * 90 * (derived.I >= 0 ? 1 : -1) + index * 84) % loopLength + loopLength) % loopLength;

                  let x = 90;
                  let y = 70;
                  if (travel <= 498) {
                    x = 90 + travel;
                    y = 70;
                  } else if (travel <= 678) {
                    x = 588;
                    y = 70 + (travel - 498);
                  } else if (travel <= 1176) {
                    x = 588 - (travel - 678);
                    y = 250;
                  } else {
                    x = 90;
                    y = 250 - (travel - 1176);
                  }

                  return <circle key={`particle-${index}`} cx={x} cy={y} r="3.2" fill="#22d3ee" opacity={0.3 + currentStrength * 0.7} />;
                })
              : null}

            {state.showMagField
              ? Array.from({ length: 5 }, (_, index) => {
                  const arcWidth = 34 + index * 12;
                  return (
                    <path
                      key={`mag-${index}`}
                      d={`M ${440 - arcWidth / 2} ${120 + index * 12} q ${arcWidth / 2} -26 ${arcWidth} 0`}
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth={1.2 + currentStrength * 2}
                      opacity={0.2 + currentStrength * 0.7}
                    />
                  );
                })
              : null}

            {state.showLabels ? (
              <>
                <text x="250" y="45" fill="#fca5a5" fontSize={12}>
                  Resistor
                </text>
                <text x="436" y="45" fill="#93c5fd" fontSize={12}>
                  Inductor
                </text>
                <text x="243" y="95" fill="#e2e8f0" fontSize={11}>
                  R = {formatNumber(state.R, 1)} Ω
                </text>
                <text x="425" y="95" fill="#e2e8f0" fontSize={11}>
                  L = {formatNumber(state.L, 2)} H
                </text>
                <text x="130" y="115" fill="#f8fafc" fontSize={12}>
                  V = {formatNumber(state.V, 1)} V
                </text>
              </>
            ) : null}

            {state.showVoltageSplit ? (
              <>
                <text x="255" y="145" fill="#fca5a5" fontSize={12}>
                  V_R = {formatNumber(derived.VR, 2)} V
                </text>
                <text x="418" y="145" fill="#93c5fd" fontSize={12}>
                  V_L = {formatNumber(derived.VL, 2)} V
                </text>
              </>
            ) : null}

            <line x1="170" y1="40" x2="255" y2="40" stroke="#f8fafc" strokeWidth="2" markerEnd="url(#lr-current-arrow)" />
            <text x="176" y="30" fill="#f8fafc" fontSize={12}>
              I(t) = {formatNumber(derived.I, 3)} A
            </text>
          </svg>
        </div>
      }
      sidebar={
        <div className="space-y-3">
          <CEDAlignmentCard alignment={cedAlignments.lrCircuit} />

          <div className="grid grid-cols-2 gap-2">
            <LiveValueCard label="Time t" value={formatNumber(time, 3)} unit="s" />
            <LiveValueCard label="τ = L/R" value={formatNumber(tau, 3)} unit="s" />
            <LiveValueCard label="Current I(t)" value={formatNumber(derived.I, 4)} unit="A" />
            <LiveValueCard label="Final I∞" value={formatNumber(derived.IInfinity, 4)} unit="A" />
            <LiveValueCard label="Resistor Voltage VR" value={formatNumber(derived.VR, 4)} unit="V" />
            <LiveValueCard label="Inductor Voltage VL" value={formatNumber(derived.VL, 4)} unit="V" />
            <LiveValueCard label="Magnetic Energy UL" value={formatNumber(magneticEnergy, 4)} unit="J" />
            <LiveValueCard label="Resistor Power PR" value={formatNumber(resistorPower, 4)} unit="W" />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-3">
            <SliderControl
              id="lr-voltage"
              label="Battery Voltage V"
              value={state.V}
              min={0}
              max={24}
              step={0.1}
              unit="V"
              onChange={(value) => update("V", value)}
            />
            <SliderControl
              id="lr-resistance"
              label="Resistance R"
              value={state.R}
              min={1}
              max={100}
              step={0.5}
              unit="Ω"
              onChange={(value) => update("R", value)}
            />
            <SliderControl
              id="lr-inductance"
              label="Inductance L"
              value={state.L}
              min={0.1}
              max={10}
              step={0.05}
              unit="H"
              onChange={(value) => update("L", value)}
            />
            <SliderControl
              id="lr-i0"
              label="Initial Current I0 (decay mode)"
              value={state.I0}
              min={0}
              max={5}
              step={0.05}
              unit="A"
              onChange={(value) => update("I0", value)}
            />
            <SliderControl
              id="lr-speed"
              label="Animation Speed"
              value={state.animationSpeed}
              min={0.2}
              max={4}
              step={0.1}
              unit="×"
              onChange={(value) => update("animationSpeed", value)}
            />

            <label className="flex items-center justify-between gap-2 rounded-xl border border-slate-700/70 bg-slate-900/55 px-3 py-2 text-sm text-slate-200">
              <span>Mode</span>
              <select
                value={state.mode}
                onChange={(event) => {
                  update("mode", event.target.value as LRMode);
                  setTime(0);
                }}
                className="rounded-lg border border-slate-600 bg-slate-950 px-2 py-1 text-xs"
              >
                <option value="rise">Current Rise</option>
                <option value="decay">Current Decay</option>
              </select>
            </label>

            <label className="flex items-center justify-between gap-2 rounded-xl border border-slate-700/70 bg-slate-900/55 px-3 py-2 text-sm text-slate-200">
              <span>Switch State</span>
              <select
                value={state.switchState}
                onChange={(event) => update("switchState", event.target.value as SwitchState)}
                className="rounded-lg border border-slate-600 bg-slate-950 px-2 py-1 text-xs"
              >
                <option value="closed">Closed</option>
                <option value="open">Open</option>
              </select>
            </label>

            <div className="grid gap-2">
              <ToggleControl
                id="lr-particles"
                label="Show Current Particles"
                checked={state.showCurrentParticles}
                onChange={(checked) => update("showCurrentParticles", checked)}
              />
              <ToggleControl
                id="lr-mfield"
                label="Show Inductor Magnetic Field"
                checked={state.showMagField}
                onChange={(checked) => update("showMagField", checked)}
              />
              <ToggleControl
                id="lr-labels"
                label="Show Initial/Long-Time Labels"
                checked={state.showLabels}
                onChange={(checked) => update("showLabels", checked)}
              />
              <ToggleControl
                id="lr-voltage-split"
                label="Show Voltage Split"
                checked={state.showVoltageSplit}
                onChange={(checked) => update("showVoltageSplit", checked)}
              />
            </div>

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
                  setTime(maxTime);
                  update("playing", false);
                }}
                className="rounded-xl border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm text-slate-100"
              >
                Jump Long t
              </button>
            </div>
          </div>

          <FormulaCard
            title="Current Rise"
            equation={String.raw`I(t)=\frac{V}{R}\left(1-e^{-Rt/L}\right)`}
            definitions={[
              { symbol: String.raw`V`, meaning: "battery voltage", unit: "V" },
              { symbol: String.raw`R`, meaning: "resistance", unit: "Ω" },
              { symbol: String.raw`L`, meaning: "inductance", unit: "H" },
            ]}
            physicalMeaning="Current starts at zero and asymptotically approaches V/R as the inductor's opposition weakens."
          />

          <FormulaCard
            title="Current Decay and Time Constant"
            equation={String.raw`I(t)=I_0e^{-Rt/L},\quad \tau=\frac{L}{R}`}
            definitions={[
              { symbol: String.raw`I_0`, meaning: "initial current", unit: "A" },
              { symbol: String.raw`\tau`, meaning: "LR time constant", unit: "s" },
            ]}
            physicalMeaning="During decay, current falls exponentially; τ sets the response speed."
          />

          <FormulaCard
            title="Voltages and Energy"
            equation={String.raw`V_R=IR,\;V_L=L\frac{dI}{dt},\;U_L=\frac{1}{2}LI^2`}
            definitions={[
              { symbol: String.raw`V_R`, meaning: "resistor voltage", unit: "V" },
              { symbol: String.raw`V_L`, meaning: "inductor voltage", unit: "V" },
              { symbol: String.raw`U_L`, meaning: "magnetic energy", unit: "J" },
            ]}
            physicalMeaning="Voltage shifts from the inductor to the resistor over time while magnetic energy builds or dissipates."
          />

          <WhatChangedCard text={whatChanged} />
          <RelationshipSummaryCard
            summary={relationshipSummary}
            constants={[
              { label: "V", value: `${formatNumber(state.V, 1)} V` },
              { label: "R", value: `${formatNumber(state.R, 1)} Ω` },
              { label: "L", value: `${formatNumber(state.L, 2)} H` },
              { label: "τ", value: `${formatNumber(tau, 3)} s` },
            ]}
          />
          <CommonMistakeCard text="Common mistake: larger resistance does not always mean slower LR response. In an LR circuit, τ = L/R, so increasing R decreases the time constant while also decreasing final current." />
          <ModelAssumptionsCard assumptions={defaultModelAssumptions} />
        </div>
      }
      bottom={
        <div className="grid gap-4 xl:grid-cols-2">
          <GraphPanel title="Current vs Time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData} margin={{ top: 8, right: 12, left: 8, bottom: 10 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={[0, maxTime]}
                  stroke="#94a3b8"
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  label={{ value: "t (s)", fill: "#e2e8f0", position: "insideBottom", offset: -2 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  label={{ value: "I (A)", fill: "#e2e8f0", angle: -90, position: "insideLeft" }}
                />
                <RechartsTooltip
                  formatter={(value) => [`${formatNumber(Number(value), 3)} A`, "Current"]}
                  labelFormatter={(label) => `t = ${formatNumber(Number(label), 2)} s`}
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    color: "#e2e8f0",
                  }}
                />
                <ReferenceLine x={time} stroke="#e2e8f0" strokeDasharray="4 4" />
                <Line dataKey="I" type="monotone" stroke="#22d3ee" dot={false} strokeWidth={2.3} />
              </LineChart>
            </ResponsiveContainer>
          </GraphPanel>

          <GraphPanel title="Inductor Voltage vs Time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData} margin={{ top: 8, right: 12, left: 8, bottom: 10 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={[0, maxTime]}
                  stroke="#94a3b8"
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  label={{ value: "t (s)", fill: "#e2e8f0", position: "insideBottom", offset: -2 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  label={{ value: "V_L (V)", fill: "#e2e8f0", angle: -90, position: "insideLeft" }}
                />
                <RechartsTooltip
                  formatter={(value) => [`${formatNumber(Number(value), 3)} V`, "Inductor Voltage"]}
                  labelFormatter={(label) => `t = ${formatNumber(Number(label), 2)} s`}
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    color: "#e2e8f0",
                  }}
                />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />
                <ReferenceLine x={time} stroke="#e2e8f0" strokeDasharray="4 4" />
                <Line dataKey="VL" type="monotone" stroke="#93c5fd" dot={false} strokeWidth={2.3} />
              </LineChart>
            </ResponsiveContainer>
          </GraphPanel>

          <GraphPanel title="Resistor Voltage vs Time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData} margin={{ top: 8, right: 12, left: 8, bottom: 10 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={[0, maxTime]}
                  stroke="#94a3b8"
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  label={{ value: "t (s)", fill: "#e2e8f0", position: "insideBottom", offset: -2 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  label={{ value: "V_R (V)", fill: "#e2e8f0", angle: -90, position: "insideLeft" }}
                />
                <RechartsTooltip
                  formatter={(value) => [`${formatNumber(Number(value), 3)} V`, "Resistor Voltage"]}
                  labelFormatter={(label) => `t = ${formatNumber(Number(label), 2)} s`}
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    color: "#e2e8f0",
                  }}
                />
                <ReferenceLine x={time} stroke="#e2e8f0" strokeDasharray="4 4" />
                <Line dataKey="VR" type="monotone" stroke="#fb7185" dot={false} strokeWidth={2.3} />
              </LineChart>
            </ResponsiveContainer>
          </GraphPanel>

          <GraphPanel title="Magnetic Energy vs Time">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={graphData} margin={{ top: 8, right: 12, left: 8, bottom: 10 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={[0, maxTime]}
                  stroke="#94a3b8"
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  label={{ value: "t (s)", fill: "#e2e8f0", position: "insideBottom", offset: -2 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#cbd5e1", fontSize: 12 }}
                  label={{ value: "U_L (J)", fill: "#e2e8f0", angle: -90, position: "insideLeft" }}
                />
                <RechartsTooltip
                  formatter={(value) => [`${formatNumber(Number(value), 3)} J`, "Magnetic Energy"]}
                  labelFormatter={(label) => `t = ${formatNumber(Number(label), 2)} s`}
                  contentStyle={{
                    background: "#020617",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    color: "#e2e8f0",
                  }}
                />
                <ReferenceLine x={time} stroke="#e2e8f0" strokeDasharray="4 4" />
                <Line dataKey="U" type="monotone" stroke="#34d399" dot={false} strokeWidth={2.3} />
              </LineChart>
            </ResponsiveContainer>
          </GraphPanel>
        </div>
      }
    />
  );
}
