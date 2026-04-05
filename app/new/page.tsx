'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Connection, CategoryRatings, SubcategoryRating, TimeRhythm, Category } from '../lib/types';
import { getCategoriesWithCustom, addCustomSubcategory } from '../lib/storage';
import { saveConnection } from '../lib/storage';
import EmojiPicker from '../components/EmojiPicker';
import CategoryStep from '../components/CategoryStep';
import TimeRhythmStep from '../components/TimeRhythmStep';

type Step = 'name' | 'category' | 'time' | 'done';

export default function NewConnection() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState<Step>('name');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatings[]>([]);
  const [timeRhythm, setTimeRhythm] = useState<TimeRhythm>({
    communication: [],
    inPerson: [],
    custom: [],
  });

  useEffect(() => {
    setCategories(getCategoriesWithCustom());
  }, []);

  const totalSteps = categories.length + 2; // categories + time + name

  const handleNameSubmit = () => {
    if (!name.trim()) return;
    setStep('category');
    setCategoryIndex(0);
  };

  const handleCategoryComplete = (ratings: SubcategoryRating[]) => {
    const cat = categories[categoryIndex];

    // Persist any custom subcategories
    const defaults = new Set(cat.subcategories);
    ratings.forEach((r) => {
      if (!defaults.has(r.subcategory)) {
        addCustomSubcategory(cat.id, r.subcategory);
      }
    });

    setCategoryRatings((prev) => {
      const existing = prev.filter((c) => c.categoryId !== cat.id);
      if (ratings.length > 0) {
        return [...existing, { categoryId: cat.id, ratings }];
      }
      return existing;
    });

    if (categoryIndex < categories.length - 1) {
      setCategoryIndex(categoryIndex + 1);
    } else {
      setStep('time');
    }
  };

  const handleCategoryBack = () => {
    if (categoryIndex > 0) {
      setCategoryIndex(categoryIndex - 1);
    } else {
      setStep('name');
    }
  };

  const handleCategorySkip = () => {
    if (categoryIndex < categories.length - 1) {
      setCategoryIndex(categoryIndex + 1);
    } else {
      setStep('time');
    }
  };

  const handleTimeComplete = (data: TimeRhythm) => {
    setTimeRhythm(data);
    // Save the connection
    const connection: Connection = {
      id: crypto.randomUUID(),
      name: name.trim(),
      emoji: emoji || '💛',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      categories: categoryRatings,
      timeRhythm: data,
    };
    saveConnection(connection);
    router.push(`/connection/${connection.id}`);
  };

  if (categories.length === 0) return null;

  if (step === 'name') {
    return (
      <div className="page-enter flex flex-col min-h-dvh">
        <div className="px-5 pt-5 pb-3">
          <button onClick={() => router.push('/')} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            &larr; Home
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <h1 className="text-2xl font-semibold mb-8 text-center">New Connection</h1>
          <EmojiPicker value={emoji} onChange={setEmoji} />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            placeholder="Their name..."
            className="mt-6 w-full max-w-xs text-center text-xl bg-transparent border-b-2 border-black/10 focus:border-black/30 outline-none pb-2 placeholder:opacity-30 transition-colors"
            autoFocus
          />
          <button
            onClick={handleNameSubmit}
            disabled={!name.trim()}
            className="mt-8 px-8 py-3 rounded-2xl text-white font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-30"
            style={{ background: 'var(--peach)' }}
          >
            Begin Mapping
          </button>
        </div>
      </div>
    );
  }

  if (step === 'category') {
    const cat = categories[categoryIndex];
    const existingRatings = categoryRatings.find((c) => c.categoryId === cat.id)?.ratings || [];
    return (
      <div className="min-h-dvh flex flex-col">
        <CategoryStep
          key={cat.id}
          category={cat}
          initialRatings={existingRatings}
          onComplete={handleCategoryComplete}
          onBack={handleCategoryBack}
          onSkip={handleCategorySkip}
          stepNumber={categoryIndex + 2}
          totalSteps={totalSteps}
        />
      </div>
    );
  }

  if (step === 'time') {
    return (
      <div className="min-h-dvh flex flex-col">
        <TimeRhythmStep
          initialData={timeRhythm}
          onComplete={handleTimeComplete}
          onBack={() => {
            setCategoryIndex(categories.length - 1);
            setStep('category');
          }}
          stepNumber={totalSteps}
          totalSteps={totalSteps}
        />
      </div>
    );
  }

  return null;
}
