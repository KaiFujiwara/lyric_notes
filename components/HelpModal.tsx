import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function HelpModal({ visible, onClose, title, content }: HelpModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-center items-center"
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View className="w-[85%] max-h-[70%] bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-black dark:text-white">{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              <Text className="text-base text-gray-700 dark:text-gray-300 leading-6">
                {content}
              </Text>
            </ScrollView>

            <TouchableOpacity
              className="mt-4 p-3.5 rounded-lg bg-blue-500 items-center"
              onPress={onClose}
            >
              <Text className="text-base text-white font-semibold">閉じる</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
