import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import config from '../config';

const VoiceRegistration = ({ route, navigation }) => {
  const { userId } = route.params;
  const [recording, setRecording] = useState(null);
  const [phrase, setPhrase] = useState('');

  const phrases = [
    "The quick brown fox jumps over the lazy dog",
    "A stitch in time saves nine",
    "To be or not to be, that is the question",
    "All that glitters is not gold",
    "Actions speak louder than words"
  ];

  useEffect(() => {
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setPhrase(randomPhrase);
  }, []);

  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      console.log('Stopping recording..');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);

      const fileInfo = await FileSystem.getInfoAsync(uri);
      const fileBlob = {
        uri: fileInfo.uri,
        name: 'voicePrint.3gp',
        type: 'audio/3gp',
      };

      const formData = new FormData();
      formData.append('voicePrint', fileBlob);

      const response = await axios.post(`${config.apiBaseUrl}/users/${userId}/voice`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Voice data registered successfully', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MainPage'),
          },
        ]);
      } else {
        throw new Error('Failed to register voice data');
      }
    } catch (err) {
      console.error('Voice registration error:', err);
      Alert.alert('Error', 'An error occurred during voice registration');
    } finally {
      setRecording(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Voice Data</Text>
      <Text style={styles.phrase}>Please say the following phrase:</Text>
      <Text style={styles.phraseText}>{phrase}</Text>
      <TouchableOpacity style={styles.button} onPress={startRecording}>
        <Text style={styles.buttonText}>Start Recording</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={stopRecording} disabled={!recording}>
        <Text style={styles.buttonText}>Stop Recording</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  phrase: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  phraseText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%', // Adjust width to fit better
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#000', // Match the button text color from Login
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default VoiceRegistration;
