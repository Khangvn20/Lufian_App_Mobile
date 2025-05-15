import AsyncStorage from '@react-native-async-storage/async-storage';

// Các khóa lưu trữ
const TOKEN_KEY = 'userToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_INFO_KEY = 'userInfo';

// Lưu token
export const saveToken = async (accessToken: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

// Lấy token
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Lưu refresh token
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error saving refresh token:', error);
    throw error;
  }
};

// Lấy refresh token
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

// Lưu thông tin người dùng
export const saveUserInfo = async (userInfo: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  } catch (error) {
    console.error('Error saving user info:', error);
    throw error;
  }
};

// Lấy thông tin người dùng
export const getUserInfo = async (): Promise<any | null> => {
  try {
    const userInfo = await AsyncStorage.getItem(USER_INFO_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

// Lưu toàn bộ dữ liệu xác thực
export const saveAuthData = async (accessToken: string, refreshToken?: string, userInfo?: any): Promise<void> => {
  try {
    const promises = [saveToken(accessToken)];
    
    if (refreshToken) {
      promises.push(saveRefreshToken(refreshToken));
    }
    
    if (userInfo) {
      promises.push(saveUserInfo(userInfo));
    }
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error saving auth data:', error);
    throw error;
  }
};

// Xóa toàn bộ dữ liệu xác thực (đăng xuất)
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

// Kiểm tra xem người dùng đã đăng nhập chưa
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token;
};