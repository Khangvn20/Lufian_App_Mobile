"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
} from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { ChevronLeft, Heart, X, Star, MessageCircle } from "lucide-react-native"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

const { width } = Dimensions.get("window")
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

  getProfileDetails: async (profileId: string) => {
    try {
      const headers = await ApiService.getHeaders()
      const response = await axios.get(`${API_BASE_URL}/profiles/${profileId}`, { headers })
      return response.data
    } catch (error) {
      console.error("Failed to fetch profile details:", error)
      throw error
    }
  },

  // Replace the individual action methods with a single performAction method
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

export default function ProfileDetailsScreen() {
  const { profileId, profileData: serializedProfileData } = useLocalSearchParams()
  const [profileResponse, setProfileResponse] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos")
  const [processingAction, setProcessingAction] = useState(false)
  const [showMatchAlert, setShowMatchAlert] = useState(false)

  // Add a helper function at the top of the component function to safely access nested properties
  const safelyAccessProfile = () => {
    if (!profileResponse || !profileResponse.profile) {
      return {
        User: { username: "", dateofbirth: "", gender: "" },
        Profile: {
          bio: "",
          hobbies: [],
          interest: [],
          prefer_gender: "",
          prefer_match: [],
          privacy: { show_age: false, show_weight: false, show_location: false },
        },
        Media: { avatar_url: "", photos: [], videos: [] },
        Insights: null,
        Career: null,
      }
    }
    return profileResponse.profile
  }

  // Add a helper function to safely access compatibility data
  const safelyAccessCompatibility = () => {
    if (!profileResponse || !profileResponse.compatibility) {
      return {
        TotalScore: 0,
        Breakdown: {},
      }
    }
    return profileResponse.compatibility
  }

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

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true)
      try {
        // First try to parse the serialized profile data if available
        if (serializedProfileData) {
          try {
            const parsedData = JSON.parse(serializedProfileData as string) as ProfileResponse
            setProfileResponse(parsedData)
            setLoading(false)
            return
          } catch (parseError) {
            console.error("Error parsing profile data:", parseError)
            // Continue to fetch from API if parsing fails
          }
        }

        // Fetch from API if no serialized data or parsing failed
        if (!profileId) {
          throw new Error("No profile ID provided")
        }

        const data = await ApiService.getProfileDetails(profileId as string)
        if (data && data.profile) {
          setProfileResponse(data)
        } else {
          throw new Error("Invalid profile data returned from API")
        }
      } catch (error) {
        console.error("Error loading profile details:", error)
        // No fallback in this case, we'll show an error message
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [profileId, serializedProfileData])

  const handleMatchSuccess = () => {
    setShowMatchAlert(true)
  }

  // Update the handler methods to use the new performAction method
  const handleLike = async () => {
    if (!profileResponse || processingAction) return

    setProcessingAction(true)

    try {
      // This sends "right" action when the heart button is pressed
      const result = await ApiService.performAction(profileResponse.profile.User.id, "right")

      if (result.success) {
        if (result.isMatch) {
          handleMatchSuccess()
        } else {
          router.back()
        }
      } else {
        Alert.alert("Error", result.message || "Failed to like profile")
      }
    } catch (error) {
      console.error("Error liking profile:", error)
      Alert.alert("Error", "Failed to like profile. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleDislike = async () => {
    if (!profileResponse || processingAction) return

    setProcessingAction(true)

    try {
      // This sends "left" action when the X button is pressed
      const result = await ApiService.performAction(profileResponse.profile.User.id, "left")

      if (result.success) {
        router.back()
      } else {
        Alert.alert("Error", result.message || "Failed to dislike profile")
      }
    } catch (error) {
      console.error("Error disliking profile:", error)
      Alert.alert("Error", "Failed to dislike profile. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleSuperlike = async () => {
    if (!profileResponse || processingAction) return

    setProcessingAction(true)

    try {
      const result = await ApiService.performAction(profileResponse.profile.User.id, "superlike")

      if (result.success) {
        if (result.isMatch) {
          handleMatchSuccess()
        } else {
          router.back()
        }
      } else {
        Alert.alert("Error", result.message || "Failed to superlike profile")
      }
    } catch (error) {
      console.error("Error superliking profile:", error)
      Alert.alert("Error", "Failed to superlike profile. Please try again.")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleMessage = () => {
    if (!profileResponse) return

    router.push({
      pathname: "/(tabs)/messages",
      params: { profileId: profileResponse.profile.User.id },
    })
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4458" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    )
  }

  if (!profileResponse) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // Replace the destructuring after the null check for profileResponse with:
  const profile = safelyAccessProfile()
  const compatibility = safelyAccessCompatibility()
  const { User, Profile, Media, Insights, Career } = profile

  // Get age from dateofbirth
  const age = calculateAge(User.dateofbirth)

  // Prepare media for gallery
  const photos = Media?.avatar_url ? [Media.avatar_url, ...(Media.photos || [])] : []
  const videos = Media?.videos || []
  const mediaItems = activeTab === "photos" ? photos : videos

  // Match Alert Modal
  const renderMatchAlert = () => {
    if (!showMatchAlert) return null

    return (
      <View style={styles.matchAlertOverlay}>
        <View style={styles.matchAlertContainer}>
          <Text style={styles.matchAlertTitle}>It's a Match!</Text>
          <Text style={styles.matchAlertSubtitle}>You and {User.username} liked each other</Text>

          <Image source={{ uri: Media.avatar_url }} style={styles.matchAlertImage} />

          <View style={styles.matchAlertButtons}>
            <TouchableOpacity
              style={[styles.matchAlertButton, styles.matchAlertMessageButton]}
              onPress={() => {
                setShowMatchAlert(false)
                router.push({
                  pathname: "/(tabs)/messages",
                  params: { profileId: User.id },
                })
              }}
            >
              <Text style={[styles.matchAlertButtonText, styles.matchAlertMessageButtonText]}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.matchAlertButton}
              onPress={() => {
                setShowMatchAlert(false)
                router.back()
              }}
            >
              <Text style={styles.matchAlertButtonText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  // Replace all direct accesses to Profile.privacy.show_age with:
  const showAge = Profile?.privacy?.show_age ?? false

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#FF4458" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{User.username}'s Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGalleryContainer}>
          {/* Media Type Tabs */}
          <View style={styles.mediaTabs}>
            <TouchableOpacity
              style={[styles.mediaTab, activeTab === "photos" && styles.activeMediaTab]}
              onPress={() => setActiveTab("photos")}
            >
              <Text style={[styles.mediaTabText, activeTab === "photos" && styles.activeMediaTabText]}>
                Photos ({photos.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mediaTab, activeTab === "videos" && styles.activeMediaTab]}
              onPress={() => setActiveTab("videos")}
            >
              <Text style={[styles.mediaTabText, activeTab === "videos" && styles.activeMediaTabText]}>
                Videos ({videos.length})
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={mediaItems}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const slideIndex = Math.floor(
                event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width,
              )
              setCurrentImageIndex(slideIndex)
            }}
            renderItem={({ item }) =>
              activeTab === "photos" ? (
                <Image source={{ uri: item }} style={styles.profileImage} />
              ) : (
                <View style={styles.videoContainer}>
                  {/* Video component would go here */}
                  <Image
                    source={{ uri: "https://images.pexels.com/photos/3379943/pexels-photo-3379943.jpeg" }}
                    style={styles.videoThumbnail}
                  />
                  <View style={styles.playButton}>
                    <Text style={styles.playButtonText}>▶</Text>
                  </View>
                </View>
              )
            }
            keyExtractor={(_, index) => index.toString()}
          />

          {/* Image Pagination Dots */}
          <View style={styles.paginationContainer}>
            {mediaItems.map((_, index) => (
              <View
                key={index}
                style={[styles.paginationDot, index === currentImageIndex && styles.paginationDotActive]}
              />
            ))}
          </View>
        </View>

        {/* Compatibility Score */}
        <View style={styles.compatibilityContainer}>
          <View style={styles.compatibilityHeader}>
            <Star size={20} color="#FF4458" />
            <Text style={styles.compatibilityTitle}>Compatibility Score</Text>
          </View>
          <View style={styles.compatibilityScoreContainer}>
            <Text style={styles.compatibilityScoreText}>{compatibility.TotalScore}%</Text>
            {/* For the compatibility breakdown mapping, replace with: */}
            <View style={styles.compatibilityBreakdown}>
              {Object.entries(compatibility?.Breakdown || {}).map(([key, value]) => (
                <View key={key} style={styles.compatibilityItem}>
                  <Text style={styles.compatibilityItemLabel}>{key}</Text>
                  <Text style={styles.compatibilityItemValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.nameAgeContainer}>
            {/* In the nameText component, replace: */}
            <Text style={styles.nameText}>
              {User?.username || ""}, {showAge ? age : ""}
            </Text>
            <View style={styles.basicInfoContainer}>
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>👤</Text>
                </View>
                <Text style={styles.infoText}>{User.gender}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>📅</Text>
                </View>
                <Text style={styles.infoText}>
                  {new Date(User.dateofbirth).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Career & Education */}
          {Career && Career.job_title && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>💼</Text>
              </View>
              <Text style={styles.infoText}>
                {Career.job_title} {Career.company ? `at ${Career.company}` : ""}
              </Text>
            </View>
          )}

          {/* Insights */}
          {Insights && (
            <View style={styles.insightsRow}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🏆</Text>
              </View>
              <Text style={styles.infoText}>
                {Insights.mbti_type} · {Insights.zodiac_sign}
              </Text>
            </View>
          )}

          {/* Bio */}
          <View style={styles.bioContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            {/* For the bio text, replace with: */}
            <Text style={styles.bioText}>{Profile?.bio || ""}</Text>
          </View>

          {/* Looking For */}
          <View style={styles.preferenceSection}>
            <Text style={styles.sectionTitle}>Looking For</Text>
            <View style={styles.preferenceContainer}>
              {/* For the prefer_gender, replace with: */}
              <Text style={styles.preferenceText}>
                Interested in: <Text style={styles.highlightText}>{Profile?.prefer_gender || ""}</Text>
              </Text>
              {/* For the prefer_match mapping, replace with: */}
              <View style={styles.preferMatchContainer}>
                {(Profile?.prefer_match || []).map((pref, index) => (
                  <View key={index} style={styles.preferMatchTag}>
                    <Text style={styles.preferMatchText}>{pref}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Interests */}
          <View style={styles.interestsSection}>
            <Text style={styles.sectionTitle}>Interests</Text>
            {/* For the interest mapping, replace with: */}
            <View style={styles.interestsContainer}>
              {(Profile?.interest || []).map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Hobbies */}
          <View style={styles.interestsSection}>
            <Text style={styles.sectionTitle}>Hobbies</Text>
            {/* For the hobbies mapping, replace with: */}
            <View style={styles.interestsContainer}>
              {(Profile?.hobbies || []).map((hobby, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{hobby}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.dislikeButton, processingAction && styles.disabledButton]}
          onPress={handleDislike}
          disabled={processingAction}
        >
          <X size={30} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton, processingAction && styles.disabledButton]}
          onPress={handleSuperlike}
          disabled={processingAction}
        >
          <Star size={30} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton, processingAction && styles.disabledButton]}
          onPress={handleLike}
          disabled={processingAction}
        >
          <Heart size={30} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.messageButton]} onPress={handleMessage}>
          <MessageCircle size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#FF4458",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF4458",
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: "#FF4458",
    fontSize: 16,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  imageGalleryContainer: {
    height: width * 1.2,
    position: "relative",
  },
  mediaTabs: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    zIndex: 10,
    padding: 4,
  },
  mediaTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 16,
  },
  activeMediaTab: {
    backgroundColor: "#FFFFFF",
  },
  mediaTabText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  activeMediaTabText: {
    color: "#FF4458",
  },
  profileImage: {
    width: width,
    height: width * 1.2,
    resizeMode: "cover",
  },
  videoContainer: {
    width: width,
    height: width * 1.2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  playButton: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 68, 88, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonText: {
    color: "white",
    fontSize: 30,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
    width: 12,
  },
  compatibilityContainer: {
    padding: 20,
    backgroundColor: "#FFF5F6",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  compatibilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  compatibilityTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 8,
  },
  compatibilityScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  compatibilityScoreText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FF4458",
    marginRight: 20,
  },
  compatibilityBreakdown: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  compatibilityItem: {
    width: "50%",
    marginBottom: 8,
  },
  compatibilityItemLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  compatibilityItemValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  profileInfoContainer: {
    padding: 20,
  },
  nameAgeContainer: {
    marginBottom: 15,
  },
  nameText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 5,
  },
  basicInfoContainer: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  insightsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  iconText: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 16,
    color: "#4B5563",
  },
  bioContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
  },
  bioText: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 24,
  },
  preferenceSection: {
    marginBottom: 20,
  },
  preferenceContainer: {
    backgroundColor: "#F9FAFB",
    padding: 15,
    borderRadius: 10,
  },
  preferenceText: {
    fontSize: 16,
    color: "#4B5563",
  },
  highlightText: {
    fontWeight: "600",
    color: "#1F2937",
  },
  preferMatchContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  preferMatchTag: {
    backgroundColor: "#FF4458",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  preferMatchText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  interestsSection: {
    marginBottom: 20,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  interestText: {
    fontSize: 14,
    color: "#4B5563",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  dislikeButton: {
    backgroundColor: "#FF3B30",
  },
  superLikeButton: {
    backgroundColor: "#007AFF",
  },
  likeButton: {
    backgroundColor: "#4CD964",
  },
  messageButton: {
    backgroundColor: "#5856D6",
  },
  disabledButton: {
    opacity: 0.5,
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
  },
  matchAlertMessageButton: {
    backgroundColor: "#FF4458",
  },
  matchAlertButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  matchAlertMessageButtonText: {
    color: "#FFFFFF",
  },
})
