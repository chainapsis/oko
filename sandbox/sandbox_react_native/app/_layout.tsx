import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  // const colorScheme = useColorScheme();

  const sandboxURL = 'http://10.0.2.2:4200'
  console.log(123, sandboxURL);

  // fetch(url).then((res) => console.log(res));

  return (
    <StatusBar style="auto" />
  );
}
