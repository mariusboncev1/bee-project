import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apinote.beekeeping',
  appName: 'ApiNote',
  webDir: 'public',

  server: {
    // For Android emulator, use 10.0.2.2 to reach the host machine's localhost.
    // For iOS simulator or physical devices on the same network, use your machine's local IP.
    // Switch to your production URL before building a release.
    url: 'http://10.0.2.2:3000',
    cleartext: true,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F2A900',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F2A900',
    },
    Keyboard: {
      resize: 'body',
      scrollAssist: true,
      scrollPadding: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
