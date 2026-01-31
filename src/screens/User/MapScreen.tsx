import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

export default function MapScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1F44' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1F44" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Who is Playing</Text>
        <View style={{ width: 42 }} />
      </View>

      {/* WebView Map */}
      <WebView
        source={{
          html: `
            <html>
              <head>
                <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
                <style>
                  html, body, #map { height: 100%; margin: 0; padding: 0; }
                </style>
              </head>
              <body>
                <iframe
                  id="map"
                  width="100%"
                  height="100%"
                  src="https://www.google.com/maps/embed/v1/view?zoom=12&center=24.8607,67.0011"
                  frameborder="0"
                  style="border:0;"
                  allowfullscreen>
                </iframe>
              </body>
            </html>
          `,
        }}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 70,
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
});
