import React, { useState, useEffect, useContext, } from 'react';
import { Container, Button, } from 'native-base';
import * as Facebook from 'expo-facebook';
import {
  StyleSheet,
  View,
  ImageBackground,
  Alert,
  Text,
} from 'react-native';

// components
import Navigation from './navigation/Navigation';
import TalkInfo from './components/TalkInfo';

// custom hooks
import useColorScheme from './hooks/useColorScheme';

// helpers
import { AppContext } from './context/provider'
import firebaseApp from './firebase/firebase';
import texts from './constants/texts';
import { loginImageURL } from './firebase/storage-urls';

const SpkioApp = _ => {
  const [state, setState] = useContext(AppContext);
  const [needToLogIn, setNeedToLogIn] = useState(false);
  const { talkInfoVisible, logged, talks } = state;
  const colorScheme = useColorScheme();
  const talksRef = firebaseApp.database().ref().child('talks').orderByChild('time');
  const speakersRef = firebaseApp.database().ref().child('speakers');

  const addUser = (loggedUser) => {
    let ref =  firebaseApp.database().ref();
    let mobileUsersRef = ref.child('mobileUsers');
    mobileUsersRef.child(loggedUser.uid).set({
      name: loggedUser.displayName,
      userId: loggedUser.uid,
      date: new Date().toISOString(),
    }).key;
  }

  useEffect(() => {
    let talksMon = [];
    let talksTue = [];
    let talksWed = [];
    let talksThu = [];
    let talksFri = [];
    let talksSat = [];
    let talks = [];
    let speakers = [];

    function listenForDatabase() {
      firebaseApp.auth().onAuthStateChanged(user => {
        if(!user) {
          setNeedToLogIn(true)
          return
        }
        setState({
          ...state,
          logged: true,
          loggedUser: {
            displayName: user.displayName,
            uid: user.uid,
          },
        })
        addUser(user);
        function updateState() {
          setState({
            ...state,
            logged: true,
            loggedUser: {
              displayName: user.displayName,
              uid: user.uid,
            },
            talksMon,
            talksTue,
            talksWed,
            talksThu,
            talksFri,
            talksSat,
            talks,
            speakers,
          })
        }

        talksRef.on('value', snap => {
          talks = [];
          talksMon = [];
          talksTue = [];
          talksWed = [];
          talksThu = [];
          talksFri = [];
          talksSat = [];
          snap.forEach(child => {
            if (!!child.val().speaker) {
              talks.push({
                day: child.val().day,
                id: child.key,
                time: child.val().time,
                title: child.val().title,
                link: child.val().link,
                description: child.val().description,
                speaker: child.val().speaker,
                _key: child.key,
              });
            } else {
              talks.push({
                day: child.val().day,
                id: child.key,
                time: child.val().time,
                title: child.val().title,
                link: child.val().link,
                description: child.val().description,
                _key: child.key,
              });
            }
  
            switch(child.val().day){
              case 'monday':
                talksMon.push({
                  day: child.val().day,
                  id: child.key,
                  time: child.val().time,
                  title: child.val().title,
                  description: child.val().description,
                  site: child.val().site,
                  link: child.val().link,
                  speaker: child.val().speaker,
                  _key: child.key,
                });
                break;
              case 'tuesday':
                talksTue.push({
                  day: child.val().day,
                  id: child.key,
                  time: child.val().time,
                  title: child.val().title,
                  description: child.val().description,
                  site: child.val().site,
                  link: child.val().link,
                  speaker: child.val().speaker,
                  _key: child.key,
                });
                break;
              case 'wednesday':
                talksWed.push({
                  day: child.val().day,
                  id: child.key,
                  time: child.val().time,
                  title: child.val().title,
                  description: child.val().description,
                  site: child.val().site,
                  link: child.val().link,
                  speaker: child.val().speaker,
                  _key: child.key,
                });
                break;
              case 'thursday':
                talksThu.push({
                  day: child.val().day,
                  id: child.key,
                  time: child.val().time,
                  title: child.val().title,
                  description: child.val().description,
                  site: child.val().site,
                  link: child.val().link,
                  speaker: child.val().speaker,
                  _key: child.key,
                });
                break;
              case 'friday':
                talksFri.push({
                  day: child.val().day,
                  id: child.key,
                  time: child.val().time,
                  title: child.val().title,
                  description: child.val().description,
                  site: child.val().site,
                  link: child.val().link,
                  speaker: child.val().speaker,
                  _key: child.key,
                });
                break;
              case 'saturday':
                talksSat.push({
                  day: child.val().day,
                  id: child.key,
                  time: child.val().time,
                  title: child.val().title,
                  description: child.val().description,
                  site: child.val().site,
                  link: child.val().link,
                  speaker: child.val().speaker,
                  _key: child.key,
                });
                break;
              }
          });
          updateState();
        });
  
        speakersRef.on('value', snap => {
          speakers = [];
          snap.forEach(child => {
            if (!!child.val().photo) {
              speakers.push({
                name: child.val().name,
                photo: child.val().photo,
                id: child.key,
                _key: child.key,
              })
            } else {
              speakers.push({
                name: child.val().name,
                id: child.key,
                _key: child.key,
              })
            }
          });
          updateState();
        });
      })
    }
    
    listenForDatabase();
  }, []);

  const logIn = async() => {
    try {
      await Facebook.initializeAsync({
        appId: '599546973887572',
      });
      const {
        type,
        token,
      } = await Facebook.logInWithReadPermissionsAsync({
        permissions: ['public_profile'],
      });
      if (type === 'success') {
        const credential = firebaseApp.auth.FacebookAuthProvider.credential(token);
        firebaseApp.auth().signInWithCredential(credential).catch(error => console.log(error));

        // Get the user's name using Facebook's Graph API
        const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
        Alert.alert(
          '¡Ingresaste correctamente!',
          `Bienvenido/a ${(await response.json()).name}!`
        );
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      alert(`Error de Login: ${message}`);
    }
  }

  // TODOx: invertir !logged
  if (logged && talks.length) {
    if (talkInfoVisible) {
      return <TalkInfo />
    } else {
      return <Navigation colorScheme={colorScheme} />
    }
  } else {
    return(
      <Container>
        <View style={styles.container}>      
          <ImageBackground
            source={{uri: loginImageURL}}
            style={styles.image}
            resizeMode="cover"
          >
            <View style={styles.loginContainer}>
              { needToLogIn &&
                <Button full block onPress={logIn}>
                  <Text style={{color: '#fff'}}>{texts.loginText}</Text>
                </Button>
              }
            </View>
          </ImageBackground>
        </View>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: '#fff',
  },
  loginContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 40,
    marginBottom: 75,
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center"
  }
});

export default SpkioApp;