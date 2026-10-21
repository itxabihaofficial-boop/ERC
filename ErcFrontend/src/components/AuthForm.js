import { StatusBar } from 'expo-status-bar';
import { forwardRef, useEffect, useId, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Text from './AppText';
import { scale as s, fs } from '../utils/responsive';

export const AUTH_COLORS = {
  brown: '#BF824F',
  brownLight: '#E3AB7C',
  ink: '#1F1B16',
  desc: '#666666',
  muted: '#8D8680',
  placeholder: '#B0A89F',
  error: '#B42318',
  success: '#3F6B4A',
  bg: '#FFFFFF',
};

const C = AUTH_COLORS;

/* ---------- Screen shell: header, title, subtitle, keyboard handling ---------- */
export function AuthScreen({ headerTitle, title, subtitle, onBack, children }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  function goBack() {
    if (onBack) onBack();
    else if (navigation.canGoBack()) navigation.goBack();
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + s(14),
            paddingBottom: insets.bottom + s(24),
            paddingHorizontal: s(20),
            alignItems: 'center',
          }}
        >
          <View style={{ width: '100%', maxWidth: 480 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                hitSlop={10}
                onPress={goBack}
                style={{ width: 32, height: 44, justifyContent: 'center', marginLeft: -4 }}
              >
                <Ionicons name="chevron-back" size={s(22)} color={C.ink} />
              </Pressable>
              <Text
                accessibilityRole="header"
                style={{ marginLeft: s(8), fontSize: fs(16), fontWeight: '600', color: C.ink }}
              >
                {headerTitle}
              </Text>
            </View>

            <Text style={{ marginTop: s(22), fontSize: fs(16), fontWeight: '600', color: C.ink }}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={{ marginTop: s(6), fontSize: fs(13), lineHeight: fs(19), color: C.desc }}
              >
                {subtitle}
              </Text>
            ) : null}

            <View style={{ marginTop: s(22) }}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ---------- Text field: label, white card with soft shadow, trailing icon ---------- */
export const AuthField = forwardRef(function AuthField(
  { label, error, hint, trailing, style, containerStyle, ...inputProps },
  ref
) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? C.error : focused ? C.brownLight : 'transparent';

  return (
    <View style={[{ marginBottom: s(18) }, containerStyle]}>
      <Text style={{ marginBottom: s(8), fontSize: fs(14), fontWeight: '600', color: C.ink }}>
        {label}
      </Text>
      <View
        style={{
          height: s(48),
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1,
          borderColor,
          paddingLeft: s(14),
          paddingRight: s(6),
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 3 },
          elevation: 3,
        }}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={C.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          maxFontSizeMultiplier={1.2}
          {...inputProps}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          style={[
            { flex: 1, height: '100%', fontSize: fs(13), color: C.ink, paddingVertical: 0 },
            style,
          ]}
        />
        {trailing}
      </View>
      {error ? (
        <Text style={{ marginTop: s(6), fontSize: fs(12), color: C.error }}>{error}</Text>
      ) : hint ? (
        <Text style={{ marginTop: s(6), fontSize: fs(12), color: C.muted }}>{hint}</Text>
      ) : null}
    </View>
  );
});

export function ClearButton({ visible, onPress, label = 'Clear' }) {
  if (!visible) return <View style={{ width: 36 }} />;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name="close-circle-outline" size={s(18)} color={C.placeholder} />
    </Pressable>
  );
}

export function EyeButton({ shown, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={shown ? 'Hide password' : 'Show password'}
      hitSlop={8}
      onPress={onPress}
      style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name={shown ? 'eye-outline' : 'eye-off-outline'} size={s(18)} color={C.placeholder} />
    </Pressable>
  );
}

/* ---------- Gradient pill button ---------- */
// Layout lives on a plain View with a static style: NativeWind drops Pressable's
// `style={({ pressed }) => ...}` function, which left the button flat and unpadded.
export function GradientButton({ title, onPress, loading, disabled, style, height = s(52) }) {
  const gradId = `authBtn${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const inactive = disabled || loading;
  const [pressed, setPressed] = useState(false);

  return (
    <View
      style={[
        {
          height,
          borderRadius: height / 2,
          overflow: 'hidden',
          opacity: inactive && !loading ? 0.55 : pressed ? 0.85 : 1,
          shadowColor: C.brown,
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        },
        style,
      ]}
    >
      <Svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={C.brown} />
            <Stop offset="1" stopColor={C.brownLight} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradId})`} />
      </Svg>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: inactive, busy: loading }}
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        disabled={inactive}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: s(24),
        }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text
            numberOfLines={1}
            maxFontSizeMultiplier={1.2}
            style={{ fontSize: fs(15), fontWeight: '600', color: '#FFFFFF', textAlign: 'center' }}
          >
            {title}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

/* ---------- Success dialog: centered card over a dimmed screen ---------- */
export function SuccessDialog({ visible, title, message, buttonTitle, onPress, onClose }) {
  const close = onClose ?? onPress;
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={close}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(31, 27, 22, 0.45)',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: s(20),
        }}
      >
        <View
          accessibilityViewIsModal
          style={{
            width: '100%',
            maxWidth: 400,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            paddingTop: s(24),
            paddingBottom: s(28),
            paddingHorizontal: s(24),
            alignItems: 'center',
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={10}
            onPress={close}
            style={{
              position: 'absolute',
              top: s(10),
              right: s(10),
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={s(18)} color={C.ink} />
          </Pressable>

          <Text
            accessibilityRole="header"
            style={{ fontSize: fs(16), fontWeight: '600', color: C.brown, textAlign: 'center' }}
          >
            {title}
          </Text>
          <Ionicons
            name="checkmark-circle"
            size={s(52)}
            color="#1FA62B"
            style={{ marginTop: s(14) }}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <Text
            style={{ marginTop: s(10), fontSize: fs(12), color: C.desc, textAlign: 'center' }}
          >
            {message}
          </Text>
          <GradientButton
            title={buttonTitle}
            onPress={onPress}
            height={s(44)}
            style={{ marginTop: s(22), alignSelf: 'stretch', marginHorizontal: s(28) }}
          />
        </View>
      </View>
    </Modal>
  );
}

export function FormMessage({ error, notice }) {
  if (!error && !notice) return null;
  return (
    <Text
      accessibilityLiveRegion="polite"
      style={{
        marginBottom: s(14),
        fontSize: fs(13),
        lineHeight: fs(18),
        color: error ? C.error : C.success,
      }}
    >
      {error || notice}
    </Text>
  );
}

/* ---------- Countdown based on an end timestamp (survives app backgrounding) ---------- */
export function useCountdown(endAt) {
  const remaining = () => Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  const [secondsLeft, setSecondsLeft] = useState(remaining);

  useEffect(() => {
    setSecondsLeft(remaining());
    if (!endAt || endAt <= Date.now()) return undefined;
    const timer = setInterval(() => {
      const next = remaining();
      setSecondsLeft(next);
      if (next <= 0) clearInterval(timer);
    }, 500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endAt]);

  return secondsLeft;
}
