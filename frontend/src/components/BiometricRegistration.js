import React, { useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import axios from 'axios';
import config from '../config';

const BiometricRegistration = ({ route, navigation }) => {
  const { userId } = route.params;

  useEffect(() => {
    console.log('BiometricRegistration: Received userId:', userId);
  }, [userId]);

  const registerBiometricData = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('Error', 'Biometric hardware not available');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('Error', 'No biometric records enrolled');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Register your biometric data',
      });

      if (result.success) {
        console.log('Biometric authentication successful for userId:', userId);

        const response = await axios.post(
          `${config.apiBaseUrl}/users/${userId}/biometric`,
          { biometricData: 'sampleData' }
        );

        if (response.status === 200) {
          Alert.alert('Success', 'Biometric data registered');
          navigation.navigate('VoiceRegistration', { userId });
        } else {
          throw new Error('Failed to register biometric data');
        }
      } else {
        Alert.alert('Error', 'Biometric authentication failed');
      }
    } catch (err) {
      console.error('Biometric registration error:', err);
      Alert.alert('Error', 'An error occurred during biometric registration');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Biometric Data</Text>
      <TouchableOpacity style={styles.button} onPress={registerBiometricData}>
        <Text style={styles.buttonText}>Register</Text>
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
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default BiometricRegistration;
