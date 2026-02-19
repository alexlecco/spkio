import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, useColorScheme, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../../context/provider';
import { supabase } from '../../lib/supabase';
import Colors from '../../constants/Colors';

export default function TalkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [state] = useContext(AppContext);
  const { talks, loggedUser } = state;
  const colorScheme = useColorScheme() ?? 'light';
  
  const [isInterested, setIsInterested] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userTalkId, setUserTalkId] = useState<string | null>(null);

  // Find the talk from state
  const talk = talks.find((t: any) => t.id === id || t._key === id);

  // Check if user already saved this talk
  useEffect(() => {
    if (!loggedUser?.uid || !id) return;

    const checkIfInterested = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_talks')
        .select('id')
        .eq('user_id', loggedUser.uid)
        .eq('talk_id', id)
        .single();

      if (data) {
        setIsInterested(true);
        setUserTalkId(data.id);
      } else {
        setIsInterested(false);
        setUserTalkId(null);
      }
      setIsLoading(false);
    };

    checkIfInterested();
  }, [loggedUser?.uid, id]);

  const handleInterestToggle = async () => {
    if (!loggedUser?.uid || !id) return;

    setIsLoading(true);

    if (isInterested && userTalkId) {
      // Remove interest
      const { error } = await supabase
        .from('user_talks')
        .delete()
        .eq('id', userTalkId);

      if (!error) {
        setIsInterested(false);
        setUserTalkId(null);
      }
    } else {
      // Add interest
      const { data, error } = await supabase
        .from('user_talks')
        .insert({
          user_id: loggedUser.uid,
          talk_id: id,
        })
        .select()
        .single();

      if (!error && data) {
        setIsInterested(true);
        setUserTalkId(data.id);
      }
    }

    setIsLoading(false);
  };

  const getDayName = (day: string) => {
    const days: Record<string, string> = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
    };
    return days[day] || day;
  };

  if (!talk) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: Colors[colorScheme].background }]}>
        <Text style={{ color: Colors[colorScheme].talkCardText }}>Charla no encontrada</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={{ color: Colors[colorScheme].tint }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const speakerName = talk.speaker?.name || 'Por confirmar';
  const speakerPhoto = talk.speaker?.photo;

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      {/* Header with back button */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme].tint }]}>
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Charla</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Speaker photo */}
      <View style={styles.speakerSection}>
        <View style={[styles.photoContainer, { backgroundColor: colorScheme === 'dark' ? '#444' : '#e0e0e0' }]}>
          {speakerPhoto ? (
            <Image
              source={{ uri: `https://oigrjktauwgxbcowwadc.supabase.co/storage/v1/object/public/speakers/${speakerPhoto}.png` }}
              style={styles.speakerPhoto}
              defaultSource={require('../../assets/images/icon.png')}
            />
          ) : (
            <Ionicons name="person" size={60} color={Colors[colorScheme].tint} />
          )}
        </View>
        <Text style={[styles.speakerName, { color: Colors[colorScheme].talkCardText }]}>
          {speakerName}
        </Text>
      </View>

      {/* Talk info */}
      <View style={styles.infoSection}>
        <Text style={[styles.talkTitle, { color: Colors[colorScheme].talkCardText }]}>
          {talk.title}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color={Colors[colorScheme].tint} />
          <Text style={[styles.infoText, { color: Colors[colorScheme].talkCardText }]}>
            {getDayName(talk.day)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color={Colors[colorScheme].tint} />
          <Text style={[styles.infoText, { color: Colors[colorScheme].talkCardText }]}>
            {talk.time} hs
          </Text>
        </View>

        {talk.site && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={Colors[colorScheme].tint} />
            <Text style={[styles.infoText, { color: Colors[colorScheme].talkCardText }]}>
              Sala {talk.site}
            </Text>
          </View>
        )}

        {talk.description && (
          <View style={styles.descriptionContainer}>
            <Text style={[styles.descriptionTitle, { color: Colors[colorScheme].talkCardText }]}>
              Descripción
            </Text>
            <Text style={[styles.description, { color: Colors[colorScheme].talkCardText }]}>
              {talk.description}
            </Text>
          </View>
        )}
      </View>

      {/* Interest button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.interestButton,
            { backgroundColor: isInterested ? '#e74c3c' : Colors[colorScheme].tint },
          ]}
          onPress={handleInterestToggle}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name={isInterested ? 'heart-dislike' : 'heart'}
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                {isInterested ? 'Ya no me interesa' : 'Me interesa'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButtonHeader: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
    padding: 12,
  },
  speakerSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 12,
  },
  speakerPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  speakerName: {
    fontSize: 20,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 20,
  },
  talkTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
  },
  descriptionContainer: {
    marginTop: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  interestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
