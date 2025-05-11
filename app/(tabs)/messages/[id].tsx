import { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Send, Image as ImageIcon, Heart, Smile } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Sample user data
const USERS = {
  '2': {
    id: '2',
    name: 'Michael',
    age: 32,
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isOnline: true,
    lastSeen: null,
  },
  '3': {
    id: '3',
    name: 'Jessica',
    age: 26,
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isOnline: false,
    lastSeen: '10m ago',
  },
  '4': {
    id: '4',
    name: 'David',
    age: 30,
    image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isOnline: true,
    lastSeen: null,
  },
  '5': {
    id: '5',
    name: 'Emma',
    age: 27,
    image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    isOnline: false,
    lastSeen: '1h ago',
  },
};

// Sample message data
const DEMO_MESSAGES = {
  '2': [
    { id: '1', text: 'Hey there!', sender: 'them', timestamp: '10:15 AM' },
    { id: '2', text: 'Hi! How are you?', sender: 'me', timestamp: '10:17 AM' },
    { id: '3', text: 'I\'m good, thanks for asking. What about you?', sender: 'them', timestamp: '10:20 AM' },
    { id: '4', text: 'I\'m doing well too. Just checking out this new dating app.', sender: 'me', timestamp: '10:25 AM' },
    { id: '5', text: 'Hey, how are you doing today?', sender: 'them', timestamp: '11:30 AM' },
  ],
  '3': [
    { id: '1', text: 'I saw that you like Italian food?', sender: 'me', timestamp: '5:30 PM' },
    { id: '2', text: 'Yes, I absolutely love it! Do you have a favorite restaurant?', sender: 'them', timestamp: '5:32 PM' },
    { id: '3', text: 'There\'s this great place downtown called Bella Vita. Have you been there?', sender: 'me', timestamp: '5:35 PM' },
    { id: '4', text: 'I love that restaurant too!', sender: 'them', timestamp: '5:36 PM' },
  ],
  '4': [
    { id: '1', text: 'Good morning!', sender: 'them', timestamp: '9:00 AM' },
    { id: '2', text: 'Morning! How\'s your day going?', sender: 'me', timestamp: '9:15 AM' },
    { id: '3', text: 'Pretty good. I was thinking we could meet up this weekend?', sender: 'them', timestamp: '9:20 AM' },
    { id: '4', text: 'Let\'s meet up this weekend', sender: 'them', timestamp: '10:30 AM' },
  ],
  '5': [
    { id: '1', text: 'Hi there, I noticed we both like hiking!', sender: 'them', timestamp: '3:45 PM' },
    { id: '2', text: 'Yes! I try to go at least once a month. How about you?', sender: 'me', timestamp: '4:00 PM' },
    { id: '3', text: 'Same here. Do you have any favorite trails?', sender: 'them', timestamp: '4:05 PM' },
    { id: '4', text: 'What are your plans for the weekend?', sender: 'them', timestamp: '5:30 PM' },
  ],
};

export default function ConversationScreen() {
  const { id } = useLocalSearchParams();
  const userId = id as string;
  const user = USERS[userId];
  
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState(DEMO_MESSAGES[userId] || []);
  const flatListRef = useRef(null);
  
  useEffect(() => {
    // Scroll to bottom when component mounts
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 200);
  }, []);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Scroll to bottom after sending message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // Simulate a reply after a delay
    if (Math.random() > 0.5) {
      setTimeout(() => {
        const replies = [
          'That sounds interesting!',
          'I\'d love to hear more about that.',
          'Thanks for sharing!',
          'What else do you enjoy doing?',
          'Have you been doing that for long?',
          'That\'s amazing!',
        ];
        
        const replyMessage = {
          id: Date.now().toString(),
          text: replies[Math.floor(Math.random() * replies.length)],
          sender: 'them',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        
        setMessages(prevMessages => [...prevMessages, replyMessage]);
        
        // Scroll to bottom after receiving reply
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }, 2000 + Math.random() * 2000);
    }
  };

  const renderMessageItem = ({ item, index }) => {
    const isMe = item.sender === 'me';
    const showAvatar = index === 0 || messages[index - 1].sender !== item.sender;
    
    return (
      <View style={[styles.messageRow, isMe ? styles.myMessageRow : styles.theirMessageRow]}>
        {!isMe && showAvatar ? (
          <Image source={{ uri: user.image }} style={styles.avatar} />
        ) : !isMe ? (
          <View style={styles.avatarSpacer} />
        ) : null}
        
        <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timeText}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.userInfoContainer}>
            <Image source={{ uri: user.image }} style={styles.headerAvatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}, {user.age}</Text>
              <Text style={styles.userStatus}>
                {user.isOnline ? 'Online' : `Last seen ${user.lastSeen}`}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
        />
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <ImageIcon size={24} color="#6C63FF" />
          </TouchableOpacity>
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Smile size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          {inputText.trim() ? (
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={sendMessage}
            >
              <LinearGradient
                colors={['#6C63FF', '#8F87FF']}
                style={styles.sendButtonGradient}
              >
                <Send size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.likeButton}>
              <Heart size={24} color="#6C63FF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 10 : 50,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
  },
  userStatus: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: user => user?.isOnline ? '#10B981' : '#6B7280',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
  },
  theirMessageRow: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  avatarSpacer: {
    width: 36,
    marginRight: 8,
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  myMessage: {
    backgroundColor: '#6C63FF',
    borderTopRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: message => message?.sender === 'me' ? '#FFFFFF' : '#111827',
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: message => message?.sender === 'me' ? 'rgba(255, 255, 255, 0.7)' : '#9CA3AF',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    maxHeight: 100,
    paddingVertical: 8,
  },
  emojiButton: {
    padding: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});