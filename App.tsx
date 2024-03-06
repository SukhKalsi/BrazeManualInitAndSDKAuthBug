/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useRef, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  NativeModules,
  Button,
  EmitterSubscription,
} from 'react-native';
import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import Braze from '@braze/react-native-sdk';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

interface BrazeManagerModule {
  initialiseSDK(userId: string, token: string): Promise<boolean>;
}

const BrazeManager: BrazeManagerModule = NativeModules.BrazeManager;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

type HeadersInit = [string, string][] | Record<string, string> | Headers;

const getToken = async (): Promise<string | undefined> => {
  try {
    // TODO: replace this with your server that returns JWT tokens for Braze
    const endpoint = '';
    const headers: HeadersInit = {
      'Content-Type': 'application/json;charset=UTF-8',
      'Accept-Encoding': 'gzip',
    };
    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
    });
    const responseStatus = response.status;
    const body = (await response.json()) as Record<string, any>;
    const accessToken = body ? body.accessToken : undefined;

    if (responseStatus >= 200 && responseStatus <= 299 && accessToken) {
      return accessToken;
    }
  } catch (e) {
    console.warn(e);
  }
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [hasBrazeInit, setBrazeInit] = useState(false);
  const [hasTokenExpired, setTokenExpired] = useState(false);
  const [currentToken, setCurrentToken] = useState('');
  const sdkAuthErrorSubscription = useRef<EmitterSubscription | null>(null);
  const isUpdatingAuthToken = useRef<boolean>(false);

  const generateNewToken = async () => {
    setTokenExpired(true);
    if (isUpdatingAuthToken.current) {
      return;
    }
    isUpdatingAuthToken.current = true;
    const newToken = await getToken();
    if (newToken) {
      try {
        Braze.setSdkAuthenticationSignature(newToken);
        isUpdatingAuthToken.current = false;
        setTokenExpired(false);
        setCurrentToken(newToken);
      } catch (error) {
        console.warn(error);
      }
    }
  };

  const setupAuthErrorSubscribtion = () => {
    if (sdkAuthErrorSubscription.current) {
      return;
    }

    sdkAuthErrorSubscription.current = Braze.addListener(
      Braze.Events.SDK_AUTHENTICATION_ERROR,
      async () => {
        console.log(
          '----------------- SDK_AUTHENTICATION_ERROR -----------------',
        );
        await generateNewToken();
      },
    );
  };

  const onBrazeInitPress = async () => {
    try {
      const userId = ''; // TODO: replace this with your User ID

      // N.B. Left this intentionally with invalid token so the SDK ERROR emitter kicks off immediately
      const result = await BrazeManager.initialiseSDK(userId, 'invalid_token');
      if (result) {
        setCurrentToken('invalid_token');
        setBrazeInit(true);
        setupAuthErrorSubscribtion();
      }
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Braze">
            <Text selectable={false}>
              Has Braze initialised: {hasBrazeInit ? 'yes' : 'no'}
            </Text>
            <Text selectable={false}>
              Has token expired: {hasTokenExpired ? 'yes' : 'no'}
            </Text>
            <Text selectable={false}>Current braze token:</Text>
            <Text selectable>{currentToken}</Text>
            {!hasBrazeInit && (
              <Button title="Initialise Braze" onPress={onBrazeInitPress} />
            )}
            {hasBrazeInit && (
              <Button
                title="Launch content cards"
                onPress={() => Braze.launchContentCards()}
              />
            )}
            {hasBrazeInit && (
              <Button title="Update token" onPress={generateNewToken} />
            )}
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
});

export default App;
