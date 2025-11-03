import { Text, View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface ScreenHeaderProps {
  title: string;
  onHelpPress?: () => void;
  showHelpButton?: boolean;
}

export function ScreenHeader({ title, onHelpPress, showHelpButton = false }: ScreenHeaderProps) {
  return (
    <View className="px-5 py-4">
      <View className="flex-row items-center">
        <Text className="text-2xl font-bold text-black dark:text-white flex-1">{title}</Text>
        {showHelpButton && onHelpPress ? (
          <TouchableOpacity
            className="-mr-2"
            style={{ width: 40, height: 32, alignItems: 'center', justifyContent: 'center' }}
            onPress={onHelpPress}
          >
            <MaterialIcons name="help-outline" size={24} color="#8E8E93" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 0, height: 32 }} />
        )}
      </View>
    </View>
  );
}
