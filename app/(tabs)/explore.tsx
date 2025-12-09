import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

// Ekran genişliği (Grafiklerin sığması için)
const screenWidth = Dimensions.get('window').width;

export default function ReportScreen() {
  const [stats, setStats] = useState({
    todayTime: 0,
    totalTime: 0,
    totalDistractions: 0,
  });
  
  // Grafikler için veri state'leri
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Verileri Çekme ve Hesaplama
  const loadData = async () => {
    setLoading(true);
    try {
      const jsonValue = await AsyncStorage.getItem('@focus_sessions');
      const sessions = jsonValue != null ? JSON.parse(jsonValue) : [];

      // --- İSTATİSTİK HESAPLAMA ---
      let today = 0;
      let total = 0;
      let distractions = 0;
      const todayStr = new Date().toISOString().split('T')[0];
      
      const catMap: {[key: string]: number} = {};
      const last7DaysMap: {[key: string]: number} = {};

      // Son 7 günün tarihlerini hazırla (Boş günler 0 görünsün diye)
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        last7DaysMap[dateKey] = 0; 
      }

      sessions.forEach((s: any) => {
        // 1. Genel Toplamlar
        total += s.duration;
        distractions += s.distractions || 0;

        // 2. Bugünün Toplamı
        if (s.date === todayStr) {
          today += s.duration;
        }

        // 3. Kategori Dağılımı (Pie Chart için)
        if (catMap[s.category]) {
          catMap[s.category] += 1; // Seans sayısı olarak sayıyoruz
        } else {
          catMap[s.category] = 1;
        }

        // 4. Günlük Dağılım (Bar Chart için)
        if (last7DaysMap[s.date] !== undefined) {
           // Dakikaya çevirip ekle
           last7DaysMap[s.date] += Math.floor(s.duration / 60);
        }
      });

      setStats({
        todayTime: Math.floor(today / 60), // Dakika
        totalTime: Math.floor(total / 60), // Dakika
        totalDistractions: distractions
      });

      // --- GRAFİK VERİLERİNİ HAZIRLA ---
      
      // Bar Chart Verisi (Son 7 Gün)
      const labels = Object.keys(last7DaysMap).map(date => date.slice(8,10)); // Sadece gün kısmı (Örn: 09)
      const dataPoints = Object.values(last7DaysMap);
      
      setWeeklyData({
        labels: labels,
        datasets: [{ data: dataPoints }]
      });

      // Pie Chart Verisi (Kategoriler)
      const pieColors = ['#f39c12', '#e74c3c', '#3498db', '#9b59b6', '#2ecc71'];
      const pData = Object.keys(catMap).map((key, index) => ({
        name: key,
        population: catMap[key],
        color: pieColors[index % pieColors.length],
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
      }));
      setCategoryData(pData);

    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // SAHTE VERİ YÜKLEME (Test İçin)
const addFakeData = async () => {
  const today = new Date().toISOString().split('T')[0];

  // Dün için tarih oluştur
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const fakeSessions = [
    { id: '1', date: today, duration: 25 * 60, category: 'Kodlama', distractions: 0 },
    { id: '2', date: today, duration: 45 * 60, category: 'Ders', distractions: 2 },
    { id: '3', date: yesterdayStr, duration: 60 * 60, category: 'Kitap', distractions: 0 },
    { id: '4', date: yesterdayStr, duration: 30 * 60, category: 'Kodlama', distractions: 1 },
  ];

  await AsyncStorage.setItem('@focus_sessions', JSON.stringify(fakeSessions));
  Alert.alert("Başarılı", "Test verileri yüklendi. Sayfa yenileniyor...");
  loadData(); // Ekranı güncelle
};

// VERİLERİ SİLME (Temizlik İçin)
const clearData = async () => {
    await AsyncStorage.removeItem('@focus_sessions');
    loadData();
    Alert.alert("Temizlendi", "Tüm veriler silindi.");
};

  // Ekran her odaklandığında verileri yenile (Tab değişince güncellemesi için şart)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
    >
      <Text style={styles.header}>Performans Raporu</Text>

      {/* 1. Üst Kartlar (İstatistikler) */}
      <View style={styles.statsContainer}>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Bugün</Text>
            <Text style={styles.cardValue}>{stats.todayTime} dk</Text>
        </View>
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Toplam</Text>
            <Text style={styles.cardValue}>{stats.totalTime} dk</Text>
        </View>
        <View style={styles.card}>
            <Text style={[styles.cardTitle, {color:'#e74c3c'}]}>Dikkat D.</Text>
            <Text style={[styles.cardValue, {color:'#e74c3c'}]}>{stats.totalDistractions}</Text>
        </View>
      </View>

      {/* 2. Bar Chart (Son 7 Gün) */}
      <Text style={styles.chartTitle}>Son 7 Gün Odaklanma (Dk)</Text>
      {weeklyData && (
        <BarChart
            data={weeklyData}
            width={screenWidth - 40}
            height={220}
            yAxisLabel=""
            yAxisSuffix="dk"
            chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
        />
      )}

      {/* 3. Pie Chart (Kategori Dağılımı) */}
      <Text style={styles.chartTitle}>Kategori Dağılımı (Seans Sayısı)</Text>
      <PieChart
        data={categoryData}
        width={screenWidth - 20}
        height={220}
        chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        absolute
      />
      
              {/* Test Butonları (Geliştirme Aşamasında Görünsün) */}
        <View style={styles.debugContainer}>
          <TouchableOpacity style={styles.debugBtn} onPress={addFakeData}>
              <Text style={styles.debugText}>+ Test Verisi Ekle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.debugBtn, {backgroundColor:'#e74c3c'}]} onPress={clearData}>
              <Text style={styles.debugText}>Verileri Temizle</Text>
          </TouchableOpacity>
        </View>

      <View style={{height: 50}} />   

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333', marginTop: 30 },
  
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  card: { backgroundColor: 'white', width: '30%', padding: 15, borderRadius: 10, alignItems: 'center', elevation: 3, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:5 },
  cardTitle: { fontSize: 12, color: '#666', marginBottom: 5, fontWeight:'600' },
  cardValue: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50' },

  chartTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 10, color: '#333' },
  chart: { borderRadius: 16, marginVertical: 8 },
  debugContainer: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 20 },
  debugBtn: { padding: 10, backgroundColor: '#333', borderRadius: 8 },
  debugText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
});