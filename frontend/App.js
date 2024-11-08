import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Signup from './src/pages/Signup';
import BiometricRegistration from './src/components/BiometricRegistration';
import OTPVerification from './src/components/OTPVerification';
import Login from './src/pages/Login';
import MainPage from './src/pages/MainPage';
import VoiceRegistration from './src/components/VoiceRegistration';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Signup"  screenOptions={{
    headerShown: false
  }}>
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="BiometricRegistration" component={BiometricRegistration} />
        <Stack.Screen name="VoiceRegistration" component={VoiceRegistration} />
        <Stack.Screen name="OTPVerification" component={OTPVerification} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="MainPage" component={MainPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
