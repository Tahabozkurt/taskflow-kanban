'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const response =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    if (mode === 'signup' && !response.data.session) {
      setMessage('Hesap oluşturuldu. Supabase e-posta doğrulaması açıksa gelen kutunu kontrol et.');
      return;
    }

    router.push('/boards');
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-[2rem] bg-white/85 p-8 shadow-soft ring-1 ring-slate-200 backdrop-blur">
        <Link href="/" className="text-sm font-semibold text-indigo-600">← TaskFlow</Link>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
          {mode === 'login' ? 'Giriş yap' : 'Hesap oluştur'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Kimlik doğrulama Supabase Auth ile çalışır. Vercel ortam değişkenleri eklendiğinde canlıda da aynı akış kullanılır.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-semibold text-slate-700">
            E-posta
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Şifre
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {message && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{message}</p>}

          <button
            className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'İşleniyor...' : mode === 'login' ? 'Giriş yap' : 'Hesap oluştur'}
          </button>
        </form>

        <button
          className="mt-5 text-sm font-semibold text-indigo-700"
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'Hesabın yok mu? Hesap oluştur' : 'Zaten hesabın var mı? Giriş yap'}
        </button>
      </section>
    </main>
  );
}
