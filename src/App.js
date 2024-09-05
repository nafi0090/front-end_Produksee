import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AccountScreen from './components/AccountScreen';
import CustomerScreen from './components/CustomerScreen';
import DepositTypeScreen from './components/DepositTypeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Customer"
          component={CustomerScreen}
          options={{ title: 'Customer Page' }}
        />
        <Stack.Screen
          name="Account"
          component={AccountScreen}
          options={{ title: 'Account Page' }}
        />
        <Stack.Screen
          name="Deposit Type"
          component={DepositTypeScreen}
          options={{ title: 'Deposit Type Page' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
