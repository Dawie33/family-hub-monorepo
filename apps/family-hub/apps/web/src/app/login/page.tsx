'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

type Tab = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);

  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await signIn(email, password);
    if (err) {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { userId, error: err } = await signUp(email, password);
    if (err || !userId) {
      setError(err ?? "Erreur lors de l'inscription.");
      setLoading(false);
      return;
    }
    router.push(`/setup?userId=${userId}&name=${encodeURIComponent(name)}`);
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
            Family<span style={{ color: '#FFE100' }}>Hub</span>
          </h1>
          <p className="text-white/70 text-sm mt-1">Votre hub familial</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {/* Onglets */}
          <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
            {(['login', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: tab === t ? '#4784EC' : 'transparent',
                  color: tab === t ? '#fff' : '#585858',
                }}
              >
                {t === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.com" />
              <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              {error && <ErrorBox message={error} />}
              <SubmitButton loading={loading} label="Se connecter" />
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <Input label="Votre prénom" type="text" value={name} onChange={setName} placeholder="Dawie" />
              <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.com" />
              <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="8 caractères minimum" minLength={6} />
              {error && <ErrorBox message={error} />}
              <SubmitButton loading={loading} label="Créer mon compte" />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, type, value, onChange, placeholder, minLength }: {
  label: string; type: string; value: string;
  onChange: (v: string) => void; placeholder: string; minLength?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: '#585858' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        minLength={minLength}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 transition-colors"
        style={{ color: '#32325D' }}
      />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{message}</p>;
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 mt-2"
      style={{ backgroundColor: '#4784EC' }}
    >
      {loading ? '...' : label}
    </button>
  );
}
