"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Heart, X, Star, RotateCcw, Info } from "lucide-react-native"
import { router } from "expo-router"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Constants
const SCREEN_WIDTH = Dimensions.get("window").width
const SCREEN_HEIGHT = Dimensions.get("window").height
const SWIPE_THRESHOLD = 120
const API_BASE_URL = "http://10.0.2.2:3001/v1"

// Types
type UserData = {
  id: string
  username: string
  email: string
  dateofbirth: string
  gender: string
  role: string
  is_banned: boolean
  createdat: string
  updatedat: string
  last_login: string
}

type ProfileData = {
  id: string
  user_id: string
  prefer_gender: string
  prefer_match: string[]
  bio: string
  hobbies: string[]
  interest: string[]
  privacy: {
    show_age: boolean
    show_weight: boolean
    show_location: boolean
  }
  location: any
  created_at: string
  updated_at: string
}

type MediaData = {
  user_id: string
  avatar_url: string
  photos: string[]
  videos: string[]
}

type InsightsData = {
  user_id: string
  mbti_type: string
  zodiac_sign: string
}

type CareerData = {
  user_id: string
  job_title: string
  company: string
}

type CompatibilityData = {
  TotalScore: number
  Breakdown: {
    Hobbies: number
    Interest: number
    MBTI: number
    MediaBoost: number
    PreferMatch: number
    SexualOrientation: number
    Zodiac: number
  }
}

type ProfileResponse = {
  compatibility: CompatibilityData
  profile: {
    User: UserData
    Profile: ProfileData
    Media: MediaData
    Insights: InsightsData
    Career: CareerData
  }
}

type ApiResponse = {
  profiles: ProfileResponse[]
}

// API Service
const ApiService = {
  getAuthToken: async () => {
    const token = await AsyncStorage.getItem("userToken")
    if (!token) {
      throw new Error("Authentication token not found")
    }
    return token
  },

  getHeaders: async () => {
    const token = await ApiService.getAuthToken()
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Device-Type": "app",
    }
  },

  getMatchHistory: async () => {
    try {
      const headers = await ApiService.getHeaders()
      const response = await axios.get(`${API_BASE_URL}/matches/history`, { headers })
      return response.data
    } catch (error) {
      console.error("Failed to fetch match history:", error)
      throw error
    }
  },

  getSuggestions: async () => {
    try {
      const headers = await ApiService.getHeaders()
      const response = await axios.get(`${API_BASE_URL}/matches/suggestions`, { headers })
      return response.data as ApiResponse
    } catch (error) {
      console.error("Failed to fetch suggestions:", error)
      throw error
    }
  },

  performAction: async (targetId: string, action: string) => {
    try {
      const headers = await ApiService.getHeaders()
      const response = await axios.post(
        `${API_BASE_URL}/matches/action`,
        {
          target_id: targetId,
          action: action,
        },
        { headers },
      )

      console.log(`Action ${action} response:`, response.data)

      // Check if there's a match
      if (response.data && response.data.isMatch) {
        return {
          success: true,
          isMatch: true,
          matchData: response.data,
        }
      }

      return {
        success: true,
        isMatch: false,
      }
    } catch (error) {
      console.error(`Failed to perform action ${action}:`, error)

      if (axios.isAxiosError(error) && error.response) {
        return {
          success: false,
          status: error.response.status,
          message: error.response.data.error || `Failed to perform action ${action}`,
        }
      }

      return {
        success: false,
        message: `Failed to perform action ${action}. Please try again.`,
      }
    }
  },
}

// Fallback data for testing
const FALLBACK_PROFILES: ProfileResponse[] = [
  {
    compatibility: {
      TotalScore: 64,
      Breakdown: {
        Hobbies: 70,
        Interest: 65,
        MBTI: 80,
        MediaBoost: 50,
        PreferMatch: 60,
        SexualOrientation: 90,
        Zodiac: 40,
      },
    },
    profile: {
      User: {
        id: "1",
        username: "Sarah",
        email: "sarah@example.com",
        dateofbirth: "1995-05-15",
        gender: "Female",
        role: "user",
        is_banned: false,
        createdat: "2023-01-01",
        updatedat: "2023-01-01",
        last_login: "2023-05-01",
      },
      Profile: {
        id: "p1",
        user_id: "1",
        prefer_gender: "Male",
        prefer_match: ["Long-term", "Casual"],
        bio: "Surface break manager yard head buy window whether reduce environment money billion popular get.",
        hobbies: ["Movies", "Game", "Photography", "Music", "Travel"],
        interest: ["Art", "Fitness", "Food"],
        privacy: {
          show_age: true,
          show_weight: false,
          show_location: true,
        },
        location: null,
        created_at: "2023-01-01",
        updated_at: "2023-01-01",
      },
      Media: {
        user_id: "1",
        avatar_url: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
        photos: [
          "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
          "https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg",
        ],
        videos: [],
      },
      Insights: {
        user_id: "1",
        mbti_type: "ENFP",
        zodiac_sign: "Taurus",
      },
      Career: {
        user_id: "1",
        job_title: "Financial adviser",
        company: "Wong LLC",
      },
    },
  },
  {
    compatibility: {
      TotalScore: 78,
      Breakdown: {
        Hobbies: 85,
        Interest: 75,
        MBTI: 70,
        MediaBoost: 80,
        PreferMatch: 90,
        SexualOrientation: 70,
        Zodiac: 75,
      },
    },
    profile: {
      User: {
        id: "2",
        username: "Michael",
        email: "michael@example.com",
        dateofbirth: "1992-08-23",
        gender: "Male",
        role: "user",
        is_banned: false,
        createdat: "2023-01-02",
        updatedat: "2023-01-02",
        last_login: "2023-05-02",
      },
      Profile: {
        id: "p2",
        user_id: "2",
        prefer_gender: "Female",
        prefer_match: ["Long-term", "Friendship"],
        bio: "Enjoy hiking, photography, and trying new restaurants. Looking for someone to share adventures with.",
        hobbies: ["Hiking", "Photography", "Cooking", "Reading", "Travel"],
        interest: ["Nature", "Food", "Technology"],
        privacy: {
          show_age: true,
          show_weight: true,
          show_location: true,
        },
        location: null,
        created_at: "2023-01-02",
        updated_at: "2023-01-02",
      },
      Media: {
        user_id: "2",
        avatar_url: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
        photos: [
          "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg",
          "https://images.pexels.com/photos/1310788/pexels-photo-1310788.jpeg",
        ],
        videos: [],
      },
      Insights: {
        user_id: "2",
        mbti_type: "INTJ",
        zodiac_sign: "Leo",
      },
      Career: {
        user_id: "2",
        job_title: "Software Engineer",
        company: "Tech Innovations",
      },
    },
  },
]

export default function DiscoverScreen() {
  // State
  const [profiles, setProfiles] = useState<ProfileResponse[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [recentlyRejected, setRecentlyRejected] = useState<ProfileResponse | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)
  const [showMatchAlert, setShowMatchAlert] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<ProfileResponse | null>(null)

  // Animation values
  const position = useRef(new Animated.ValueXY()).current
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  })

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  })

  const superlikeOpacity = position.y.interpolate({
    inputRange: [-SCREEN_HEIGHT / 8, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  })

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.8, 1],
    extrapolate: "clamp",
  })

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.95, 1],
    extrapolate: "clamp",
  })

  // Calculate age from dateofbirth
  const calculateAge = (dateOfBirth: string): number => {
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  // Fetch profiles data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // First get match history
      await ApiService.getMatchHistory()

      // Then get suggestions
      const suggestionsData = await ApiService.getSuggestions()
      if (suggestionsData.profiles && suggestionsData.profiles.length > 0) {
        console.log("Profiles fetched:", suggestionsData.profiles.length)
        setProfiles(suggestionsData.profiles)
      } else {
        console.log("No profiles returned from API, using fallback data")
        setProfiles(FALLBACK_PROFILES)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      // Use fallback data if API fails
      setProfiles(FALLBACK_PROFILES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy })
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          swipeRight()
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          swipeLeft()
        } else if (gestureState.dy < -SWIPE_THRESHOLD) {
          superLike()
        } else {
          resetPosition()
        }
      },
    }),
  ).current

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start()
  }

  const handleMatchSuccess = (profile: ProfileResponse) => {
    setMatchedProfile(profile)
    setShowMatchAlert(true)
  }

  // Swipe right (like)
  const swipeRight = () => {
    if (currentIndex >= profiles.length || processingAction) return

    const currentProfile = profiles[currentIndex]
    setRecentlyRejected(null)
    setProcessingAction(true)

    // First increment the index to show the next card immediately
    setCurrentIndex(currentIndex + 1)

    // Then animate the current card off screen
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 })

      // Process the API call after animation
      ApiService.performAction(currentProfile.profile.User.id, "right")
        .then((result) => {
          if (result.success && result.isMatch) {
            handleMatchSuccess(currentProfile)
          }
        })
        .catch((error) => {
          console.error("Error liking profile:", error)
        })
        .finally(() => {
          setProcessingAction(false)
        })
    })
  }

  // Swipe left (dislike)
  const swipeLeft = () => {
    if (currentIndex >= profiles.length || processingAction) return

    const currentProfile = profiles[currentIndex]
    setRecentlyRejected(currentProfile)
    setProcessingAction(true)

    // First increment the index to show the next card immediately
    setCurrentIndex(currentIndex + 1)

    // Then animate the current card off screen
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 })

      // Process the API call after animation
      ApiService.performAction(currentProfile.profile.User.id, "left")
        .catch((error) => {
          console.error("Error disliking profile:", error)
        })
        .finally(() => {
          setProcessingAction(false)
        })
    })
  }

  // Super like
  const superLike = () => {
    if (currentIndex >= profiles.length || processingAction) return

    const currentProfile = profiles[currentIndex]
    setRecentlyRejected(null)
    setProcessingAction(true)

    // First increment the index to show the next card immediately
    setCurrentIndex(currentIndex + 1)

    // Then animate the current card off screen
    Animated.timing(position, {
      toValue: { x: 0, y: -SCREEN_HEIGHT - 100 },
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 })

      // Process the API call after animation
      ApiService.performAction(currentProfile.profile.User.id, "superlike")
        .then((result) => {
          if (result.success && result.isMatch) {
            handleMatchSuccess(currentProfile)
          }
        })
        .catch((error) => {
          console.error("Error superliking profile:", error)
        })
        .finally(() => {
          setProcessingAction(false)
        })
    })
  }

  // Restore recently rejected profile
  const restoreProfile = () => {
    if (!recentlyRejected || isRestoring || processingAction) return

    setIsRestoring(true)

    // Insert the rejected profile back at the current position
    const updatedProfiles = [...profiles]
    updatedProfiles.splice(currentIndex - 1, 0, recentlyRejected)
    setProfiles(updatedProfiles)

    // Go back one index
    setCurrentIndex(currentIndex - 1)
    setRecentlyRejected(null)

    setTimeout(() => {
      setIsRestoring(false)
    }, 300)
  }

  // View profile details
  const viewProfileDetails = (profileData: ProfileResponse) => {
    router.push({
      pathname: "/profile-details",
      params: {
        profileId: profileData.profile.User.id,
        // Pass serialized profile data to avoid API call in details screen
        profileData: JSON.stringify(profileData),
      },
    })
  }

  // Render profile card
  const renderCard = (profileData: ProfileResponse, isCurrentCard: boolean) => {
    const profile = profileData.profile
    const user = profile.User
    const media = profile.Media
    const insights = profile.Insights
    const career = profile.Career
    const compatibility = profileData.compatibility

    // Get primary image (avatar)
    const primaryImage = media.avatar_url

    // Get age from dateofbirth
    const age = calculateAge(user.dateofbirth)

    // Get hobbies for display
    const displayHobbies = profile.Profile.hobbies.slice(0, 5)

    return (
      <Animated.View
        key={user.id}
        style={[
          styles.card,
          isCurrentCard
            ? {
                transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
              }
            : {
                opacity: nextCardOpacity,
                transform: [{ scale: nextCardScale }],
                zIndex: -1,
              },
        ]}
        {...(isCurrentCard ? panResponder.panHandlers : {})}
      >
        <Image source={{ uri: primaryImage }} style={styles.cardImage} />

        {/* Compatibility Score Badge */}
        <View style={styles.compatibilityBadge}>
          <Text style={styles.compatibilityScore}>{compatibility.TotalScore}%</Text>
          <Text style={styles.compatibilityLabel}>Match</Text>
        </View>

        {isCurrentCard && (
          <>
            {/* Like Badge */}
            <Animated.View style={[styles.likeDislikeBadge, styles.likeBadge, { opacity: likeOpacity }]}>
              <Text style={styles.badgeText}>LIKE</Text>
            </Animated.View>

            {/* Dislike Badge */}
            <Animated.View style={[styles.likeDislikeBadge, styles.dislikeBadge, { opacity: dislikeOpacity }]}>
              <Text style={styles.badgeText}>NOPE</Text>
            </Animated.View>

            {/* Superlike Badge */}
            <Animated.View style={[styles.likeDislikeBadge, styles.superlikeBadge, { opacity: superlikeOpacity }]}>
              <Text style={styles.badgeText}>SUPER LIKE</Text>
            </Animated.View>
          </>
        )}

        <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.cardGradient}>
          <View style={styles.cardInfo}>
            <View style={styles.nameLocationContainer}>
              <Text style={styles.nameText}>
                {user.username}
                {profile.Profile && profile.Profile.privacy && profile.Profile.privacy.show_age ? `, ${age}` : ""}
              </Text>

              {career && career.job_title && (
                <View style={styles.careerContainer}>
                  <Text style={styles.iconText}>💼</Text>
                  <Text style={styles.locationText}>
                    {career.job_title} {career.company ? `at ${career.company}` : ""}
                  </Text>
                </View>
              )}

              {insights && (
                <View style={styles.insightsContainer}>
                  <Text style={styles.iconText}>🏆</Text>
                  <Text style={styles.insightsText}>{insights.mbti_type}</Text>
                </View>
              )}
            </View>

            <Text style={styles.bioText}>{profile.Profile.bio}</Text>

            <View style={styles.interestsContainer}>
              {displayHobbies.map((hobby, i) => (
                <View key={i} style={styles.interestTag}>
                  <Text style={styles.interestText}>{hobby}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.infoButton} onPress={() => viewProfileDetails(profileData)}>
              <Info size={20} color="#FFFFFF" />
              <Text style={styles.infoButtonText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    )
  }

  // Render profiles
  const renderProfiles = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4458" />
          <Text style={styles.loadingText}>Finding matches for you...</Text>
        </View>
      )
    }

    if (profiles.length === 0 || currentIndex >= profiles.length) {
      return (
        <View style={styles.noMoreProfilesContainer}>
          <Image
            source={{
              uri: "https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
            }}
            style={styles.noMoreProfilesImage}
          />
          <Text style={styles.noMoreProfilesText}>No more profiles to show</Text>
          <Text style={styles.noMoreProfilesSubText}>Check back later for new matches</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      )
    }

    const cards = []

    // Add next card (shown behind current)
    if (currentIndex + 1 < profiles.length) {
      cards.push(renderCard(profiles[currentIndex + 1], false))
    }

    // Add current card
    cards.push(renderCard(profiles[currentIndex], true))

    return cards
  }

  // Match Alert Modal
  const renderMatchAlert = () => {
    if (!showMatchAlert || !matchedProfile) return null

    const profile = matchedProfile.profile

    return (
      <View style={styles.matchAlertOverlay}>
        <View style={styles.matchAlertContainer}>
          <Text style={styles.matchAlertTitle}>It's a Match!</Text>
          <Text style={styles.matchAlertSubtitle}>You and {profile.User.username} liked each other</Text>

          <Image source={{ uri: profile.Media.avatar_url }} style={styles.matchAlertImage} />

          <View style={styles.matchAlertButtons}>
            <TouchableOpacity
              style={[styles.matchAlertButton, styles.matchAlertMessageButton]}
              onPress={() => {
                setShowMatchAlert(false)
                router.push({
                  pathname: "/(tabs)/messages",
                  params: { profileId: profile.User.id },
                })
              }}
            >
              <Text style={[styles.matchAlertButtonText, { color: "#FFFFFF" }]}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.matchAlertButton} onPress={() => setShowMatchAlert(false)}>
              <Text style={styles.matchAlertButtonText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      {/* Main Content */}
      <View style={styles.container}>
        <View style={styles.cardsContainer}>{renderProfiles()}</View>
      </View>

      {/* Action Buttons */}
      {!loading && currentIndex < profiles.length && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dislikeButton, processingAction && styles.disabledButton]}
            onPress={swipeLeft}
            disabled={processingAction}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.restoreButton,
              (!recentlyRejected || isRestoring || processingAction) && styles.disabledButton,
            ]}
            onPress={restoreProfile}
            disabled={!recentlyRejected || isRestoring || processingAction}
          >
            <RotateCcw size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.superLikeButton, processingAction && styles.disabledButton]}
            onPress={superLike}
            disabled={processingAction}
          >
            <Star size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton, processingAction && styles.disabledButton]}
            onPress={swipeRight}
            disabled={processingAction}
          >
            <Heart size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Match Alert Modal */}
      {renderMatchAlert()}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FF4458",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingBottom: 80, // Add padding to make room for the action buttons
  },
  cardsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.65, // Slightly smaller height
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    padding: 20,
    justifyContent: "flex-end",
  },
  cardInfo: {
    width: "100%",
  },
  nameLocationContainer: {
    marginBottom: 8,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  careerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  insightsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  iconText: {
    fontSize: 16,
    marginRight: 6,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
  },
  insightsText: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
  },
  bioText: {
    fontSize: 14,
    color: "white",
    marginTop: 8,
    marginBottom: 10,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    marginBottom: 15,
  },
  interestTag: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 12,
    fontWeight: "500",
    color: "white",
  },
  infoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  infoButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 6,
  },
  compatibilityBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(255, 68, 88, 0.9)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  compatibilityScore: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
  compatibilityLabel: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  likeDislikeBadge: {
    position: "absolute",
    top: 50,
    padding: 10,
    borderWidth: 4,
    borderRadius: 10,
    transform: [{ rotate: "-30deg" }],
    zIndex: 1000,
  },
  likeBadge: {
    right: 40,
    borderColor: "#4CD964",
  },
  dislikeBadge: {
    left: 40,
    borderColor: "#FF3B30",
  },
  superlikeBadge: {
    alignSelf: "center",
    top: 100,
    borderColor: "#007AFF",
    transform: [{ rotate: "0deg" }],
  },
  badgeText: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 1,
    color: "white",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: 25, // Add extra padding at the bottom
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    position: "absolute",
    bottom: 60, // Move up to avoid overlapping with tab bar (which is typically 50-60px)
    left: 0,
    right: 0,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dislikeButton: {
    backgroundColor: "#FF3B30",
  },
  restoreButton: {
    backgroundColor: "#FFCC00",
     width: 50,
    height: 50,
    borderRadius: 20,
  },
  superLikeButton: {
    backgroundColor: "#007AFF",
  },
  likeButton: {
    backgroundColor: "#4CD964",
  },
  disabledButton: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#6B7280",
  },
  noMoreProfilesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noMoreProfilesImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  noMoreProfilesText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FF4458",
    marginBottom: 8,
  },
  noMoreProfilesSubText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
    textAlign: "center",
  },
  refreshButton: {
    backgroundColor: "#FF4458",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  matchAlertOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  matchAlertContainer: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  matchAlertTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FF4458",
    marginBottom: 10,
  },
  matchAlertSubtitle: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  matchAlertImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#FF4458",
  },
  matchAlertButtons: {
    width: "100%",
    flexDirection: "column",
    gap: 10,
  },
  matchAlertButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  matchAlertMessageButton: {
    backgroundColor: "#FF4458",
  },
  matchAlertButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
})
