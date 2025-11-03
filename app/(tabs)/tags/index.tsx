import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { HelpModal } from "@/components/HelpModal";

export default function TagsScreen() {
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-black" edges={['top']}>
      <ScreenHeader
        title="タグ"
        showHelpButton={true}
        onHelpPress={() => setHelpModalVisible(true)}
      />
      <View className="flex-1 justify-center items-center">
        <Text className="text-base text-gray-500 dark:text-[#8E8E93]">タグ管理機能（未実装）</Text>
      </View>

      <HelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        title="タグについて"
        content="タグ管理機能では、プロジェクトやフレーズに付けるタグを作成・管理できます。&#10;&#10;「ラブソング」「別れ」「希望」などのテーマ別タグを作成することで、歌詞やフレーズを整理しやすくなります。"
      />

      <FloatingActionButton onPress={() => {}} />
    </SafeAreaView>
  );
}
