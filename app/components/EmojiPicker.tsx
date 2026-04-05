'use client';

import { useState } from 'react';

const EMOJI_OPTIONS = [
  '💛', '💜', '💙', '🧡', '💚', '❤️', '🩷', '🤍',
  '🌸', '🌊', '🌿', '🔥', '⭐', '🌙', '☀️', '🦋',
  '🌺', '🍃', '🫧', '✨', '🌻', '🪷', '🎭', '🎨',
  '🏔️', '🌈', '🕊️', '🐚', '🧿', '🪻', '🌾', '💫',
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="emoji-btn"
        onClick={() => setOpen(!open)}
      >
        {value || '➕'}
      </button>
      {open && (
        <div className="absolute z-10 top-full mt-2 left-0 bg-white rounded-2xl shadow-lg p-3 grid grid-cols-8 gap-1 w-72">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/5 text-lg transition-colors"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
