import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { hasPinSet, updatePin, verifyPin } from '@/lib/api/security';
import { useAuth } from '@/lib/hooks/useAuth';
import { FONT_SIZE, SPACING } from '@/lib/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type PinStage = 'check' | 'verify_old' | 'setup_new' | 'confirm_new';

export default function EditPinScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [stage, setStage] = useState<PinStage>('check');
    const [pin, setPin] = useState('');
    const [tempData, setTempData] = useState<{ oldPinVerified?: boolean; newPinTemp?: string }>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        checkStatus();
    }, [user]);

    // Auto-focus input when stage changes
    useEffect(() => {
        setPin('');
        setError(null);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [stage]);

    // Handle PIN input completion
    useEffect(() => {
        if (pin.length === 6) {
            handlePinComplete(pin);
        }
    }, [pin]);

    const checkStatus = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const hasPin = await hasPinSet(user.id);
            if (hasPin) {
                setStage('verify_old');
            } else {
                setStage('setup_new');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Eror', 'Gagal memuat status PIN');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handlePinComplete = async (inputPin: string) => {
        if (!user) return;

        // VERIFY OLD
        if (stage === 'verify_old') {
            setLoading(true);
            try {
                const isValid = await verifyPin(user.id, inputPin);
                if (isValid) {
                    setStage('setup_new');
                } else {
                    setError('PIN Lama salah. Silakan coba lagi.');
                    setPin('');
                    Keyboard.dismiss(); // Shake effect optional
                }
            } catch (e) {
                Alert.alert('Eror', 'Gagal memverifikasi PIN');
            } finally {
                setLoading(false);
            }
        }
        // SETUP NEW
        else if (stage === 'setup_new') {
            setTempData({ ...tempData, newPinTemp: inputPin });
            setStage('confirm_new');
        }
        // CONFIRM NEW
        else if (stage === 'confirm_new') {
            if (inputPin === tempData.newPinTemp) {
                // Save
                setLoading(true);
                try {
                    await updatePin(user.id, inputPin);
                    Alert.alert('Sukses', 'PIN Keamanan berhasil disimpan!', [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                } catch (e) {
                    Alert.alert('Eror', 'Gagal menyimpan PIN');
                    setStage('setup_new');
                } finally {
                    setLoading(false);
                }
            } else {
                setError('PIN Konfirmasi tidak cocok.');
                setPin('');
                // Maybe auto go back to setup new? Or let user retry confirm?
                // Usually retry confirm, or strict flow back to setup
                Alert.alert('PIN Tidak Cocok', 'Silakan masukkan PIN baru dari awal.', [
                    { text: 'OK', onPress: () => setStage('setup_new') }
                ]);
            }
        }
    };

    const getTitle = () => {
        switch (stage) {
            case 'verify_old': return 'Masukkan PIN Lama';
            case 'setup_new': return tempData.oldPinVerified ? 'Masukkan PIN Baru' : 'Buat PIN Baru';
            case 'confirm_new': return 'Konfirmasi PIN Baru';
            default: return 'Memuat...';
        }
    };

    const getSubtitle = () => {
        switch (stage) {
            case 'verify_old': return 'Demi keamanan, masukkan PIN lama Anda.';
            case 'setup_new': return 'PIN digunakan untuk verifikasi pembayaran.';
            case 'confirm_new': return 'Masukkan ulang PIN baru Anda.';
            default: return '';
        }
    };

    const renderDots = () => {
        return (
            <View style={styles.dotsContainer}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            {
                                borderColor: error ? theme.error : (pin.length > i ? theme.primary : theme.border),
                                backgroundColor: pin.length > i ? theme.primary : 'transparent',
                            }
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="lock-closed" size={48} color={theme.primary} />
                </View>

                <Text style={[styles.title, { color: theme.text }]}>{getTitle()}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{getSubtitle()}</Text>

                {renderDots()}

                {error && <Text style={[styles.errorText, { color: theme.error || 'red' }]}>{error}</Text>}

                {loading && <ActivityIndicator style={{ marginTop: 20 }} color={theme.primary} />}

                {/* Hidden Input */}
                <TextInput
                    ref={inputRef}
                    value={pin}
                    onChangeText={(t) => {
                        // Only allow numeric
                        const cleaned = t.replace(/[^0-9]/g, '');
                        if (cleaned.length <= 6) {
                            setPin(cleaned);
                            if (error) setError(null);
                        }
                    }}
                    keyboardType="number-pad"
                    style={styles.hiddenInput}
                    maxLength={6}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: SPACING.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: SPACING.xl,
    },
    iconContainer: {
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: 'bold',
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FONT_SIZE.md,
        textAlign: 'center',
        marginBottom: SPACING.xxl,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
    },
    hiddenInput: {
        position: 'absolute',
        opacity: 0,
        width: '100%',
        height: '100%', // Cover screen to ensure tap anywhere focuses? Maybe
    },
    errorText: {
        fontSize: FONT_SIZE.md,
        marginTop: SPACING.md,
    }
});
