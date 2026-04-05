'use client';

import { useState } from 'react';
import { TimeRhythm } from '../lib/types';
import { COMMUNICATION_OPTIONS, IN_PERSON_OPTIONS } from '../lib/categories';

interface TimeRhythmStepProps {
  initialData: TimeRhythm;
  onComplete: (data: TimeRhythm) => void;
  onBack: () => void;
  stepNumber: number;
  totalSteps: number;
}

export default function TimeRhythmStep({
  initialData,
  onComplete,
  onBack,
  stepNumber,
  totalSteps,
}: TimeRhythmStepProps) {
  const [communication, setCommunication] = useState<string[]>(initialData.communication);
  const [inPerson, setInPerson] = useState<string[]>(initialData.inPerson);
  const [custom, setCustom] = useState<string[]>(initialData.custom);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customText, setCustomText] = useState('');

  const toggleOption = (
    option: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    if (list.includes(option)) {
      setList(list.filter((o) => o !== option));
    } else {
      setList([...list, option]);
    }
  };

  const addCustomOption = () => {
    const trimmed = customText.trim();
    if (trimmed && !custom.includes(trimmed)) {
      setCustom([...custom, trimmed]);
      setCustomText('');
      setAddingCustom(false);
    }
  };

  return (
    <div className="page-enter flex flex-col min-h-full">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            &larr; Back
          </button>
          <span className="text-xs opacity-50">{stepNumber} / {totalSteps}</span>
          <div className="w-12" />
        </div>
        <div className="progress-bar mb-4">
          <div
            className="progress-fill"
            style={{
              width: `${(stepNumber / totalSteps) * 100}%`,
              background: 'var(--sage)',
            }}
          />
        </div>
        <h2 className="text-xl font-semibold mb-1">Time & Rhythm</h2>
        <p className="text-sm opacity-60">How do you spend time together?</p>
      </div>

      <div className="flex-1 px-5 space-y-6 pb-4">
        {/* Communication */}
        <div>
          <p className="text-sm font-medium mb-3 opacity-70">Communication</p>
          <div className="flex flex-wrap gap-2">
            {COMMUNICATION_OPTIONS.map((opt) => (
              <button
                key={opt}
                className={`chip ${communication.includes(opt) ? 'chip-selected' : ''}`}
                style={{
                  background: communication.includes(opt) ? 'rgba(168, 197, 160, 0.25)' : 'rgba(168, 197, 160, 0.1)',
                  borderColor: communication.includes(opt) ? 'var(--sage)' : 'transparent',
                }}
                onClick={() => toggleOption(opt, communication, setCommunication)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* In Person */}
        <div>
          <p className="text-sm font-medium mb-3 opacity-70">In Person</p>
          <div className="flex flex-wrap gap-2">
            {IN_PERSON_OPTIONS.map((opt) => (
              <button
                key={opt}
                className={`chip ${inPerson.includes(opt) ? 'chip-selected' : ''}`}
                style={{
                  background: inPerson.includes(opt) ? 'rgba(168, 197, 160, 0.25)' : 'rgba(168, 197, 160, 0.1)',
                  borderColor: inPerson.includes(opt) ? 'var(--sage)' : 'transparent',
                }}
                onClick={() => toggleOption(opt, inPerson, setInPerson)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Custom */}
        <div>
          <p className="text-sm font-medium mb-3 opacity-70">Custom Rhythms</p>
          <div className="flex flex-wrap gap-2">
            {custom.map((opt) => (
              <button
                key={opt}
                className="chip chip-selected"
                style={{
                  background: 'rgba(168, 197, 160, 0.25)',
                  borderColor: 'var(--sage)',
                }}
                onClick={() => setCustom(custom.filter((c) => c !== opt))}
              >
                {opt}
                <span className="ml-1 opacity-40 text-xs">&times;</span>
              </button>
            ))}
            {!addingCustom ? (
              <button
                onClick={() => setAddingCustom(true)}
                className="chip"
                style={{ background: 'rgba(168, 197, 160, 0.1)' }}
              >
                + Add custom
              </button>
            ) : (
              <div className="flex gap-2 w-full mt-1">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomOption()}
                  placeholder="e.g., Monthly game night..."
                  className="flex-1 px-3 py-2 rounded-xl bg-white/60 border border-black/10 text-sm outline-none focus:border-black/20"
                  autoFocus
                />
                <button
                  onClick={addCustomOption}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-sage text-white"
                  style={{ background: 'var(--sage)' }}
                >
                  Add
                </button>
                <button
                  onClick={() => { setAddingCustom(false); setCustomText(''); }}
                  className="px-3 py-2 rounded-xl text-sm opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 pt-2">
        <button
          onClick={() => onComplete({ communication, inPerson, custom })}
          className="w-full py-3 rounded-2xl text-white font-medium text-base transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'var(--sage)' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
