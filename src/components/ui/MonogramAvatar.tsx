export function MonogramAvatar({ letter, size = 64 }: { letter: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-badge bg-accent/10 border border-accent/30 text-accent font-heading font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {letter}
    </div>
  );
}
