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
          className="text-xl font-semibold text-center mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Map this connection
        </h2>
        <p className="text-xs opacity-40 text-center mb-6">
          How does this relationship show up for you?
        </p>

        <div className="space-y-5 mb-8">
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
              style={{ background: 'rgba(197,163,207,0.15)' }}
            >
              {'\u{1F446}'}
            </div>
            <div>
              <p className="text-sm font-medium mb-0.5">Tap</p>
              <p className="text-xs opacity-50 leading-relaxed">See what each item means</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
              style={{ background: 'rgba(244,168,154,0.15)' }}
            >
              {'\u{1F44B}'}
            </div>
            <div>
              <p className="text-sm font-medium mb-0.5">Drag to an edge</p>
              <p className="text-xs opacity-50 leading-relaxed">Sort each item into a tier based on this specific connection</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(137,207,240,0.15)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium mb-0.5">Undo</p>
              <p className="text-xs opacity-50 leading-relaxed">Tap the undo button to bring back the last sorted item</p>
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
