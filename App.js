import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  NativeEventEmitter,
} from 'react-native';

import RNZoomUsBridge, {
  RNZoomUsBridgeEventEmitter,
} from '@mokriya/react-native-zoom-us-bridge';

import Button from './src/components/Button';
import Loader from './src/components/LoaderComponent';

import {
  ZOOM_APP_KEY,
  ZOOM_APP_SECRET,
  ZOOM_JWT_APP_KEY,
  ZOOM_JWT_APP_SECRET,
} from './src/Utils/ZoomConfig';

export default class App extends Component {
  state = {
    meetingId: '',
    meetingPassword: '',
    meetingTitle: '',
    userName: '',
    userEmail: 'singh.davinder0810@gmail.com',
    userId: '',
    accessToken: '',
    userZoomAccessToken: '',
    meetingCreated: false,
    view: 'select',
    isLoading: false,
  };

  componentDidMount() {
    const meetingEventEmitter = new NativeEventEmitter(
      RNZoomUsBridgeEventEmitter,
    );

    if (!this.sdkInitialized) {
      this.sdkInitialized = meetingEventEmitter.addListener(
        'SDKInitialized',
        () => {
          console.log('SDKInitialized');

          // lets also get access token
          this.createAccessToken();
        },
      );
    }

    if (!this.meetingWaitingRoomIsActiveSubscription) {
      this.meetingWaitingRoomIsActiveSubscription = meetingEventEmitter.addListener(
        'waitingRoomActive',
        () => {
          Alert.alert(
            'Error Joining',
            'Meeting waiting room is active. Please disable before joining.',
            [{text: 'OK', onPress: () => null}],
            {cancelable: false},
          );
          console.log('waitingRoomActive');
        },
      );
    }

    if (!this.meetingStatusChangedSubscription) {
      this.meetingStatusChangedSubscription = meetingEventEmitter.addListener(
        'meetingStatusChanged',
        (event) => console.log('meetingStatusChanged', event.eventProperty),
      );
    }

    if (!this.hiddenSubscription) {
      this.hiddenSubscription = meetingEventEmitter.addListener(
        'meetingSetToHidden',
        () => console.log('Meeting Hidden'),
      );
    }

    if (!this.endedSubscription) {
      this.endedSubscription = meetingEventEmitter.addListener(
        'meetingEnded',
        (result) => {
          console.log('Meeting Ended: ', result);
          if ('error' in result) {
            Alert.alert(
              'Error Joining',
              'One of your inputs is invalid.',
              [{text: 'OK', onPress: () => null}],
              {cancelable: false},
            );
          }
        },
      );
    }

    if (!this.meetingErroredSubscription) {
      this.meetingErroredSubscription = meetingEventEmitter.addListener(
        'meetingError',
        (result) => {
          console.log('Meeting Errored: ', result);
          if ('error' in result) {
            Alert.alert(
              'Error Joining',
              'One of your inputs is invalid.',
              [{text: 'OK', onPress: () => null}],
              {cancelable: false},
            );
          }
        },
      );
    }

    if (!this.startedSubscription) {
      this.startedSubscription = meetingEventEmitter.addListener(
        'meetingStarted',
        (result) => {
          console.log('Meeting Started: ', result);
          if ('error' in result) {
            Alert.alert(
              'Error Joining',
              'One of your inputs is invalid.',
              [{text: 'OK', onPress: () => null}],
              {cancelable: false},
            );
          }
        },
      );
    }

    if (!this.joinedSubscription) {
      this.joinedSubscription = meetingEventEmitter.addListener(
        'meetingJoined',
        (result) => {
          console.log('Meeting Joined: ', result);
          if ('error' in result) {
            Alert.alert(
              'Error Joining',
              'One of your inputs is invalid.',
              [{text: 'OK', onPress: () => null}],
              {cancelable: false},
            );
          }
        },
      );
    }

    this.initializeZoomSDK();
  }

  initializeZoomSDK = () => {
    if (!ZOOM_APP_KEY || !ZOOM_APP_SECRET) return false;

    // init sdk
    RNZoomUsBridge.initialize(ZOOM_APP_KEY, ZOOM_APP_SECRET)
      .then()
      .catch((err) => {
        console.warn(err);
        Alert.alert('error!', err.message);
      });
  };

  joinMeeting = async () => {
    const {meetingId, userName, meetingPassword} = this.state;

    if (!meetingId || !userName || !meetingPassword) return false;

    RNZoomUsBridge.joinMeeting(String(meetingId), userName, meetingPassword)
      .then()
      .catch((err) => {
        console.warn(err);
        Alert.alert('error!', err.message);
      });
  };

  createAccessToken = async () => {
    // to talk to ZOOM API you will need access token
    if (!ZOOM_JWT_APP_KEY || !ZOOM_JWT_APP_SECRET) return false;
    const accessToken = await RNZoomUsBridge.createJWT(
      ZOOM_JWT_APP_KEY,
      ZOOM_JWT_APP_SECRET,
    )
      .then()
      .catch((err) => console.log(err));

    console.log(`createAccessToken ${accessToken}`);

    if (accessToken) this.setState({accessToken});
  };

  getUserID = async (userEmail, accessToken) => {
    const fetchURL = `https://api.zoom.us/v2/users/${userEmail}`;
    const userResult = await fetch(fetchURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        return json;
      })
      .catch((error) => {
        console.error(error);
      });

    console.log('userResult', userResult);

    if (userResult && userResult.code === 429) {
      // rate error try again later
      Alert.alert('API Rate error try again in a few seconds');
    }

    if (userResult && userResult.id && userResult.status === 'active') {
      // set user id
      const {id: userId} = userResult;

      this.setState({userId});

      return userId;
    }

    return false;
  };

  createUserZAK = async (userId, accessToken) => {
    const userZAKResult = await fetch(
      'https://api.zoom.us/v2/users/${userId}/token?type=zak',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    )
      .then((response) => response.json())
      .then((json) => {
        return json;
      })
      .catch((error) => {
        console.error(error);
      });

    console.log('userZAKResult', userZAKResult);

    if (userZAKResult && userZAKResult.code === 429) {
      // rate error try again later
      Alert.alert('API Rate error try again in a few seconds');
    }

    if (userZAKResult && userZAKResult.token) {
      // set user id
      const {token} = userZAKResult;

      this.setState({
        userZoomAccessToken: token,
      });

      return token;
    }

    return false;
  };

  createMeeting = async () => {
    const {accessToken, userEmail, meetingTitle} = this.state;
    if (!accessToken || !meetingTitle || !userEmail) return false;

    // user ID is pulled from jwt end point using the email address
    const userId = await this.getUserID(userEmail, accessToken);
    await this.createUserZAK(userId, accessToken);

    if (userId) {
      // use api to create meeting

      const fetchURL = `https://api.zoom.us/v2/users/${userId}/meetings`;
      const createMeetingResult = await fetch(fetchURL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: meetingTitle,
          type: 1,
          duration: 30,
          password: '123456', // set your own password is possible
          settings: {
            waiting_room: true,
            registrants_confirmation_email: false,
            audio: 'voip',
          },
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          return json;
        })
        .catch((error) => {
          console.error(error);
        });

      console.log('createMeetingResult', createMeetingResult);

      if (createMeetingResult && createMeetingResult.code === 429) {
        // rate error try again later
        Alert.alert('API Rate error try again in a few seconds');
      }

      if (createMeetingResult && createMeetingResult.id) {
        const {id, password} = createMeetingResult;
        this.setState({
          meetingId: id,
          meetingPassword: password,
          meetingCreated: true,
        });
      }
    }
  };

  startMeeting = async () => {
    const {meetingId, userId, userName, userZoomAccessToken} = this.state;

    if (!meetingId || !userId || !userZoomAccessToken) return false;

    await RNZoomUsBridge.startMeeting(
      String(meetingId),
      userName == null || userName == undefined || userName == ''
        ? 'Davinder'
        : userName,
      userId,
      userZoomAccessToken,
    );
  };

  viewJoin = () => this.setState({view: 'join'});

  viewHost = () => this.setState({view: 'host'});

  _renderSelectView = () => {
    const {accessToken} = this.state;
    console.log(accessToken);
    return (
      <>
        <Button buttonText={'Join a Meeting'} onPressButton={this.viewJoin} />
        {accessToken != '' && (
          <Button buttonText={'Host a Meeting'} onPressButton={this.viewHost} />
        )}
      </>
    );
  };

  _renderJoinView = () => {
    const {meetingId, userName, meetingPassword} = this.state;
    return (
      <>
        <TextInput
          value={meetingId}
          placeholder="Meeting ID"
          onChangeText={(text) => this.setState({meetingId: text})}
          style={styles.input}
        />
        <TextInput
          value={meetingPassword}
          placeholder="Meeting Password"
          onChangeText={(text) => this.setState({meetingPassword: text})}
          style={styles.input}
        />
        <TextInput
          value={userName}
          placeholder="Your name"
          onChangeText={(text) => this.setState({userName: text})}
          style={styles.input}
        />
        <Button buttonText={'Join Meeting'} onPressButton={this.joinMeeting} />
      </>
    );
  };

  _renderHostingView = () => {
    const {
      meetingId,
      meetingCreated,
      userEmail,
      meetingTitle,
      meetingPassword,
    } = this.state;
    return (
      <>
        <TextInput
          value={userEmail}
          placeholder="Your zoom email address"
          editable={false}
          style={styles.input}
        />
        <TextInput
          value={meetingTitle}
          placeholder="Meeting title"
          onChangeText={(text) => this.setState({meetingTitle: text})}
          style={styles.input}
        />

        <Button
          buttonText={'Create Meeting'}
          onPressButton={this.createMeeting}
        />

        {meetingCreated ? (
          <>
            <TextInput
              value={meetingId.toString()}
              placeholder="Meeting ID"
              style={styles.input}
              editable={false}
            />
            <TextInput
              value={meetingPassword}
              placeholder="Meeting Password"
              style={styles.input}
              editable={false}
            />

            <Button
              buttonText={'Start Meeting'}
              onPressButton={this.startMeeting}
            />
          </>
        ) : null}
      </>
    );
  };

  _renderSdkError = () => {
    return (
      <Text
        style={styles.welcome}
        children={'ZOOM_APP_KEY and ZOOM_APP_SECRET must be set'}
      />
    );
  };

  _renderJWTError = () => {
    return (
      <Text
        style={styles.welcome}
        children={
          'optional ZOOM_JWT_APP_KEY and ZOOM_JWT_APP_SECRET must be set to host meetings'
        }
      />
    );
  };

  render() {
    const {view, isLoading} = this.state;
    return (
      <View style={styles.container}>
        <Text style={styles.welcome} children={'Zoom Demo'} />

        {!ZOOM_APP_KEY || !ZOOM_APP_SECRET ? this._renderSdkError() : null}

        {!ZOOM_JWT_APP_KEY || !ZOOM_JWT_APP_SECRET
          ? this._renderJWTError()
          : null}

        {view === 'select' && this._renderSelectView()}
        {view === 'join' && this._renderJoinView()}
        {view === 'host' && this._renderHostingView()}

        {isLoading && <Loader />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 50,
    textAlign: 'center',
    margin: 10,
  },
  input: {
    width: '80%',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'grey',
    margin: 3,
    fontSize: 18,
  },
});
