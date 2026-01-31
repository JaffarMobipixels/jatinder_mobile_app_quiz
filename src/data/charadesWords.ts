import database from '@react-native-firebase/database';

export const uploadCharadesWords = async () => {
  const words = [
    "CAT", "DOG", "LION", "APPLE", "PIZZA",
    "BURGER", "CAR", "PHONE", "CHAIR", "DOCTOR",
    "TEACHER", "POLICE", "BATMAN", "SPIDERMAN", "HARRY POTTER",
    "FOOTBALL", "CRICKET", "TENNIS", "DANCE", "SLEEP"
  ];

  try {
    // 'charades/words' path par poori list store hogi
    await database().ref('/charades/words').set(words);
    console.log("Words uploaded successfully!");
  } catch (error) {
    console.error("Error uploading words:", error);
  }
};