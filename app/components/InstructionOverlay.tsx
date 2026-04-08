'use client';

interface InstructionOverlayProps {
  onDismiss: () => void;
}

export default function InstructionOverlay({ onDismiss }: InstructionOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />

      {/* Card */}
      <div className="relative watercolor-card bg-[var(--background)] p-8 max-w-sm w-full animate-tooltip">
        <h2
          className="text-xl font-semibold text-center mb-6"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          How it works
        </h2>

        <div className="space-y-5 mb-8">
          {/* Tap */}
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
              style={{ background: 'rgba(197,163,207,0.15)' }}
            >
              {'\u{1F446}'}
            </div>
            <div>
              <p className="text-sm font-medium mb-0.5">Tap</p>
              <p className="text-xs opacity-50 leading-relaxed">See a description of what each item means</p>
            </div>
          </div>

          {/* Drag */}
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
              style={{ background: 'rgba(244,168,154,0.15)' }}
            >
              {'\u{1F44B}'}
            </div>
            <div>
              <p className="text-sm font-medium mb-0.5">Drag to an edge</p>
              <p className="text-xs opacity-50 leading-relaxed">Assign it to a tier &mdash; drag right, left, up, or down to sort it</p>
            </div>
          </div>

          {/* Undo */}
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(137,207,240,0.15)' }}
            >
              <span className="text-sm opacity-40">&times;</span>
            </div>
            <div>
              <p className="text-sm font-medium mb-0.5">Undo</p>
              <p className="text-xs opacity-50 leading-relaxed">Tap a sorted item below the pool to put it back</p>
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-2xl text-white font-medium text-base transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
