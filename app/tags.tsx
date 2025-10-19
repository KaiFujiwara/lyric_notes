import { Text, View, StyleSheet, TouchableOpacity, FlatList, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

export default function TagsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const tags = [
    { id: '1', name: '空', usageCount: 15, color: '#E3F2FD', textColor: '#1976D2' },
    { id: '2', name: '心', usageCount: 12, color: '#FCE4EC', textColor: '#C2185B' },
    { id: '3', name: '風', usageCount: 8, color: '#E8F5E8', textColor: '#388E3C' },
    { id: '4', name: '歌声', usageCount: 6, color: '#FFF3E0', textColor: '#F57C00' },
    { id: '5', name: '自由', usageCount: 5, color: '#F3E5F5', textColor: '#7B1FA2' },
    { id: '6', name: '愛', usageCount: 4, color: '#FFEBEE', textColor: '#D32F2F' },
  ];

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTag = ({ item }: { item: any }) => (
    <TouchableOpacity style={[styles.tagCard, { backgroundColor: item.color }]}>
      <View style={styles.tagContent}>
        <Text style={[styles.tagName, { color: item.textColor }]}>{item.name}</Text>
        <Text style={[styles.tagUsage, { color: item.textColor }]}>
          {item.usageCount}回使用
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={item.textColor} />
    </TouchableOpacity>
  );

  const popularTags = tags.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>タグ管理</Text>
        <TouchableOpacity style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="タグを検索"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#8E8E93"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.length === 0 && (
        <View style={styles.popularSection}>
          <Text style={styles.sectionTitle}>よく使うタグ</Text>
          <View style={styles.popularTagsContainer}>
            {popularTags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[styles.popularTag, { backgroundColor: tag.color }]}
              >
                <Text style={[styles.popularTagText, { color: tag.textColor }]}>
                  {tag.name}
                </Text>
                <Text style={[styles.popularTagCount, { color: tag.textColor }]}>
                  {tag.usageCount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.allTagsSection}>
        <Text style={styles.sectionTitle}>
          {searchQuery.length > 0 ? '検索結果' : 'すべてのタグ'}
        </Text>
        <FlatList
          data={filteredTags}
          renderItem={renderTag}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000000',
  },
  popularSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  popularTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  popularTag: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  popularTagText: {
    fontSize: 16,
    fontWeight: '600',
  },
  popularTagCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  allTagsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  tagCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tagContent: {
    flex: 1,
  },
  tagName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  tagUsage: {
    fontSize: 14,
    fontWeight: '500',
  },
});