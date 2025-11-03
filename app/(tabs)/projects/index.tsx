import { Text, View, TouchableOpacity, FlatList, TextInput, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useProjects } from "./hooks/useProjects";
import { Project } from "@/src/domain/entities/Project";
import { ScreenHeader } from "@/components/ScreenHeader";
import { EmptyState } from "@/components/EmptyState";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { HelpModal } from "@/components/HelpModal";

export default function ProjectsScreen() {
  const { projects, loading, loadProjects, createProject } = useProjects();
  const [modalVisible, setModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");

  // 新規プロジェクト作成
  const handleCreateProject = async () => {
    const success = await createProject(newProjectTitle);
    if (success) {
      setNewProjectTitle("");
      setModalVisible(false);
    }
  };

  const renderProject = ({ item }: { item: Project }) => (
    <TouchableOpacity className="bg-white dark:bg-[#1C1C1E] rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-black dark:text-white flex-1">{item.title}</Text>
        <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
      </View>
      <View className="flex-row items-center">
        <Text className="text-sm text-gray-500">
          {new Date(item.updatedAt).toLocaleDateString('ja-JP')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <EmptyState
      icon="library-music"
      title="プロジェクトがありません"
      subtitle="右下の + ボタンから作成できます"
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-black" edges={['top']}>
      <ScreenHeader
        title="歌詞プロジェクト"
        showHelpButton={true}
        onHelpPress={() => setHelpModalVisible(true)}
      />

      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? renderEmpty : null}
        refreshing={loading}
        onRefresh={loadProjects}
      />

      {/* 新規作成モーダル */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="w-[85%] bg-white dark:bg-[#1C1C1E] rounded-2xl p-5">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-bold text-black dark:text-white">新規プロジェクト</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <TextInput
              className="border border-gray-200 dark:border-[#38383A] dark:bg-[#2C2C2E] rounded-lg p-3 text-base mb-5 text-black dark:text-white"
              placeholder="プロジェクトタイトル"
              placeholderTextColor="#8E8E93"
              value={newProjectTitle}
              onChangeText={setNewProjectTitle}
              autoFocus
              maxLength={200}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 p-3.5 rounded-lg border border-gray-200 dark:border-[#38383A] dark:bg-[#2C2C2E] items-center"
                onPress={() => setModalVisible(false)}
              >
                <Text className="text-base text-gray-500 dark:text-white font-semibold">キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 p-3.5 rounded-lg bg-blue-500 items-center"
                onPress={handleCreateProject}
              >
                <Text className="text-base text-white font-semibold">作成</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <HelpModal
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
        title="歌詞プロジェクトについて"
        content="歌詞プロジェクトは、楽曲ごとに歌詞を管理する機能です。プロジェクトを作成すると、歌詞のバージョン管理や音数カウント、韻チェックなどの機能を利用できます。&#10;&#10;下部の + ボタンから新しいプロジェクトを作成できます。"
      />

      <FloatingActionButton onPress={() => setModalVisible(true)} />
    </SafeAreaView>
  );
}
