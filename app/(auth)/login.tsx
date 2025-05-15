import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { Heart, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveAuthData } from '../utils/auth'; // Giả sử bạn đã định nghĩa hàm này trong utils/auth.js
// Định nghĩa API base URL
const API_BASE_URL = 'http://10.0.2.2:3001/v1';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    // Validate inputs
    let isValid = true;
    
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
    }
    
    if (isValid) {
      setIsLoading(true);
      try {
        // Log để debug
        console.log('Attempting login with:', { email, password: '***' });
        
        const response = await axios.post(`${API_BASE_URL}/login`, {
          email,
          password
        }, 
        {
          headers: {
            "X-Device-Type": "app", 
            "Content-Type": "application/json",
          },
        });
        
        // Log response để debug
        console.log('Login response structure:', Object.keys(response.data));
        
        if (response.data && response.data.access_token) {
          try {
            console.log('Login successful, saving auth data');
            
            // Lưu dữ liệu xác thực sử dụng module auth
            await saveAuthData(
              response.data.access_token,
              response.data.refresh_token,
              response.data.user,
              response.data.expires_in
            );
            
            console.log('Auth data saved successfully');
            
            // Kiểm tra token đã lưu
            const savedToken = await AsyncStorage.getItem('userToken');
            console.log('Verified saved token exists:', !!savedToken);
            
            setIsLoading(false);
            router.replace('/(tabs)');
          } catch (storageError) {
            console.error('Error saving auth data to AsyncStorage:', storageError);
            Alert.alert(
              'Storage Error',
              'Failed to save login information. Please try again.',
              [{ text: 'OK' }]
            );
            setIsLoading(false);
          }
        } else {
          console.error('Invalid response format:', response.data);
          Alert.alert(
            'Login Error',
            'Server returned an invalid response format. Please try again later.',
            [{ text: 'OK' }]
          );
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
        
        if (axios.isAxiosError(error)) {
          // Xử lý lỗi Axios
          console.error('Login error:', error);
          
          if (error.response) {
            console.error('Error data:', error.response.data);
            console.error('Error status:', error.response.status);
            
            // Hiển thị thông báo lỗi cụ thể từ server
            const errorMessage = error.response.data?.message || 'Login failed. Please check your credentials.';
            Alert.alert('Login Error', errorMessage);
          } else if (error.request) {
            console.error('Network Error:', error.request);
            Alert.alert('Network Error', 'Could not connect to the server. Please check your internet connection.');
          } else {
            console.error('Error:', error.message);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
          }
        } else {
          // Xử lý lỗi không phải Axios
          console.error('Unexpected error:', error);
          Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        }
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#FF3366', '#FF0099']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBackground}
          >
            <Heart size={40} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.logoText}>Lufian</Text>
        </View>
        
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.subtitleText}>Sign in to continue finding your perfect match</Text>
        
        <View style={styles.formContainer}>
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
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <EyeOff size={20} color="#FF3366" />
              ) : (
                <Eye size={20} color="#FF3366" />
              )}
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </Link>
          
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#1A1A1A', '#000000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footerContainer}>
          <Text style={styles.noAccountText}>Don't have an account?</Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerText}>Sign Up</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
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
  welcomeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: '#1A1A1A',
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
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#EF4444',
    marginTop: -8,
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#FF3366',
    textAlign: 'right',
    marginBottom: 24,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
  loginButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccountText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  registerText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FF3366',
    marginLeft: 4,
  },
});