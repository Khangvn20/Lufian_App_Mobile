import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { Heart, MessageCircle, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Sample data for matches
const DEMO_MATCHES = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    location: 'New York, NY',
    matchedOn: '2h ago',
    image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isNew: true,
    lastMessage: null,
  },
  {
    id: '2',
    name: 'Michael',
    age: 32,
    location: 'Brooklyn, NY',
    matchedOn: '1d ago',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isNew: false,
    lastMessage: 'Hey, how are you doing today?',
  },
  {
    id: '3',
    name: 'Jessica',
    age: 26,
    location: 'Manhattan, NY',
    matchedOn: '3d ago',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isNew: false,
    lastMessage: 'I love that restaurant too!',
  },
  {
    id: '4',
    name: 'David',
    age: 30,
    location: 'Queens, NY',
    matchedOn: '1w ago',
    image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isNew: false,
    lastMessage: 'Let\'s meet up this weekend',
  },
  {
    id: '5',
    name: 'Emma',
    age: 27,
    location: 'Jersey City, NJ',
    matchedOn: '2w ago',
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isNew: false,
    lastMessage: 'What are your plans for the weekend?',
  },
];

export default function MatchesScreen() {
  const [matches, setMatches] = useState(DEMO_MATCHES);
  const [filterActive, setFilterActive] = useState(false);
  
  const newMatches = matches.filter(match => match.isNew);
  const messageMatches = matches.filter(match => !match.isNew && match.lastMessage);
  const pendingMatches = matches.filter(match => !match.isNew && !match.lastMessage);

  const handleStartConversation = (matchId: string) => {
    // Update the match to show it's no longer new
    setMatches(
      matches.map(match => 
        match.id === matchId ? { ...match, isNew: false } : match
      )
    );
    
    // Navigate to messages
    router.push(`/messages/${matchId}`);
  };

  const renderMatchItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.matchItem} 
        onPress={() => handleStartConversation(item.id)}
      >
        <Image source={{ uri: item.image }} style={styles.matchImage} />
        
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        
        <View style={styles.matchDetails}>
          <View style={styles.matchHeaderRow}>
            <Text style={styles.matchName}>{item.name}, {item.age}</Text>
            <Text style={styles.matchTime}>{item.matchedOn}</Text>
          </View>
          
          <Text style={styles.matchLocation}>{item.location}</Text>
          
          {item.lastMessage ? (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          ) : (
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.messageButton}
                onPress={() => handleStartConversation(item.id)}
              >
                <LinearGradient
                  colors={['#6C63FF', '#8F87FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <MessageCircle size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.messageButtonText}>Message</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = ({ title, count }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterActive(!filterActive)}
        >
          <Filter size={22} color={filterActive ? '#6C63FF' : '#6B7280'} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {newMatches.length > 0 && <ListHeader title="New Matches" count={newMatches.length} />}
            {messageMatches.length > 0 && <ListHeader title="Messages" count={messageMatches.length} />}
            {pendingMatches.length > 0 && <ListHeader title="Waiting for Messages" count={pendingMatches.length} />}
          </>
        }
        stickyHeaderIndices={[]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Heart size={60} color="#6C63FF" />
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptyText}>Keep swiping to find your matches</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#111827',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    backgroundColor: '#F9FAFB',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  matchItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  matchImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#6C63FF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newBadgeText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  matchDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  matchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
  },
  matchTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  matchLocation: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 4,
  },
  lastMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4B5563',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  messageButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    height: 36,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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
  },
});