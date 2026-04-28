import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
      <section className="rounded-[2rem] bg-white/75 p-8 shadow-soft ring-1 ring-slate-200 backdrop-blur md:p-12">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">TaskFlow</p>
        <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
          Küçük ekipler için hızlı, temiz ve kalıcı Kanban tahtası.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Board oluştur, sütun ve kart ekle, kartları mobil uyumlu sürükle-bırak ile taşı. Sıralama Supabase üzerinde saklanır ve yenilemede korunur.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link className="rounded-2xl bg-slate-950 px-5 py-3 text-center font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-800" href="/login">
            Giriş yap / Hesap oluştur
          </Link>
          <Link className="rounded-2xl bg-white px-5 py-3 text-center font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50" href="/boards">
            Boardlara git
          </Link>
        </div>
      </section>
    </main>
  );
}
