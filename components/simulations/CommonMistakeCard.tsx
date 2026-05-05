type CommonMistakeCardProps = {
  text: string;
};

export function CommonMistakeCard({ text }: CommonMistakeCardProps) {
  return (
    <section className="rounded-2xl border border-amber-300/20 bg-amber-950/25 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-200">
        Common Mistake
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-amber-50/90">{text}</p>
    </section>
  );
}
