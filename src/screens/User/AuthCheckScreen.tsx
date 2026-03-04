import React, {useEffect} from 'react';
import {View, ActivityIndicator} from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const AuthCheckScreen = ({navigation}: any) => {

  useEffect(() => {

    const unsubscribe = auth().onAuthStateChanged(async user => {

      if (!user) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
        return;
      }

      const snapshot = await database()
        .ref('users/' + user.uid + '/status')
        .once('value');

      const status = snapshot.val();

      if (status === 'approved') {
        navigation.reset({
          index: 0,
          routes: [{name: 'UserTabs'}],
        });
      } 
      else if (status === 'pending') {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'PendingApprovalScreen',
              params: {userId: user.uid},
            },
          ],
        });
      } 
      else {
        await auth().signOut();

        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      }
    });

    return unsubscribe;

  }, []);

  return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <ActivityIndicator size="large"/>
    </View>
  );
};

export default AuthCheckScreen;