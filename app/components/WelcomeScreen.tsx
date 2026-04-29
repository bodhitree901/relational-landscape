'use client';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-8 py-12">
      <div
        className="w-full max-w-sm rounded-3xl p-8"
        style={{
          background: 'white',
          boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
          border: '2px solid rgba(255,255,255,0.8)',
        }}
      >
        <h1
          className="text-2xl font-semibold text-center mb-6"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Welcome
        </h1>

        <div className="space-y-4 mb-8 text-sm leading-relaxed" style={{ color: 'rgba(0,0,0,0.6)' }}>
          <p>
            If you're here, it's probably because you care — about yourself, about the people in your life, and about the quality of the connections between you.
          </p>
          <p>
            Relationships are one of the most beautiful and complex parts of being human. So much of how we show up in them was shaped long before we had a say — by the families we grew up in, the cultures we were part of, the stories we absorbed about what love and connection are supposed to look like.
          </p>
          <p>
            This app was created on the basis that relationships thrive when people have a choice in how they relate and can consent fully. Imagine how unique and amazing every individual is — doesn't it make sense that each relationship would have that same uniqueness, and that how we relate with each person would be unique between us? Now is your time to slow down and get real with yourself about what you actually want, need, and feel — both in specific relationships and across your life as a whole.
          </p>
          <p>
            We've done our best to name and make visible the many small, often unspoken aspects of relationship — so you can meet them with fresh eyes and real honesty. A big shout out goes to the Relationship Anarchy Smorgasbord and the Relationship Menu — two beautiful tools that help people discover their true yes's and no's across every dimension of connection.
          </p>
          <p>
            Think of this as a starting point, to open up conversations. You will most obviously continue to evolve in your relationship to relationship as you grow and learn in your life!
          </p>
          <p className="font-medium" style={{ color: 'rgba(0,0,0,0.75)' }}>
            May your journey begin well.
          </p>
          <p
            className="text-center font-semibold text-base pt-1"
            style={{ fontFamily: 'Georgia, serif', color: 'rgba(0,0,0,0.55)' }}
          >
            Happy Mapping! 🗺️
          </p>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3 rounded-2xl text-white font-medium text-base transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, var(--peach), var(--lavender))' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
