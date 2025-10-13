import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { initializeDatabase, isDatabaseReady, getInitializationError } from "@/src/db/runtime";
import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import * as SplashScreen from "expo-splash-screen";

// スプラッシュスクリーンを表示し続ける
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const initializeApp = async () => {
    try {
      setError(null);
      await initializeDatabase();
      setIsReady(true);
    } catch (err) {
      console.error('Failed to initialize app:', err);
      setError(err as Error);
      setIsReady(true);
    } finally {
      await SplashScreen.hideAsync();
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setIsReady(false);

    await SplashScreen.preventAutoHideAsync();
    await initializeApp();
    setIsRetrying(false);
  };

  useEffect(() => {
    // 既に初期化済みかチェック
    if (isDatabaseReady()) {
      setIsReady(true);
      const initError = getInitializationError();
      if (initError) {
        setError(initError);
      }
      // initializeAppのfinallyでSplashScreenが閉じられるため、ここでも呼ぶ
      SplashScreen.hideAsync();
    } else {
      initializeApp();
    }
  }, []);

  // エラー時はRetryボタン付きエラー画面を表示
  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-white">
        <MaterialIcons name="error" size={48} color="#FF3B30" />
        <Text className="text-xl font-bold text-black mt-4 mb-2 text-center">
          初期化に失敗しました
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-6 leading-5">
          {error.message}
        </Text>
        <TouchableOpacity
          className="bg-blue-500 rounded-xl py-3 px-6 min-w-30"
          onPress={handleRetry}
          disabled={isRetrying}
        >
          <Text className="text-white text-base font-semibold text-center">
            {isRetrying ? '再試行中...' : '再試行'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 初期化完了まではスプラッシュスクリーンを表示（このコンポーネントは表示されない）
  if (!isReady) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        lazy: true, // 遅延マウントで初回負荷軽減
        freezeOnBlur: true, // タブ外のツリーを停止して省エネ
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '歌詞',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="library-music" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="phrases"
        options={{
          title: 'フレーズ',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="format-quote" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tags"
        options={{
          title: 'タグ',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="label" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return <AppContent />;
}
