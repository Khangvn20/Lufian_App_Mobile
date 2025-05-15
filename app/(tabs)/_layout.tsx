import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet, View, Platform } from 'react-native';
import { Heart, MessageCircle, Users, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';


export default function TabLayout() {
  const iconSize = 24;
  

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FFB6C1',
        tabBarInactiveTintColor: '#FFC0CB',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]} />
          )
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => (
            <Heart size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => (
            <Users size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => (
            <MessageCircle size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <User size={iconSize} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: 85,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 10,
    backgroundColor: 'transparent',
    borderTopColor: '#FFE4E8',
    borderTopWidth: 1,
    marginBottom: 10,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    paddingBottom: 5,
  },
});