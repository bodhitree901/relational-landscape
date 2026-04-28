'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Connection, CategoryRatings, SubcategoryRating, Tier, Category } from '../../lib/types';
import { getConnection, saveConnection, getCategoriesWithCustom, addCustomSubcategory } from '../../lib/storage';
import ColorPicker from '../../components/ColorPicker';
import ChipPool, { ChipRating } from '../../components/ChipPool';
import { CONNECTION_TIERS } from '../../lib/tier-configs';
import InstructionOverlay from '../../components/InstructionOverlay';

type Step = 'name' | 'instructions' | 'category';

export default function EditConnection() {
  const params = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [step, setStep] = useState<Step>('name');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#C5A3CF');
  const [categoryRatings, setCategoryRatings] = useState<CategoryRatings[]>([]);

  useEffect(() => {
    // Tones first in Edit Connection — sets relational tone before logistics
    const allCats = getCategoriesWithCustom();
    const tonesCat = allCats.find((c) => c.id === 'tones');
    setCategories(tonesCat ? [tonesCat, ...allCats.filter((c) => c.id !== 'tones')] : allCats);
    const c = getConnection(params.id as string);
    if (c) {
      setConnection(c);
      setName(c.name);
      setColor(c.color || c.emoji || '#C5A3CF');
      setCategoryRatings(c.categories);
    } else {
      router.push('/');
    }
  }, [params.id, router]);

  if (!connection || categories.length === 0) return null;

  const totalSteps = categories.length + 1;

  const handleNameSubmit = () => {
    if (!name.trim()) return;
    setStep('instructions');
  };

  const handleCategoryComplete = (chipRatings: ChipRating[]) => {
    const cat = categories[categoryIndex];

    // Convert ChipRating[] to SubcategoryRating[]
    const ratings: SubcategoryRating[] = chipRatings.map((r) => ({
      subcategory: r.item,
      tier: r.tierId as Tier,
    }));

    const defaults = new Set(cat.subcategories);
    ratings.forEach((r) => {
      if (!defaults.has(r.subcategory)) {
        addCustomSubcategory(cat.id, r.subcategory);
      }
    });

    const updatedRatings = categoryRatings.filter((c) => c.categoryId !== cat.id);
    if (ratings.length > 0) {
      updatedRatings.push({ categoryId: cat.id, ratings });
    }
    setCategoryRatings(updatedRatings);

    if (categoryIndex < categories.length - 1) {
      setCategoryIndex(categoryIndex + 1);
    } else {
      // Save
      const updated: Connection = {
        ...connection,
        name: name.trim(),
        emoji: color,
        color: color,
        categories: updatedRatings,
      };
      saveConnection(updated);
      router.push(`/connection/${connection.id}`);
    }
  };

  if (step === 'name') {
    return (
      <div className="page-enter flex flex-col min-h-dvh">
        <div className="px-5 pt-5 pb-3">
          <button onClick={() => router.back()} className="text-sm opacity-60 hover:opacity-100 transition-opacity">
            &larr; Back
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <h1 className="text-2xl font-semibold mb-8 text-center">Edit Connection</h1>
          <ColorPicker value={color} onChange={setColor} />
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
            style={{ background: color }}
          >
            Continue Editing
          </button>
        </div>
      </div>
    );
  }

  if (step === 'instructions') {
    return (
      <div className="min-h-dvh flex flex-col">
        <InstructionOverlay onDismiss={() => { setStep('category'); setCategoryIndex(0); }} />
      </div>
    );
  }

  if (step === 'category') {
    const cat = categories[categoryIndex];
    const existingRatings = categoryRatings.find((c) => c.categoryId === cat.id)?.ratings || [];
    const initialChipRatings: ChipRating[] = existingRatings.map((r) => ({
      item: r.subcategory,
      tierId: r.tier,
    }));
    return (
      <div className="min-h-dvh flex flex-col">
        <ChipPool
          key={cat.id}
          items={cat.subcategories}
          categoryColor={cat.color}
          tiers={CONNECTION_TIERS}
          initialRatings={initialChipRatings}
          onComplete={handleCategoryComplete}
          onBack={() => {
            if (categoryIndex > 0) setCategoryIndex(categoryIndex - 1);
            else setStep('name');
          }}
          categoryName={cat.name}
          stepNumber={categoryIndex + 2}
          totalSteps={totalSteps}
        />
      </div>
    );
  }

  return null;
}
