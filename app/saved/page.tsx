import Link from 'next/link';
import SavedRecipesList from '@/components/SavedRecipesList';

export default function SavedPage() {
  return (
    <div className="space-y-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📚</span>
            <p className="text-sm font-bold text-mango uppercase tracking-wider">Collection</p>
          </div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-coral via-mango to-sunshine bg-clip-text text-transparent">
            Mes recettes
          </h1>
          <p className="text-stone-500 mt-1.5 text-sm">Vos recettes sauvegardées pour toute la famille.</p>
        </div>
        <Link
          href="/"
          className="shrink-0 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-coral to-mango text-white font-bold rounded-full transition-all hover:shadow-lg hover:shadow-coral/30 hover:-translate-y-0.5"
        >
          <span className="text-lg">✨</span>
          Nouvelle recette
        </Link>
      </div>

      <SavedRecipesList />
    </div>
  );
}
