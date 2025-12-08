import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { saveSession } from '../../src/utils/storage';

export default function HomeScreen() {
  // 1. Durum Tanımları (State)
  const [seconds, setSeconds] = useState(25 * 60); // 25 dakika 
  const [isActive, setIsActive] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [category, setCategory] = useState<string | null>(null);

  // AppState referansı (Uygulamanın durumu: aktif mi, arka planda mı?)
  const appState = useRef(AppState.currentState);

  // 2. Dikkat Dağınıklığı Takibi (Hocanın İstediği Kritik Kısım) [cite: 21, 23]
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Eğer uygulama aktifken -> arka plana (background/inactive) geçerse
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        if (isActive) {
          console.log("Dikkat dağınıklığı algılandı!");
          setIsActive(false); // Sayacı duraklat [cite: 23]
          setDistractions((prev) => prev + 1); // Sayıyı artır
          Alert.alert("Dikkat!", "Uygulamadan ayrıldın, sayaç duraklatıldı.");
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]);

  // 3. Sayaç Mantığı (Her saniye çalışır)
  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((sec) => sec - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      
      // --- EKLENEN KISIM BAŞLANGIÇ ---
      if (category) { // Sadece kategori seçiliyse kaydet
        saveSession({
          date: new Date().toISOString().split('T')[0], // Bugünün tarihi (YYYY-AA-GG)
          duration: 25 * 60, // Toplam odaklanma süresi (Şimdilik sabit 25dk)
          category: category,
          distractions: distractions
        });
      }
      // --- EKLENEN KISIM BİTİŞ ---

      Alert.alert("Tebrikler!", "Odaklanma seansı tamamlandı ve kaydedildi.");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  // Zamanı Formatla (Örn: 25:00)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const sec = time % 60;
    return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Seans Sıfırlama
  const resetSession = () => {
    setIsActive(false);
    setSeconds(25 * 60);
    setDistractions(0);
    setCategory(null);
  };

  return (
    <View style={styles.container}>
      {/* Başlık ve Kategori */}
      <Text style={styles.header}>Odaklanma Takibi</Text>
      
      <View style={styles.categoryContainer}>
        <Text style={styles.subHeader}>Kategori Seç: {category || "Seçilmedi"}</Text> 
        {/* Kategori Seçimi  */}
        <View style={styles.categoryButtons}>
            {['Ders', 'Kodlama', 'Kitap'].map((cat) => (
                <TouchableOpacity 
                    key={cat} 
                    style={[styles.catButton, category === cat && styles.catButtonActive]}
                    onPress={() => setCategory(cat)}
                >
                    <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
            ))}
        </View>
      </View>

      {/* Sayaç Göstergesi */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        <Text style={styles.distractionText}>Dikkat Dağılması: {distractions}</Text>
      </View>

      {/* Kontrol Butonları [cite: 18] */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.mainButton} onPress={() => {
            if (!category) return Alert.alert("Uyarı", "Lütfen önce bir kategori seçin.");
            setIsActive(!isActive);
        }}>
            <Ionicons name={isActive ? "pause" : "play"} size={32} color="white" />
            <Text style={styles.buttonText}>{isActive ? "Duraklat" : "Başlat"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mainButton, styles.resetButton]} onPress={resetSession}>
            <Ionicons name="refresh" size={32} color="white" />
            <Text style={styles.buttonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  subHeader: { fontSize: 16, marginBottom: 10, color: '#666' },
  
  categoryContainer: { marginBottom: 30, alignItems: 'center' },
  categoryButtons: { flexDirection: 'row', gap: 10 },
  catButton: { padding: 10, backgroundColor: '#ddd', borderRadius: 8 },
  catButtonActive: { backgroundColor: '#4a90e2' },
  catText: { color: '#333' },
  catTextActive: { color: 'white', fontWeight: 'bold' },

  timerContainer: { marginBottom: 40, alignItems: 'center' },
  timerText: { fontSize: 64, fontWeight: 'bold', color: '#2c3e50', fontVariant: ['tabular-nums'] },
  distractionText: { fontSize: 16, color: 'red', marginTop: 10 },

  controls: { flexDirection: 'row', gap: 20 },
  mainButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2ecc71', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30 },
  resetButton: { backgroundColor: '#e74c3c' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});