type TimeTransportControlsProps = {
  playing: boolean;
  stepSeconds: number;
  onTogglePlaying: () => void;
  onStepSecondsChange: (value: number) => void;
  onStep: (deltaSeconds: number) => void;
  onReset: () => void;
};

const stepOptions = [
  { label: "50 ms", value: 0.05 },
  { label: "100 ms", value: 0.1 },
  { label: "250 ms", value: 0.25 },
  { label: "500 ms", value: 0.5 },
  { label: "1 s", value: 1 },
  { label: "2 s", value: 2 },
];

export function TimeTransportControls({
  playing,
  stepSeconds,
  onTogglePlaying,
  onStepSecondsChange,
  onStep,
  onReset,
}: TimeTransportControlsProps) {
  return (
    <div className="grid gap-2 border border-slate-700/70 bg-slate-950/50 p-2 text-xs text-slate-200 sm:grid-cols-[auto_auto_auto_1fr_auto] sm:items-center">
      <button
        type="button"
        onClick={onTogglePlaying}
        className="border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-cyan-100"
      >
        {playing ? "Pause" : "Play"}
      </button>
      <button
        type="button"
        onClick={() => onStep(-stepSeconds)}
        className="border border-slate-600 bg-slate-800/60 px-3 py-1.5 text-slate-100"
      >
        Back
      </button>
      <button
        type="button"
        onClick={() => onStep(stepSeconds)}
        className="border border-slate-600 bg-slate-800/60 px-3 py-1.5 text-slate-100"
      >
        Forward
      </button>
      <label className="flex items-center gap-2">
        <span className="text-slate-300">Step size</span>
        <select
          value={stepSeconds}
          onChange={(event) => onStepSecondsChange(Number(event.target.value))}
          className="border border-slate-600 bg-slate-950 px-2 py-1 text-xs text-slate-100"
        >
          {stepOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={onReset}
        className="border border-slate-600 bg-slate-800/60 px-3 py-1.5 text-slate-100"
      >
        Reset
      </button>
    </div>
  );
}
