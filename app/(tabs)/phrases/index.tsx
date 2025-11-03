import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { HelpModal } from "@/components/HelpModal";

export default function PhrasesScreen() {
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-black" edges={['top']}>
      <ScreenHeader
        title="フレーズ"
        showHelpButton={true}
        onHelpPress={() => setHelpModalVisible(true)}
      />
      <View className="flex-1 justify-center items-center">
        <Text className="text-base text-gray-500 dark:text-[#8E8E93]">フレーズストック機能（未実装）</Text>
      </View>

      <HelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        title="フレーズについて"
        content="フレーズストックは、思いついた歌詞のフレーズを保存しておく機能です。気に入ったフレーズをストックしておき、後で歌詞制作に活用できます。&#10;&#10;タグやカテゴリーで整理することで、必要な時にすぐに見つけられます。"
      />

      <FloatingActionButton onPress={() => {}} />
    </SafeAreaView>
  );
}
