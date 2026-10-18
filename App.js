import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TeamProvider, useTeam } from './src/TeamContext';
import PokedexScreen from './src/screens/PokedexScreen';
import TeamScreen from './src/screens/TeamScreen';
import GameScreen from './src/screens/GameScreen';
import DetailScreen from './src/screens/DetailScreen';
import { theme } from './src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icon = (emoji) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

function Tabs() {
  const { team } = useTeam();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800' },
        tabBarActiveTintColor: theme.primary,
      }}
    >
      <Tab.Screen
        name="Pokédex"
        component={PokedexScreen}
        options={{ title: "Tashi's Pokédex", tabBarLabel: 'Pokédex', tabBarIcon: icon('📖') }}
      />
      <Tab.Screen
        name="My Team"
        component={TeamScreen}
        options={{
          tabBarIcon: icon('⭐'),
          tabBarBadge: team.length > 0 ? team.length : undefined,
        }}
      />
      <Tab.Screen
        name="Game"
        component={GameScreen}
        options={{ title: "Who's That Pokémon?", tabBarLabel: 'Game', tabBarIcon: icon('🎮') }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <TeamProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: theme.primary },
            headerTintColor: '#fff',
          }}
        >
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Details' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </TeamProvider>
  );
}
