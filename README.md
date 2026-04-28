# 🚀 **TaskFlow** | *Modern & Dynamic Kanban Management*

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-blueviolet?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://taskflow-kanban-indol.vercel.app)

> **"İş akışınızı görselleştirin, üretkenliğinizi zirveye taşıyın."**
> *TaskFlow, ekiplerin ve bireylerin karmaşık süreçlerini basitleştirmek için tasarlanmış, **full-stack** bir yönetim çözümüdür.*

---

## ✨ **Öne Çıkan "Premium" Özellikler**

* 🎨 **Gelişmiş Sürükle-Bırak:** `@dnd-kit` altyapısıyla hem kartları hem sütunları ***pürüzsüz*** bir şekilde taşıyın.
* 👥 **Hibrit Çalışma Alanı:** İster **Kişisel Boardlar** ile odaklanın, ister **Ortak Çalışma Alanı** ile ekibinize dahil olun.
* 📱 **Mobil Senkronizasyon:** Dokunmatik ekranlara özel *long-press* (uzun basma) sensörleri ve **Hızlı Taşıma** butonlarıyla kesintisiz deneyim.
* ✏️ **Esnek Başlık Yönetimi:** *Inline Editing* teknolojisi sayesinde sütun isimlerini çift tıklamaya gerek kalmadan, anında güncelleyin.
* 🔐 **Ultra Güvenli Auth:** *Supabase Auth* güvencesiyle verileriniz her zaman şifreli ve koruma altında.
* 📈 **Akıllı Sıralama:** ***Fractional Indexing*** algoritması ile binlerce kart arasında bile milisaniyelik sıralama performansı.

---

## 🛠️ **Teknoloji Yığını (Tech Stack)**

| Katman | Teknoloji |
| :--- | :--- |
| **Core Framework** | `Next.js 14 (App Router)` |
| **Language** | `TypeScript` (Strict Mode) |
| **Database & Auth** | `Supabase (PostgreSQL)` |
| **Styling** | `Tailwind CSS` & `Lucide Icons` |
| **D&D Engine** | `@dnd-kit/core` & `Sortable` |
| **Deployment** | `Vercel` |

---

## 📦 **Hızlı Kurulum**

***Projeyi yerelinizde ayağa kaldırmak sadece 2 dakikanızı alır:***

1. **Repoyu Klonlayın:**
   ```bash
   git clone https://github.com/Tahabozkurt/taskflow-kanban.git
   cd taskflow-kanban
   ```

2. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

3. **Çevre Değişkenlerini Ayarlayın:**
   `.env.local` dosyasını oluşturun:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

4. **Motoru Çalıştırın:**
   ```bash
   npm run dev
   ```

---

## 🏗️ **Veritabanı Mimarisi**

Uygulama, yüksek performans için *ilişkisel veritabanı* prensiplerine göre optimize edilmiştir:
* 📂 **`boards`**: Stratejik tahta verileri ve sahiplik hiyerarşisi.
* 📋 **`columns`**: Dinamik sütun yapıları ve pozisyonel veriler.
* 🗂️ **`cards`**: Görev detayları, içerik yönetimi ve sıralama indeksleri.
* 📜 **`activity`**: Geçmişe dönük kart hareketlerinin *Real-time* log kaydı.

---

## 💡 **Neden TaskFlow? **

* **Optimistic UI:** Kullanıcı bir işlem yaptığında sunucu cevabı beklenmez; arayüz ***anında*** güncellenir. Bu, "Zero-Lag" (Sıfır Gecikme) hissi yaratır.
* **Hafif Mimari:** Modüler yapı sayesinde uygulama sadece ihtiyaç duyulan kodları yükler, bu da **Lighthouse** skorlarını zirveye taşır.
* **Stratejik Yaklaşım:** 48 saatlik süreçte "over-engineering" yerine, çekirdek mekanizmanın (D&D) **mükemmelliğine** odaklanılmıştır.

---

## 👨‍💻 **Geliştirici**

**Taha Bozkurt**
* [GitHub Profilim](https://github.com/Tahabozkurt)
* [LinkedIn üzerinden ulaşın](https://linkedin.com/in/tahabozkurt)

---
*TaskFlow bir **Taha Bozkurt** projesidir. &copy; 2026*

---
