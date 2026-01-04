# Firestore Security Rules - Setup Instructions

## Issue

The DebugSeeder requires write permissions to Firestore collections (`students` and `users`). If you're seeing "Missing or insufficient permissions", your Firestore security rules are blocking the writes.

## Solution: Update Firestore Rules

### Option 1: Firebase Console (Recommended for Quick Testing)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Replace the rules with the contents of [`firestore.rules`](file:///c:/Users/emirl/WEB-Project-Sleep-monitoring/sleepquest/firestore.rules)
5. Click **Publish**

### Option 2: Firebase CLI

If you have Firebase CLI installed:

```bash
cd sleepquest
firebase deploy --only firestore:rules
```

## Development vs Production Rules

**Current Rules (Development)**:

```javascript
// Allow all read/write for testing
allow read, write: if true;
```

**⚠️ IMPORTANT**: These permissive rules are for **DEVELOPMENT ONLY**

**Production Rules Example**:

```javascript
match /students/{studentToken} {
  // Only allow students to read/write their own data
  allow read: if request.auth != null && request.auth.uid == studentToken;
  allow write: if request.auth != null && request.auth.uid == studentToken;

  match /submissions/{submissionId} {
    allow read: if request.auth != null && request.auth.uid == studentToken;
    allow write: if request.auth != null && request.auth.uid == studentToken;
  }
}

match /users/{userId} {
  // Teachers can read their own data
  allow read: if request.auth != null && request.auth.uid == userId;
  // Only allow updates to own profile
  allow update: if request.auth != null && request.auth.uid == userId;
  // Admin-only creates
  allow create: if request.auth != null && request.auth.token.admin == true;
}
```

## Quick Fix for Testing

If you just need to test quickly without deploying rules:

**Temporary Test Mode** (Firebase Console):

1. Go to Firestore Database → Rules
2. Use this **temporary** rule (expires in 30 days):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 2, 3);
    }
  }
}
```

## Verify Rules are Active

After deploying, the DebugSeeder should work immediately. If you still see errors:

1. **Check Firebase Console**: Verify rules were published
2. **Refresh browser**: Clear cache and reload
3. **Check Firebase project**: Ensure you're using the correct project

## Security Best Practices

- ✅ Use permissive rules during development
- ✅ Always restrict rules before production
- ✅ Use Firebase Authentication for user-specific data
- ✅ Validate data structure in rules
- ✅ Set rate limits and data size limits
