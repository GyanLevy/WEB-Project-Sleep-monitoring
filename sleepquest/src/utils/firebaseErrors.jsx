/**
 * Firebase Error Message Utility
 * Provides Hebrew translations for common Firebase authentication errors
 */

/**
 * Translates Firebase error codes to user-friendly Hebrew messages
 * @param {Error} error - Firebase error object
 * @returns {string} Hebrew error message
 */
export function getFirebaseErrorMessage(error) {
  const errorMessages = {
    "auth/user-not-found": "משתמש לא נמצא",
    "auth/wrong-password": "סיסמה שגויה",
    "auth/invalid-email": "אימייל לא תקין",
    "auth/user-disabled": "החשבון מכוהה",
    "auth/too-many-requests": "יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר.",
    "auth/invalid-credential": "פרטי התחברות לא תקינים",
    "auth/network-request-failed": "בעיית רשת. בדוק את החיבור לאינטרנט.",
  };

  return errorMessages[error.code] || `שגיאה: ${error.message}`;
}
