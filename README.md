# FocusTracker - Odaklanma Takibi ve Raporlama Uygulaması

Bu proje, **Sakarya Üniversitesi Bilgisayar Mühendisliği Bölümü**, **BSM 447 - Mobil Uygulama Geliştirme** dersi dönem projesi kapsamında geliştirilmiştir.

Uygulama, kullanıcıların Pomodoro tekniği veya özel sürelerle odaklanma seansları yapmasını sağlar, arka plan takibi (AppState) ile dikkat dağınıklığını ölçer ve detaylı grafiklerle raporlar sunar.

## 📱 Proje Özellikleri (MVP ve Ekstralar)

### Temel Gereksinimler
* **⏱ Özelleştirilebilir Sayaç:** 15, 25, 45, 60 dakikalık hızlı seçimler ve manuel süre arttırma/azaltma özellikleri.
* **🚨 Dikkat Dağınıklığı Takibi:** `AppState API` kullanılarak, kullanıcı uygulamadan ayrıldığında (arka plana attığında) sayaç otomatik durur ve dikkat dağınıklığı olarak kaydedilir.
* **📊 Gelişmiş Raporlama:** `react-native-chart-kit` ile son 7 günün odaklanma süreleri (Bar Chart) ve kategori dağılımları (Pie Chart) görselleştirilir.
* **💾 Veri Kalıcılığı:** Tamamlanan seanslar `AsyncStorage` kullanılarak cihaz hafızasında tutulur.
* **🏷 Kategori Yönetimi:** Ders, Kodlama, Kitap, Proje ve Spor kategorileri ile seans takibi.

### UX/UI İyileştirmeleri (Bonus)
* **🌑 Dark Mode (Karanlık Tema):** Göz yormayan, pil dostu modern tasarım.
* **📳 Haptik Geri Bildirim (Titreşim):** Buton etkileşimlerinde, sayaç bitiminde ve uyarı anlarında titreşimli geri bildirim (Vibration API).
* **🔒 Akıllı Kontroller:** Kategori seçilmeden sayacın başlamasını engelleyen güvenlik kontrolleri.

## 🛠 Kullanılan Teknolojiler

* **Framework:** React Native (Expo Router)
* **Dil:** TypeScript
* **Veri Depolama:** @react-native-async-storage/async-storage
* **Grafikler:** react-native-chart-kit & react-native-svg
* **İkonlar:** @expo/vector-icons (Ionicons)

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin:

**1. Projeyi Klonlayın**
```bash
git clone [https://github.com/KULLANICI_ADINIZ/MobilOdev.git](https://github.com/KULLANICI_ADINIZ/MobilOdev.git)
cd MobilOdev

**2. Gerekli Paketleri Yükleyin**
npm install

**3. Uygulamayı Başlatın**
npx expo start

**4. Test Edin**
Terminalde çıkan QR Kodu telefonunuzdaki Expo Go uygulamasıyla okutun (Android) veya Kamera ile tarayın (iOS).

Alternatif olarak, emülatörde çalıştırmak için terminalde a (Android) veya i (iOS) tuşuna basın.

