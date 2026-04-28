'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Trash2, User, Users } from 'lucide-react'; 
import { supabase } from '@/lib/supabase';
import type { Board } from '@/lib/types';
import { POSITION_STEP } from '@/lib/order';

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Silme yetkisi kontrolü için hem ID hem Email tutuyoruz
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'mine' | 'shared'>('mine');

  useEffect(() => {
    void loadBoards();
  }, [viewMode]);

  async function loadBoards() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push('/login');
      return;
    }
    
    setUserId(userData.user.id);
    setUserEmail(userData.user.email ?? null);

    let query = supabase.from('boards').select('*').order('created_at', { ascending: false });

    if (viewMode === 'mine') {
      query = query.eq('owner_id', userData.user.id);
    }

    const { data, error } = await query;
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
      .insert({ 
        title: title.trim(), 
        owner_id: userData.user.id,
        owner_email: userData.user.email
      })
      .select('*')
      .single();

    if (!error && board) {
      await supabase.from('columns').insert([
        { board_id: board.id, title: 'Yapılacak', position: POSITION_STEP },
        { board_id: board.id, title: 'Devam Ediyor', position: POSITION_STEP * 2 },
        { board_id: board.id, title: 'Tamamlandı', position: POSITION_STEP * 3 }
      ]);
      
      // Eğer kişisel sekmedeysek listeye ekle
      if (viewMode === 'mine') {
        setBoards([board, ...boards]);
      }
      setTitle('');
      // Yeni board eklendiğinde listeyi tazelemek en sağlıklısı
      void loadBoards();
    }

    setCreating(false);
  }

  async function deleteBoard(boardId: string) {
    const confirmed = window.confirm("Bu board'u ve içindeki tüm verileri silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    // Arayüzden kaldır (Optimistic)
    setBoards((current) => current.filter((b) => b.id !== boardId));

    const { error } = await supabase.from('boards').delete().eq('id', boardId);
    if (error) {
      alert("Board silinemedi.");
      void loadBoards(); 
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

      <div className="mt-8 flex w-fit rounded-2xl bg-slate-100 p-1">
        <button
          onClick={() => setViewMode('mine')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            viewMode === 'mine' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <User size={16} /> Benim Boardlarım
        </button>
        <button
          onClick={() => setViewMode('shared')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
            viewMode === 'shared' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users size={16} /> Ortak Çalışma Alanı
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-600">Yükleniyor...</p>
      ) : (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link key={board.id} href={`/boards/${board.id}`} className="block rounded-[2rem] bg-white/85 p-6 shadow-soft ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl relative group">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h2 className="text-xl font-black text-slate-950 break-words">{board.title}</h2>
                  
                  {viewMode === 'shared' && (
                    <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">
                      Oluşturan: {board.owner_id === userId ? "SİZ" : (board.owner_email || "Bilinmiyor")}
                    </span>
                  )}
                  
                  <p className="mt-4 text-sm text-slate-500 italic">Açmak için tıkla →</p>
                </div>
                
                {/* SİLME BUTONU: Eğer board'un sahibiysen (id üzerinden kontrol) her zaman görünür */}
                {board.owner_id === userId && (
                  <button
                    onClick={(e) => {
                      e.preventDefault(); 
                      deleteBoard(board.id);
                    }}
                    className="shrink-0 rounded-xl p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}