import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import {
  MapPin,
  Calendar,
  Camera,
  ChevronRight,
  Settings,
  Edit2,
  Shield,
  LogOut,
  Heart,
  Bell,
  Globe,
  BookOpen,
  User,
  Briefcase,
  Ruler,
  Weight,
  Coffee,
  Cigarette,
  Baby,
  Activity,
  MessageCircle,
  Music,
  Target,
  Building 
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types matching backend structs
type ProfilePrivacy = {
  showAge: boolean;
  showWeight: boolean;
  showLocation: boolean;
};

type User = {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  user_id: string;
  username: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  hobbies: string[]; // Thêm trường hobbies
  preferences: {
    ageRange: [number, number];
    distance: number;
    showOnline: boolean;
    notifications: boolean;
  };
  sexualOrientation: string;
  preferGender: string;
  preferMatch: string[];
  relationshipGoal: string;
  education: string;
  height: number;
  weight: number;
  religion: string;
  drinkingHabits: string;
  smokingHabits: string;
  childrenPreference: string;
  fitnessLevel: string;
  languages: string[];
  zodiacSign: string;
  mbtiType: string;
  privacy: ProfilePrivacy;
  created_at: string;
  updated_at: string;
};

type ProfileMedia = {
  id: string;
  user_id: string;
  profile_id: string;
  avatar_url: string;
  photos: string[];
  created_at: string;
  updated_at: string;
};

type ProfileInsights = {
  id: string;
  profile_id: string;
  views: number;
  likes: number;
  matches: number;
  created_at: string;
  updated_at: string;
};

type ProfileCareer = {
  id: string;
  profile_id: string;
  job_title: string;
  company: string;
  industry: string;
  created_at: string;
  updated_at: string;
};

type FullProfile = {
  User: User;
  Profile: Profile;
  Media: ProfileMedia;
  Insights: ProfileInsights;
  Career: ProfileCareer;
};

export default function ProfileScreen() {
  const { updatedProfileImage } = useLocalSearchParams();
  const [profileImage, setProfileImage] = useState<string>(
    updatedProfileImage as string || 'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg'
  );
  const [fullProfile, setFullProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch user profile from API
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Make API request to fetch profile
      const response = await axios.get('http://10.0.2.2:3001/v1/user-profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Device-Type': 'app'
        }
      });

      console.log('Profile data received:', JSON.stringify(response.data, null, 2));
      
      // Ánh xạ dữ liệu API vào cấu trúc FE
      if (response.data && response.data.profile) {
        const apiData = response.data.profile;
        
        // Đảm bảo thuộc tính privacy luôn được định nghĩa
        const privacySettings: ProfilePrivacy = {
          showAge: apiData.profile?.privacy?.show_age || false,
          showWeight: apiData.profile?.privacy?.show_weight || false,
          showLocation: apiData.profile?.privacy?.show_location || false
        };
        
        // Tạo đối tượng FullProfile từ dữ liệu API
        const mappedProfile: FullProfile = {
          User: {
            id: apiData.user?.id || '',
            email: apiData.user?.email || '',
            username: apiData.user?.username || '',
            created_at: apiData.user?.createdat || '',
            updated_at: apiData.user?.updatedat || ''
          },
          Profile: {
            id: apiData.profile?.id || '',
            user_id: apiData.profile?.user_id || '',
            username: capitalizeFirstLetter(apiData.user?.username || apiData.profile?.username || ''),
            // Tính tuổi từ ngày sinh
            age: apiData.user?.dateofbirth ? calculateAge(new Date(apiData.user.dateofbirth)) : 0,
            // Chuyển đổi tọa độ thành địa chỉ nếu có
            location: capitalizeFirstLetter(getLocationString(apiData.profile?.location) || 'Unknown Location'),
            bio: capitalizeFirstLetter(apiData.profile?.bio || ''),
          interests: (apiData.profile?.interest || []).map((item: string) => capitalizeFirstLetter(item)),
           hobbies: (apiData.profile?.hobbies || []).map((item: string) => capitalizeFirstLetter(item)),// Thêm hobbies
            preferences: {
              ageRange: [24, 35], // Giá trị mặc định vì API không có
              distance: 15, // Giá trị mặc định vì API không có
              showOnline: true, // Giá trị mặc định vì API không có
              notifications: true // Giá trị mặc định vì API không có
            },
            sexualOrientation: capitalizeFirstLetter(apiData.profile?.sexual_orientation || ''),
            preferGender: capitalizeFirstLetter(apiData.profile?.prefer_gender || ''),
            preferMatch: (apiData.profile?.prefer_match || []).map((item: string) => capitalizeFirstLetter(item)),
            relationshipGoal: capitalizeFirstLetter(mapRelationshipGoal(apiData.profile?.prefer_match?.[0] || '')),
            education: capitalizeFirstLetter(apiData.profile?.education_level || ''),
            height: apiData.profile?.height || 0,
            weight: apiData.profile?.weight || 0,
            religion: capitalizeFirstLetter(apiData.profile?.religion || ''),
            drinkingHabits: capitalizeFirstLetter(apiData.profile?.drinking_habits || ''),
            smokingHabits: capitalizeFirstLetter(apiData.profile?.smoking_habits || ''),
            childrenPreference: capitalizeFirstLetter(apiData.profile?.children_preference || ''),
            fitnessLevel: capitalizeFirstLetter(apiData.profile?.fitness_level || ''),
          languages: (apiData.profile?.languages || []).map((item: string) => capitalizeFirstLetter(item)),
            zodiacSign: capitalizeFirstLetter(apiData.insights?.zodiac_sign || ''),
            mbtiType: (apiData.insights?.mbti_type || '').toUpperCase(),
            // Đảm bảo thuộc tính privacy được gán đúng cách
            privacy: privacySettings,
            created_at: apiData.profile?.created_at || '',
            updated_at: apiData.profile?.updated_at || ''
          },
          Media: {
            id: '', // API không có ID cho media
            user_id: apiData.media?.user_id || '',
            profile_id: '', // API không có profile_id cho media
            avatar_url: apiData.media?.avatar_url || '',
            photos: apiData.media?.photos || [],
            created_at: '', // API không có created_at cho media
            updated_at: '' // API không có updated_at cho media
          },
          Insights: {
            id: '', // API không có ID cho insights
            profile_id: '', // API không có profile_id cho insights
            views: 0, // API không có views
            likes: 0, // API không có likes
            matches: 0, // API không có matches
            created_at: '', // API không có created_at cho insights
            updated_at: '' // API không có updated_at cho insights
          },
          Career: {
            id: '', // API không có ID cho career
            profile_id: '', // API không có profile_id cho career
            job_title: capitalizeFirstLetter(apiData.career?.job_title || ''),
            company: capitalizeFirstLetter(apiData.career?.company || ''),
            industry: capitalizeFirstLetter(apiData.career?.work_location || ''), // Sử dụng work_location thay cho industry
            created_at: '', // API không có created_at cho career
            updated_at: '' // API không có updated_at cho career
          }
        };
        
        setFullProfile(mappedProfile);
        
        // Update profile image if available
        if (apiData.media && apiData.media.avatar_url) {
          setProfileImage(apiData.media.avatar_url);
        }
      }
      
      // If there's an updated profile image from the EditPhotosScreen
      if (updatedProfileImage) {
        setProfileImage(updatedProfileImage as string);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Hàm viết hoa chữ cái đầu tiên
  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Hàm tính tuổi từ ngày sinh
  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Hàm chuyển đổi tọa độ thành chuỗi địa chỉ
  const getLocationString = (location: any): string => {
    if (!location) return '';
    
    if (location.latitude && location.longitude) {
      // Trong thực tế, bạn có thể sử dụng Geocoding API để chuyển đổi tọa độ thành địa chỉ
      // Ở đây chúng ta chỉ trả về chuỗi tọa độ đơn giản
      return `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`;
    }
    
    return '';
  };

  // Hàm ánh xạ mục tiêu mối quan hệ
  const mapRelationshipGoal = (preferMatch: string): string => {
    switch (preferMatch.toLowerCase()) {
      case 'casual':
        return 'Casual Dating';
      case 'serious':
        return 'Serious Relationship';
      case 'friendship':
        return 'Friendship';
      case 'marriage':
        return 'Marriage';
      default:
        return preferMatch || 'Casual Dating';
    }
  };

  // Update profile image
  const updateProfileImage = async (imageUri: string) => {
    try {
      setProfileImage(imageUri);
      
      // Get auth token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create form data for image upload
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg'
      } as any);
      
      // Upload image to server
      await axios.post('http://localhost:3001/v1/user-profile/upload-avatar', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'X-Device-Type': 'app'
        }
      });
      
      // Refresh profile data
      fetchUserProfile();
    } catch (err) {
      console.error('Failed to update profile image:', err);
      Alert.alert(
        'Update Failed',
        'Failed to update profile image on the server, but its updated locally.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
  };

  // Image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      updateProfileImage(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Error during logout:', err);
      Alert.alert('Logout Failed', 'An error occurred during logout. Please try again.');
    }
  };

  const handleEditProfile = () => {
    router.push('/UpdateProfileScreen');
  };

  const handleEditPhoto = () => {
    router.push({
      pathname: '/editPhoto',
      params: { currentProfileImage: profileImage }
    });
  };

  // Function to get relationship goal style based on the goal
  const getRelationshipGoalStyle = (goal: string) => {
    switch (goal) {
      case 'Casual Dating':
        return styles.casualDatingGoal;
      case 'Serious Relationship':
        return styles.seriousRelationshipGoal;
      case 'Friendship':
        return styles.friendshipGoal;
      case 'Marriage':
        return styles.marriageGoal;
      default:
        return styles.defaultGoal;
    }
  };

  // Function to get relationship goal text style based on the goal
  const getRelationshipGoalTextStyle = (goal: string) => {
    switch (goal) {
      case 'Casual Dating':
        return styles.casualDatingGoalText;
      case 'Serious Relationship':
        return styles.seriousRelationshipGoalText;
      case 'Friendship':
        return styles.friendshipGoalText;
      case 'Marriage':
        return styles.marriageGoalText;
      default:
        return styles.defaultGoalText;
    }
  };

  // Fetch profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, [updatedProfileImage]);

  // Show loading indicator while fetching profile
  if (loading && !fullProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4458" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // Show error message if fetch failed
  if (error && !fullProfile) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Extract profile data for easier access
  const profile = fullProfile?.Profile;
  const media = fullProfile?.Media;
  const user = fullProfile?.User;
  const career = fullProfile?.Career;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with settings button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={handleEditProfile}>
            <Settings size={20} color="#FF4458" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageWrapper}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
            <TouchableOpacity style={styles.editImageButton} onPress={handleEditPhoto}>
              <Camera size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileNameContainer}>
            <Text style={styles.profileName}>{profile?.username}</Text>
            {profile?.privacy.showAge && (
              <Text style={styles.profileAge}>{profile?.age}</Text>
            )}
          </View>

          {profile?.privacy.showLocation && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#FF4458" />
              <Text style={styles.locationText}>{profile?.location}</Text>
            </View>
          )}

          {/* Hiển thị thông tin nghề nghiệp nếu có */}
          {career?.job_title && career?.company && (
            <View style={styles.careerContainer}>
              <Briefcase size={14} color="#FF4458" style={styles.careerIcon} />
              <Text style={styles.jobEducationText}>
                {career.job_title} at {career.company}
              </Text>
            </View>
          )}

          {/* Hiển thị thông tin học vấn nếu không có thông tin nghề nghiệp */}
          {(!career?.job_title || !career?.company) && profile?.education && (
            <View style={styles.jobEducationContainer}>
              <Text style={styles.jobEducationText}>
                {profile.education}
              </Text>
            </View>
          )}
        </View>

        {/* Relationship Goal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relationship Goal</Text>
          <View style={styles.relationshipGoalContainer}>
            <View style={[styles.relationshipGoalTag, getRelationshipGoalStyle(profile?.relationshipGoal || '')]}>
              <Heart size={16} color={profile?.relationshipGoal === 'Casual Dating' ? '#FF4458' : 
                                     profile?.relationshipGoal === 'Serious Relationship' ? '#8B5CF6' :
                                     profile?.relationshipGoal === 'Friendship' ? '#3B82F6' : 
                                     profile?.relationshipGoal === 'Marriage' ? '#10B981' : '#6B7280'} 
                    style={styles.relationshipGoalIcon} />
              <Text style={[styles.relationshipGoalText, getRelationshipGoalTextStyle(profile?.relationshipGoal || '')]}>
                {profile?.relationshipGoal}
              </Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{profile?.bio}</Text>
        </View>

        {/* Identity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identity</Text>
          <View style={styles.identityGrid}>
            <View style={styles.identityItem}>
              <View style={styles.identityIconContainer}>
                <User size={16} color="#FF4458" />
              </View>
              <View style={styles.identityContent}>
                <Text style={styles.identityLabel}>Sexual Orientation</Text>
                <Text style={styles.identityValue}>{profile?.sexualOrientation}</Text>
              </View>
            </View>
            
            <View style={styles.identityItem}>
              <View style={styles.identityIconContainer}>
                <BookOpen size={16} color="#FF4458" />
              </View>
              <View style={styles.identityContent}>
                <Text style={styles.identityLabel}>MBTI Type</Text>
                <Text style={styles.identityValue}>{profile?.mbtiType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Basics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basics</Text>
          <View style={styles.basicsGrid}>
            <View style={styles.basicItem}>
              <View style={styles.basicIconContainer}>
                <Ruler size={16} color="#FF4458" />
              </View>
              <View>
                <Text style={styles.basicLabel}>Height</Text>
                <Text style={styles.basicValue}>{profile?.height} cm</Text>
              </View>
            </View>
            
            {profile?.privacy.showWeight && (
              <View style={styles.basicItem}>
                <View style={styles.basicIconContainer}>
                  <Weight size={16} color="#FF4458" />
                </View>
                <View>
                  <Text style={styles.basicLabel}>Weight</Text>
                  <Text style={styles.basicValue}>{profile?.weight} kg</Text>
                </View>
              </View>
            )}
            
            <View style={styles.basicItem}>
              <View style={styles.basicIconContainer}>
                <Globe size={16} color="#FF4458" />
              </View>
              <View>
                <Text style={styles.basicLabel}>Zodiac</Text>
                <Text style={styles.basicValue}>{profile?.zodiacSign}</Text>
              </View>
            </View>
            
            <View style={styles.basicItem}>
              <View style={styles.basicIconContainer}>
                <Briefcase size={16} color="#FF4458" />
              </View>
              <View>
                <Text style={styles.basicLabel}>Education</Text>
                <Text style={styles.basicValue}>{profile?.education}</Text>
              </View>
            </View>
            
            <View style={styles.basicItem}>
              <View style={styles.basicIconContainer}>
                <BookOpen size={16} color="#FF4458" />
              </View>
              <View>
                <Text style={styles.basicLabel}>Religion</Text>
                <Text style={styles.basicValue}>{profile?.religion}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Lifestyle Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle</Text>
          <View style={styles.lifestyleGrid}>
            <View style={styles.lifestyleItem}>
              <View style={styles.lifestyleIconContainer}>
                <Coffee size={16} color="#FF4458" />
              </View>
              <View>
                <Text style={styles.lifestyleLabel}>Drinking</Text>
                <Text style={styles.lifestyleValue}>{profile?.drinkingHabits}</Text>
              </View>
            </View>
            
            <View style={styles.lifestyleItem}>
              <View style={styles.lifestyleIconContainer}>
                <Cigarette size={16} color="#FF4458" />
              </View>
              <View>
                <Text style={styles.lifestyleLabel}>Smoking</Text>
                <Text style={styles.lifestyleValue}>{profile?.smokingHabits}</Text>
              </View>
            </View>
            
            <View style={styles.lifestyleItem}>
              <View style={styles.lifestyleIconContainer}>
                <Baby size={16} color="#FF4458" />
              </View>
              <View>
                <Text style={styles.lifestyleLabel}>Children</Text>
                <Text style={styles.lifestyleValue}>{profile?.childrenPreference}</Text>
              </View>
            </View>
            
            <View style={styles.lifestyleItem}>
              <View style={styles.lifestyleIconContainer}>
                <Activity size={16} color="#FF4458" />
              </View>
              <View>
                <Text style={styles.lifestyleLabel}>Fitness</Text>
                <Text style={styles.lifestyleValue}>{profile?.fitnessLevel}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {profile?.interests.map((interest, idx) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hobbies Section - Thêm mới */}
        {profile?.hobbies && profile.hobbies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hobbies</Text>
            <View style={styles.hobbiesContainer}>
              {profile.hobbies.map((hobby, idx) => (
                <View key={idx} style={styles.hobbyTag}>
                  <Text style={styles.hobbyText}>{hobby}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Looking For Section - Đã sửa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Looking For</Text>
          <View style={styles.lookingForContainer}>
            <View style={styles.lookingForItem}>
              <Text style={styles.lookingForLabel}>Gender</Text>
              <Text style={styles.lookingForValue}>{profile?.preferGender}</Text>
            </View>
            {/* Đã loại bỏ phần Distance */}
          </View>
          
          {/* Đã loại bỏ phần "Qualities I'm Looking For" */}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.preferencesContainer}>
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceIconAndLabel}>
                <View style={styles.preferenceIconContainer}>
                  <Globe size={16} color="#FF4458" />
                </View>
                <Text style={styles.preferenceLabel}>Show Online Status</Text>
              </View>
              <Switch
                value={profile?.preferences.showOnline}
                disabled={true}
                trackColor={{ false: '#E5E7EB', true: '#FFE9EC' }}
                thumbColor={profile?.preferences.showOnline ? '#FF4458' : '#F3F4F6'}
              />
            </View>
            
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceIconAndLabel}>
                <View style={styles.preferenceIconContainer}>
                  <Bell size={16} color="#FF4458" />
                </View>
                <Text style={styles.preferenceLabel}>Notifications</Text>
              </View>
              <Switch
                value={profile?.preferences.notifications}
                disabled={true}
                trackColor={{ false: '#E5E7EB', true: '#FFE9EC' }}
                thumbColor={profile?.preferences.notifications ? '#FF4458' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Languages Section - Đã cập nhật màu sắc */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <View style={styles.languagesContainer}>
            {profile?.languages.map((language, idx) => (
              <View key={idx} style={styles.languageTag}>
                <Text style={styles.languageText}>{language}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <View style={styles.privacyContainer}>
            <View style={styles.privacyItem}>
              <Text style={styles.privacyLabel}>Show Age</Text>
              <Switch
                value={profile?.privacy.showAge}
                disabled={true}
                trackColor={{ false: '#E5E7EB', true: '#FFE9EC' }}
                thumbColor={profile?.privacy.showAge ? '#FF4458' : '#F3F4F6'}
              />
            </View>
            
            <View style={styles.privacyItem}>
              <Text style={styles.privacyLabel}>Show Weight</Text>
              <Switch
                value={profile?.privacy.showWeight}
                disabled={true}
                trackColor={{ false: '#E5E7EB', true: '#FFE9EC' }}
                thumbColor={profile?.privacy.showWeight ? '#FF4458' : '#F3F4F6'}
              />
            </View>
            
            <View style={styles.privacyItem}>
              <Text style={styles.privacyLabel}>Show Location</Text>
              <Switch
                value={profile?.privacy.showLocation}
                disabled={true}
                trackColor={{ false: '#E5E7EB', true: '#FFE9EC' }}
                thumbColor={profile?.privacy.showLocation ? '#FF4458' : '#F3F4F6'}
              />
            </View>
          </View>
        </View>

        {/* Settings Buttons */}
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.settingsButton} onPress={handleEditProfile}>
            <View style={styles.settingsButtonContent}>
              <Edit2 size={18} color="#FF4458" />
              <Text style={styles.settingsButtonText}>Edit Profile</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsButton}>
            <View style={styles.settingsButtonContent}>
              <Shield size={18} color="#FF4458" />
              <Text style={styles.settingsButtonText}>Privacy Settings</Text>
            </View>
            <ChevronRight size={18} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={18} color="#FF4458" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Lufian v1.0.0</Text>
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF4458',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FF4458',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF4458',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginRight: 8,
  },
  profileAge: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4B5563',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 6,
  },
  jobEducationContainer: {
    marginBottom: 8,
  },
  jobEducationText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
  },
  // Thêm Career styles
  careerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  careerIcon: {
    marginRight: 6,
  },
  section: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  // Relationship Goal styles
  relationshipGoalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relationshipGoalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 8,
  },
  relationshipGoalIcon: {
    marginRight: 8,
  },
  relationshipGoalText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Specific relationship goal styles
  casualDatingGoal: {
    backgroundColor: '#FFE9EC',
  },
  casualDatingGoalText: {
    color: '#FF4458',
  },
  seriousRelationshipGoal: {
    backgroundColor: '#F3E8FF',
  },
  seriousRelationshipGoalText: {
    color: '#8B5CF6',
  },
  friendshipGoal: {
    backgroundColor: '#DBEAFE',
  },
  friendshipGoalText: {
    color: '#3B82F6',
  },
  marriageGoal: {
    backgroundColor: '#D1FAE5',
  },
  marriageGoalText: {
    color: '#10B981',
  },
  defaultGoal: {
    backgroundColor: '#F3F4F6',
  },
  defaultGoalText: {
    color: '#6B7280',
  },
  // Identity section styles
  identityGrid: {
    flexDirection: 'column',
  },
  identityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  identityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE9EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  identityContent: {
    flex: 1,
  },
  identityLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  identityValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  // Basics section styles
  basicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  basicItem: {
    width: '48%',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  basicIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE9EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  basicLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  basicValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  // Lifestyle section styles
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lifestyleItem: {
    width: '48%',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  lifestyleIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE9EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  lifestyleLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  lifestyleValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  // Interests section styles
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#FFE9EC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    color: '#FF4458',
    fontWeight: '500',
  },
  // Hobbies section styles - Thêm mới
hobbiesContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
},
hobbyTag: {
  backgroundColor: '#FFE9EC', // Thay đổi từ #F3F4F6 thành #FFE9EC (màu nền đỏ nhạt)
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  marginRight: 8,
  marginBottom: 8,
},
hobbyText: {
  fontSize: 14,
  color: '#FF4458', // Thay đổi từ #4B5563 thành #FF4458 (màu chữ đỏ)
  fontWeight: '500',
},
  // Looking For section styles
  lookingForContainer: {
    marginBottom: 16,
  },
  lookingForItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lookingForLabel: {
    fontSize: 16,
    color: '#4B5563',
  },
  lookingForValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  lookingForSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
  },
  preferMatchContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferMatchTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  preferMatchText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  // Preferences section styles
  preferencesContainer: {
    flexDirection: 'column',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferenceIconAndLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE9EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#4B5563',
  },
  // Languages section styles - Đã cập nhật
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageTag: {
    backgroundColor: '#FFE9EC', // Thay đổi màu nền giống với interest tags
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 14,
    color: '#FF4458', // Thay đổi màu chữ giống với interest tags
    fontWeight: '500',
  },
  // Privacy section styles
  privacyContainer: {
    flexDirection: 'column',
  },
  privacyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  privacyLabel: {
    fontSize: 16,
    color: '#4B5563',
  },
  // Settings section styles
  settingsSection: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 12,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF4458',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});