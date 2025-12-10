import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

// Ekran genişliği
const screenWidth = Dimensions.get('window').width;

// Renk Paleti (Ana Sayfa ile Uyumlu)
const COLORS = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#5E5CE6', // Mor
  accent: '#32D74B',  // Yeşil
  danger: '#FF453A',  // Kırmızı
  text: '#FFFFFF',
  textSec: '#A0A0A0',
  grid: '#333333'     // Grafik çizgileri için
};

export default function ReportScreen() {
  const [stats, setStats] = useState({ todayTime: 0, totalTime: 0, totalDistractions: 0 });
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const jsonValue = await AsyncStorage.getItem('@focus_sessions');
      const sessions = jsonValue != null ? JSON.parse(jsonValue) : [];

      let today = 0, total = 0, distractions = 0;
      const todayStr = new Date().toISOString().split('T')[0];
      const catMap: {[key: string]: number} = {};
      const last7DaysMap: {[key: string]: number} = {};

      // Son 7 günü sıfırla
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7DaysMap[d.toISOString().split('T')[0]] = 0; 
      }

      sessions.forEach((s: any) => {
        total += s.duration;
        distractions += s.distractions || 0;
        if (s.date === todayStr) today += s.duration;

        // Kategori Sayımı
        catMap[s.category] = (catMap[s.category] || 0) + 1;

        // Günlük Dağılım
        if (last7DaysMap[s.date] !== undefined) {
           last7DaysMap[s.date] += Math.floor(s.duration / 60);
        }
      });

      setStats({
        todayTime: Math.floor(today / 60),
        totalTime: Math.floor(total / 60),
        totalDistractions: distractions
      });

      // Grafik Verileri
      setWeeklyData({
        labels: Object.keys(last7DaysMap).map(date => date.slice(8,10)), // Gün (09, 10 vb.)
        datasets: [{ data: Object.values(last7DaysMap) }]
      });

      // Pasta Grafik Renkleri (Canlı)
      const pieColors = ['#FF9F0A', '#FF453A', '#0A84FF', '#BF5AF2', '#32D74B'];
      const pData = Object.keys(catMap).map((key, index) => ({
        name: key,
        population: catMap[key],
        color: pieColors[index % pieColors.length],
        legendFontColor: COLORS.textSec,
        legendFontSize: 12
      }));
      setCategoryData(pData);

    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const addFakeData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];

    const fakeSessions = [
      { id: '1', date: today, duration: 45 * 60, category: 'Kodlama', distractions: 0 },
      { id: '2', date: today, duration: 25 * 60, category: 'Ders', distractions: 2 },
      { id: '3', date: yStr, duration: 60 * 60, category: 'Kitap', distractions: 0 },
      { id: '4', date: yStr, duration: 30 * 60, category: 'Kodlama', distractions: 1 },
      { id: '5', date: yStr, duration: 15 * 60, category: 'Spor', distractions: 0 },
    ];
    await AsyncStorage.setItem('@focus_sessions', JSON.stringify(fakeSessions));
    Alert.alert("Başarılı", "Test verileri eklendi.");
    loadData();
  };

  const clearData = async () => {
    await AsyncStorage.removeItem('@focus_sessions');
    loadData();
    Alert.alert("Temizlendi", "Veriler silindi.");
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor={COLORS.primary} />}
    >
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>Performans Özeti</Text>

      {/* 1. İstatistik Kartları */}
      <View style={styles.statsContainer}>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>BUGÜN</Text>
            <Text style={[styles.cardValue, {color: COLORS.accent}]}>{stats.todayTime} dk</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>TOPLAM</Text>
            <Text style={[styles.cardValue, {color: COLORS.primary}]}>{stats.totalTime} dk</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>DİKKAT D.</Text>
            <Text style={[styles.cardValue, {color: COLORS.danger}]}>{stats.totalDistractions}</Text>
        </View>
      </View>

      {/* 2. Bar Chart */}
      <Text style={styles.chartTitle}>Son 7 Günlük Odaklanma</Text>
      {weeklyData && (
        <BarChart
            data={weeklyData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix=" dk"
            chartConfig={{
              backgroundGradientFrom: COLORS.surface,
              backgroundGradientTo: COLORS.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(94, 92, 230, ${opacity})`, // Mor Çubuklar
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              propsForBackgroundLines: { stroke: COLORS.grid }
            }}
            style={styles.chart}
            showBarTops={false}
            fromZero
        />
      )}

      {/* 3. Pie Chart */}
      <Text style={styles.chartTitle}>Kategori Dağılımı (Seans)</Text>
      <View style={styles.pieContainer}>
        <PieChart
            data={categoryData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"0"}
            center={[10, 0]}
            absolute
        />
      </View>

      {/* 4. Test Butonları (Geliştirici) */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugLabel}>Geliştirici Araçları</Text>
        <View style={styles.debugRow}>
            <TouchableOpacity style={styles.debugBtn} onPress={addFakeData}>
                <Text style={styles.debugText}>+ Test Verisi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.debugBtn, {backgroundColor: 'rgba(255, 69, 58, 0.2)', borderWidth:1, borderColor: COLORS.danger}]} onPress={clearData}>
                <Text style={[styles.debugText, {color: COLORS.danger}]}>Temizle</Text>
            </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 25, color: COLORS.text, marginTop: 30 },
  
  // İstatistikler
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  card: { backgroundColor: COLORS.surface, width: '31%', paddingVertical: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 10, color: COLORS.textSec, marginBottom: 5, fontWeight:'bold', letterSpacing: 1 },
  cardValue: { fontSize: 22, fontWeight: 'bold' },

  // Grafikler
  chartTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, marginTop: 10, color: COLORS.text },
  chart: { borderRadius: 16, marginVertical: 8 },
  pieContainer: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 10, alignItems: 'center' },

  // Test Alanı
  debugContainer: { marginTop: 40, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#333', borderStyle: 'dashed' },
  debugLabel: { color: '#666', fontSize: 12, marginBottom: 10, textAlign: 'center' },
  debugRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  debugBtn: { paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#333', borderRadius: 8 },
  debugText: { color: 'white', fontWeight: '600', fontSize: 12 },
});