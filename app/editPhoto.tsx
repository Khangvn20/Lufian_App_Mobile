"use client"

import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import * as DocumentPicker from "expo-document-picker"
import {
  ChevronLeft,
  Camera,
  X,
  Plus,
  Trash2,
  User,
  Info,
  CheckCircle2,
  Image as ImageIcon,
  Video,
} from "lucide-react-native"
import { StatusBar } from "expo-status-bar"
import { BlurView } from "expo-blur"
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Constants
const { width } = Dimensions.get("window")
const GRID_PADDING = 16
const GRID_SPACING = 8
const GRID_COLUMNS = 3
const PHOTO_SIZE = Math.floor((width - GRID_PADDING * 2 - GRID_SPACING * (GRID_COLUMNS - 1)) / GRID_COLUMNS)
const API_BASE_URL = "http://10.0.2.2:3001/v1"
const MAX_PHOTOS = 5 // Thay vì 6, vì 1 ô đã dùng cho avatar
const MAX_VIDEOS = 3
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Types
enum MediaType {
  PHOTO = "photo",
  VIDEO = "video",
  AVATAR = "avatar",
}

type Media = {
  id: string
  uri: string
  type: MediaType
  isVerified?: boolean
  position?: number
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

  getHeaders: async (isMultipart = false) => {
    const token = await ApiService.getAuthToken()
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": isMultipart ? "multipart/form-data" : "application/json",
      Accept: "application/json",
      "X-Device-Type": "app",
    }
  },

  fetchUserProfile: async () => {
    const headers = await ApiService.getHeaders()
    return axios.get(`${API_BASE_URL}/user-profile/`, { headers })
  },

  uploadMedia: async (uri: string, type: MediaType) => {
    const headers = await ApiService.getHeaders(true)
    const formData = new FormData()
    const uriParts = uri.split("/")
    const fileName = uriParts[uriParts.length - 1]

    formData.append("file", {
      uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
      name: fileName,
      type: type === MediaType.VIDEO ? "video/mp4" : "image/jpeg",
    } as any)

    let endpoint = ""
    switch (type) {
      case MediaType.AVATAR:
        endpoint = `${API_BASE_URL}/user-profile/upload-avatar`
        break
      case MediaType.PHOTO:
        endpoint = `${API_BASE_URL}/media/upload-photo`
        break
      case MediaType.VIDEO:
        endpoint = `${API_BASE_URL}/media/upload-video`
        break
    }

    return axios.post(endpoint, formData, { headers, timeout: 30000 })
  },

  deleteMedia: async (mediaItem: Media) => {
    const headers = await ApiService.getHeaders()
    let endpoint = ""
    let requestData = {}

    switch (mediaItem.type) {
      case MediaType.AVATAR:
        endpoint = `${API_BASE_URL}/user-profile/delete-avatar`
        break
      case MediaType.PHOTO:
        endpoint = `${API_BASE_URL}/media/delete-photo`
        requestData = { photo_url: mediaItem.uri }
        break
      case MediaType.VIDEO:
        endpoint = `${API_BASE_URL}/media/delete-video`
        requestData = { video_url: mediaItem.uri }
        break
    }

    return axios({
      method: "DELETE",
      url: endpoint,
      headers,
      data: requestData,
    })
  },

  saveMediaChanges: async (mediaData: any) => {
    const headers = await ApiService.getHeaders()
    return axios.put(`${API_BASE_URL}/user-profile/media`, mediaData, { headers })
  },
}

// Media Picker Service
const MediaPickerService = {
  checkPermission: async (permissionType: "camera" | "mediaLibrary") => {
    try {
      let status
      if (permissionType === "camera") {
        status = await ImagePicker.requestCameraPermissionsAsync()
      } else {
        status = await ImagePicker.requestMediaLibraryPermissionsAsync()
      }

      if (status.status !== "granted") {
        Alert.alert("Permission Required", `You need to grant ${permissionType} permission to use this feature.`)
        return false
      }
      return true
    } catch (error) {
      console.error(`Error requesting ${permissionType} permission:`, error)
      return false
    }
  },

  pickImageFromGallery: async () => {
    try {
      // Simplified approach with minimal options
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*"],
        copyToCacheDirectory: true,
      })

      if (result.canceled) {
        return null
      }

      // Check file size
      const fileInfo = result.assets[0]
      if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
        Alert.alert("File Too Large", "Please select an image smaller than 10MB.")
        return null
      }

      return fileInfo
    } catch (error) {
      console.error("Error picking image:", error)
      return null
    }
  },

  pickVideoFromGallery: async () => {
    try {
      // Simplified approach with minimal options
      const result = await DocumentPicker.getDocumentAsync({
        type: ["video/*"],
        copyToCacheDirectory: true,
      })

      if (result.canceled) {
        return null
      }

      // Check file size
      const fileInfo = result.assets[0]
      if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
        Alert.alert("File Too Large", "Please select a video smaller than 10MB.")
        return null
      }

      return fileInfo
    } catch (error) {
      console.error("Error picking video:", error)
      return null
    }
  },

  captureImage: async () => {
    try {
      // Use minimal options for camera
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null
      }

      return result.assets[0]
    } catch (error) {
      console.error("Error capturing image:", error)
      return null
    }
  },

  captureVideo: async () => {
    try {
      // Use minimal options for camera
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
        videoMaxDuration: 60,
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null
      }

      return result.assets[0]
    } catch (error) {
      console.error("Error capturing video:", error)
      return null
    }
  },
}

// Main Component
export default function EditPhotosScreen() {
  // State
  const { currentProfileImage } = useLocalSearchParams()
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [uploading, setUploading] = useState<boolean>(false)
  const [showTips, setShowTips] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
  const tipOpacity = useSharedValue(0)

  // Animated styles
  const tipAnimatedStyle = useAnimatedStyle(() => ({
    opacity: tipOpacity.value,
  }))

  // Toggle tips overlay
  const toggleTips = () => {
    if (showTips) {
      tipOpacity.value = withSpring(0, { damping: 15 }, () => {
        runOnJS(setShowTips)(false)
      })
    } else {
      setShowTips(true)
      tipOpacity.value = withSpring(1, { damping: 15 })
    }
  }

  // Media count utilities
  const getMediaCounts = useCallback(() => {
    const photos = media.filter((item) => item.type === MediaType.PHOTO).length
    const videos = media.filter((item) => item.type === MediaType.VIDEO).length
    const hasAvatar = media.some((item) => item.type === MediaType.AVATAR)

    return {
      photos,
      videos,
      hasAvatar,
      total: photos + videos + (hasAvatar ? 1 : 0),
    }
  }, [media])

  const canAddMoreMedia = useCallback(
    (type: MediaType) => {
      const counts = getMediaCounts()

      switch (type) {
        case MediaType.PHOTO:
          return counts.photos < MAX_PHOTOS
        case MediaType.VIDEO:
          return counts.videos < MAX_VIDEOS
        case MediaType.AVATAR:
          // Avatar luôn có thể thay đổi, không cần kiểm tra giới hạn
          return true
        default:
          return false
      }
    },
    [getMediaCounts],
  )

  // Fetch user media
  const fetchUserMedia = useCallback(async () => {
    try {
      setLoading(true)

      const response = await ApiService.fetchUserProfile()
      console.log("Profile data received:", JSON.stringify(response.data, null, 2))

      if (response.data && response.data.profile) {
        const apiData = response.data.profile
        const mediaList: Media[] = []

        // Add avatar
        if (apiData.media && apiData.media.avatar_url) {
          mediaList.push({
            id: "avatar",
            uri: apiData.media.avatar_url,
            type: MediaType.AVATAR,
            isVerified: true,
            position: 0,
          })
        } else if (currentProfileImage) {
          mediaList.push({
            id: "avatar",
            uri: currentProfileImage as string,
            type: MediaType.AVATAR,
            isVerified: true,
            position: 0,
          })
        }

        // Add photos
        if (apiData.media && Array.isArray(apiData.media.photos)) {
          apiData.media.photos.forEach((photoUrl: string, index: number) => {
            if (photoUrl) {
              mediaList.push({
                id: `photo-${index}`,
                uri: photoUrl,
                type: MediaType.PHOTO,
                isVerified: false,
                position: index + 1,
              })
            }
          })
        }

        // Add videos
        if (apiData.media && Array.isArray(apiData.media.videos)) {
          apiData.media.videos.forEach((videoUrl: string, index: number) => {
            if (videoUrl) {
              mediaList.push({
                id: `video-${index}`,
                uri: videoUrl,
                type: MediaType.VIDEO,
                isVerified: false,
                position: mediaList.length,
              })
            }
          })
        }

        setMedia(mediaList)
      } else {
        // If no media from API, use the currentProfileImage as avatar
        if (currentProfileImage) {
          setMedia([
            {
              id: "avatar",
              uri: currentProfileImage as string,
              type: MediaType.AVATAR,
              isVerified: true,
              position: 0,
            },
          ])
        }
      }
    } catch (err) {
      console.error("Failed to fetch media:", err)

      // If error, use the currentProfileImage as avatar
      if (currentProfileImage) {
        setMedia([
          {
            id: "avatar",
            uri: currentProfileImage as string,
            type: MediaType.AVATAR,
            isVerified: true,
            position: 0,
          },
        ])
      }

      Alert.alert("Error", "Failed to load your media. Using local profile image.")
    } finally {
      setLoading(false)
    }
  }, [currentProfileImage])

  // Handle media upload
  const handleMediaUpload = async (uri: string, type: MediaType) => {
    try {
      setUploading(true)

      const response = await ApiService.uploadMedia(uri, type)
      console.log("Upload response:", response.data)

      // Extract URL from response
      let mediaUrl = ""
      if (type === MediaType.AVATAR && response.data.avatar_url) {
        mediaUrl = response.data.avatar_url
      } else if (type === MediaType.PHOTO && response.data.photo_url) {
        mediaUrl = response.data.photo_url
      } else if (type === MediaType.VIDEO && response.data.video_url) {
        mediaUrl = response.data.video_url
      } else if (response.data.url) {
        mediaUrl = response.data.url
      }

      if (mediaUrl) {
        // Generate unique ID
        const newId = Date.now().toString()

        const newMedia: Media = {
          id: newId,
          uri: mediaUrl,
          type: type,
          isVerified: false,
          position: type === MediaType.AVATAR ? 0 : media.length,
        }

        // Update state
        if (type === MediaType.AVATAR) {
          setMedia((prev) => [newMedia, ...prev.filter((item) => item.type !== MediaType.AVATAR)])
        } else {
          setMedia((prev) => [...prev, newMedia])
        }

        Alert.alert("Success", `${type} uploaded successfully!`)
        return true
      } else {
        Alert.alert("Warning", `${type} upload response invalid. Please try again.`)
        return false
      }
    } catch (err) {
      console.error("Failed to upload media:", err)

      if (axios.isAxiosError(err)) {
        console.error("Axios error details:", {
          status: err.response?.status,
          data: err.response?.data,
        })

        Alert.alert("Error", `Failed to upload ${type}. Server error: ${err.response?.status || "Unknown"}`)
      } else {
        Alert.alert("Error", `Failed to upload ${type}. ${err instanceof Error ? err.message : "Unknown error"}`)
      }

      return false
    } finally {
      setUploading(false)
    }
  }

  // Pick media from gallery
  const pickMedia = async (type: MediaType) => {
    try {
      // Check if user can add more media
      if (!canAddMoreMedia(type)) {
        let message = ""
        switch (type) {
          case MediaType.PHOTO:
            message = `You can only upload a maximum of ${MAX_PHOTOS} photos.`
            break
          case MediaType.VIDEO:
            message = `You can only upload a maximum of ${MAX_VIDEOS} videos.`
            break
          default:
            message = "Media limit reached."
            break
        }

        Alert.alert("Limit Reached", message)
        return
      }

      // Check permission
      const hasPermission = await MediaPickerService.checkPermission("mediaLibrary")
      if (!hasPermission) return

      // Pick media based on type
      let result
      if (type === MediaType.VIDEO) {
        result = await MediaPickerService.pickVideoFromGallery()
      } else {
        result = await MediaPickerService.pickImageFromGallery()
      }

      if (!result) return

      // Upload media
      await handleMediaUpload(result.uri, type)
    } catch (error) {
      console.error("Error picking media:", error)
      Alert.alert("Error", "Failed to pick media. Please try again.")
    }
  }

  // Capture media with camera
  const captureMedia = async (type: MediaType) => {
    try {
      // Check if user can add more media
      if (!canAddMoreMedia(type)) {
        let message = ""
        switch (type) {
          case MediaType.PHOTO:
            message = `You can only upload a maximum of ${MAX_PHOTOS} photos.`
            break
          case MediaType.VIDEO:
            message = `You can only upload a maximum of ${MAX_VIDEOS} videos.`
            break
          default:
            message = "Media limit reached."
            break
        }

        Alert.alert("Limit Reached", message)
        return
      }

      // Check permission
      const hasPermission = await MediaPickerService.checkPermission("camera")
      if (!hasPermission) return

      // Capture media based on type
      let result
      if (type === MediaType.VIDEO) {
        result = await MediaPickerService.captureVideo()
      } else {
        result = await MediaPickerService.captureImage()
      }

      if (!result) return

      // Upload media
      await handleMediaUpload(result.uri, type)
    } catch (error) {
      console.error("Error capturing media:", error)
      Alert.alert(
        "Camera Error",
        "There was a problem capturing media. Would you like to select from your files instead?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Select File", onPress: () => pickMedia(type) },
        ],
      )
    }
  }

  // Delete media
  const removeMedia = async (mediaItem: Media) => {
    // Don't allow removing avatar without replacing
    if (mediaItem.type === MediaType.AVATAR) {
      Alert.alert(
        "Cannot Delete Avatar",
        "You cannot delete your profile picture. Please replace it with another photo instead.",
      )
      return
    }

    // Confirm deletion
    Alert.alert("Confirm Deletion", `Are you sure you want to delete this ${mediaItem.type}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setUploading(true)

            const response = await ApiService.deleteMedia(mediaItem)
            console.log("Delete response:", response.data)

            // Remove from state
            setMedia((prev) => prev.filter((item) => item.id !== mediaItem.id))

            Alert.alert("Success", `${mediaItem.type} deleted successfully!`)
          } catch (err) {
            console.error("Failed to delete media:", err)

            if (axios.isAxiosError(err)) {
              console.error("Axios error details:", {
                status: err.response?.status,
                data: err.response?.data,
              })

              Alert.alert(
                "Error",
                `Failed to delete ${mediaItem.type}. Server error: ${err.response?.status || "Unknown"}`,
              )
            } else {
              Alert.alert(
                "Error",
                `Failed to delete ${mediaItem.type}. ${err instanceof Error ? err.message : "Unknown error"}`,
              )
            }
          } finally {
            setUploading(false)
          }
        },
      },
    ])
  }

  // Media preview
  const handleMediaPress = (item: Media) => {
    setSelectedMedia(item)
  }

  const closeMediaPreview = () => {
    setSelectedMedia(null)
  }

  // Save changes
  const handleSave = async () => {
    try {
      setUploading(true)

      // Get avatar
      const avatar = media.find((item) => item.type === MediaType.AVATAR)

      if (!avatar) {
        Alert.alert("Error", "No profile picture found")
        return
      }

      // Prepare data for API
      const photoUrls = media
        .filter((item) => item.type === MediaType.PHOTO)
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map((item) => item.uri)

      const videoUrls = media
        .filter((item) => item.type === MediaType.VIDEO)
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map((item) => item.uri)

      const mediaData = {
        avatar_url: avatar.uri,
        photos: photoUrls,
        videos: videoUrls,
      }

      console.log("Sending media data:", JSON.stringify(mediaData, null, 2))

      // Save changes
      await ApiService.saveMediaChanges(mediaData)

      // Return to profile
      router.push({
        pathname: "/(tabs)/profile",
        params: { updatedProfileImage: avatar.uri },
      })
    } catch (err) {
      console.error("Failed to save media:", err)

      if (axios.isAxiosError(err)) {
        console.error("Axios error details:", {
          status: err.response?.status,
          data: err.response?.data,
        })

        Alert.alert(
          "Warning",
          `Failed to save all media to server. Server error: ${err.response?.status || "Unknown"}`,
          [
            {
              text: "OK",
              onPress: () => {
                const avatar = media.find((item) => item.type === MediaType.AVATAR)
                if (avatar) {
                  router.push({
                    pathname: "/(tabs)/profile",
                    params: { updatedProfileImage: avatar.uri },
                  })
                }
              },
            },
          ],
        )
      } else {
        Alert.alert(
          "Warning",
          "Failed to save all media to server, but your profile picture has been updated locally.",
          [
            {
              text: "OK",
              onPress: () => {
                const avatar = media.find((item) => item.type === MediaType.AVATAR)
                if (avatar) {
                  router.push({
                    pathname: "/(tabs)/profile",
                    params: { updatedProfileImage: avatar.uri },
                  })
                }
              },
            },
          ],
        )
      }
    } finally {
      setUploading(false)
    }
  }

  // Render functions
  const renderMediaItem = (item: Media, index: number) => {
    const isAvatar = item.type === MediaType.AVATAR
    const isVideo = item.type === MediaType.VIDEO

    return (
      <TouchableOpacity key={item.id} onPress={() => handleMediaPress(item)} style={styles.mediaContainer}>
        <Image source={{ uri: item.uri }} style={styles.media} />

        {isAvatar && (
          <View style={styles.avatarBadge}>
            <User size={12} color="#FFFFFF" />
            <Text style={styles.avatarText}>Avatar</Text>
          </View>
        )}

        {isVideo && (
          <View style={styles.videoBadge}>
            <Video size={12} color="#FFFFFF" />
            <Text style={styles.videoBadgeText}>Video</Text>
          </View>
        )}

        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <CheckCircle2 size={14} color="#FFFFFF" />
          </View>
        )}

        {!isAvatar && (
          <TouchableOpacity style={styles.deleteButton} onPress={() => removeMedia(item)}>
            <Trash2 size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }

  const renderEmptySlot = (type: MediaType, index: number) => {
    const isAvatar = type === MediaType.AVATAR
    const isVideo = type === MediaType.VIDEO

    return (
      <TouchableOpacity key={`empty-${type}-${index}`} style={styles.mediaContainer} onPress={() => pickMedia(type)}>
        <View style={styles.emptyMediaContent}>
          <Plus size={24} color="#9CA3AF" />
          <Text style={styles.emptySlotText}>{isAvatar ? "Add Avatar" : isVideo ? "Add Video" : "Add Photo"}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const renderMediaGrid = () => {
    const gridItems = []

    // Add avatar (first position)
    const avatar = media.find((item) => item.type === MediaType.AVATAR)
    if (avatar) {
      gridItems.push(renderMediaItem(avatar, 0))
    } else {
      gridItems.push(renderEmptySlot(MediaType.AVATAR, 0))
    }

    // Add photos (5 slots)
    const photos = media.filter((item) => item.type === MediaType.PHOTO)
    photos.forEach((photo, index) => {
      if (index < MAX_PHOTOS) {
        gridItems.push(renderMediaItem(photo, index + 1))
      }
    })

    // Add empty photo slots
    for (let i = photos.length; i < MAX_PHOTOS; i++) {
      gridItems.push(renderEmptySlot(MediaType.PHOTO, i))
    }

    // Add videos (3 slots)
    const videos = media.filter((item) => item.type === MediaType.VIDEO)
    videos.forEach((video, index) => {
      if (index < MAX_VIDEOS) {
        gridItems.push(renderMediaItem(video, index + photos.length + 1))
      }
    })

    // Add empty video slots
    for (let i = videos.length; i < MAX_VIDEOS; i++) {
      gridItems.push(renderEmptySlot(MediaType.VIDEO, i))
    }

    return <View style={styles.mediaGrid}>{gridItems}</View>
  }

  // Effects
  useEffect(() => {
    fetchUserMedia()
  }, [fetchUserMedia])

  // Render
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Media</Text>
          <TouchableOpacity style={styles.infoButton} onPress={toggleTips}>
            <Info size={20} color="#FF4458" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <ScrollView style={styles.container}>
          {/* Media Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Media</Text>
              <Text style={styles.mediaCount}>
                {getMediaCounts().photos}/{MAX_PHOTOS} Photos • {getMediaCounts().videos}/{MAX_VIDEOS} Videos
              </Text>
            </View>

            <Text style={styles.sectionDescription}>
              First photo is your profile picture. You can add up to {MAX_PHOTOS} photos and {MAX_VIDEOS} videos.
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF4458" />
                <Text style={styles.loadingText}>Loading media...</Text>
              </View>
            ) : (
              <View style={styles.mediaGridContainer}>{renderMediaGrid()}</View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.cameraButton, !canAddMoreMedia(MediaType.PHOTO) && styles.disabledButton]}
                onPress={() => captureMedia(MediaType.PHOTO)}
                disabled={!canAddMoreMedia(MediaType.PHOTO) || uploading}
              >
                <Camera size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.videoButton, !canAddMoreMedia(MediaType.VIDEO) && styles.disabledButton]}
                onPress={() => captureMedia(MediaType.VIDEO)}
                disabled={!canAddMoreMedia(MediaType.VIDEO) || uploading}
              >
                <Video size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Record Video</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tips Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Media Tips</Text>

            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <CheckCircle2 size={24} color="#FF4458" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Clear profile picture</Text>
                <Text style={styles.tipText}>Your profile picture should clearly show your face.</Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <CheckCircle2 size={24} color="#FF4458" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Show your interests</Text>
                <Text style={styles.tipText}>Include photos and videos of activities you enjoy.</Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <View style={styles.tipIconContainer}>
                <CheckCircle2 size={24} color="#FF4458" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Keep videos short</Text>
                <Text style={styles.tipText}>Videos should be under 60 seconds and showcase your personality.</Text>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, uploading && styles.disabledButton]}
            onPress={handleSave}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Media Preview */}
        {selectedMedia && (
          <View style={styles.mediaPreviewContainer}>
            <BlurView intensity={80} style={styles.blurBackground} tint="dark">
              <TouchableOpacity style={styles.closePreviewButton} onPress={closeMediaPreview}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Image source={{ uri: selectedMedia.uri }} style={styles.previewImage} resizeMode="contain" />

              <View style={styles.previewActions}>
                {selectedMedia.type !== MediaType.AVATAR ? (
                  <TouchableOpacity
                    style={[styles.previewActionButton, styles.deleteActionButton]}
                    onPress={() => {
                      const mediaToRemove = selectedMedia
                      closeMediaPreview()
                      setTimeout(() => removeMedia(mediaToRemove), 200)
                    }}
                  >
                    <Trash2 size={20} color="#FFFFFF" />
                    <Text style={styles.previewActionText}>Delete</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.previewActionButtonGroup}>
                    <TouchableOpacity
                      style={[styles.previewActionButton, styles.galleryButton]}
                      onPress={() => {
                        closeMediaPreview()
                        setTimeout(() => pickMedia(MediaType.AVATAR), 200)
                      }}
                    >
                      <ImageIcon size={20} color="#FFFFFF" />
                      <Text style={styles.previewActionText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </BlurView>
          </View>
        )}

        {/* Tips Overlay */}
        {showTips && (
          <Animated.View style={[styles.tipsOverlay, tipAnimatedStyle]}>
            <BlurView intensity={80} style={styles.blurBackground} tint="dark">
              <TouchableOpacity style={styles.closeTipsButton} onPress={toggleTips}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.tipsContent}>
                <Text style={styles.tipsTitle}>Media Guidelines</Text>

                <View style={styles.tipItem}>
                  <CheckCircle2 size={20} color="#FF4458" style={styles.tipItemIcon} />
                  <Text style={styles.tipItemText}>Your first photo should clearly show your face</Text>
                </View>

                <View style={styles.tipItem}>
                  <CheckCircle2 size={20} color="#FF4458" style={styles.tipItemIcon} />
                  <Text style={styles.tipItemText}>Include at least 3 photos to get more matches</Text>
                </View>

                <View style={styles.tipItem}>
                  <CheckCircle2 size={20} color="#FF4458" style={styles.tipItemIcon} />
                  <Text style={styles.tipItemText}>Videos should be under 60 seconds</Text>
                </View>

                <View style={styles.tipItem}>
                  <CheckCircle2 size={20} color="#FF4458" style={styles.tipItemIcon} />
                  <Text style={styles.tipItemText}>No inappropriate content or nudity</Text>
                </View>

                <View style={styles.tipItem}>
                  <CheckCircle2 size={20} color="#FF4458" style={styles.tipItemIcon} />
                  <Text style={styles.tipItemText}>Photos with pets or showing your hobbies get more attention</Text>
                </View>

                <View style={styles.tipItem}>
                  <CheckCircle2 size={20} color="#FF4458" style={styles.tipItemIcon} />
                  <Text style={styles.tipItemText}>Verified photos help build trust (blue checkmark)</Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  backButton: {
    padding: 5,
  },
  infoButton: {
    padding: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  mediaCount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 10,
  },
  mediaGridContainer: {
    padding: 0,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  mediaContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    marginBottom: GRID_SPACING,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  media: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  emptyMediaContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 8,
  },
  emptySlotText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
  },
  avatarBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF4458",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },
  videoBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  videoBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 4,
  },
  verifiedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#3B82F6",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 16,
    gap: 12,
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: "#FF4458",
  },
  videoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: "#3B82F6",
  },
  disabledButton: {
    opacity: 0.5,
  },
  galleryButton: {
    backgroundColor: "#6B7280",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFE9EC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: "#6B7280",
  },
  saveButton: {
    backgroundColor: "#FF4458",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    margin: 20,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  mediaPreviewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  blurBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  closePreviewButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  previewImage: {
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: 12,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "center",
    width: width * 0.9,
    marginTop: 20,
  },
  previewActionButtonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  previewActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
    maxWidth: 200,
  },
  deleteActionButton: {
    backgroundColor: "#EF4444",
  },
  previewActionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  tipsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tipsContent: {
    width: width * 0.9,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    maxHeight: "80%",
  },
  tipsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 20,
    textAlign: "center",
  },
  closeTipsButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  tipItemIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipItemText: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    lineHeight: 24,
  },
})
