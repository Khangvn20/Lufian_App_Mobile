import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Switch,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  Modal,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { X, Plus, ChevronLeft, Save, ChevronDown, Check, Heart } from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types matching backend structs
type ProfilePrivacy = {
  showAge: boolean;
  showWeight: boolean;
  showLocation: boolean;
};

type Profile = {
  username: string;
  sexualOrientation: string;
  preferGender: string;
  preferMatch: string[];
  bio: string;
  education: string;
  height: number;
  weight: number;
  hobbies: string[];
  interest: string[];
  religion: string;
  drinkingHabits: string;
  smokingHabits: string;
  childrenPreference: string;
  fitnessLevel: string;
  languages: string[];
  mbtiType: string;
  zodiacSign: string;
  privacy: ProfilePrivacy;
};

// Predefined options for dropdowns
const SEXUAL_ORIENTATIONS = [
  'Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual'
];

const GENDER_OPTIONS = [
  'Male', 'Female', 'Non-binary'
];

const PREFERRED_GENDER_OPTIONS = [
  'Same Gender', 'Opposite Gender', 'Both Genders', 'All Genders'
];

const RELATIONSHIP_GOALS = [
  'Casual Dating', 'Serious Relationship', 'Friendship', 'Marriage'
];

const FITNESS_LEVELS = [
  'Not Active', 'Occasionally Active', 'Active', 'Fit', 'Very Fit'
];

const SMOKING_HABITS = [
  'Non-smoker', 'Rarely', 'Social Smoker', 'Regular Smoker'
];

const DRINKING_HABITS = [
  'Non-drinker', 'Rarely', 'Social Drinker', 'Regular Drinker'
];

const CHILDREN_PREFERENCES = [
  'Not Decided', 'Want Children', 'Don\'t Want Children', 'Have Children'
];

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

const INTEREST_OPTIONS = [
  'AI', 'Tech', 'IT', 'Astrology', 'Space', 'Music', 'Art', 'Sports', 'Travel',
  'Food', 'Fashion', 'Photography', 'Movies', 'Books', 'Gaming', 'Fitness',
  'Cooking', 'Nature', 'Animals', 'Science', 'History', 'Politics', 'Philosophy',
  'Psychology', 'Business', 'Finance', 'Education', 'Health', 'Wellness', 'Spirituality'
];

const HOBBY_OPTIONS = [
  'Game', 'Music', 'Travel', 'Food', 'Sports', 'Movies', 'Books', 'Art', 'Work',
  'Study', 'Shopping', 'Dance', 'Photography', 'Writing', 'Gardening', 'DIY',
  'Coding', 'Design', 'Pet', 'Volunteering', 'Social work', 'Charity', 'Beauty',
  'Health', 'Technology', 'Science', 'History', 'Politics', 'Economy', 'Philosophy',
  'Psychology', 'Sociology', 'Environment', 'Climate change', 'Human rights',
  'Equality', 'Diversity', 'Inclusion', 'Justice', 'Peace', 'Love', 'Friendship',
  'Family', 'Relationship', 'Marriage', 'Parenting', 'Education', 'Career', 'Business',
  'Entrepreneurship', 'Investing', 'Finance', 'Real estate', 'Traveling', 'Camping',
  'Hiking', 'Swimming', 'Cycling', 'Running', 'Yoga', 'Meditation', 'Gym', 'Diet',
  'Cooking', 'Baking', 'Coffee', 'Tea', 'Wine', 'Skincare', 'Self Development',
  'Makeup', 'Art Galleries', 'Museums', 'Theater', 'Concerts', 'Festivals', 'Cinema',
  'Reading', 'Poetry', 'Singing', 'Playing instruments', 'Take Photos', 'Edit Photos',
  'Drawing', 'Painting', 'Craft', 'Fashion', 'Fitness', 'Spa', 'League Of Legends', 'Sport'
];

const LANGUAGE_OPTIONS = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi', 'Vietnamese', 'Thai'
];

const RELIGION_OPTIONS = [
  'Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Judaism', 'Sikhism', 'Atheism', 'Agnosticism', 'Other'
];

// API configuration
const API_BASE_URL = 'http://10.0.2.2:3001/v1';

export default function UpdateProfileScreen() {
  const [profile, setProfile] = useState<Profile>({
    username: '',
    sexualOrientation: '',
    preferGender: '',
    preferMatch: [],
    bio: '',
    education: '',
    height: 0,
    weight: 0,
    hobbies: [],
    interest: [],
    religion: '',
    drinkingHabits: '',
    smokingHabits: '',
    childrenPreference: '',
    fitnessLevel: '',
    languages: [],
    mbtiType: '',
    zodiacSign: '',
    privacy: {
      showAge: true,
      showWeight: false,
      showLocation: true
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // For new tag inputs
  const [newInterest, setNewInterest] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newPreferMatch, setNewPreferMatch] = useState('');

  // For dropdown modals
  const [currentDropdown, setCurrentDropdown] = useState<string | null>(null);
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  const [dropdownField, setDropdownField] = useState<keyof Profile | null>(null);

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
      const response = await axios.get(`${API_BASE_URL}/user-profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Device-Type': 'app'
        }
      });

      console.log('Profile data received:', JSON.stringify(response.data, null, 2));
      
      // Map API data to frontend structure
      if (response.data && response.data.profile) {
        const apiData = response.data.profile;
        
        // Create Profile object from API data
        const mappedProfile: Profile = {
          username: apiData.user?.username || apiData.profile?.username || '',
          sexualOrientation: capitalizeFirstLetter(apiData.profile?.sexual_orientation || ''),
          preferGender: capitalizeFirstLetter(apiData.profile?.prefer_gender || ''),
          preferMatch: Array.isArray(apiData.profile?.prefer_match) 
            ? apiData.profile.prefer_match.map((item: string) => capitalizeFirstLetter(item))
            : [],
          bio: apiData.profile?.bio || '',
          education: capitalizeFirstLetter(apiData.profile?.education_level || ''),
          height: apiData.profile?.height || 0,
          weight: apiData.profile?.weight || 0,
          hobbies: Array.isArray(apiData.profile?.hobbies)
            ? apiData.profile.hobbies.map((item: string) => capitalizeFirstLetter(item))
            : [],
          interest: Array.isArray(apiData.profile?.interest)
            ? apiData.profile.interest.map((item: string) => capitalizeFirstLetter(item))
            : [],
          religion: capitalizeFirstLetter(apiData.profile?.religion || ''),
          drinkingHabits: capitalizeFirstLetter(apiData.profile?.drinking_habits || ''),
          smokingHabits: capitalizeFirstLetter(apiData.profile?.smoking_habits || ''),
          childrenPreference: capitalizeFirstLetter(apiData.profile?.children_preference || ''),
          fitnessLevel: capitalizeFirstLetter(apiData.profile?.fitness_level || ''),
          languages: Array.isArray(apiData.profile?.languages)
            ? apiData.profile.languages.map((item: string) => capitalizeFirstLetter(item))
            : [],
          zodiacSign: capitalizeFirstLetter(apiData.insights?.zodiac_sign || ''),
          mbtiType: (apiData.insights?.mbti_type || '').toUpperCase(),
          privacy: {
            showAge: Boolean(apiData.profile?.privacy?.show_age),
            showWeight: Boolean(apiData.profile?.privacy?.show_weight),
            showLocation: Boolean(apiData.profile?.privacy?.show_location)
          }
        };
        
        setProfile(mappedProfile);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      
      // Show error message
      Alert.alert(
        'Error',
        'Failed to load profile data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Capitalize first letter of string
  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Map relationship goal
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

  // Map relationship goal back to API format
  const mapRelationshipGoalToAPI = (goal: string): string => {
    switch (goal) {
      case 'Casual Dating':
        return 'casual';
      case 'Serious Relationship':
        return 'serious';
      case 'Friendship':
        return 'friendship';
      case 'Marriage':
        return 'marriage';
      default:
        return goal.toLowerCase();
    }
  };

  // Add item to array
  const addItem = (field: keyof Profile, value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!value.trim()) return;
    
    // Type assertion for array field
    const currentArray = profile[field] as string[];
    
    if (!currentArray.includes(value)) {
      setProfile({
        ...profile,
        [field]: [...currentArray, value.trim()]
      });
    }
    setter('');
  };

  // Remove item from array
  const removeItem = (field: keyof Profile, index: number) => {
    // Type assertion for array field
    const currentArray = profile[field] as string[];
    
    setProfile({
      ...profile,
      [field]: currentArray.filter((_, i) => i !== index)
    });
  };

  // Open dropdown modal
  const openDropdown = (field: keyof Profile, options: string[]) => {
    setDropdownField(field);
    setDropdownOptions(options);
    setCurrentDropdown(field as string);
  };

  // Select option from dropdown
  const selectOption = (option: string) => {
    if (dropdownField) {
      setProfile({
        ...profile,
        [dropdownField]: option
      });
      setCurrentDropdown(null);
    }
  };

  // Add option from predefined list to array field
  const addPredefinedOption = (field: keyof Profile, option: string) => {
    const currentArray = profile[field] as string[];
    
    if (!currentArray.includes(option)) {
      setProfile({
        ...profile,
        [field]: [...currentArray, option]
      });
    }
  };

  // Get relationship goal style based on the goal
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

  // Get relationship goal text style based on the goal
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

  // Get relationship goal icon color based on the goal
  const getRelationshipGoalIconColor = (goal: string) => {
    switch (goal) {
      case 'Casual Dating':
        return '#FF4458';
      case 'Serious Relationship':
        return '#8B5CF6';
      case 'Friendship':
        return '#3B82F6';
      case 'Marriage':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  // Prepare data for API
  const prepareProfileDataForAPI = () => {
    return {
      username: profile.username,
    sexual_orientation: profile.sexualOrientation.toLowerCase(),
    prefer_gender: profile.preferGender.toLowerCase(),
    prefer_match: Array.isArray(profile.preferMatch) 
      ? profile.preferMatch.map(item => item.toLowerCase())
      : [],
    bio: profile.bio,
    education_level: profile.education.toLowerCase(),
    height: Number(profile.height) || 0,
    weight: Number(profile.weight) || 0,
    hobbies: profile.hobbies.map(item => item.toLowerCase()),
    interest: profile.interest.map(item => item.toLowerCase()),
    religion: profile.religion.toLowerCase(),
    drinking_habits: profile.drinkingHabits.toLowerCase(),
    smoking_habits: profile.smokingHabits.toLowerCase(),
    children_preference: profile.childrenPreference.toLowerCase(),
    fitness_level: profile.fitnessLevel.toLowerCase(),
    languages: profile.languages.map(item => item.toLowerCase()),
    privacy: {
      show_age: profile.privacy.showAge,
      show_weight: profile.privacy.showWeight,
      show_location: profile.privacy.showLocation
    },
      insights: {
        zodiac_sign: profile.zodiacSign.toLowerCase(),
        mbti_type: profile.mbtiType.toUpperCase()
      }
    };
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Get auth token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Prepare data for API
      const profileData = prepareProfileDataForAPI();
      
      console.log('Sending profile data:', JSON.stringify(profileData, null, 2));
      
      // Send PUT request to update profile
      const response = await axios.put(`${API_BASE_URL}/user-profile/`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Device-Type': 'app'
        }
      });
      
      console.log('Update response:', response.data);
      
      // Show success message
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => router.push('/(tabs)/profile')
          }
        ]
      );
    } catch (err) {
      console.error('Failed to update profile:', err);
      
      // Show error message
      Alert.alert(
        'Error',
        'Failed to update profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  // Fetch profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Render relationship goal options
  const renderRelationshipGoalOptions = () => {
    return (
      <View style={styles.relationshipGoalsContainer}>
        {RELATIONSHIP_GOALS.map((goal, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.relationshipGoalOption,
              profile.preferMatch.includes(goal) && getRelationshipGoalStyle(goal)
            ]}
            onPress={() => {
              // Toggle selection for relationship goals
              if (profile.preferMatch.includes(goal)) {
                setProfile({
                  ...profile,
                  preferMatch: profile.preferMatch.filter(item => item !== goal)
                });
              } else {
                setProfile({
                  ...profile,
                  preferMatch: [...profile.preferMatch, goal]
                });
              }
            }}
          >
            <Heart 
              size={16} 
              color={profile.preferMatch.includes(goal) 
                ? getRelationshipGoalIconColor(goal) 
                : '#6B7280'} 
              style={styles.relationshipGoalIcon} 
            />
            <Text 
              style={[
                styles.relationshipGoalOptionText,
                profile.preferMatch.includes(goal) && getRelationshipGoalTextStyle(goal)
              ]}
            >
              {goal}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Show loading indicator while fetching profile
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4458" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityLabel="Go back to profile"
          >
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={saving}
            accessibilityLabel="Save profile changes"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FF4458" />
            ) : (
              <Save size={20} color="#FF4458" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Relationship Goal Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Relationship Goal</Text>
            <Text style={styles.sectionDescription}>What are you looking for right now?</Text>
            
            {renderRelationshipGoalOptions()}

            <View style={styles.currentGoalContainer}>
              <Text style={styles.currentGoalLabel}>Selected Goals:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {profile.preferMatch.length > 0 ? (
                  profile.preferMatch.map((goal, index) => (
                    <View 
                      key={index} 
                      style={[styles.currentGoalTag, getRelationshipGoalStyle(goal)]}
                    >
                      <Heart 
                        size={16} 
                        color={getRelationshipGoalIconColor(goal)} 
                        style={styles.relationshipGoalIcon} 
                      />
                      <Text style={[styles.currentGoalText, getRelationshipGoalTextStyle(goal)]}>
                        {goal}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noGoalsText}>No goals selected</Text>
                )}
              </ScrollView>
            </View>
          </View>

          {/* Basic Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={profile.username}
                onChangeText={(text) => setProfile({ ...profile, username: text })}
                placeholder="Your name"
                accessibilityLabel="Username input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profile.bio}
                onChangeText={(text) => setProfile({ ...profile, bio: text })}
                placeholder="Tell others about yourself"
                multiline
                numberOfLines={4}
                accessibilityLabel="Bio input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Sexual Orientation</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => openDropdown('sexualOrientation', SEXUAL_ORIENTATIONS)}
                accessibilityLabel="Select sexual orientation"
              >
                <Text style={styles.dropdownText}>
                  {profile.sexualOrientation || 'Select sexual orientation'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Prefer Gender</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => openDropdown('preferGender', PREFERRED_GENDER_OPTIONS)}
                accessibilityLabel="Select preferred gender"
              >
                <Text style={styles.dropdownText}>
                  {profile.preferGender || 'Select preferred gender'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Physical Attributes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Physical Attributes</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={profile.height ? String(profile.height) : ''}
                onChangeText={(text) => {
                  const numValue = text.replace(/[^0-9]/g, '');
                  setProfile({ ...profile, height: numValue ? Number(numValue) : 0 });
                }}
                keyboardType="numeric"
                placeholder="Your height in cm"
                accessibilityLabel="Height input in centimeters"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={profile.weight ? String(profile.weight) : ''}
                onChangeText={(text) => {
                  const numValue = text.replace(/[^0-9]/g, '');
                  setProfile({ ...profile, weight: numValue ? Number(numValue) : 0 });
                }}
                keyboardType="numeric"
                placeholder="Your weight in kg"
                accessibilityLabel="Weight input in kilograms"
              />
            </View>
          </View>

          {/* Personality Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personality</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>MBTI Type</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => openDropdown('mbtiType', MBTI_TYPES)}
                accessibilityLabel="Select MBTI personality type"
              >
                <Text style={styles.dropdownText}>
                  {profile.mbtiType || 'Select MBTI type'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Zodiac Sign</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => openDropdown('zodiacSign', ZODIAC_SIGNS)}
                accessibilityLabel="Select zodiac sign"
              >
                <Text style={styles.dropdownText}>
                  {profile.zodiacSign || 'Select zodiac sign'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lifestyle Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lifestyle</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Education</Text>
              <TextInput
                style={styles.input}
                value={profile.education}
                onChangeText={(text) => setProfile({ ...profile, education: text })}
                placeholder="Your education level"
                accessibilityLabel="Education level input"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Religion</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => openDropdown('religion', RELIGION_OPTIONS)}
                accessibilityLabel="Select religion"
              >
                <Text style={styles.dropdownText}>
                  {profile.religion || 'Select your religion'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Drinking Habits</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => openDropdown('drinkingHabits', DRINKING_HABITS)}
                accessibilityLabel="Select drinking habits"
              >
                <Text style={styles.dropdownText}>
                  {profile.drinkingHabits || 'Select drinking habits'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Smoking Habits</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => openDropdown('smokingHabits', SMOKING_HABITS)}
                accessibilityLabel="Select smoking habits"
              >
                <Text style={styles.dropdownText}>
                  {profile.smokingHabits || 'Select smoking habits'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Children Preference</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => openDropdown('childrenPreference', CHILDREN_PREFERENCES)}
                accessibilityLabel="Select children preference"
              >
                <Text style={styles.dropdownText}>
                  {profile.childrenPreference || 'Select children preference'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fitness Level</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => openDropdown('fitnessLevel', FITNESS_LEVELS)}
                accessibilityLabel="Select fitness level"
              >
                <Text style={styles.dropdownText}>
                  {profile.fitnessLevel || 'Select fitness level'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Interests Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interests</Text>
            
            <View style={styles.tagsContainer}>
              {profile.interest.map((item, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{item}</Text>
                  <TouchableOpacity 
                    style={styles.removeTagButton}
                    onPress={() => removeItem('interest', index)}
                    accessibilityLabel={`Remove interest ${item}`}
                  >
                    <X size={14} color="#FF4458" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            <Text style={styles.subLabel}>Select from popular interests:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              {INTEREST_OPTIONS.filter(option => !profile.interest.includes(option)).map((option, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.optionTag}
                  onPress={() => addPredefinedOption('interest', option)}
                  accessibilityLabel={`Add interest ${option}`}
                >
                  <Text style={styles.optionTagText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.addTagContainer}>
              <TextInput
                style={styles.tagInput}
                value={newInterest}
                onChangeText={setNewInterest}
                placeholder="Add custom interest"
                accessibilityLabel="Custom interest input"
              />
              <TouchableOpacity 
                style={styles.addTagButton}
                onPress={() => addItem('interest', newInterest, setNewInterest)}
                accessibilityLabel="Add custom interest"
                disabled={!newInterest.trim()}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hobbies Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hobbies</Text>
            
            <View style={styles.tagsContainer}>
              {profile.hobbies.map((item, index) => (
                <View key={index} style={styles.hobbyTag}>
                  <Text style={styles.hobbyText}>{item}</Text>
                  <TouchableOpacity 
                    style={styles.removeTagButton}
                    onPress={() => removeItem('hobbies', index)}
                    accessibilityLabel={`Remove hobby ${item}`}
                  >
                    <X size={14} color="#FF4458" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            <Text style={styles.subLabel}>Select from popular hobbies:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              {HOBBY_OPTIONS.filter(option => !profile.hobbies.includes(option)).map((option, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.optionTag}
                  onPress={() => addPredefinedOption('hobbies', option)}
                  accessibilityLabel={`Add hobby ${option}`}
                >
                  <Text style={styles.optionTagText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.addTagContainer}>
              <TextInput
                style={styles.tagInput}
                value={newHobby}
                onChangeText={setNewHobby}
                placeholder="Add custom hobby"
                accessibilityLabel="Custom hobby input"
              />
              <TouchableOpacity 
                style={styles.addTagButton}
                onPress={() => addItem('hobbies', newHobby, setNewHobby)}
                accessibilityLabel="Add custom hobby"
                disabled={!newHobby.trim()}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Languages Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            
            <View style={styles.tagsContainer}>
              {profile.languages.map((item, index) => (
                <View key={index} style={styles.languageTag}>
                  <Text style={styles.languageText}>{item}</Text>
                  <TouchableOpacity 
                    style={styles.removeTagButton}
                    onPress={() => removeItem('languages', index)}
                    accessibilityLabel={`Remove language ${item}`}
                  >
                    <X size={14} color="#FF4458" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            <Text style={styles.subLabel}>Select from languages:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
              {LANGUAGE_OPTIONS.filter(option => !profile.languages.includes(option)).map((option, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.optionTag}
                  onPress={() => addPredefinedOption('languages', option)}
                  accessibilityLabel={`Add language ${option}`}
                >
                  <Text style={styles.optionTagText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.addTagContainer}>
              <TextInput
                style={styles.tagInput}
                value={newLanguage}
                onChangeText={setNewLanguage}
                placeholder="Add custom language"
                accessibilityLabel="Custom language input"
              />
              <TouchableOpacity 
                style={styles.addTagButton}
                onPress={() => addItem('languages', newLanguage, setNewLanguage)}
                accessibilityLabel="Add custom language"
                disabled={!newLanguage.trim()}
              >
                <Plus size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Show Age</Text>
              <Switch
                value={profile.privacy.showAge}
                onValueChange={(value) => 
                  setProfile({
                    ...profile,
                    privacy: { ...profile.privacy, showAge: value }
                  })
                }
                trackColor={{ false: '#E5E7EB', true: '#FFE9EC' }}
                thumbColor={profile.privacy.showAge ? '#FF4458' : '#F3F4F6'}
                accessibilityLabel="Toggle show age"
              />
            </View>
            
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Show Weight</Text>
              <Switch
                value={profile.privacy.showWeight}
                onValueChange={(value) => 
                  setProfile({
                    ...profile,
                    privacy: { ...profile.privacy, showWeight: value }
                  })
                }
                trackColor={{ false: '#E5E7EB', true: '#FFE9EC' }}
                thumbColor={profile.privacy.showWeight ? '#FF4458' : '#F3F4F6'}
                accessibilityLabel="Toggle show weight"
              />
            </View>
            
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Show Location</Text>
              <Switch
                value={profile.privacy.showLocation}
                onValueChange={(value) => 
                  setProfile({
                    ...profile,
                    privacy: { ...profile.privacy, showLocation: value }
                  })
                }
                trackColor={{ false: '#E5E7EB', true: '#FFE9EC' }}
                thumbColor={profile.privacy.showLocation ? '#FF4458' : '#F3F4F6'}
                accessibilityLabel="Toggle show location"
              />
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.mainButton} 
              onPress={handleSave}
              disabled={saving}
              accessibilityLabel="Save profile changes"
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.mainButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => router.push('/(tabs)/profile')}
              disabled={saving}
              accessibilityLabel="Cancel and return to profile"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Dropdown Modal */}
        <Modal
          visible={currentDropdown !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setCurrentDropdown(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Select {currentDropdown?.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Text>
                <TouchableOpacity 
                  onPress={() => setCurrentDropdown(null)}
                  accessibilityLabel="Close dropdown"
                >
                  <X size={24} color="#000" />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={dropdownOptions}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.optionItem,
                      pressed && styles.optionItemPressed,
                      dropdownField && profile[dropdownField] === item && styles.optionItemSelected
                    ]}
                    onPress={() => selectOption(item)}
                    accessibilityLabel={`Select ${item}`}
                  >
                    <Text style={styles.optionItemText}>{item}</Text>
                    {dropdownField && profile[dropdownField] === item && (
                      <Check size={20} color="#FF4458" />
                    )}
                  </Pressable>
                )}
                style={styles.optionsList}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  backButton: {
    padding: 5,
  },
  saveButton: {
    padding: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 10,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  dropdownText: {
    fontSize: 16,
    color: '#4B5563',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  // Relationship Goal styles
  relationshipGoalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  relationshipGoalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    backgroundColor: '#F9FAFB',
  },
  relationshipGoalOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  relationshipGoalIcon: {
    marginRight: 8,
  },
  currentGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  currentGoalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginRight: 10,
  },
  currentGoalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  currentGoalText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noGoalsText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  // Specific relationship goal styles
  casualDatingGoal: {
    backgroundColor: '#FFE9EC',
    borderColor: '#FFE9EC',
  },
  casualDatingGoalText: {
    color: '#FF4458',
  },
  seriousRelationshipGoal: {
    backgroundColor: '#F3E8FF',
    borderColor: '#F3E8FF',
  },
  seriousRelationshipGoalText: {
    color: '#8B5CF6',
  },
  friendshipGoal: {
    backgroundColor: '#DBEAFE',
    borderColor: '#DBEAFE',
  },
  friendshipGoalText: {
    color: '#3B82F6',
  },
  marriageGoal: {
    backgroundColor: '#D1FAE5',
    borderColor: '#D1FAE5',
  },
  marriageGoalText: {
    color: '#10B981',
  },
  defaultGoal: {
    backgroundColor: '#F3F4F6',
    borderColor: '#F3F4F6',
  },
  defaultGoalText: {
    color: '#6B7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE9EC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#FF4458',
    marginRight: 5,
  },
  // Hobby tag styles
  hobbyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE9EC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  hobbyText: {
    fontSize: 14,
    color: '#FF4458',
    marginRight: 5,
  },
  // Language tag styles
  languageTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE9EC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 14,
    color: '#FF4458',
    marginRight: 5,
  },
  removeTagButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsScroll: {
    marginBottom: 15,
  },
  optionTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  optionTagText: {
    fontSize: 14,
    color: '#4B5563',
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginRight: 10,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4458',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#4B5563',
  },
  footer: {
    padding: 20,
    marginBottom: 20,
  },
  mainButton: {
    backgroundColor: '#FF4458',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionItemPressed: {
    backgroundColor: '#F9FAFB',
  },
  optionItemSelected: {
    backgroundColor: '#FFE9EC',
  },
  optionItemText: {
    fontSize: 16,
    color: '#4B5563',
  },
});