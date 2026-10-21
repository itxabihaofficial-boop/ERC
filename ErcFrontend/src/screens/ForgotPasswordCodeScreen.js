import { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Text from '../components/AppText';
import {
  AUTH_COLORS as C,
  AuthField,
  AuthScreen,
  ClearButton,
  FormMessage,
  GradientButton,
  useCountdown,
} from '../components/AuthForm';
import {
  DEFAULT_CODE_LENGTH,
  formatCountdown,
  requestResetCode,
  resetError,
  verifyResetCode,
} from '../lib/passwordReset';
import { scale as s, fs } from '../utils/responsive';

// Step 2 of 3: enter the emailed code. Resend is locked behind a cooldown timer.
export default function ForgotPasswordCodeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, source = 'signin' } = route.params ?? {};
  const codeLength = route.params?.codeLength ?? DEFAULT_CODE_LENGTH;

  const [code, setCode] = useState('');
  const [cooldownEndsAt, setCooldownEndsAt] = useState(route.params?.cooldownEndsAt ?? 0);
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(route.params?.notice ?? '');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const busy = useRef(false);

  const secondsLeft = useCountdown(cooldownEndsAt);
  const canResend = secondsLeft <= 0 && !resending && !verifying;

  async function handleVerify() {
    const cleanCode = code.trim();
    setError('');
    if (cleanCode.length !== codeLength) {
      setFieldError(`Enter the ${codeLength}-digit code from your email.`);
      return;
    }
    setFieldError('');
    if (busy.current) return;
    busy.current = true;
    setVerifying(true);
    setNotice('');

    try {
      const data = await verifyResetCode(email, cleanCode);
      // The code is spent, so leave it off the back stack.
      navigation.replace('ForgotPasswordNew', {
        email,
        source,
        resetToken: data.resetToken,
        tokenExpiresAt: Date.now() + (data.expiresInSeconds ?? 900) * 1000,
      });
    } catch (err) {
      const info = resetError(err);
      if (info.code === 'WRONG_CODE' || info.code === 'INVALID_CODE') {
        setFieldError(info.message);
      } else if (info.code === 'CODE_EXPIRED' || info.code === 'TOO_MANY_ATTEMPTS') {
        setCode('');
        setError(`${info.message.replace(/\.$/, '')} using “Resend code” below.`);
      } else if (info.retryAfterSeconds) {
        setError(`${info.message} Try again in ${formatCountdown(info.retryAfterSeconds)}.`);
      } else {
        setError(info.message);
      }
    } finally {
      busy.current = false;
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (!canResend || busy.current) return;
    busy.current = true;
    setResending(true);
    setError('');
    setFieldError('');
    setNotice('');

    try {
      const data = await requestResetCode(email);
      setCode('');
      setCooldownEndsAt(Date.now() + (data.cooldownSeconds ?? 60) * 1000);
      setNotice(`A new code has been sent to ${email}.`);
    } catch (err) {
      const info = resetError(err);
      if (info.code === 'COOLDOWN') {
        setCooldownEndsAt(Date.now() + (info.retryAfterSeconds ?? 60) * 1000);
      } else if (info.retryAfterSeconds) {
        setError(`${info.message} Try again in ${formatCountdown(info.retryAfterSeconds)}.`);
      } else {
        setError(info.message);
      }
    } finally {
      busy.current = false;
      setResending(false);
    }
  }

  return (
    <AuthScreen
      headerTitle="Change Password"
      title="Forgot Password"
      subtitle={`Please enter the ${codeLength}-digit code sent to ${email} to verify your account`}
    >
      <AuthField
        label="Code"
        value={code}
        onChangeText={(text) => {
          setCode(text.replace(/\D/g, '').slice(0, codeLength));
          if (fieldError) setFieldError('');
        }}
        placeholder={'0'.repeat(codeLength)}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={codeLength}
        returnKeyType="go"
        onSubmitEditing={handleVerify}
        editable={!verifying}
        autoFocus
        error={fieldError}
        style={{ letterSpacing: 2 }}
        trailing={
          <ClearButton
            visible={code.length > 0 && !verifying}
            label="Clear code"
            onPress={() => setCode('')}
          />
        }
      />

      <FormMessage error={error} notice={notice} />

      <GradientButton title="Continue" onPress={handleVerify} loading={verifying} />

      <View
        style={{
          marginTop: s(20),
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Text style={{ fontSize: fs(13), color: C.muted }}>Didn’t receive the code? </Text>
        {secondsLeft > 0 ? (
          <Text
            accessibilityLiveRegion="polite"
            style={{ fontSize: fs(13), color: C.muted, fontVariant: ['tabular-nums'] }}
          >
            Resend in {formatCountdown(secondsLeft)}
          </Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canResend, busy: resending }}
            hitSlop={10}
            onPress={handleResend}
            disabled={!canResend}
          >
            <Text style={{ fontSize: fs(13), fontWeight: '600', color: C.brown }}>
              {resending ? 'Sending…' : 'Resend code'}
            </Text>
          </Pressable>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => navigation.goBack()}
        style={{ marginTop: s(14), alignSelf: 'center' }}
      >
        <Text style={{ fontSize: fs(13), color: C.muted }}>
          Wrong email? <Text style={{ fontWeight: '600', color: C.brown }}>Change it</Text>
        </Text>
      </Pressable>
    </AuthScreen>
  );
}
