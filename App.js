import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Roboto_500Medium
} from '@expo-google-fonts/roboto';

// custom hooks
import useCachedResources from './hooks/useCachedResources';

// components
import SpkioApp from './SpkioApp';

// helpers
import ContextProvider from './context/provider';
import useColorScheme from './hooks/useColorScheme';

// constants
import Colors from './constants/Colors';

const App = _ => {
  const colorScheme = useColorScheme();
  LogBox.ignoreAllLogs()
  const isLoadingComplete = useCachedResources();
  let [ fontsLoaded ] = useFonts({ Roboto_500Medium });

  if (!fontsLoaded) {
    return null
  } else {
    return (
      !isLoadingComplete ?
        null
      :
        <SafeAreaProvider>
          <ContextProvider>
            <SpkioApp />
          </ContextProvider>
          <StatusBar backgroundColor={Colors[colorScheme].tint} />
        </SafeAreaProvider>
    )
  }
}

export default App;