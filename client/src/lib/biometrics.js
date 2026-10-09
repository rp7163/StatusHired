/**
 * WebAuthn Biometrics & Device Security helper for StatusHired.
 * Enables one-time biometric / passkey enrollment (Touch ID / Face ID / Windows Hello)
 * using standard native browser navigator.credentials WebAuthn APIs.
 */

const BIOMETRICS_COOKIE_PREFIX = 'statushired_biometric_enrolled_';

/**
 * Check if the current browser/device supports WebAuthn platform authenticators (Face ID, Touch ID, Windows Hello)
 */
export async function isPlatformBiometricsAvailable() {
  if (
    typeof window === 'undefined' ||
    !window.PublicKeyCredential ||
    !navigator.credentials ||
    !navigator.credentials.create
  ) {
    return false;
  }

  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return Boolean(available);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the user has already registered a device biometric passkey on this browser
 */
export function getBiometricEnrollment(userId) {
  if (!userId || typeof document === 'undefined') {
    return { isEnrolled: false };
  }

  const cookieKey = `${BIOMETRICS_COOKIE_PREFIX}${userId}`;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const cookie of cookies) {
    const [name, ...valParts] = cookie.trim().split('=');
    if (name === cookieKey) {
      const val = decodeURIComponent(valParts.join('='));
      try {
        const parsed = JSON.parse(val);
        return { isEnrolled: true, enrolledAt: parsed.enrolledAt };
      } catch {
        return { isEnrolled: true, enrolledAt: val };
      }
    }
  }

  return { isEnrolled: false };
}

/**
 * Perform one-time device biometric / passkey credential creation via WebAuthn
 */
export async function enrollDeviceBiometrics(userId, userEmail) {
  try {
    const isSupported = await isPlatformBiometricsAvailable();
    if (!isSupported) {
      return { success: false, error: 'Device biometrics are not supported on this browser or platform.' };
    }

    // Generate random challenge bytes
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Encode user id to Uint8Array
    const encoder = new TextEncoder();
    const userIdBuffer = encoder.encode(userId);

    const publicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'StatusHired',
        id: window.location.hostname || 'localhost',
      },
      user: {
        id: userIdBuffer,
        name: userEmail,
        displayName: userEmail.split('@')[0] || 'StatusHired User',
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' }, // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Touch ID / Face ID / Windows Hello
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });

    if (!credential) {
      return { success: false, error: 'Registration was cancelled or failed.' };
    }

    // Persist verified enrollment status in cookie (expires in 365 days)
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    const payload = encodeURIComponent(
      JSON.stringify({
        id: credential.id,
        enrolledAt: new Date().toISOString(),
      })
    );
    document.cookie = `${BIOMETRICS_COOKIE_PREFIX}${userId}=${payload}; path=/; expires=${expires}; SameSite=Lax`;

    return { success: true };
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      return { success: false, error: 'Biometric prompt was dismissed or cancelled.' };
    }
    console.warn('Biometric enrollment error:', err);
    return { success: false, error: err.message || 'Could not enroll biometrics.' };
  }
}
