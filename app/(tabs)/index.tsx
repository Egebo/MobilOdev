import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { saveSession } from '../../src/utils/storage';

const PRESET_TIMES = [15, 25, 45, 60];

// Dark Mode
const COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#5E5CE6',
  accent: '#32D74B',
  danger: '#FF453A',
  text: '#FFFFFF',
  textSec: '#A0A0A0',
  buttonBg: '#2C2C2E',
};

export default function HomeScreen() {
  // --- Durum Yönetimi (State) ---
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [category, setCategory] = useState<string | null>(null);

  const appState = useRef(AppState.currentState);

  // --- 1. Dikkat Dağınıklığı Takibi (AppState) ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
        if (isActive) {
          // Uyarı Titreşimi: İki kısa titreme
          Vibration.vibrate([100, 200, 100, 200]); 
          
          setIsActive(false);
          setDistractions((prev) => prev + 1);
          Alert.alert("Dikkat!", "Uygulamadan ayrıldın, sayaç duraklatıldı.");
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isActive]);

  // --- 2. Sayaç Mantığı ---
  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((sec) => sec - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      
      Vibration.vibrate(1000);

      if (category) {
        saveSession({
          date: new Date().toISOString().split('T')[0],
          duration: initialTime,
          category: category,
          distractions: distractions
        });

        const minutes = Math.floor(initialTime / 60); 

        Alert.alert(
            "Seans Özeti", 
            `Tebrikler! Hedefine ulaştın.\n\n` +
            `Kategori: ${category}\n` +
            `Süre: ${minutes} dakika\n` + 
            `Dikkat Dağınıklığı: ${distractions}`,
            [
                { 
                    text: "Harika!", 
                    onPress: () => resetSession() 
                }
            ]
        );
      } else {
         Alert.alert("Tebrikler!", "Süre doldu.");
      }
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, seconds]);

  // --- Yardımcı Fonksiyonlar ---
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const sec = time % 60;
    return `${minutes}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const resetSession = () => {
    Vibration.vibrate(50);
    setIsActive(false);
    setSeconds(initialTime);
    setDistractions(0);
  };

  const handlePresetSelect = (minutes: number) => {
    if (isActive) return Alert.alert("Uyarı", "Sayaç çalışırken süre değiştirilemez.");
    Vibration.vibrate(20);
    const newTime = minutes * 60;
    setInitialTime(newTime);
    setSeconds(newTime);
  };

  const adjustTime = (deltaMinutes: number) => {
    if (isActive) return Alert.alert("Uyarı", "Sayaç çalışırken süre değiştirilemez.");
    Vibration.vibrate(20);
    
    let newSeconds = seconds + (deltaMinutes * 60);
    
    if (newSeconds < 60) newSeconds = 60; 

    setSeconds(newSeconds);
    setInitialTime(newSeconds);
  };

  // --- ARAYÜZ (UI) ---
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Başlık */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Odaklanma Takibi</Text>
        <Text style={styles.subHeader}>Hedefini Seç ve Başla</Text>
      </View>
      
      {/* Kategori Seçimi */}
      <View style={styles.sectionContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {['Ders', 'Kodlama', 'Kitap', 'Proje'].map((cat) => (
                <TouchableOpacity 
                    key={cat} 
                    style={[styles.chipButton, category === cat && styles.chipActive]}
                    onPress={() => {
                        Vibration.vibrate(20);
                        setCategory(cat);
                    }}
                >
                    <Text style={[styles.chipText, category === cat && styles.textActive]}>{cat}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
        {!category && <Text style={styles.warningText}>* Başlamak için bir kategori seçmelisin</Text>}
      </View>

      {/* Sık Kullanılan Süreler (Presets) */}
      <View style={styles.presetContainer}>
        {PRESET_TIMES.map((min) => (
            <TouchableOpacity 
                key={min}
                onPress={() => handlePresetSelect(min)}
                style={[styles.presetBtn, initialTime === min * 60 && styles.presetBtnActive]}
            >
                <Text style={[styles.presetText, initialTime === min * 60 && styles.textActive]}>{min}</Text>
                <Text style={[styles.presetLabel, initialTime === min * 60 && styles.textActive]}>dk</Text>
            </TouchableOpacity>
        ))}
      </View>

      {/* Sayaç Alanı */}
      <View style={styles.timerWrapper}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        
        {/* İnce Ayar Butonları */}
        <View style={styles.adjustmentRow}>
           <View style={styles.adjustGroupLeft}>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(-5)}>
                <Text style={styles.adjustText}>-5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(-1)}>
                <Text style={styles.adjustText}>-1</Text>
              </TouchableOpacity>
           </View>

           <View style={{width: 20}} />

           <View style={styles.adjustGroupRight}>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(1)}>
                <Text style={styles.adjustText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTime(5)}>
                <Text style={styles.adjustText}>+5</Text>
              </TouchableOpacity>
           </View>
        </View>

        <Text style={styles.distractionText}>
            {distractions > 0 ? `⚠️ ${distractions} Dikkat Dağılması` : "Harika Gidiyorsun!"}
        </Text>
      </View>

      {/* Ana Kontroller */}
      <View style={styles.controls}>
        <TouchableOpacity 
            disabled={!category}
            style={[
                styles.mainButton, 
                { 
                    backgroundColor: isActive ? COLORS.buttonBg : COLORS.accent,
                    opacity: !category ? 0.3 : 1
                }
            ]} 
            onPress={() => {
                Vibration.vibrate(50);
                setIsActive(!isActive);
            }}
        >
            <Ionicons name={isActive ? "pause" : "play"} size={32} color={isActive ? COLORS.accent : "white"} />
            <Text style={[styles.buttonText, isActive && { color: COLORS.accent }]}>
                {isActive ? "Duraklat" : "Başlat"}
            </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mainButton, styles.resetButton]} onPress={resetSession}>
            <Ionicons name="refresh" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.background, alignItems: 'center', padding: 20, paddingTop: 60 },
  headerContainer: { width: '100%', marginBottom: 20 },
  header: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, textAlign: 'left' },
  subHeader: { fontSize: 16, color: COLORS.textSec, marginTop: 5 },
  
  sectionContainer: { marginBottom: 25, height: 50, width: '100%' },
  categoryScroll: { gap: 10, paddingRight: 20 },
  warningText: { color: COLORS.danger, fontSize: 12, marginTop: 5 },
  
  chipButton: { paddingVertical: 8, paddingHorizontal: 20, backgroundColor: COLORS.surface, borderRadius: 25, borderWidth: 1, borderColor: '#333' },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSec, fontWeight: '600' },
  textActive: { color: 'white', fontWeight: 'bold' },

  presetContainer: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 10, width: '100%' },
  presetBtn: { width: 60, height: 60, borderRadius: 16, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  presetBtnActive: { backgroundColor: COLORS.buttonBg, borderColor: COLORS.primary, borderWidth: 2 },
  presetText: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  presetLabel: { fontSize: 10, color: COLORS.textSec },

  timerWrapper: { alignItems: 'center', marginBottom: 30, width: '100%', paddingVertical: 10 },
  timerText: { fontSize: 80, fontWeight: 'bold', color: COLORS.text, fontVariant: ['tabular-nums'], letterSpacing: 2 },
  
  adjustmentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  adjustGroupLeft: { flexDirection: 'row', gap: 10 },
  adjustGroupRight: { flexDirection: 'row', gap: 10 },
  adjustBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  adjustText: { fontWeight: 'bold', color: COLORS.text, fontSize: 16 },

  distractionText: { fontSize: 14, color: COLORS.textSec, marginTop: 20, opacity: 0.8 },

  controls: { flexDirection: 'row', gap: 15, width: '100%', paddingHorizontal: 20 },
  mainButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 20, elevation: 4 },
  resetButton: { flex: 0, width: 70, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.danger },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});