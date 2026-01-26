// components/decision-memo/BlindSpotCard.tsx
// Individual blind spot card component

"use client";

export function BlindSpotCard({
  number,
  title,
  description,
  preventedLoss,
}: {
  number: number;
  title: string;
  description: string;
  preventedLoss: number;
}) {
  return (
    <div className="bg-card border-2 border-amber-500/30 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
          {number}
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-bold mb-3">{title}</h4>
          <p className="text-base leading-relaxed text-muted-foreground mb-4">
            {description}
          </p>
          <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500 rounded-lg">
            <span className="text-green-500 font-semibold">
              PREVENTED LOSS: ${preventedLoss.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
