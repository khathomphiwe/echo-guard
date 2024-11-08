import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';
import config from '../config';

const OTPVerification = ({ route, navigation }) => {
  const { encryptionKey } = route.params;
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${config.apiBaseUrl}/users/verify`, {
        encryptionKey,
        otp: otp.trim(),
      });

      if (response.data.success) {
        const { userId } = response.data;

        Alert.alert('Success', 'Email verified successfully', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('BiometricRegistration', { userId }),
          },
        ]);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verification failed. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit OTP"
        placeholderTextColor="#888"
        value={otp}
        keyboardType="numeric"
        maxLength={6}
        onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
      />
      {isSubmitting ? (
        <ActivityIndicator size="large" color="#FFD700" />
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={verifyOtp}
          disabled={otp.length !== 6}
        >
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>
      )}
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
  input: {
    height: 50,
    backgroundColor: '#333',
    borderRadius: 8,
    color: '#FFF',
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
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
});

export default OTPVerification;
