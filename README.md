# TaskFlow - Kanban Proje Yonetim Tahtasi

TaskFlow, kucuk yazilim ekipleri icin hazirlanmis Trello benzeri Kanban uygulamasidir. Kullanici hesap acabilir, giris yapabilir, board olusturabilir, sutun ve kart ekleyebilir, kartlari surukle-birak ile sutunlar arasinda tasiyabilir ve kart detaylarini duzenleyebilir.

## Teknoloji

- Next.js + React + TypeScript
- Tailwind CSS
- Supabase Auth + Postgres + Row Level Security
- dnd-kit ile surukle-birak
- Vercel deploy uyumlu yapi

## Kurulum

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` icine Supabase proje bilgilerini ekleyin:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Supabase SQL Editor icinde `supabase/schema.sql` dosyasini calistirin.

## Vercel Deploy

1. Projeyi GitHub reposuna yukleyin.
2. Vercel'de "New Project" ile repoyu secin.
3. Environment Variables alanina `.env.example` dosyasindaki iki degiskeni ekleyin.
4. Deploy edin.

## Kapsam

Tamamlananlar:

- Hesap olusturma ve giris
- Board olusturma
- Sütun ekleme
- Kart ekleme
- Kart basligi/aciklamasi duzenleme
- Kart silme
- Kartlari sutunlar arasi surukle-birak ile tasima
- Sutun siralamasi degistirme
- Siralamanin sayfa yenilemede korunmasi
- Mobilde uzun basma + alternatif ileri/geri tasima butonlari
- Kart hareketleri icin activity tablosu

Bilincli olarak MVP disi birakilanlar:

- Gercek zamanli birlikte duzenleme
- Board paylasim linki
- Etiket / son teslim tarihi / sorumlu kisi
- Kart ekleri

Bu kararlar 48 saatlik teslim icin temel surukle-birak, veri modeli ve siralama kalitesini oncelemek amaciyla alindi.

## Siralama Mantigi

`columns.position` ve `cards.position` numeric olarak tutulur. Araya tasimada yeni pozisyon, onceki ve sonraki elemanin ortalamasi olarak hesaplanir. Bu yaklasim sayesinde sadece tasinan kayit update edilir; her tasimada tum kartlarin sirasi yeniden yazilmaz.

## Mobil Kullanilabilirlik

`PointerSensor` 180ms gecikme ile baslatilir. Bu, scroll hareketi ile suruklemenin karismasini azaltir. Mobilde ayrica kart altinda ileri/geri tasima butonlari gosterilir.
