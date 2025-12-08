import AsyncStorage from '@react-native-async-storage/async-storage';

// Kaydedilecek Seans Verisi Tipi
export interface SessionData {
  id: string;
  date: string;       // Örn: 2025-12-08
  duration: number;   // Saniye cinsinden
  category: string;   // Örn: Kodlama
  distractions: number;
}

const STORAGE_KEY = '@focus_sessions';

// Yeni seans ekleme fonksiyonu
export const saveSession = async (session: Omit<SessionData, 'id'>) => {
  try {
    // 1. Mevcut verileri çek
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const sessions: SessionData[] = existingData ? JSON.parse(existingData) : [];

    // 2. Yeni seansı ekle
    const newSession: SessionData = {
      id: Date.now().toString(), // Benzersiz ID
      ...session,
    };
    sessions.push(newSession);

    // 3. Tekrar kaydet
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    console.log('Seans kaydedildi:', newSession);
  } catch (e) {
    console.error('Veri kaydedilemedi:', e);
  }
};

// Tüm verileri temizleme (Test için işine yarar)
export const clearSessions = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch(e) {
    console.error(e);
  }
};