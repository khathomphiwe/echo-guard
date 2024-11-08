import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import * as LocalAuthentication from 'expo-local-authentication';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import config from '../config';

const Login = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(null);

  const { email, password } = formData;

  const onChange = (key, value) => setFormData({ ...formData, [key]: value });

  const loginWithPassword = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${config.apiBaseUrl}/users/login`, { email, password });
      Alert.alert('Success', 'Login successful');
      await AsyncStorage.setItem('userToken', res.data.token);
      navigation.navigate('MainPage');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const loginWithBiometric = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert('Error', 'Biometric authentication is not available or not set up on this device');
        return;
      }

      await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with Biometrics',
        fallbackLabel: 'Enter Password',
      });

      Alert.alert('Success', 'Biometric login successful');
      setTimeout(() => {
        navigation.navigate('MainPage');
      }, 500);
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert('Error', 'An error occurred during biometric authentication');
    }
  };

  const startVoiceRecording = async () => {
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

  const stopVoiceRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);

        if (uri) {
          Alert.alert('Success', 'Voice login successful');
          navigation.navigate('MainPage');
        } else {
          throw new Error('Recording was not successful');
        }
      }
    } catch (err) {
      console.error('Voice login error:', err);
      Alert.alert('Error', 'An error occurred during voice authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={(text) => onChange('email', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={(text) => onChange('password', text)}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={loginWithPassword}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={loginWithBiometric}>
            <Text style={styles.buttonText}>Login with Biometrics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={startVoiceRecording}>
            <Text style={styles.buttonText}>Start Voice Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ ...styles.button, backgroundColor: '#555' }}
            onPress={stopVoiceRecording}
            disabled={!recording}
          >
            <Text style={styles.buttonText}>Stop Voice Login</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: '#333',
    borderRadius: 8,
    color: '#FFF',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  placeholder: {
    color: '#FFF',
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    color: '#FFD700',
    textAlign: 'center',
  },
});

export default Login;
