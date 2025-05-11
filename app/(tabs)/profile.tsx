import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Platform
} from 'react-native';
import { 
  User, 
  MapPin, 
  Calendar, 
  Edit2, 
  Settings, 
  Camera, 
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  LogOut
} from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const [profileImage, setProfileImage] = useState('https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');
  const [isEditing, setIsEditing] = useState(false);
  
  // Sample profile data
  const [profile, setProfile] = useState({
    name: 'Amanda Wilson',
    age: 26,
    location: 'New York, NY',
    bio: 'Coffee enthusiast, avid reader, and hiking lover. Looking for someone to share adventures with!',
    interests: ['Reading', 'Hiking', 'Coffee', 'Travel', 'Photography', 'Cooking'],
    preferences: {
      ageRange: [24, 35],
      distance: 15,
      showOnline: true,
      notifications: true,
    }
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <Text style={styles.doneText}>Done</Text>
          ) : (
            <Settings size={24} color="#111827" />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: profileImage }} 
            style={styles.profileImage} 
          />
          {isEditing && (
            <TouchableOpacity 
              style={styles.editImageButton}
              onPress={pickImage}
            >
              <Camera size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile.name}</Text>
          
          <View style={styles.profileDetail}>
            <MapPin size={16} color="#6C63FF" style={styles.profileIcon} />
            <Text style={styles.profileText}>{profile.location}</Text>
          </View>
          
          <View style={styles.profileDetail}>
            <Calendar size={16} color="#6C63FF" style={styles.profileIcon} />
            <Text style={styles.profileText}>{profile.age} years old</Text>
          </View>
        </View>
        
        {isEditing && (
          <TouchableOpacity style={styles.editProfileButton}>
            <Edit2 size={18} color="#6C63FF" style={styles.editIcon} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.bioSection}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.bioText}>{profile.bio}</Text>
        {isEditing && (
          <TouchableOpacity style={styles.editBioButton}>
            <Edit2 size={16} color="#6C63FF" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.interestsSection}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.interestsContainer}>
          {profile.interests.map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
              {isEditing && (
                <TouchableOpacity style={styles.removeInterestButton}>
                  <Text style={styles.removeInterestText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          {isEditing && (
            <TouchableOpacity style={styles.addInterestButton}>
              <Text style={styles.addInterestText}>+ Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.preferencesSection}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Age Range</Text>
          <Text style={styles.preferenceValue}>{profile.preferences.ageRange[0]}-{profile.preferences.ageRange[1]} years</Text>
          {isEditing && <ChevronRight size={20} color="#9CA3AF" />}
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Maximum Distance</Text>
          <Text style={styles.preferenceValue}>{profile.preferences.distance} miles</Text>
          {isEditing && <ChevronRight size={20} color="#9CA3AF" />}
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Show Online Status</Text>
          <Switch
            trackColor={{ false: '#E5E7EB', true: '#C7C3FF' }}
            thumbColor={profile.preferences.showOnline ? '#6C63FF' : '#F9FAFB'}
            ios_backgroundColor="#E5E7EB"
            onValueChange={(value) => setProfile({
              ...profile,
              preferences: {
                ...profile.preferences,
                showOnline: value
              }
            })}
            value={profile.preferences.showOnline}
            disabled={!isEditing}
          />
        </View>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Push Notifications</Text>
          <Switch
            trackColor={{ false: '#E5E7EB', true: '#C7C3FF' }}
            thumbColor={profile.preferences.notifications ? '#6C63FF' : '#F9FAFB'}
            ios_backgroundColor="#E5E7EB"
            onValueChange={(value) => setProfile({
              ...profile,
              preferences: {
                ...profile.preferences,
                notifications: value
              }
            })}
            value={profile.preferences.notifications}
            disabled={!isEditing}
          />
        </View>
      </View>
      
      {isEditing && (
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemIcon}>
              <Bell size={20} color="#6C63FF" />
            </View>
            <Text style={styles.settingsItemText}>Notifications</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemIcon}>
              <Shield size={20} color="#6C63FF" />
            </View>
            <Text style={styles.settingsItemText}>Privacy & Security</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemIcon}>
              <HelpCircle size={20} color="#6C63FF" />
            </View>
            <Text style={styles.settingsItemText}>Help & Support</Text>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Lufian v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#111827',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#6C63FF',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6C63FF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  profileDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileIcon: {
    marginRight: 8,
  },
  profileText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#4B5563',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  editIcon: {
    marginRight: 6,
  },
  editProfileText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6C63FF',
  },
  bioSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    position: 'relative',
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
    marginBottom: 10,
  },
  bioText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  editBioButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    padding: 8,
  },
  interestsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  removeInterestButton: {
    marginLeft: 6,
  },
  removeInterestText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#9CA3AF',
  },
  addInterestButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  addInterestText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6C63FF',
  },
  preferencesSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  preferenceLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  preferenceValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginRight: 8,
  },
  settingsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#111827',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  logoutText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
});