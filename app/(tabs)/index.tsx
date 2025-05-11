import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, PanResponder, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, X, Star, MessageCircle, Info } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 120;

// Sample data for profiles
const DEMO_PROFILES = [
  {
    id: '1',
    name: 'Sarah',
    age: 28,
    location: 'New York, NY',
    bio: 'Coffee enthusiast, book lover and traveler. Looking for someone to share adventures with.',
    distance: '5 miles away',
    images: [
      'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    interests: ['Travel', 'Books', 'Coffee', 'Hiking'],
  },
  {
    id: '2',
    name: 'Michael',
    age: 32,
    location: 'Brooklyn, NY',
    bio: 'Photographer and nature lover. Let\'s capture beautiful moments together!',
    distance: '8 miles away',
    images: [
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    interests: ['Photography', 'Nature', 'Cooking', 'Art'],
  },
  {
    id: '3',
    name: 'Jessica',
    age: 26,
    location: 'Manhattan, NY',
    bio: 'Fitness instructor by day, foodie by night. Balance is everything!',
    distance: '3 miles away',
    images: [
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    interests: ['Fitness', 'Food', 'Yoga', 'Music'],
  },
  {
    id: '4',
    name: 'David',
    age: 30,
    location: 'Queens, NY',
    bio: 'Software engineer who loves hiking and craft beer. Looking for my player 2.',
    distance: '12 miles away',
    images: [
      'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    interests: ['Technology', 'Hiking', 'Beer', 'Gaming'],
  },
];

export default function DiscoverScreen() {
  const [profiles, setProfiles] = useState(DEMO_PROFILES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
  const [dislikedProfiles, setDislikedProfiles] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });
  
  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  const nextCardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.8, 1],
    extrapolate: 'clamp',
  });
  
  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.95, 1],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const swipeRight = () => {
    const currentProfile = profiles[currentIndex];
    setLikedProfiles([...likedProfiles, currentProfile.id]);
    
    // Simulate a match with a 25% chance
    const isMatch = Math.random() < 0.25;
    
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
      setCurrentImageIndex(0);
      
      if (isMatch) {
        // Handle match logic here
      }
    });
  };

  const swipeLeft = () => {
    const currentProfile = profiles[currentIndex];
    setDislikedProfiles([...dislikedProfiles, currentProfile.id]);
    
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
      setCurrentImageIndex(0);
    });
  };

  const superLike = () => {
    const currentProfile = profiles[currentIndex];
    setLikedProfiles([...likedProfiles, currentProfile.id]);
    
    // Super likes have a 50% chance of matching
    const isMatch = Math.random() < 0.5;
    
    Animated.timing(position, {
      toValue: { x: 0, y: -SCREEN_HEIGHT - 100 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
      setCurrentImageIndex(0);
      
      if (isMatch) {
        // Handle match logic here
      }
    });
  };

  const renderProfiles = () => {
    if (currentIndex >= profiles.length) {
      return (
        <View style={styles.noMoreProfilesContainer}>
          <Text style={styles.noMoreProfilesText}>No more profiles to show</Text>
          <Text style={styles.noMoreProfilesSubText}>Check back later for new matches</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={() => setCurrentIndex(0)}
          >
            <LinearGradient
              colors={['#FFB6C1', '#FFC0CB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    return profiles
      .map((profile, index) => {
        if (index < currentIndex) {
          return null;
        } else if (index === currentIndex) {
          return (
            <Animated.View
              key={profile.id}
              style={[
                styles.card,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate },
                  ],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <Animated.View style={[styles.likeOverlay, { opacity: likeOpacity }]}>
                <Text style={styles.overlayText}>LIKE</Text>
              </Animated.View>
              
              <Animated.View style={[styles.dislikeOverlay, { opacity: dislikeOpacity }]}>
                <Text style={styles.overlayText}>NOPE</Text>
              </Animated.View>
              
              <Image source={{ uri: profile.images[currentImageIndex] }} style={styles.cardImage} />
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.cardGradient}
              >
                <View style={styles.cardInfo}>
                  <View style={styles.nameAgeContainer}>
                    <Text style={styles.nameText}>{profile.name}, {profile.age}</Text>
                    <TouchableOpacity style={styles.infoIcon}>
                      <Info size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.locationText}>{profile.location}</Text>
                  <Text style={styles.distanceText}>{profile.distance}</Text>
                  
                  <View style={styles.interestsContainer}>
                    {profile.interests.map((interest, i) => (
                      <View key={i} style={styles.interestTag}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          );
        } else if (index === currentIndex + 1) {
          return (
            <Animated.View
              key={profile.id}
              style={[
                styles.card, 
                styles.nextCard,
                {
                  opacity: nextCardOpacity,
                  transform: [{ scale: nextCardScale }],
                },
              ]}
            >
              <Image source={{ uri: profile.images[0] }} style={styles.cardImage} />
              
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.cardGradient}
              >
                <View style={styles.cardInfo}>
                  <View style={styles.nameAgeContainer}>
                    <Text style={styles.nameText}>{profile.name}, {profile.age}</Text>
                    <TouchableOpacity style={styles.infoIcon}>
                      <Info size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.locationText}>{profile.location}</Text>
                  <Text style={styles.distanceText}>{profile.distance}</Text>
                  
                  <View style={styles.interestsContainer}>
                    {profile.interests.map((interest, i) => (
                      <View key={i} style={styles.interestTag}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
          );
        }
      })
      .reverse();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>
      
      <View style={styles.cardsContainer}>
        {renderProfiles()}
      </View>
      
      {currentIndex < profiles.length && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.dislikeButton]} onPress={swipeLeft}>
            <X size={30} color="#FF5864" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.superLikeButton]} onPress={superLike}>
            <Star size={30} color="#00D1FF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={swipeRight}>
            <Heart size={30} color="#FFB6C1" fill="#FFB6C1" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F6',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4E8',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FF8DA1',
  },
  cardsContainer: {
    flex: 1,
    marginTop: 20,
    marginBottom: 100,
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.65,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  nextCard: {
    top: 10,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    padding: 20,
    justifyContent: 'flex-end',
  },
  cardInfo: {
    width: '100%',
  },
  nameAgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: 'white',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: 'white',
    marginTop: 4,
  },
  distanceText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'white',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: 'white',
  },
  superLikeButton: {
    backgroundColor: 'white',
  },
  likeButton: {
    backgroundColor: 'white',
  },
  likeOverlay: {
    position: 'absolute',
    top: 50,
    right: 40,
    zIndex: 1000,
    transform: [{ rotate: '20deg' }],
  },
  dislikeOverlay: {
    position: 'absolute',
    top: 50,
    left: 40,
    zIndex: 1000,
    transform: [{ rotate: '-20deg' }],
  },
  overlayText: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    borderWidth: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    color: '#FFB6C1',
    borderColor: '#FFB6C1',
  },
  noMoreProfilesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMoreProfilesText: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#FF8DA1',
    marginBottom: 8,
  },
  noMoreProfilesSubText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FF8DA1',
    marginBottom: 30,
    textAlign: 'center',
  },
  refreshButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '80%',
    maxWidth: 300,
    elevation: 3,
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});