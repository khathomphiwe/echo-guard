import React, { useState } from 'react';
import { View, TextInput, Alert, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import config from '../config';

const Signup = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const { firstName, lastName, email, contact, password, confirmPassword } = formData;

  const onChange = (key, value) => setFormData({ ...formData, [key]: value });

  const onSubmit = async () => {
    if (!firstName || !lastName) {
      Alert.alert('Error', 'First name and last name are required');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    setLoading(true);
    try {
      const res = await axios.post(`${config.apiBaseUrl}/users/signup`, {
        firstName,
        lastName,
        email,
        contact,
        password,
      });
  
      const { encryptionKey } = res.data;
      Alert.alert('Success', 'OTP sent to your email');
      navigation.navigate('OTPVerification', { encryptionKey });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={(text) => onChange('firstName', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={(text) => onChange('lastName', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => onChange('email', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact"
        value={contact}
        onChangeText={(text) => onChange('contact', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => onChange('password', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => onChange('confirmPassword', text)}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
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
    color: '#FFFF',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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

export default Signup;
