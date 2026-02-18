import React, { useContext, useState } from 'react';
import { FlatList, StyleSheet, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { AppContext } from '../../context/provider';
import Colors from '../../constants/Colors';

const days = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

export default function CalendarScreen() {
  const [state] = useContext(AppContext);
  const { talksMon, talksTue, talksWed, talksThu, talksFri, talksSat } = state;
  const colorScheme = useColorScheme() ?? 'light';
  const [selectedDay, setSelectedDay] = useState('lun');

  function getTalksArray(day: string) {
    if (day === 'lun') return talksMon || [];
    if (day === 'mar') return talksTue || [];
    if (day === 'mie') return talksWed || [];
    if (day === 'jue') return talksThu || [];
    if (day === 'vie') return talksFri || [];
    if (day === 'sab') return talksSat || [];
    return [];
  }

  const renderTalkCard = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#333' : '#fff' }]}>
      <Text style={[styles.time, { color: Colors[colorScheme].tint }]}>{item.time}</Text>
      <Text style={[styles.title, { color: Colors[colorScheme].talkCardText }]}>{item.title}</Text>
      {item.speaker && (
        <Text style={[styles.speaker, { color: Colors[colorScheme].talkCardText }]}>
          {item.speaker.name || item.speaker}
        </Text>
      )}
      {item.description && (
        <Text style={[styles.description, { color: Colors[colorScheme].talkCardText }]} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </View>
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
        data={getTalksArray(selectedDay)}
        renderItem={renderTalkCard}
        keyExtractor={(item) => item._key || item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: Colors[colorScheme].talkCardText }}>
              No hay charlas para este día
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
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
});
