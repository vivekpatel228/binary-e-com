import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApolloProvider } from '@apollo/client/react';
import Toast from 'react-native-toast-message';
import { AppProvider } from './src/context';
import { RootNavigator } from './src/navigation';
import { apolloClient } from './src/graphql';
import { colors } from './src/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.natural,
    card: colors.natural,
    border: colors.border,
    text: colors.primary,
    primary: colors.primary,
  },
};

const App: React.FC = () => (
  <GestureHandlerRootView>
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.natural} />
      <ApolloProvider client={apolloClient}>
        <AppProvider>
          <NavigationContainer theme={navTheme}>
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </ApolloProvider>
      <Toast />
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
