import { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Camera, Plus, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const [photos, setPhotos] = useState([
    'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    null,
    null,
    null,
    null,
    null,
  ]);
  
  const [profile, setProfile] = useState({
    name: 'Amanda Wilson',
    age: '26',
    job: 'Software Engineer',
    company: 'Tech Corp',
    school: 'Stanford University',
    bio: 'Coffee enthusiast, avid reader, and hiking lover. Looking for someone to share adventures with!',
    livingIn: 'New York, NY',
    gender: 'Woman',
    sexualOrientation: 'Straight',
    lookingFor: 'Men',
  });

  const pickImage = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const newPhotos = [...photos];
      newPhotos[index] = result.assets[0].uri;
      setPhotos(newPhotos);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos[index] = null;
    setPhotos(newPhotos);
  };

  const handleSave = () => {
    // Save profile changes
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Profile Photos</Text>
        <Text style={styles.sectionSubtitle}>Add up to 6 photos to show your best self</Text>
        
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              {photo ? (
                <>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity 
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={styles.addPhotoButton}
                  onPress={() => pickImage(index)}
                >
                  <Plus size={24} color="#FF6B6B" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>About You</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={profile.name}
              onChangeText={(text) => setProfile({ ...profile, name: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={profile.age}
              keyboardType="number-pad"
              onChangeText={(text) => setProfile({ ...profile, age: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Job Title</Text>
            <TextInput
              style={styles.input}
              value={profile.job}
              onChangeText={(text) => setProfile({ ...profile, job: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company</Text>
            <TextInput
              style={styles.input}
              value={profile.company}
              onChangeText={(text) => setProfile({ ...profile, company: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>School</Text>
            <TextInput
              style={styles.input}
              value={profile.school}
              onChangeText={(text) => setProfile({ ...profile, school: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Living in</Text>
            <TextInput
              style={styles.input}
              value={profile.livingIn}
              onChangeText={(text) => setProfile({ ...profile, livingIn: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>About Me</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profile.bio}
              multiline
              numberOfLines={4}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Control Your Profile</Text>

          <TouchableOpacity style={styles.controlItem}>
            <View>
              <Text style={styles.controlTitle}>I am a</Text>
              <Text style={styles.controlValue}>{profile.gender}</Text>
            </View>
            <ChevronLeft size={20} color="#9CA3AF" style={styles.chevronIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlItem}>
            <View>
              <Text style={styles.controlTitle}>Sexual Orientation</Text>
              <Text style={styles.controlValue}>{profile.sexualOrientation}</Text>
            </View>
            <ChevronLeft size={20} color="#9CA3AF" style={styles.chevronIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlItem}>
            <View>
              <Text style={styles.controlTitle}>Show Me</Text>
              <Text style={styles.controlValue}>{profile.lookingFor}</Text>
            </View>
            <ChevronLeft size={20} color="#9CA3AF" style={styles.chevronIcon} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#111827',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 32,
  },
  photoContainer: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 4,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
  },
  formSection: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  controlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  controlTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  controlValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#111827',
  },
  chevronIcon: {
    transform: [{ rotate: '-90deg' }],
  },
});