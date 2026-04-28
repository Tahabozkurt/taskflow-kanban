'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Trash2 ikonunu buraya ekledik
import { LogOut, Plus, Trash2 } from 'lucide-react'; 
import { supabase } from '@/lib/supabase';
import type { Board } from '@/lib/types';
import { POSITION_STEP } from '@/lib/order';

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void loadBoards();
  }, []);

  async function loadBoards() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push('/login');
      return;
    }

    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .eq('owner_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (!error) setBoards(data ?? []);
    setLoading(false);
  }

  async function createBoard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    setCreating(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return router.push('/login');

    const { data: board, error } = await supabase
      .from('boards')
      .insert({ title: title.trim(), owner_id: userData.user.id })
      .select('*')
      .single();

    if (!error && board) {
      await supabase.from('columns').insert([
        { board_id: board.id, title: 'Yapılacak', position: POSITION_STEP },
        { board_id: board.id, title: 'Devam Ediyor', position: POSITION_STEP * 2 },
        { board_id: board.id, title: 'Tamamlandı', position: POSITION_STEP * 3 }
      ]);
      setBoards([board, ...boards]);
      setTitle('');
    }

    setCreating(false);
  }

  // YENİ EKLENEN BOARD SİLME FONKSİYONU
  async function deleteBoard(boardId: string) {
    const confirmed = window.confirm("Bu board'u ve içindeki tüm verileri silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    // Arayüzden anında siliyoruz (Optimistic Update)
    setBoards((current) => current.filter((b) => b.id !== boardId));

    // Veritabanından siliyoruz
    const { error } = await supabase.from('boards').delete().eq('id', boardId);
    if (error) {
      console.error("Board silinirken hata oluştu:", error);
      alert("Board silinemedi.");
      void loadBoards(); // Hata olursa listeyi geri yüklüyoruz
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link href="/" className="text-sm font-semibold text-indigo-600">TaskFlow</Link>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Boardlar</h1>
        </div>
        <button onClick={signOut} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50">
          <LogOut size={18} /> Çıkış yap
        </button>
      </header>

      <form onSubmit={createBoard} className="mt-8 flex flex-col gap-3 rounded-[2rem] bg-white/80 p-4 shadow-soft ring-1 ring-slate-200 sm:flex-row">
        <input
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Yeni board adı"
        />
        <button disabled={creating} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60">
          <Plus size={18} /> Board oluştur
        </button>
      </form>

      {loading ? (
        <p className="mt-8 text-slate-600">Yükleniyor...</p>
      ) : (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link key={board.id} href={`/boards/${board.id}`} className="block rounded-[2rem] bg-white/85 p-6 shadow-soft ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl relative group">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">{board.title}</h2>
                  <p className="mt-3 text-sm text-slate-500">Açmak için tıkla</p>
                </div>
                {/* Board Silme Butonu */}
                <button
                  onClick={(e) => {
                    e.preventDefault(); // Link'e gitmeyi durdurur, sadece silme çalışır
                    deleteBoard(board.id);
                  }}
                  className="rounded-xl p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  aria-label="Board'u sil"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Link>
          ))}
          {boards.length === 0 && <p className="text-slate-600">Henüz board yok. İlk boardunu oluştur.</p>}
        </section>
      )}
    </main>
  );
}