# ESportsMatches

CS2 E-Spor maçlarını takip etmek için geliştirilmiş modern bir web uygulaması.

## Özellikler

- 🎮 Aktif, yaklaşan ve geçmiş CS2 maçlarını görüntüleme
- ⭐ Favori maçları kaydetme ve takip etme
- 🔔 Maç hatırlatıcıları oluşturma
- 🌓 Koyu/Açık tema desteği
- 🔍 Maç arama özelliği
- 📱 Mobil uyumlu tasarım

## Teknolojiler

- **Framework**: Next.js 15
- **UI**: React 19, TailwindCSS
- **Veri Yönetimi**: SWR (stale-while-revalidate)
- **Kimlik Doğrulama**: NextAuth.js
- **Veritabanı**: Supabase
- **E-posta Servisi**: Gmail API
- **Dil**: TypeScript

## Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/yourusername/esportsmatches.git
cd esportsmatches
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env.local` dosyasını oluşturun ve gerekli ortam değişkenlerini ekleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

5. Tarayıcınızda `http://localhost:3000` adresini açın.

## Proje Yapısı

```
src/
├── app/                    # Next.js App Router sayfaları
│   ├── api/               # API endpoint'leri
│   ├── auth/              # Kimlik doğrulama sayfaları
│   ├── favorites/         # Favori maçlar sayfası
│   ├── past/              # Geçmiş maçlar sayfası
│   └── upcoming/          # Yaklaşan maçlar sayfası
├── components/            # UI bileşenleri
│   ├── ui/               # Temel UI bileşenleri
│   ├── AuthButtons.tsx   # Kimlik doğrulama butonları
│   ├── Header.tsx        # Sayfa başlığı
│   ├── MatchCard.tsx     # Maç kartı bileşeni
│   ├── MatchList.tsx     # Maç listesi bileşeni
│   ├── ReminderModal.tsx # Hatırlatıcı modal bileşeni
│   ├── SearchBar.tsx     # Arama çubuğu
│   ├── TabNavigation.tsx # Sekme navigasyonu
│   └── ThemeToggle.tsx   # Tema değiştirme bileşeni
├── hooks/                # React hook'ları
│   └── useMatches.ts    # Maç verilerini yöneten hook
├── lib/                 # Yardımcı kütüphaneler
│   ├── api.ts          # API istemcisi
│   ├── gmail.ts        # Gmail API entegrasyonu
│   ├── hooks.ts        # Genel hook'lar
│   └── ThemeContext.tsx # Tema yönetimi
├── services/           # Servis katmanı
│   └── FavoriteService.ts # Favori maç servisi
├── types/             # TypeScript tip tanımlamaları
│   └── match.ts      # Maç veri modeli
└── utils/            # Yardımcı fonksiyonlar
    └── eventEmitter.ts # Olay yönetimi
```

## Geliştirme Kuralları

### Kod Stili
- TypeScript strict mode kullanımı
- ESLint ve Prettier ile kod formatı
- Tailwind CSS class isimlendirme kuralları
- Component isimlendirme PascalCase
- Hook isimlendirme camelCase

### Git Commit Mesajları
- feat: Yeni özellik
- fix: Hata düzeltmesi
- docs: Dokümantasyon değişiklikleri
- style: Kod stili değişiklikleri
- refactor: Kod yeniden düzenleme
- test: Test ekleme veya düzenleme
- chore: Genel bakım

### Branch Stratejisi
- main: Ana branch
- develop: Geliştirme branch'i
- feature/*: Yeni özellikler
- bugfix/*: Hata düzeltmeleri
- hotfix/*: Acil düzeltmeler

### Code Review Kuralları
- PR açıklaması zorunlu
- En az bir reviewer onayı
- CI/CD kontrollerinin başarılı olması
- Test coverage kontrolü
- TypeScript tip kontrolü

### Deployment Süreci
- Staging ortamına otomatik deployment
- Production ortamına manuel onay ile deployment
- Her deployment öncesi test suite çalıştırma
- Deployment sonrası smoke test

## Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir özellik dalı oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add some amazing feature'`)
4. Dalınıza push yapın (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Proje Sahibi - [@yourusername](https://github.com/yourusername)

Proje Linki: [https://github.com/yourusername/esportsmatches](https://github.com/yourusername/esportsmatches) 
