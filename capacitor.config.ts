import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.daehyun.webview',
  appName: 'Daehyun.com',
  webDir: 'dist',
  includePlugins: ['capacitor-token-vault'],
  server: {
    androidScheme: 'https',
  },
};

export default config;
