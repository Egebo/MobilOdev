# 🎯 FocusTracker - Odaklanma Takibi ve Raporlama Uygulaması

Bu proje, **Sakarya Üniversitesi Bilgisayar Mühendisliği Bölümü**, **BSM 447 - Mobil Uygulama Geliştirme** dersi dönem projesi kapsamında geliştirilmiştir.

Uygulama, kullanıcıların Pomodoro tekniği veya özel sürelerle odaklanma seansları yapmasını sağlar, arka plan takibi (**AppState**) ile dikkat dağınıklığını ölçer ve elde edilen verileri detaylı grafiklerle raporlar.

---

## 📱 Proje Özellikleri

### ✅ Temel Gereksinimler (MVP)
* **⏱ Özelleştirilebilir Sayaç:** 15, 25, 45, 60 dakikalık hızlı seçim butonları ve manuel süre arttırma/azaltma (+1, +5 dk) özellikleri.
* **🚨 Dikkat Dağınıklığı Takibi:** Uygulama `AppState API` kullanarak arka plan durumunu dinler. Kullanıcı sayaç çalışırken uygulamadan ayrılırsa (WhatsApp'a girmek, ana ekrana dönmek vb.), sayaç otomatik olarak duraklatılır ve "Dikkat Dağınıklığı" sayısı arttırılır.
* **📊 Gelişmiş Raporlama:** `react-native-chart-kit` kullanılarak oluşturulan **Dashboard**:
    * **Bar Chart:** Son 7 günün günlük odaklanma süreleri.
    * **Pie Chart:** Kategorilere göre odaklanma dağılımı.
* **💾 Veri Kalıcılığı (Persistence):** Tamamlanan tüm seanslar `AsyncStorage` kullanılarak cihaz hafızasında kalıcı olarak saklanır.
* **🏷 Kategori Yönetimi:** "Ders", "Kodlama", "Kitap", "Proje" ve "Spor" kategorileri ile seans takibi.

### 🚀 UX/UI İyileştirmeleri (Bonus)
* **🌑 Dark Mode (Karanlık Tema):** Göz yormayan, pil dostu ve modern, tam uyumlu karanlık tasarım.
* **📳 Haptik Geri Bildirim (Titreşim):**
    * Butonlara basıldığında fiziksel his veren kısa titreşimler.
    * Uygulamadan çıkıldığında uyarıcı titreşim (İki kısa).
    * Süre bittiğinde uzun bildirim titreşimi.
* **🔒 Akıllı Kontroller:** Kategori seçilmeden sayacın başlatılmasını engelleyen ve butonu pasif hale getiren kullanıcı deneyimi iyileştirmesi.
* **🛠 Geliştirici Araçları:** Raporlar ekranında test verisi üretmek ve verileri temizlemek için gizli geliştirici butonları.

---

## 🛠 Kullanılan Teknolojiler

| Teknoloji | Açıklama |
| :--- | :--- |
| **Framework** | React Native (Expo Router) |
| **Dil** | TypeScript |
| **Veri Depolama** | @react-native-async-storage/async-storage |
| **Grafikler** | react-native-chart-kit & react-native-svg |
| **İkonlar** | @expo/vector-icons (Ionicons) |
| **Navigasyon** | Expo Router (File-based routing) |

---

## 📂 Proje Yapısı

Kodlar temiz, modüler ve yeniden kullanılabilir bileşen mantığına göre düzenlenmiştir:

```text
MobilOdev/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      # Ana Sayfa (Sayaç, AppState ve Kontroller)
│   │   ├── explore.tsx    # Raporlar Ekranı (Grafikler ve İstatistikler)
│   │   └── _layout.tsx    # Tab Bar Navigasyon Ayarları
├── src/
│   ├── utils/
│   │   └── storage.ts     # Veritabanı İşlemleri (Save/Load/Clear)
│   └── components/        # (UI Bileşenleri)
└── assets/                # Görseller ve Fontlar

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

**1. Projeyi Klonlayın**
```bash
git clone [https://github.com/Egebo/MobilOdev.git](https://github.com/Egebo/MobilOdev.git)
cd MobilOdev
2. Gerekli Paketleri Yükleyin

Bash

npm install
3. Uygulamayı Başlatın

Bash

npx expo start

4. Test Edin

Terminalde çıkan QR Kodu telefonunuzdaki Expo Go uygulamasıyla okutun (Android) veya Kamera ile tarayın (iOS).

Bilgisayar ve telefonun aynı Wi-Fi ağında olduğundan emin olun.

Alternatif: Android Emulator veya iOS Simulator kullanıyorsanız terminalde a veya i tuşuna basarak başlatabilirsiniz.