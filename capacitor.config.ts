import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.daehyun.app',
  appName: 'Daehyun.com',
  webDir: 'dist',
  includePlugins: [
    '@capacitor/app',
    '@capacitor/browser',
    'capacitor-token-vault',
  ],
  server: {
    androidScheme: 'https',
  },
};

export default config;
