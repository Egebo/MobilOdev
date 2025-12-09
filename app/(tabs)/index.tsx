import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { saveSession } from '../../src/utils/storage';

const PRESET_TIMES = [15, 25, 45, 60];

export default function HomeScreen() {
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [category, setCategory] = useState<string | null>(null);

  const appState = useRef(AppState.currentState);

  // --- Dikkat Dağınıklığı Takibi ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        if (isActive) {
          setIsActive(false);
          setDistractions((prev) => prev + 1);
          Alert.alert("Dikkat!", "Uygulamadan ayrıldın, sayaç duraklatıldı.");
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isActive]);

  // --- Sayaç Mantığı ---
  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((sec) => sec - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      if (category) {
        saveSession({
          date: new Date().toISOString().split('T')[0],
          duration: initialTime,
          category: category,
          distractions: distractions
        });
      }
      Alert.alert("Tebrikler!", "Odaklanma seansı tamamlandı.");
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, seconds]);

  // Formatlama
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const sec = time % 60;
    return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const resetSession = () => {
    setIsActive(false);
    setSeconds(initialTime);
    setDistractions(0);
  };

  // --- Süre Değiştirme (Preset) ---
  const handlePresetSelect = (minutes: number) => {
    if (isActive) return Alert.alert("Uyarı", "Sayaç çalışırken süre değiştirilemez.");
    const newTime = minutes * 60;
    setInitialTime(newTime);
    setSeconds(newTime);
  };

  // --- Süre Değiştirme (+/- Manuel) ---
  const adjustTime = (deltaMinutes: number) => {
    if (isActive) return Alert.alert("Uyarı", "Sayaç çalışırken süre değiştirilemez.");
    
    setSeconds((prevSeconds) => {
      const newSeconds = prevSeconds + (deltaMinutes * 60);
      // En az 1 dakika (60 sn) sınırı
      if (newSeconds < 60) return 60;
      setInitialTime(newSeconds); // Resetlenince bu süreye dönsün
      return newSeconds;
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Odaklanma Takibi</Text>
      
      {/* Kategori Seçimi */}
      <View style={styles.sectionContainer}>
        <View style={styles.row}>
            {['Ders', 'Kodlama', 'Kitap', 'Proje'].map((cat) => (
                <TouchableOpacity 
                    key={cat} 
                    style={[styles.chipButton, category === cat && styles.chipActive]}
                    onPress={() => setCategory(cat)}
                >
                    <Text style={[styles.chipText, category === cat && styles.textActive]}>{cat}</Text>
                </TouchableOpacity>
            ))}
        </View>
        {!category && <Text style={styles.warningText}>* Başlamak için kategori seçin</Text>}
      </View>

      {/* Sayaç ve Kontrolleri */}
      <View style={styles.timerWrapper}>
        
        {/* Dakika Ayar Butonları (Üst Sıra) */}
        <View style={styles.adjustmentRow}>
           {/* Azaltma Butonları */}
           <View style={styles.adjustGroup}>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(-5)}>
                <Text style={styles.adjustText}>-5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(-1)}>
                <Text style={styles.adjustText}>-1</Text>
              </TouchableOpacity>
           </View>

           {/* Sayaç Göstergesi */}
           <Text style={styles.timerText}>{formatTime(seconds)}</Text>

           {/* Arttırma Butonları */}
           <View style={styles.adjustGroup}>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(1)}>
                <Text style={styles.adjustText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(5)}>
                <Text style={styles.adjustText}>+5</Text>
              </TouchableOpacity>
           </View>
        </View>

        {/* Hızlı Seçim Butonları (Alt Sıra) */}
        <View style={styles.presetRow}>
            {PRESET_TIMES.map((min) => (
                <TouchableOpacity 
                    key={min}
                    onPress={() => handlePresetSelect(min)}
                    style={styles.presetBtn}
                >
                    <Text style={styles.presetText}>{min}dk</Text>
                </TouchableOpacity>
            ))}
        </View>
        
        <Text style={styles.distractionText}>Dikkat Dağılması: {distractions}</Text>
      </View>

      {/* Ana Kontroller (Başlat/Sıfırla) */}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f5f5f5', alignItems: 'center', padding: 20, paddingTop: 60 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  
  sectionContainer: { marginBottom: 20, width: '100%', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  warningText: { color: '#e74c3c', fontSize: 12, marginTop: 5 },
  
  chipButton: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#e0e0e0', borderRadius: 20 },
  chipActive: { backgroundColor: '#4a90e2' },
  chipText: { color: '#333' },
  textActive: { color: 'white', fontWeight: 'bold' },

  timerWrapper: { alignItems: 'center', marginBottom: 30, width: '100%' },
  
  // Sayaç ve Yan Butonlar Düzeni
  adjustmentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15, marginBottom: 15 },
  adjustGroup: { flexDirection: 'row', gap: 8 },
  adjustBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  adjustText: { fontWeight: 'bold', color: '#555' },
  
  timerText: { fontSize: 60, fontWeight: 'bold', color: '#2c3e50', fontVariant: ['tabular-nums'], minWidth: 180, textAlign: 'center' },

  presetRow: { flexDirection: 'row', gap: 10 },
  presetBtn: { padding: 8, backgroundColor: '#ececec', borderRadius: 8 },
  presetText: { fontSize: 12, color: '#666' },

  distractionText: { fontSize: 16, color: '#e74c3c', marginTop: 15, fontWeight: '600' },

  controls: { flexDirection: 'row', gap: 20 },
  mainButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2ecc71', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, elevation: 4 },
  resetButton: { backgroundColor: '#e74c3c' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});