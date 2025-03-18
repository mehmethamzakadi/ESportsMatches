# E-Spor Maçları Takip Uygulaması

Bu proje, e-spor maçlarını takip etmek ve hatırlatıcılar oluşturmak için tasarlanmış bir web uygulamasıdır.

## Özellikler

- Yaklaşan ve canlı e-spor maçlarını görüntüleme
- Maç detaylarını inceleme
- Favori maçları kaydetme ve yönetme
- Hatırlatıcı oluşturma:
  - Tarayıcı bildirimleri
  - Takvim dosyası indirme
  - E-posta bildirimleri

## E-posta Bildirimleri Kurulumu

E-posta bildirimleri için bir SMTP sunucusu yapılandırılması gerekmektedir. Aşağıdaki adımları izleyin:

1. `.env.local` dosyasını projenin kök dizininde oluşturun (varsa güncelleyin)
2. SMTP sunucu ayarlarınızı aşağıdaki şekilde ekleyin:

```
EMAIL_HOST=smtp.sunucunuz.com
EMAIL_PORT=587
EMAIL_SECURE=false  # true = 465 portu için, false = diğer portlar için
EMAIL_USER=kullanici@adresi.com
EMAIL_PASSWORD=parolanız
EMAIL_FROM=noreply@adresi.com
```

### Gmail SMTP Kullanımı

Gmail kullanmak isterseniz:

1. [Google Hesap Güvenliği](https://myaccount.google.com/security) sayfasına gidin
2. İki faktörlü doğrulamayı etkinleştirin
3. [Uygulama Şifreleri](https://myaccount.google.com/apppasswords) bölümünden yeni bir uygulama şifresi oluşturun
4. `.env.local` dosyasında aşağıdaki ayarları kullanın:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=gmail_adresiniz@gmail.com
EMAIL_PASSWORD=uygulama_şifreniz
EMAIL_FROM=gmail_adresiniz@gmail.com
```

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

## Teknolojiler

- Next.js
- React
- Tailwind CSS
- SWR
- TypeScript
- Node.js (E-posta gönderimi için)
- Nodemailer (E-posta gönderimi için)

## Kullanılan Teknolojiler

- Next.js
- React
- TypeScript
- Tailwind CSS

## Başlangıç

### Gereksinimler

- Node.js (v14 veya daha yeni)
- npm veya yarn

### Kurulum

1. Depoyu klonlayın
   ```bash
   git clone https://github.com/mehmethamzakadi/ESportsMatches.git
   cd ESportsMatches
   ```

2. Bağımlılıkları yükleyin
   ```bash
   npm install
   # veya
   yarn install
   ```

3. Geliştirme sunucusunu çalıştırın
   ```bash
   npm run dev
   # veya
   yarn dev
   ```

4. Uygulamayı görmek için tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın

## Lisans

MIT 
