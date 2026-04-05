'use client';

import { useState } from 'react';

const COLOR_OPTIONS = [
  // Warm
  '#F4A89A', '#E8796A', '#D4594D', '#F2B5B5', '#F5C7A9',
  // Gold / Yellow
  '#F5D06E', '#E8C547', '#D4A843', '#F0E0A0', '#C4A030',
  // Green / Sage
  '#A8C5A0', '#7BAF6E', '#5A9A4E', '#B8D4A8', '#6B8F5E',
  // Blue
  '#89CFF0', '#6BB5E0', '#4A9AC7', '#A0D4F0', '#3D8AB5',
  // Lavender / Purple
  '#C5A3CF', '#B08ABF', '#9A70AF', '#B8A9D4', '#8E6BA8',
  // Rose / Pink
  '#E8A0B0', '#D4809A', '#C06080', '#F0B8C8', '#B85878',
  // Earth / Warm neutrals
  '#C4A882', '#B09070', '#9A7860', '#D4B898', '#8A6A50',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedColor = value || '#C5A3CF';

  return (
    <div className="relative flex flex-col items-center">
      <button
        type="button"
        className="w-16 h-16 rounded-full transition-all hover:scale-105 active:scale-95"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${selectedColor}CC, ${selectedColor})`,
          boxShadow: `0 4px 20px ${selectedColor}40, inset 0 -2px 6px ${selectedColor}60`,
          border: '3px solid rgba(255,255,255,0.6)',
        }}
        onClick={() => setOpen(!open)}
      />
      {!open && (
        <p className="text-[10px] opacity-30 mt-1.5">tap to change</p>
      )}
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full mt-3 bg-white rounded-2xl shadow-xl p-4 animate-tooltip">
            <div className="grid grid-cols-7 gap-2.5 w-72">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-8 h-8 rounded-full transition-all hover:scale-110 active:scale-95"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${color}CC, ${color})`,
                    boxShadow: value === color ? `0 0 0 2.5px white, 0 0 0 4px ${color}` : `0 2px 6px ${color}30`,
                  }}
                  onClick={() => {
                    onChange(color);
                    setOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Reusable circle component for displaying a connection's color
export function ConnectionCircle({ color, size = 40 }: { color: string; size?: number }) {
  const c = color || '#C5A3CF';
  return (
    <div
      className="rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 35%, ${c}CC, ${c})`,
        boxShadow: `0 2px 12px ${c}30, inset 0 -2px 4px ${c}50`,
        border: '2px solid rgba(255,255,255,0.5)',
      }}
    />
  );
}
