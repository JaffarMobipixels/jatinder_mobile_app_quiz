import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, BackHandler, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';
import { getAuth } from '@react-native-firebase/auth';

const UserProfileScreen: React.FC<any> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const dummyImage = require('../../assets/dummy_profile.png');
  const dummyImageUrl =
    'https://firebasestorage.googleapis.com/v0/b/quiz-app-cac0d.firebasestorage.app/o/profile_images%2Favatar-659652_1280-removebg-preview.png?alt=media&token=db3cdf8f-3577-4b90-9cfc-cc690363c247';

  useEffect(() => {
    let isMounted = true;
    const currentUser = getAuth().currentUser;

    if (!currentUser) {
      Alert.alert('Error', 'User not logged in');
      navigation.goBack();
      return;
    }

    setEmail(currentUser.email || '');
    const userRef = database().ref(`users/${currentUser.uid}`);

    userRef.once('value').then(async snapshot => {
      if (!isMounted) return;

      const data = snapshot.val();
      if (data) {
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setProfileImage(data.profileImage || dummyImageUrl);
        setTotalScore(data.score ?? 0);

        if (!data.profileImage) {
          await userRef.update({ profileImage: dummyImageUrl });
        }
      } else {
        await userRef.set({
          firstName: '',
          lastName: '',
          email: currentUser.email || '',
          profileImage: dummyImageUrl,
          score: 0,
        });
        setProfileImage(dummyImageUrl);
      }

      setLoading(false);
    });

    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      isMounted = false;
      backHandler.remove();
    };
  }, []);

  // IMAGE UPLOAD
  const handleImageUpload = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets && result.assets.length > 0) {
      const image = result.assets[0];
      const currentUser = getAuth().currentUser;
      if (!currentUser) return;

      try {
        setUploading(true);
        setImageLoading(true);
        const reference = storage().ref(`profile_images/${currentUser.uid}`);
        await reference.putFile(image.uri!);
        const url = await reference.getDownloadURL();
        setProfileImage(url);

        await database().ref(`users/${currentUser.uid}`).update({ profileImage: url });
        Alert.alert('Success', 'Profile Image Updated!');
      } catch (err) {
        console.log(err);
        Alert.alert('Error', 'Unable to upload image.');
      } finally {
        setUploading(false);
      }
    }
  };

  // DELETE PROFILE IMAGE
  const handleDeleteImage = async () => {
    const currentUser = getAuth().currentUser;
    if (!currentUser) return;

    Alert.alert(
      'Delete Profile Image',
      'Are you sure you want to remove your profile image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);
              if (profileImage && profileImage !== dummyImageUrl) {
                const reference = storage().ref(`profile_images/${currentUser.uid}`);
                await reference.delete();
              }

              await database().ref(`users/${currentUser.uid}`).update({ profileImage: dummyImageUrl });
              setProfileImage(dummyImageUrl);
              Alert.alert('Deleted', 'Profile image reset to default!');
            } catch (err) {
              console.log(err);
              Alert.alert('Error', 'Unable to delete image.');
            } finally {
              setUploading(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Screen Header */}
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Profile</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Profile Image Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handleImageUpload} disabled={uploading}>
            <View style={styles.profileImageWrapper}>
  <Image
    source={profileImage && profileImage !== dummyImageUrl ? { uri: profileImage } : dummyImage}
    style={[styles.profileImage, { opacity: imageLoading ? 0 : 1 }]}
    onLoadStart={() => setImageLoading(true)}
    onLoadEnd={() => setImageLoading(false)}
    resizeMode="cover"
  />

  {imageLoading && (
    <View style={styles.imageLoaderOverlay}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  )}
</View>

          </TouchableOpacity>

          {/* Delete Image Button */}
          {profileImage && !uploading && profileImage !== dummyImageUrl && (
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteImage}>
              <Text style={styles.deleteText}>Delete Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Total Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Total Quiz Score</Text>
          <Text style={styles.scoreValue}>{totalScore}</Text>
        </View>

        {/* Form Fields (Readonly) */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>First Name</Text>
          <Text style={styles.readonlyInput}>{firstName}</Text>

          <Text style={styles.label}>Last Name</Text>
          <Text style={styles.readonlyInput}>{lastName}</Text>

          <Text style={styles.label}>E-Mail</Text>
          <Text style={styles.readonlyInput}>{email}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A1F44' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },

  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderTopRightRadius: 25,
    borderTopLeftRadius:25,
    borderBottomRightRadius: 25,
    backgroundColor: '#1E3A8A',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 30,
  },
  backButton: { width: 30, alignItems: 'center' },
  backArrow: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },

  profileCard: { alignItems: 'center', marginBottom: 30 },
 profileImageWrapper: {
  width: 130,
  height: 130,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#E5E7EB',
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 10,
  elevation: 8,
  position: 'relative', // add this
},

imageLoaderOverlay: {
  ...StyleSheet.absoluteFillObject,
  justifyContent: 'center',
  alignItems: 'center',
},

  profileImage: { width: 120, height: 120, borderRadius: 20 },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: '38%',
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraText: { color: '#fff', fontWeight: 'bold' },

  deleteButton: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EF4444',
  },
  deleteText: { color: '#fff', fontWeight: '700' },

  scoreCard: {
    backgroundColor: '#4D96FF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  scoreLabel: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 10 },
  scoreValue: { color: '#FFD93D', fontSize: 28, fontWeight: 'bold' },

  formContainer: { marginBottom: 30 },
  label: { fontSize: 14, color: '#fff', marginBottom: 5, fontWeight: '700' },
  readonlyInput: {
    backgroundColor: '#1E3A8A',
    color: '#fff',
    fontSize: 16,
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
  },
});

export default UserProfileScreen;
