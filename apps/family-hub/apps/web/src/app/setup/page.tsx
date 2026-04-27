'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3003/api';

function SetupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get('userId') ?? '';
  const defaultName = params.get('name') ?? '';

  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/families`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: familyName, userId }),
      });

      if (!res.ok) throw new Error('Erreur lors de la création de la famille.');
      router.push('/');
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #4784EC 0%, #32325D 100%)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🏡</span>
          <h1 className="text-3xl font-bold text-white mt-3" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Bienvenue{defaultName ? `, ${defaultName}` : ''} !
          </h1>
          <p className="text-white/70 text-sm mt-1">Créons votre famille</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <p className="text-sm text-gray-500 mb-5">
            Donnez un nom à votre famille pour commencer à utiliser FamilyHub.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#585858' }}>
                Nom de la famille
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Ex: Famille Dupont"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-colors"
                style={{ color: '#32325D' }}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ backgroundColor: '#4784EC' }}
            >
              {loading ? 'Création...' : 'Créer ma famille'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense>
      <SetupForm />
    </Suspense>
  );
}
