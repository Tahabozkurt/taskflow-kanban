# TaskFlow Karar Kaydı

## 1. Odak
48 saatlik MVP icin en kritik deger: board -> sutun -> kart veri modelinin temiz kurulmasi, kartlarin sutunlar arasi surukle-birak ile tasinmasi ve siralamanin yenilemede korunmasi.

Kapsam disi birakilanlar: gercek zamanli birlikte duzenleme, rol bazli paylasim, dosya ekleri, karmasik etiket sistemi. Bunlar urunlesme asamasinda eklenebilir.

## 2. Drag-and-drop secimi
Secilen kutuphane: dnd-kit.

Neden:
- TypeScript ve React ile modern API.
- Pointer, touch ve keyboard sensor destegi.
- Sortable yapisi board/sutun/kart modeline uygun.
- Gorsel overlay, collision detection ve activation constraint ile mobilde uzun basma deneyimi kurulabilir.

Alternatifler:
- @hello-pangea/dnd: Liste tabanli akislarda cok pratik, ancak dnd-kit kadar dusuk seviye esneklik sunmaz.
- SortableJS: Framework bagimsiz ve dokunmatik cihazlarda guclu, fakat React state ile senkronizasyonu icin daha fazla adaptor kodu gerekir.
- Native HTML5 DnD: Paket boyutu yok, ancak mobil ve touch destegi zayif; tutarli UX icin ekstra is gerekir.

## 3. Siralama modeli
Her sutun ve kart `position numeric` alanina sahiptir. Yeni eleman sona eklenirken mevcut son pozisyona 1024 eklenir. Araya tasimada sadece tasinan kaydin pozisyonu `onceki` ve `sonraki` pozisyonun ortalamasi olarak hesaplanir.

Bu nedenle her hareketten sonra tum kartlari yeniden numaralandirmaya gerek yoktur. Uzun sureli kullanimda pozisyonlar birbirine cok yaklasirsa arka planda normalize edilebilir; MVP icin gerekli degildir.

## 4. Mobil kullanim
Mobilde surukleme kazara baslamasin diye PointerSensor `delay: 180ms` ve `tolerance: 6px` ile ayarlandi. Ayrica kucuk ekranlarda kart altinda "Geri" ve "Ileri" hizli tasima butonlari var. Bu, surukle-birakin mobilde zorlandigi durumlarda alternatif mekanizma saglar.

## 5. Veri guvenligi
Supabase RLS politikalari ile board sahibi disindaki kullanicilarin board, sutun, kart ve aktivite kayitlarina erisimi engellenir.

## 6. Sonraki adimlar
- Board paylasimi: once salt okunur link, sonra rol bazli birlikte duzenleme.
- Etiket ve son teslim tarihi: filtreleme de eklenecekse degerli.
- Aktivite paneli: mevcut activity tablosu hareketleri saklamaya hazir.
- Performans: 500+ kart senaryosunda sutun bazli sanallastirma degerlendirilebilir.
