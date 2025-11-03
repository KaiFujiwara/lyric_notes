import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 justify-center items-center py-20">
      <MaterialIcons name={icon} size={64} color="#C7C7CC" />
      <Text className="text-lg font-semibold text-gray-500 dark:text-[#8E8E93] mt-4">{title}</Text>
      {subtitle && (
        <Text className="text-sm text-gray-400 dark:text-[#636366] mt-2">{subtitle}</Text>
      )}
    </View>
  );
}
