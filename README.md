🚀 TaskFlow - Modern Kanban Yönetim Platformu
TaskFlow, ekiplerin ve bireylerin iş akışlarını görselleştirmesi, yönetmesi ve optimize etmesi için tasarlanmış, tam kapsamlı (full-stack) bir Kanban uygulamasıdır. Kullanıcı deneyimi, performans ve mobil uyumluluk odaklı geliştirilmiştir.

Canlı Demo Linki [(Vercel)](https://taskflow-kanban-indol.vercel.app)

✨ Öne Çıkan Özellikler
Gelişmiş Sürükle-Bırak: @dnd-kit kullanılarak inşa edilen mimari ile kartları ve sütunları hem yatay hem dikey düzlemde akıcı bir şekilde taşıyabilirsiniz.

Kişisel ve Ortak Çalışma Alanları: Kullanıcılar sadece kendi oluşturdukları boardlar üzerinde çalışabilir veya "Ortak Çalışma Alanı" üzerinden tüm ekibin projelerini takip edebilir.

Mobil Öncelikli Tasarım: Dokunmatik ekranlar için "uzun basma" (delay) sensörleri ve kart altı hızlı taşıma butonları ile mobil cihazlarda kusursuz deneyim.

Esnek Başlık Yönetimi: Sütun isimlerini "Inline Editing" özelliği ile anında değiştirebilme.

Hızlı ve Güvenli Kimlik Doğrulama: Supabase Auth ile şifresiz/şifreli giriş ve oturum yönetimi.

Performanslı Sıralama: "Fractional Indexing" mantığı kullanılarak veritabanında tüm kartları güncellemeye gerek kalmadan sonsuz sıralama imkanı.

🛠️ Teknoloji Yığını
Framework: Next.js 14 (App Router)

Dil: TypeScript

Veritabanı & Auth: Supabase (PostgreSQL)

Stil: Tailwind CSS

Sürükle-Bırak: @dnd-kit/core & @dnd-kit/sortable

İkonlar: Lucide React

Deployment: Vercel

📦 Kurulum ve Çalıştırma
Projeyi yerel bilgisayarınızda çalıştırmak için:

Depoyu klonlayın:

Bash
git clone https://github.com/Tahabozkurt/taskflow-kanban.git
cd taskflow-kanban
Bağımlılıkları yükleyin:

Bash
npm install
.env.local dosyasını oluşturun ve Supabase bilgilerinizi ekleyin:

Code snippet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
Uygulamayı başlatın:

Bash
npm run dev
🏗️ Veritabanı Şeması
Proje, ilişkisel bir veritabanı yapısı üzerine kuruludur:

boards: Tahta bilgilerini ve sahiplik verilerini tutar.

columns: Tahtalara bağlı sütunları ve sıralamalarını tutar.

cards: Sütunlara bağlı görevleri, içerikleri ve pozisyon verilerini tutar.

activity: Kart hareketlerinin tarihçesini (log) tutar.

💡 Teknik Kararlar ve Yaklaşım
Neden dnd-kit? Eski kütüphanelerin aksine daha hafif, modüler ve erişilebilirlik (A11y) standartlarına uygun olduğu için tercih edildi.

Optimistic UI: Kullanıcı bir kartı taşıdığında, veritabanı yanıtı beklenmeden arayüz anında güncellenir. Bu, kullanıcının "gecikme" hissetmesini engeller.

Zaman Yönetimi: 48 saatlik geliştirme sürecinde, karmaşık özelliklerden ziyade çekirdek Kanban mekanizmasının (Drag-and-Drop) hatasız çalışmasına odaklanılmıştır.

👨‍💻 Geliştirici
Taha Bozkurt - [GitHub Profilim](https://github.com/Tahabozkurt)
