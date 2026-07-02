import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolves the backend API base URL dynamically:
 * - Local development: uses the developer's computer IP from expo-constants
 * - Android Emulator: uses the virtual loopback adapter (10.0.2.2)
 * - iOS Simulators / Fallback: uses localhost
 */
const resolveBaseUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000/api`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }
  return 'http://localhost:3000/api';
};

export const API_CONFIG = {
  BASE_URL: resolveBaseUrl(),
  TIMEOUT_MS: 15000,
};
