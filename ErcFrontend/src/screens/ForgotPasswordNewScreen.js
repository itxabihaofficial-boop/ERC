import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  AuthField,
  AuthScreen,
  EyeButton,
  FormMessage,
  GradientButton,
  SuccessDialog,
} from '../components/AuthForm';
import { signOutUser } from '../lib/auth';
import {
  PASSWORD_HINT,
  confirmPasswordReset,
  passwordProblem,
  resetError,
} from '../lib/passwordReset';

// Step 3 of 3: choose the new password.
export default function ForgotPasswordNewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email, source = 'signin', resetToken, tokenExpiresAt = 0 } = route.params ?? {};

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [updated, setUpdated] = useState(false);
  const busy = useRef(false);
  const confirmRef = useRef(null);

  function startOver() {
    Alert.alert('Session expired', 'For your security, please verify your email again.', [
      { text: 'OK', onPress: () => navigation.popTo('ForgotPassword', { email, source }) },
    ]);
  }

  function backToSignIn() {
    setUpdated(false);
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'SignIn',
          params: {
            email,
            notice:
              source === 'profile'
                ? 'Password changed. Please sign in again with your new password.'
                : '',
          },
        },
      ],
    });
  }

  async function handleSave() {
    setError('');
    const problem = passwordProblem(password);
    const mismatch = !confirm
      ? 'Re-enter your new password.'
      : confirm !== password
        ? 'Passwords do not match.'
        : '';
    setPasswordError(problem ?? '');
    setConfirmError(problem ? '' : mismatch);
    if (problem || mismatch) return;

    if (!resetToken || Date.now() > tokenExpiresAt) {
      startOver();
      return;
    }
    if (busy.current || updated) return;
    busy.current = true;
    setSaving(true);

    try {
      await confirmPasswordReset(resetToken, password);
      // The server signs the account out everywhere, so sign out here too.
      await signOutUser().catch(() => {});
      setUpdated(true);
    } catch (err) {
      const info = resetError(err);
      if (info.code === 'RESET_EXPIRED') {
        startOver();
      } else if (info.code === 'WEAK_PASSWORD') {
        setPasswordError(info.message);
      } else {
        setError(info.message);
      }
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  return (
    <AuthScreen
      headerTitle="Change Password"
      title="Forgot Password"
      subtitle="Create a new password for your account"
    >
      <AuthField
        label="New Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) setPasswordError('');
        }}
        placeholder="Enter new password"
        secureTextEntry={!showPassword}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        onSubmitEditing={() => confirmRef.current?.focus()}
        submitBehavior="submit"
        editable={!saving && !updated}
        autoFocus
        error={passwordError}
        hint={PASSWORD_HINT}
        trailing={<EyeButton shown={showPassword} onPress={() => setShowPassword((v) => !v)} />}
      />

      <AuthField
        ref={confirmRef}
        label="Confirm Password"
        value={confirm}
        onChangeText={(text) => {
          setConfirm(text);
          if (confirmError) setConfirmError('');
        }}
        placeholder="Re-enter new password"
        secureTextEntry={!showConfirm}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleSave}
        editable={!saving && !updated}
        error={confirmError}
        trailing={<EyeButton shown={showConfirm} onPress={() => setShowConfirm((v) => !v)} />}
      />

      <FormMessage error={error} />

      <GradientButton title="Save" onPress={handleSave} loading={saving} disabled={updated} />

      <SuccessDialog
        visible={updated}
        title="Password Updated"
        message="Your Password is Updated..."
        buttonTitle="Back To Sign In"
        onPress={backToSignIn}
      />
    </AuthScreen>
  );
}
