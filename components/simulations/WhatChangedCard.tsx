type WhatChangedCardProps = {
  text: string;
};

export function WhatChangedCard({ text }: WhatChangedCardProps) {
  return (
    <section className="sim-inline-panel border-sky-400/30 bg-sky-950/22 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-200">
        What Changed?
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-100">{text}</p>
    </section>
  );
}
