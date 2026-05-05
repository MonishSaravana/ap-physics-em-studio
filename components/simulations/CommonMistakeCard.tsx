type CommonMistakeCardProps = {
  text: string;
};

export function CommonMistakeCard({ text }: CommonMistakeCardProps) {
  return (
    <section className="sim-inline-panel border-amber-300/30 bg-amber-950/18 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">
        Common Mistake
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-amber-50/90">{text}</p>
    </section>
  );
}
