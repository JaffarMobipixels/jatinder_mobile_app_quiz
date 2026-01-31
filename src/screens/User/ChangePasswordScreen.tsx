import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { getAuth, updatePassword } from '@react-native-firebase/auth';
 
const ChangePasswordScreen: React.FC<any> = ({ navigation }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
   
    // Safe Area Insets hook
    const insets = useSafeAreaInsets();
 
    const handlePasswordChange = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New password and confirmation do not match.");
            return;
        }
 
        const auth = getAuth();
        const user = auth.currentUser;
 
        if (!user) {
            Alert.alert("Error", "No user logged in.");
            return;
        }
 
        try {
            setLoading(true);
            await updatePassword(user, newPassword);
            Alert.alert("Success", "Your password has been changed successfully.");
            setNewPassword('');
            setConfirmPassword('');
            navigation.goBack();
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                Alert.alert("Error", "Security sensitive: You need to re-login to change your password.");
            } else if (error.code === 'auth/weak-password') {
                Alert.alert("Error", "Password should be at least 6 characters.");
            } else {
                Alert.alert("Error", "Something went wrong. Try again later.");
            }
        } finally {
            setLoading(false);
        }
    };
 
    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
           
            {/* ---------- RESPONSIVE HEADER ---------- */}
            <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20 }}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Feather name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Security</Text>
                    <View style={{ width: 45 }} />
                </View>
            </View>
 
            <ScrollView
                contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.subtitle}>Update your account password to stay secure.</Text>
 
                {/* Form Fields */}
                <View style={styles.formContainer}>
                    <View style={styles.inputWrapper}>
                        <Feather name="lock" size={20} color="#94A3B8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="New Password"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry={true}
                        />
                    </View>
 
                    <View style={styles.inputWrapper}>
                        <Feather name="shield" size={20} color="#94A3B8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm New Password"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry={true}
                        />
                    </View>
                </View>
 
                {/* Save Button */}
                <TouchableOpacity
                    onPress={handlePasswordChange}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#3B82F6', '#1E3A8A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.saveButton}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveButtonText}>UPDATE PASSWORD</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};
 
const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#0A1F44' },
    scrollContainer: { paddingHorizontal: 20 },
 
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    backButton: {
        width: 45,
        height: 45,
        backgroundColor: '#1E3A8A',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
    },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
 
    subtitle: { fontSize: 15, color: '#94A3B8', marginBottom: 30, marginTop: 10, lineHeight: 22 },
 
    formContainer: { marginBottom: 30 },
   
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E3A8A',
        borderRadius: 15,
        marginBottom: 20,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    inputIcon: { marginRight: 10 },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: '#fff',
    },
 
    saveButton: {
        height:60,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#3B82F6',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    },
});
 
export default ChangePasswordScreen;
 