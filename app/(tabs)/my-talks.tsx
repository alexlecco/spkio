import React, { useContext, useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../../context/provider';
import { supabase } from '../../lib/supabase';
import Colors from '../../constants/Colors';

const days = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

export default function MyTalksScreen() {
  const [state] = useContext(AppContext);
  const { talks, loggedUser } = state;
  const colorScheme = useColorScheme() ?? 'light';
  const [selectedDay, setSelectedDay] = useState('lun');
  const [userTalks, setUserTalks] = useState<any[]>([]);
  const [userTalksByDay, setUserTalksByDay] = useState<Record<string, any[]>>({
    lun: [],
    mar: [],
    mie: [],
    jue: [],
    vie: [],
    sab: [],
  });

  // Load user's saved talks from Supabase
  useEffect(() => {
    if (!loggedUser?.uid) return;

    const loadUserTalks = async () => {
      const { data, error } = await supabase
        .from('user_talks')
        .select(`
          *,
          talk:talks(
            *,
            speaker:speakers(*)
          )
        `)
        .eq('user_id', loggedUser.uid);

      if (error) {
        console.error('Error loading user talks:', error);
        return;
      }

      setUserTalks(data || []);
    };

    loadUserTalks();

    // Subscribe to changes
    const subscription = supabase
      .channel('user_talks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_talks',
          filter: `user_id=eq.${loggedUser.uid}`,
        },
        () => {
          loadUserTalks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loggedUser?.uid]);

  // Organize talks by day
  useEffect(() => {
    const dayMap: Record<string, string> = {
      monday: 'lun',
      tuesday: 'mar',
      wednesday: 'mie',
      thursday: 'jue',
      friday: 'vie',
      saturday: 'sab',
    };

    const byDay: Record<string, any[]> = {
      lun: [],
      mar: [],
      mie: [],
      jue: [],
      vie: [],
      sab: [],
    };

    userTalks.forEach((userTalk) => {
      if (userTalk.talk && userTalk.talk.day) {
        const dayKey = dayMap[userTalk.talk.day];
        if (dayKey) {
          byDay[dayKey].push({
            ...userTalk.talk,
            _key: userTalk.talk.id,
            userTalkId: userTalk.id,
          });
        }
      }
    });

    setUserTalksByDay(byDay);
  }, [userTalks]);

  const navigateToTalk = (talkId: string) => {
    router.push(`/talk/${talkId}`);
  };

  const renderTalkCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}
      onPress={() => navigateToTalk(item.id || item._key)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={[styles.time, { color: Colors[colorScheme].tint }]}>{item.time}</Text>
          <Text style={[styles.title, { color: Colors[colorScheme].talkCardText }]}>{item.title}</Text>
          {item.speaker && (
            <Text style={[styles.speaker, { color: Colors[colorScheme].talkCardText }]}>
              {item.speaker.name || item.speaker}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme].tint} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <View style={styles.tabsContainer}>
        {days.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.tab,
              { backgroundColor: Colors[colorScheme].tint },
              selectedDay === day && styles.selectedTab,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.tabText, selectedDay === day && styles.selectedTabText]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={userTalksByDay[selectedDay]}
        renderItem={renderTalkCard}
        keyExtractor={(item) => item._key || item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: Colors[colorScheme].talkCardText }]}>
              Aún no tenés charlas o eventos{'\n'}agregados este día
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedTab: {
    opacity: 0.8,
  },
  tabText: {
    color: '#fff',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  selectedTabText: {
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  time: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  speaker: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    textAlign: 'center',
  },
});
