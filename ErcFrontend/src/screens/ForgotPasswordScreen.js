import { useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  AuthField,
  AuthScreen,
  ClearButton,
  FormMessage,
  GradientButton,
} from '../components/AuthForm';
import {
  DEFAULT_CODE_LENGTH,
  EMAIL_PATTERN,
  formatCountdown,
  requestResetCode,
  resetError,
} from '../lib/passwordReset';

// Step 1 of 3: enter the account email and get a verification code.
export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const source = route.params?.source ?? 'signin';
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);

  function goToCode(nextEmail, cooldownSeconds, extra = {}) {
    navigation.navigate('ForgotPasswordCode', {
      email: nextEmail,
      source,
      cooldownEndsAt: Date.now() + cooldownSeconds * 1000,
      codeLength: extra.codeLength ?? DEFAULT_CODE_LENGTH,
      notice: extra.notice ?? `We sent a verification code to ${nextEmail}.`,
    });
  }

  async function handleContinue() {
    const nextEmail = email.trim().toLowerCase();
    setError('');
    if (!EMAIL_PATTERN.test(nextEmail)) {
      setFieldError('Enter a valid email address.');
      return;
    }
    setFieldError('');
    if (busy.current) return;
    busy.current = true;
    setLoading(true);

    try {
      const data = await requestResetCode(nextEmail);
      goToCode(nextEmail, data.cooldownSeconds ?? 60, { codeLength: data.codeLength });
    } catch (err) {
      const info = resetError(err);
      if (info.code === 'COOLDOWN') {
        // A code was sent moments ago and is still valid: continue with the remaining wait.
        goToCode(nextEmail, info.retryAfterSeconds ?? 60, {
          notice: 'We already sent a code to this email. Check your inbox and spam folder.',
        });
      } else if (info.code === 'INVALID_EMAIL') {
        setFieldError(info.message);
      } else if (info.retryAfterSeconds) {
        setError(`${info.message} Try again in ${formatCountdown(info.retryAfterSeconds)}.`);
      } else {
        setError(info.message);
      }
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      headerTitle="Change Password"
      title="Forgot Password"
      subtitle="Please enter the email address below to verify your account"
    >
      <AuthField
        label="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (fieldError) setFieldError('');
        }}
        placeholder="debra.holt@example.com"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="go"
        onSubmitEditing={handleContinue}
        editable={!loading}
        error={fieldError}
        trailing={
          <ClearButton
            visible={email.length > 0 && !loading}
            label="Clear email"
            onPress={() => setEmail('')}
          />
        }
      />

      <FormMessage error={error} />

      <GradientButton title="Continue" onPress={handleContinue} loading={loading} />
    </AuthScreen>
  );
}
