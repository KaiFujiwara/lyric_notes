import { Stack } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { initializeDatabase, isDatabaseReady, getInitializationError } from "@/src/db/runtime";
import { forceDeleteDatabaseBeforeInit } from "@/src/db/dev-utils";
import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import "../global.css";

// スプラッシュスクリーンを表示し続ける
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const initializeApp = async () => {
    try {
      setError(null);

      // TEMPORARY: 開発環境でのみ、DB接続前にファイルを完全削除
      // TODO: スキーマが安定したら削除すること
      if (__DEV__) {
        await forceDeleteDatabaseBeforeInit();
      }

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
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return <AppContent />;
}
