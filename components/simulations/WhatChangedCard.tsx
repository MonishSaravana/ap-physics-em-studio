type WhatChangedCardProps = {
  text: string;
};

export function WhatChangedCard({ text }: WhatChangedCardProps) {
  return (
    <section className="rounded-2xl border border-sky-400/20 bg-sky-950/25 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-200">
        What Changed?
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-100">{text}</p>
    </section>
  );
}
