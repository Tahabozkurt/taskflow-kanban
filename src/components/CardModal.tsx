'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { KanbanCard } from '@/lib/types';

export default function CardModal({
  card,
  onClose,
  onSave,
  onDelete
}: {
  card: KanbanCard | null;
  onClose: () => void;
  onSave: (cardId: string, values: { title: string; description: string }) => Promise<void>;
  onDelete: (cardId: string) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(card?.title ?? '');
    setDescription(card?.description ?? '');
  }, [card]);

  if (!card) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!card || !title.trim()) return;
    setSaving(true);
    await onSave(card.id, { title: title.trim(), description: description.trim() });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={onClose}>
      <form onSubmit={submit} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-xl rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem]">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-950">Kart detayı</h2>
          <button type="button" onClick={onClose} className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-100">Kapat</button>
        </div>

        <label className="mt-5 block text-sm font-semibold text-slate-700">
          Başlık
          <input className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>

        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Açıklama
          <textarea className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button type="button" onClick={() => onDelete(card.id)} className="rounded-2xl px-5 py-3 font-semibold text-red-600 hover:bg-red-50">Kartı sil</button>
          <button disabled={saving} className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-60">
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
