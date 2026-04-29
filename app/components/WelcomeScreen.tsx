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
            If you are here, it probably means that you care about yourself and the people that you relate to — and that you want to relate in a good way.
          </p>
          <p>
            Relationships are often riddled with unconscious behaviors, assumptions and concepts that were imprinted into us from our culture, society, religion and family.
          </p>
          <p>
            We believe that relationships thrive when there is clarity, transparency, mutual agreement and honesty. This tool was created to support you to find clarity both in regards to specific connections and in general.
          </p>
          <p>
            This app is heavily inspired by the Relationship Anarchy Smorgasbord and the Relationship Menu — two tools to support people in finding their true yes's and no's across all domains of relationship.
          </p>
          <p>
            We have done our best to identify and make explicit the many little aspects of relationship, so that you can see how you truly feel about them.
          </p>
          <p>
            This process is a great starting point to open up a conversation with those you are relating to — and your feelings will most definitely shift as you grow and evolve!
          </p>
          <p className="font-medium" style={{ color: 'rgba(0,0,0,0.75)' }}>
            We hope this app supports you to find clarity, honesty, and more thriving.
          </p>
          <p
            className="text-center font-semibold text-base pt-1"
            style={{ fontFamily: 'Georgia, serif', color: 'rgba(0,0,0,0.55)' }}
          >
            Happy Mapping!
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
