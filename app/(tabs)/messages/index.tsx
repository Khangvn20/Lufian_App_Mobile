import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { Search, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DEMO_CONVERSATIONS = [
  {
    id: '2',
    name: 'Michael',
    age: 32,
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    lastMessage: 'Hey, how are you doing today?',
    lastMessageTime: '2m ago',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '3',
    name: 'Jessica',
    age: 26,
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    lastMessage: 'I love that restaurant too! We should definitely go there sometime.',
    lastMessageTime: '1h ago',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '4',
    name: 'David',
    age: 30,
    image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    lastMessage: 'Let\'s meet up this weekend',
    lastMessageTime: '3h ago',
    unreadCount: 3,
    isOnline: true,
  },
  {
    id: '5',
    name: 'Emma',
    age: 27,
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    lastMessage: 'What are your plans for the weekend?',
    lastMessageTime: '1d ago',
    unreadCount: 0,
    isOnline: false,
  },
];

export default function MessagesScreen() {
  const [conversations, setConversations] = useState(DEMO_CONVERSATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredConversations = searchQuery 
    ? conversations.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const handleConversationPress = (id: string) => {
    // Mark messages as read
    setConversations(
      conversations.map(convo => 
        convo.id === id ? { ...convo, unreadCount: 0 } : convo
      )
    );
    
    // Navigate to conversation
    router.push(`/messages/${id}`);
  };

  const renderConversationItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.conversationItem} 
        onPress={() => handleConversationPress(item.id)}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.image }} style={styles.avatar} />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        
        <View style={styles.conversationDetails}>
          <View style={styles.conversationHeader}>
            <Text style={styles.nameText}>{item.name}, {item.age}</Text>
            <Text style={styles.timeText}>{item.lastMessageTime}</Text>
          </View>
          
          <Text 
            style={[
              styles.messageText, 
              item.unreadCount > 0 && styles.unreadMessageText
            ]} 
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        </View>
        
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversationItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MessageCircle size={60} color="#6C63FF" />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'No conversations match your search'
                : 'Start a conversation with your matches'}
            </Text>
            
            {!searchQuery && (
              <TouchableOpacity 
                style={styles.matchesButton}
                onPress={() => router.navigate('/(tabs)/matches')}
              >
                <LinearGradient
                  colors={['#6C63FF', '#8F87FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.matchesButtonText}>Go to Matches</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    height: 46,
    borderRadius: 23,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationDetails: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  unreadMessageText: {
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  unreadBadge: {
    backgroundColor: '#6C63FF',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  matchesButton: {
    borderRadius: 25,
    overflow: 'hidden',
    width: '70%',
    marginTop: 8,
  },
  gradientButton: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchesButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});