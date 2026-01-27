# WhitepaperIQ B2B Frontend

Kurumsal kripto analiz platformu için React + TypeScript frontend uygulaması.

## 🚀 Teknolojiler

- **React 19** - UI framework
- **TypeScript** - Tip güvenliği
- **Vite** - Build tool
- **React Router** - Routing
- **CSS Variables** - Tema sistemi

## 📁 Proje Yapısı

```
src/
├── assets/          # Görseller, fontlar vb.
├── components/      # Yeniden kullanılabilir bileşenler
│   └── common/      # Ortak bileşenler (Button, Input vb.)
├── context/         # React Context providers
├── hooks/           # Custom React hooks
├── layouts/         # Layout bileşenleri
├── mock/            # Mock data (geçici)
├── pages/           # Sayfa bileşenleri
├── services/        # API servisleri
├── styles/          # Global stiller ve CSS değişkenleri
├── types/           # TypeScript tipleri
└── utils/           # Yardımcı fonksiyonlar
```

## 🎨 Renk Paleti

| Renk | Hex | Kullanım |
|------|-----|----------|
| Primary | `#8B2E8B` | Ana tema rengi (koyu magenta-mor) |
| Accent | `#C13584` | Vurgu rengi (pembe-mor) |

## 🛠️ Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build

# Build önizleme
npm run preview
```

## 📝 Geliştirme Notları

### Mock Data Kullanımı

Backend henüz tamamlanmadığından, uygulama şu anda mock data ile çalışmaktadır. Mock data dosyaları `src/mock/` klasöründe bulunmaktadır.

**Test Kullanıcıları:**
| E-posta | Şifre | Rol |
|---------|-------|-----|
| admin@whitepaperiq.com | admin123 | Admin |
| analyst@whitepaperiq.com | analyst123 | Analist |
| user@whitepaperiq.com | user123 | Kullanıcı |

### CSS Yapısı

Her bileşen için ayrı CSS dosyası kullanılmaktadır:
- BEM metodolojisi uygulanmıştır (`block__element--modifier`)
- Global CSS değişkenleri `src/styles/variables.css` dosyasında tanımlıdır
- Tüm renkler, spacing, typography değerleri CSS variable olarak kullanılmalıdır

### Bileşen Yapısı

Her bileşen klasöründe:
- `ComponentName.tsx` - Bileşen kodu
- `ComponentName.css` - Bileşene özel stiller
- `index.ts` - Export dosyası

## 📋 Sayfalar

- [x] Login - Giriş sayfası
- [ ] Dashboard - Ana panel
- [ ] (Diğer sayfalar eklenecek)

## 🔒 Güvenlik

- 256-bit SSL şifreleme
- JWT token tabanlı kimlik doğrulama (backend hazır olduğunda)

---

**Not:** Bu proje aktif geliştirme aşamasındadır. Backend entegrasyonu tamamlandığında mock data kaldırılacak ve gerçek API servisleri eklenecektir.
