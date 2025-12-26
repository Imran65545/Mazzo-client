import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mazzo.app',
  appName: 'Mazzo',
  webDir: 'out',

  server: {
    cleartext: true
  }
};

export default config;
