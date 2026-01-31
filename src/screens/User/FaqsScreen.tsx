// FaqsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

// LayoutAnimation enable karein (Android ke liye zaroori)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Dummy FAQ Data
const FAQ_DATA = [
    { id: '1', question: "How do I reset my password?", answer: "You can reset your password by going to Settings > Change Password and following the steps there. You will need access to your registered email." },
    { id: '2', question: "What types of quizzes are available?", answer: "We offer Aptitude Test, Logical Reasoning, Science, and Mathematics quizzes, all designed to sharpen your skills." },
    { id: '3', question: "How is my progress tracked?", answer: "Your progress is tracked automatically based on your daily quiz scores and recording minutes. You can view detailed reports on the Progress tab." },
    { id: '4', question: "Can I use the app offline?", answer: "Basic reading resources and locally saved progress can be accessed offline. New quizzes require an internet connection." },
];

// --- Reusable Component: Accordion Item ---
const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
    };

    return (
        <View style={styles.faqCard}>
            <TouchableOpacity onPress={toggleAccordion} style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{question}</Text>
                <Text style={styles.arrow}>{isOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{answer}</Text>
                </View>
            )}
        </View>
    );
};

const FaqsScreen: React.FC<any> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>FAQs</Text>
                    <View style={{ width: 30 }} />
                </View>

                {/* Subtitle */}
                <Text style={styles.subtitle}>Frequently Asked Questions about Quizzer.</Text>

                {/* FAQ List */}
                <View style={styles.faqListContainer}>
                    {FAQ_DATA.map(item => (
                        <FaqItem key={item.id} question={item.question} answer={item.answer} />
                    ))}
                </View>
                
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#0A1F44' },
    scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, marginBottom: 20 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },

    subtitle: { fontSize: 16, color: '#C7D2FE', marginBottom: 20 },

    faqListContainer: { marginBottom: 30 },

    faqCard: {
        backgroundColor: '#1E3A8A',
        borderRadius: 12,
        marginBottom: 15,
        overflow: 'hidden',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    faqQuestion: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#fff', 
        flex: 1,
        marginRight: 10,
    },
    arrow: { fontSize: 16, color: '#FBBF24', fontWeight: 'bold' },
    faqBody: { 
        paddingHorizontal: 15, 
        paddingVertical: 12, 
        backgroundColor: '#15213B',
    },
    faqAnswer: { fontSize: 14, color: '#C7D2FE', lineHeight: 22 },
});

export default FaqsScreen;
