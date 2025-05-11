import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Mail, Lock, Eye, EyeOff, User, ChevronLeft, Calendar, Users } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState(''); // Lưu trữ ngày sinh
  const [gender, setGender] = useState('male'); // Lưu trữ giới tính (default male)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [dobError, setDobError] = useState(''); // Lỗi cho ngày sinh
  const [genderError, setGenderError] = useState(''); // Lỗi cho giới tính

  const handleRegister = () => {
    // Reset all errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setDobError('');
    setGenderError('');

    // Validate inputs
    let isValid = true;

    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    }

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    if (!dob) {
      setDobError('Date of Birth is required');
      isValid = false;
    }

    if (!gender) {
      setGenderError('Please select a gender');
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);

      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to profile setup
        router.push('/(tabs)');
      }, 1500);
    }
  };

  // Function to get gender display text
  const getGenderDisplayText = () => {
    switch(gender) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      case 'other': return 'Other';
      default: return 'Select Gender';
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <LinearGradient colors={['#FF3366', '#FF0099']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logoBackground}>
            <Heart size={40} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.logoText}>Lufian</Text>
        </View>

        <Text style={styles.titleText}>Create Account</Text>
        <Text style={styles.subtitleText}>Start finding your perfect match today</Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <User size={20} color="#FF3366" style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Full Name" 
              placeholderTextColor="#9CA3AF" 
              value={name} 
              onChangeText={setName} 
            />
          </View>
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

          <View style={styles.inputContainer}>
            <Mail size={20} color="#FF3366" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <View style={styles.inputContainer}>
            <Lock size={20} color="#FF3366" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              {showPassword ? <EyeOff size={20} color="#FF3366" /> : <Eye size={20} color="#FF3366" />}
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <View style={styles.inputContainer}>
            <Lock size={20} color="#FF3366" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              {showConfirmPassword ? <EyeOff size={20} color="#FF3366" /> : <Eye size={20} color="#FF3366" />}
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

          {/* Trường nhập ngày sinh - Cải thiện UI */}
          <View style={styles.inputContainer}>
            <Calendar size={20} color="#FF3366" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (MM/DD/YYYY)"
              placeholderTextColor="#9CA3AF"
              value={dob}
              onChangeText={setDob}
              keyboardType="numbers-and-punctuation"
            />
          </View>
          {dobError ? <Text style={styles.errorText}>{dobError}</Text> : null}

          {/* Trường chọn giới tính - Cải thiện UI */}
          <TouchableOpacity 
            style={styles.inputContainer}
            onPress={() => setShowGenderPicker(!showGenderPicker)}
          >
            <Users size={20} color="#FF3366" style={styles.inputIcon} />
            <Text style={[styles.input, {color: gender ? '#111827' : '#9CA3AF'}]}>
              {getGenderDisplayText()}
            </Text>
            <ChevronLeft 
              size={20} 
              color="#111827" 
              style={[styles.chevronIcon, showGenderPicker && styles.chevronIconUp]} 
            />
          </TouchableOpacity>
          {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}
          
          {showGenderPicker && (
            <View style={styles.pickerContainer}>
              <TouchableOpacity 
                style={styles.pickerItem} 
                onPress={() => {
                  setGender('male');
                  setShowGenderPicker(false);
                }}
              >
                <Text style={[styles.pickerItemText, gender === 'male' && styles.selectedPickerItemText]}>Male</Text>
                {gender === 'male' && <View style={styles.selectedIndicator} />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.pickerItem} 
                onPress={() => {
                  setGender('female');
                  setShowGenderPicker(false);
                }}
              >
                <Text style={[styles.pickerItemText, gender === 'female' && styles.selectedPickerItemText]}>Female</Text>
                {gender === 'female' && <View style={styles.selectedIndicator} />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.pickerItem} 
                onPress={() => {
                  setGender('other');
                  setShowGenderPicker(false);
                }}
              >
                <Text style={[styles.pickerItemText, gender === 'other' && styles.selectedPickerItemText]}>Other</Text>
                {gender === 'other' && <View style={styles.selectedIndicator} />}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
            <LinearGradient colors={['#1A1A1A', '#000000']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              <Text style={styles.registerButtonText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.haveAccountText}>Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBackground: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#FF3366',
    marginLeft: 16,
  },
  titleText: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: '#111827',
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
  },
  eyeIcon: {
    padding: 8,
  },
  chevronIcon: {
    transform: [{ rotate: '-90deg' }],
    padding: 8,
  },
  chevronIconUp: {
    transform: [{ rotate: '90deg' }],
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#EF4444',
    marginTop: -8,
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: -8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
  },
  selectedPickerItemText: {
    fontFamily: 'Inter-Medium',
    color: '#FF3366',
  },
  selectedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF3366',
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3366',
  },
  registerButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  haveAccountText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  loginText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FF3366',
    marginLeft: 4,
  },
});