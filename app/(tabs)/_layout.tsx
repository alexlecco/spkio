import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme].tint,
        },
        headerTintColor: Colors[colorScheme].tabIconDefault,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-talks"
        options={{
          title: 'Mis charlas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sponsors"
        options={{
          title: 'Sponsors',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
