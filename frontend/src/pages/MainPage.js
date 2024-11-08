import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../config';

const MainPage = ({ navigation, route }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBulbOn, setIsBulbOn] = useState(false);
  const { loginMethod } = route.params || { loginMethod: 'password' };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          navigation.navigate('Login');
          return;
        }

        if (loginMethod === 'biometric' || loginMethod === 'voice') {
          setUserDetails(dummyUserDetails);
        } else {
          try {
            const res = await axios.get(`${config.apiBaseUrl}/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUserDetails(res.data);
          } catch (error) {
            console.error('Error fetching user details:', error);
            Alert.alert('Error', 'Failed to fetch user details');
            navigation.navigate('Login');
            return;
          }
        }
      } catch (error) {
        console.error('Error in fetchUserDetails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [loginMethod]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const turnBulbOn = () => {
    setIsBulbOn(true);
    Alert.alert('Success', 'Bulb turned on');
  };

  const turnBulbOff = () => {
    setIsBulbOn(false);
    Alert.alert('Success', 'Bulb turned off');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!userDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No user details available.</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        Welcome, {userDetails.firstName} {userDetails.lastName}!
      </Text>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.infoText}>{userDetails.email}</Text>
        <Text style={styles.label}>Contact:</Text>
        <Text style={styles.infoText}>{userDetails.contact}</Text>
      </View>
      <View style={styles.bulbStatus}>
        <Text style={styles.statusText}>
          Bulb Status: <Text style={styles.statusValue}>{isBulbOn ? 'ON' : 'OFF'}</Text>
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.lightButton, isBulbOn && styles.activeButton]}
          onPress={turnBulbOn}
          disabled={isBulbOn}
        >
          <Text style={styles.buttonText}>Turn Bulb On</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.lightButton, !isBulbOn && styles.activeButton]}
          onPress={turnBulbOff}
          disabled={!isBulbOn}
        >
          <Text style={styles.buttonText}>Turn Bulb Off</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f7fa',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  bulbStatus: {
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    padding: 15,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusValue: {
    color: '#e67e22',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  lightButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    opacity: 0.7,
  },
  activeButton: {
    opacity: 1,
    backgroundColor: '#2ecc71',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default MainPage;