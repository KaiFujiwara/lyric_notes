import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-black" edges={['top']}>
      <ScreenHeader title="設定" />
      <View className="flex-1 justify-center items-center">
        <Text className="text-base text-gray-500 dark:text-[#8E8E93]">設定画面（未実装）</Text>
      </View>
    </SafeAreaView>
  );
}
