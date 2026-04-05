'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function ReferencePage() {
  return (
    <div className="page-enter min-h-dvh pb-8">
      <div className="px-5 pt-5 pb-3">
        <Link href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
          &larr; Home
        </Link>
      </div>

      <div className="px-5 pt-2 pb-4">
        <h1 className="text-2xl font-semibold mb-1">Reference</h1>
        <p className="text-sm opacity-50">The original Relational Landscape map (Version 3)</p>
      </div>

      <div className="mx-5 watercolor-card bg-white/50 p-3 mb-6 overflow-auto">
        <Image
          src="/relational-landscape.png"
          alt="Our Relational Landscape - Version 3"
          width={1600}
          height={900}
          className="w-full h-auto rounded-xl"
          priority
        />
      </div>

      <div className="mx-5 space-y-4">
        <div className="watercolor-card watercolor-peach p-4">
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--peach)' }}>
            Physical Touch & Physical Intimacy
          </h3>
          <p className="text-xs opacity-60 leading-relaxed">
            Hand Buddies, Massage/Therapeutic Touch, Shared Cuddles, Sleeping Buddies, Dance Buddies,
            Hand Holding, Nudity, Sex and Eros, Sensual Interactions, Sexual Interactions
          </p>
        </div>

        <div className="watercolor-card watercolor-blue p-4">
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--blue)' }}>
            Life Structure / Logistics & Agreements
          </h3>
          <p className="text-xs opacity-60 leading-relaxed">
            Professional/Work, Co-Parents/Caregivers, Housemates/Domestic Living, Lending Money,
            Legal & Financial Bonds, Co-owning, Power of Attorney, Marriage/Civil Partnership,
            Shared Collaborations, Creative, Academic, Adoption, Shared Finances/Meal Sharing, Legal Processes
          </p>
        </div>

        <div className="watercolor-card watercolor-lavender p-4">
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--lavender)' }}>
            Emotional Connection
          </h3>
          <p className="text-xs opacity-60 leading-relaxed">
            Emotional Caregivers, Emotional Support (outside the relationship),
            Emotional Process Partners (within the relationship), Feeds Self Growth, Support Person
          </p>
        </div>

        <div className="watercolor-card watercolor-gold p-4">
          <h3 className="text-sm font-semibold mb-2" style={{ color: '#C4A030' }}>
            Social
          </h3>
          <p className="text-xs opacity-60 leading-relaxed">
            Common Interests, Intellectual Connection, Sense of Humor, Shared Play,
            Spiritual/Religious, Shared Causes/Politics, Shared Community, Shared Learning, Shared Adventure
          </p>
        </div>

        <div className="watercolor-card watercolor-rose p-4">
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--rose)' }}>
            Frames
          </h3>
          <p className="text-xs opacity-60 leading-relaxed">
            Friendship, Companionship, Romantic Love, Erotic, Attachment Figure, Therapeutic
          </p>
        </div>

        <div className="watercolor-card watercolor-purple p-4">
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--purple)' }}>
            Qualities
          </h3>
          <p className="text-xs opacity-60 leading-relaxed">
            Kink, Exclusivity, Hierarchy, Teacher & Student, Parent & Child, Facilitator & Participant
          </p>
        </div>
      </div>
    </div>
  );
}
