import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export function FloatingActionButton({
  onPress,
  icon = "add",
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      className="absolute bottom-8 w-20 h-20 bg-blue-500 rounded-full items-center justify-center shadow-lg self-center"
      style={{ left: '50%', marginLeft: -40 }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialIcons name={icon} size={36} color="white" />
    </TouchableOpacity>
  );
}
