import React, { useEffect, useState, useContext } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import { useFonts, Roboto_500Medium } from '@expo-google-fonts/roboto';
import * as SplashScreen from 'expo-splash-screen';
import ContextProvider, { AppContext } from '../context/provider';
import { supabase, Talk } from '../lib/supabase';
import Colors from '../constants/Colors';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const [state, setState] = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { logged, talks } = state;
  const colorScheme = useColorScheme() ?? 'light';

  const [fontsLoaded] = useFonts({
    Roboto_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Create or get anonymous user
  const createAnonymousUser = async () => {
    try {
      // Check if we have a stored user ID in state
      if (state.loggedUser?.uid) {
        setUserId(state.loggedUser.uid);
        return state.loggedUser.uid;
      }

      // Create a new anonymous user
      const { data, error } = await supabase
        .from('users')
        .insert({ name: 'Anonymous' })
        .select()
        .single();

      if (error) throw error;

      const newUserId = data.id;
      setUserId(newUserId);
      
      setState((prev: any) => ({
        ...prev,
        logged: true,
        loggedUser: {
          displayName: 'Anonymous',
          uid: newUserId,
        },
      }));

      return newUserId;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  };

  // Load talks from Supabase
  const loadTalks = async () => {
    try {
      const { data: talksData, error } = await supabase
        .from('talks')
        .select(`
          *,
          speaker:speakers(*)
        `)
        .order('time');

      if (error) throw error;

      const talksMon: Talk[] = [];
      const talksTue: Talk[] = [];
      const talksWed: Talk[] = [];
      const talksThu: Talk[] = [];
      const talksFri: Talk[] = [];
      const talksSat: Talk[] = [];

      talksData?.forEach((talk) => {
        const talkWithKey = { ...talk, _key: talk.id };
        
        switch (talk.day) {
          case 'monday':
            talksMon.push(talkWithKey);
            break;
          case 'tuesday':
            talksTue.push(talkWithKey);
            break;
          case 'wednesday':
            talksWed.push(talkWithKey);
            break;
          case 'thursday':
            talksThu.push(talkWithKey);
            break;
          case 'friday':
            talksFri.push(talkWithKey);
            break;
          case 'saturday':
            talksSat.push(talkWithKey);
            break;
        }
      });

      setState((prev: any) => ({
        ...prev,
        talks: talksData?.map(t => ({ ...t, _key: t.id })) || [],
        talksMon,
        talksTue,
        talksWed,
        talksThu,
        talksFri,
        talksSat,
      }));

      return talksData;
    } catch (error) {
      console.error('Error loading talks:', error);
      return [];
    }
  };

  // Load speakers
  const loadSpeakers = async () => {
    try {
      const { data, error } = await supabase
        .from('speakers')
        .select('*');

      if (error) throw error;

      setState((prev: any) => ({
        ...prev,
        speakers: data || [],
      }));
    } catch (error) {
      console.error('Error loading speakers:', error);
    }
  };

  // Initialize app
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      
      await createAnonymousUser();
      await loadTalks();
      await loadSpeakers();
      
      setIsLoading(false);
    };

    initApp();
  }, []);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
        <Text style={[styles.loadingText, { color: Colors[colorScheme].talkCardText }]}>
          Cargando...
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  return (
    <ContextProvider>
      <RootLayoutContent />
    </ContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
