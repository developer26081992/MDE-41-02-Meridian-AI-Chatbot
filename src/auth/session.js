import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'meridian.session';

export const saveToken = (session) => SecureStore.setItemAsync(KEY, JSON.stringify(session));
export async function getToken() {
  await AsyncStorage.removeItem('sessionToken');
  const value = await SecureStore.getItemAsync(KEY);
  return value ? JSON.parse(value) : null;
}
export const clearToken = () => SecureStore.deleteItemAsync(KEY);
