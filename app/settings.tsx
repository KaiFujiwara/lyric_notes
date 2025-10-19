import { Text, View, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightComponent
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <MaterialIcons name={icon as any} size={24} color="#007AFF" />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && !rightComponent && (
          <MaterialIcons name="chevron-right" size={20} color="#8E8E93" />
        )}
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="一般" />
        <View style={styles.section}>
          <SettingItem
            icon="notifications"
            title="通知"
            subtitle="リマインダーや更新通知"
            showArrow={false}
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingItem
            icon="save"
            title="自動保存"
            subtitle="編集内容を自動的に保存"
            showArrow={false}
            rightComponent={
              <Switch
                value={autoSave}
                onValueChange={setAutoSave}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <SettingItem
            icon="dark-mode"
            title="ダークモード"
            subtitle="画面の表示テーマ"
            showArrow={false}
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        <SectionHeader title="データ" />
        <View style={styles.section}>
          <SettingItem
            icon="sync"
            title="同期設定"
            subtitle="デバイス間でのデータ同期"
            onPress={() => {}}
          />
          <SettingItem
            icon="download"
            title="データのエクスポート"
            subtitle="歌詞データを他の形式で出力"
            onPress={() => {}}
          />
        </View>

        <SectionHeader title="アプリについて" />
        <View style={styles.section}>
          <SettingItem
            icon="info"
            title="バージョン情報"
            subtitle="v1.0.0"
            onPress={() => {}}
          />
          <SettingItem
            icon="help"
            title="ヘルプ・サポート"
            subtitle="使い方やお問い合わせ"
            onPress={() => {}}
          />
          <SettingItem
            icon="star"
            title="アプリを評価"
            subtitle="App Storeでレビューを書く"
            onPress={() => {}}
          />
          <SettingItem
            icon="favorite"
            title="開発者を応援"
            subtitle="今後の開発をサポート"
            onPress={() => {}}
          />
        </View>

        <SectionHeader title="プライバシー" />
        <View style={styles.section}>
          <SettingItem
            icon="privacy-tip"
            title="プライバシーポリシー"
            onPress={() => {}}
          />
          <SettingItem
            icon="description"
            title="利用規約"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 20,
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});