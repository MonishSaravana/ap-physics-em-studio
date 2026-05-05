"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
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
import { degToRad, formatNumber } from "@/lib/format";

type FluxState = {
  B: number;
  A: number;
  theta: number;
  N: number;
  showAreaVector: boolean;
  showFieldLines: boolean;
  showAngleArc: boolean;
  showFluxCalc: boolean;
};

const defaults: FluxState = {
  B: 2.4,
  A: 1.2,
  theta: 45,
  N: 100,
  showAreaVector: true,
  showFieldLines: true,
  showAngleArc: true,
  showFluxCalc: true,
};

export function MagneticFluxLab() {
  const [state, setState] = useState<FluxState>(defaults);
  const [lastChanged, setLastChanged] = useState<keyof FluxState>("theta");

  const thetaRad = degToRad(state.theta);
  const flux = state.B * state.A * Math.cos(thetaRad);
  const linkage = state.N * flux;

  const chartData = useMemo(
    () =>
      Array.from({ length: 181 }, (_, angle) => ({
        angle,
        flux: state.B * state.A * Math.cos(degToRad(angle)),
      })),
    [state.B, state.A]
  );

  const update = (key: keyof FluxState, value: number | boolean) => {
    setState((previous) => ({ ...previous, [key]: value }));
    setLastChanged(key);
  };

  const whatChanged =
    lastChanged === "B"
      ? "Increasing B increases magnetic flux linearly because \\Phi_B is proportional to field strength."
      : lastChanged === "A"
      ? "Increasing area increases the amount of magnetic field passing through the loop, so flux rises linearly."
      : lastChanged === "theta"
      ? "As θ approaches 90°, the field becomes parallel to the loop surface, so flux approaches zero."
      : lastChanged === "N"
      ? "Changing N does not change single-loop flux, but it scales flux linkage N\\Phi_B, which affects induced emf."
      : "Toggles change what representation is visible while the underlying flux relationship remains the same.";

  const relationshipSummary =
    lastChanged === "theta"
      ? "Flux follows cosine dependence on angle: \\Phi_B = BA\\cos\\theta."
      : lastChanged === "N"
      ? "Flux linkage is linear in turns: N\\Phi_B = N(BA\\cos\\theta)."
      : "Flux is linear in both magnetic field strength and area.";

  const areaScale = 0.45 + 0.55 * Math.sqrt(state.A / 5);
  const baseWidth = 260 * areaScale;
  const baseHeight = 120 * areaScale;
  const projectedWidth = Math.max(30, baseWidth * Math.abs(Math.cos(thetaRad)));
  const shear = (baseWidth * Math.sin(thetaRad)) / 6;
  const centerX = 300;
  const centerY = 180;

  const vectorLength = 95;
  const vectorX = centerX + vectorLength * Math.cos(thetaRad);
  const vectorY = centerY - vectorLength * Math.sin(thetaRad);

  const fieldArrowCount = Math.round(6 + state.B * 4);

  return (
    <SimulationLayout
      title="Magnetic Flux Lab"
      description="Manipulate B, A, θ, and turns N to see flux, flux linkage, geometry, and cosine graph behavior update together."
      visual={
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <p className="inline-flex items-center gap-1.5">
              Magnetic flux <Tooltip text="Magnetic flux measures how much magnetic field passes through a surface." />
            </p>
            <p className="font-mono text-cyan-300">
              Φ<sub>B</sub> = {formatNumber(flux, 3)} Wb
            </p>
          </div>
          <svg viewBox="0 0 600 360" className="h-[340px] w-full rounded-xl bg-slate-950/70">
            <defs>
              <marker
                id="flux-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#22d3ee" />
              </marker>
              <linearGradient id="field-glow" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            {state.showFieldLines
              ? Array.from({ length: fieldArrowCount }, (_, index) => {
                  const y = 45 + (index * 270) / Math.max(1, fieldArrowCount - 1);
                  return (
                    <g key={`field-${index}`} opacity={0.4 + state.B / 9}>
                      <line
                        x1={50}
                        y1={y}
                        x2={550}
                        y2={y}
                        stroke="url(#field-glow)"
                        strokeWidth={1.5 + state.B / 4}
                        markerEnd="url(#flux-arrow)"
                      />
                    </g>
                  );
                })
              : null}

            <polygon
              points={`${centerX - projectedWidth / 2},${centerY - baseHeight / 2 - shear} ${
                centerX + projectedWidth / 2
              },${centerY - baseHeight / 2 + shear} ${centerX + projectedWidth / 2},${
                centerY + baseHeight / 2 + shear
              } ${centerX - projectedWidth / 2},${centerY + baseHeight / 2 - shear}`}
              fill="rgba(56, 189, 248, 0.12)"
              stroke="rgba(125, 211, 252, 0.9)"
              strokeWidth={2.5}
            />

            {state.showAreaVector ? (
              <g>
                <line
                  x1={centerX}
                  y1={centerY}
                  x2={vectorX}
                  y2={vectorY}
                  stroke="#f8fafc"
                  strokeWidth="2.2"
                  markerEnd="url(#flux-arrow)"
                />
                <text x={vectorX + 8} y={vectorY - 6} fill="#f8fafc" fontSize="13">
                  A⃗
                </text>
              </g>
            ) : null}

            {state.showAngleArc ? (
              <g>
                <path
                  d={`M ${centerX + 52} ${centerY} A 52 52 0 ${state.theta > 180 ? 1 : 0} 0 ${
                    centerX + 52 * Math.cos(thetaRad)
                  } ${centerY - 52 * Math.sin(thetaRad)}`}
                  stroke="#a5b4fc"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.9"
                />
                <text x={centerX + 64} y={centerY - 20} fill="#c4b5fd" fontSize="13">
                  θ = {formatNumber(state.theta, 0)}°
                </text>
              </g>
            ) : null}

            <text x="34" y="28" fill="#cbd5e1" fontSize="13">
              B field →
            </text>

            {state.showFluxCalc ? (
              <text x="20" y="335" fill="#7dd3fc" fontSize="14" fontFamily="monospace">
                Φ_B = BAcosθ = {formatNumber(state.B, 2)}×{formatNumber(state.A, 2)}×cos({formatNumber(
                  state.theta,
                  0
                )}°) = {formatNumber(flux, 3)} Wb
              </text>
            ) : null}
          </svg>
        </div>
      }
      sidebar={
        <div className="space-y-3">
          <CEDAlignmentCard alignment={cedAlignments.magneticFlux} />

          <div className="grid grid-cols-2 gap-2">
            <LiveValueCard label="Magnetic Field B" value={formatNumber(state.B)} unit="T" />
            <LiveValueCard label="Area A" value={formatNumber(state.A)} unit="m²" />
            <LiveValueCard label="Angle θ" value={formatNumber(state.theta, 0)} unit="°" />
            <LiveValueCard label="Flux Φ_B" value={formatNumber(flux, 3)} unit="Wb" />
            <LiveValueCard label="Flux Linkage" value={formatNumber(linkage, 2)} unit="Wb-turns" />
            <LiveValueCard label="Turns N" value={formatNumber(state.N, 0)} unit="turns" />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-3">
            <SliderControl
              id="flux-b"
              label="Magnetic Field B"
              tooltip="Field strength through the loop."
              value={state.B}
              min={0}
              max={5}
              step={0.05}
              unit="T"
              onChange={(value) => update("B", value)}
            />
            <SliderControl
              id="flux-a"
              label="Loop Area A"
              tooltip="Area enclosed by the loop."
              value={state.A}
              min={0.1}
              max={5}
              step={0.05}
              unit="m²"
              onChange={(value) => update("A", value)}
            />
            <SliderControl
              id="flux-theta"
              label="Angle θ"
              tooltip="Angle between magnetic field and area vector."
              value={state.theta}
              min={0}
              max={180}
              step={1}
              digits={0}
              unit="°"
              onChange={(value) => update("theta", value)}
            />
            <SliderControl
              id="flux-n"
              label="Turns N"
              tooltip="Number of coil turns."
              value={state.N}
              min={1}
              max={100}
              step={1}
              digits={0}
              unit="turns"
              onChange={(value) => update("N", value)}
            />

            <div className="grid gap-2">
              <ToggleControl
                id="flux-show-area"
                label="Show Area Vector"
                checked={state.showAreaVector}
                onChange={(checked) => update("showAreaVector", checked)}
              />
              <ToggleControl
                id="flux-show-field"
                label="Show Magnetic Field Lines"
                checked={state.showFieldLines}
                onChange={(checked) => update("showFieldLines", checked)}
              />
              <ToggleControl
                id="flux-show-angle"
                label="Show Angle Arc"
                checked={state.showAngleArc}
                onChange={(checked) => update("showAngleArc", checked)}
              />
              <ToggleControl
                id="flux-show-calc"
                label="Show Flux Calculation"
                checked={state.showFluxCalc}
                onChange={(checked) => update("showFluxCalc", checked)}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setState(defaults);
                setLastChanged("theta");
              }}
              className="w-full rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
            >
              Reset Module
            </button>
          </div>

          <FormulaCard
            title="Magnetic Flux"
            equation={String.raw`\Phi_B = BA\cos\theta`}
            definitions={[
              { symbol: String.raw`\Phi_B`, meaning: "magnetic flux", unit: "Wb" },
              { symbol: String.raw`B`, meaning: "magnetic field strength", unit: "T" },
              { symbol: String.raw`A`, meaning: "loop area", unit: "m²" },
              {
                symbol: String.raw`\theta`,
                meaning: "angle between B and area vector",
                unit: "degrees or radians",
              },
            ]}
            physicalMeaning="Magnetic flux measures how much magnetic field passes through a loop surface."
          />

          <FormulaCard
            title="Flux Linkage"
            equation={String.raw`N\Phi_B = NBA\cos\theta`}
            definitions={[
              { symbol: String.raw`N`, meaning: "number of turns", unit: "turns" },
              { symbol: String.raw`\Phi_B`, meaning: "flux per turn", unit: "Wb" },
            ]}
            physicalMeaning="For coils, linked flux scales linearly with number of turns and drives induction behavior."
          />

          <WhatChangedCard text={whatChanged} />
          <RelationshipSummaryCard
            summary={relationshipSummary}
            constants={[
              { label: "B", value: `${formatNumber(state.B)} T` },
              { label: "A", value: `${formatNumber(state.A)} m²` },
              { label: "θ", value: `${formatNumber(state.theta, 0)}°` },
              { label: "N", value: `${formatNumber(state.N, 0)}` },
            ]}
          />
          <CommonMistakeCard text="Common mistake: θ is not the angle between the magnetic field and the wire. It is the angle between the magnetic field and the area vector." />
          <ModelAssumptionsCard assumptions={defaultModelAssumptions} />
        </div>
      }
      bottom={
        <GraphPanel title="Magnetic Flux vs Angle">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 22, left: 8, bottom: 10 }}>
              <CartesianGrid stroke="#334155" strokeDasharray="4 4" />
              <XAxis
                type="number"
                dataKey="angle"
                domain={[0, 180]}
                ticks={[0, 30, 60, 90, 120, 150, 180]}
                stroke="#94a3b8"
                tick={{ fill: "#cbd5e1", fontSize: 12 }}
                label={{
                  value: "Angle θ (degrees)",
                  fill: "#e2e8f0",
                  offset: -2,
                  position: "insideBottom",
                }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#cbd5e1", fontSize: 12 }}
                label={{
                  value: "Magnetic Flux Φ_B (Wb)",
                  fill: "#e2e8f0",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <RechartsTooltip
                formatter={(value) => [`${formatNumber(Number(value), 3)} Wb`, "Flux"]}
                labelFormatter={(label) => `θ = ${label}°`}
                contentStyle={{
                  background: "#020617",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  color: "#e2e8f0",
                }}
              />
              <Line type="monotone" dataKey="flux" stroke="#22d3ee" strokeWidth={2.5} dot={false} />
              <ReferenceDot
                x={state.theta}
                y={flux}
                r={5}
                fill="#f8fafc"
                stroke="#0ea5e9"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </GraphPanel>
      }
    />
  );
}
