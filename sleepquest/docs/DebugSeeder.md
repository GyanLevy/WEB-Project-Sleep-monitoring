# DebugSeeder Component - Documentation

## Overview

The **DebugSeeder** is a development-only tool for generating realistic test data with a structured school environment.

## Features

### Structured Data Generation

- **3 Classes**: class_101, class_102, class_103
- **1 Teacher per class**: Fake email, role='teacher'
- **28-32 Students per class**: ~90 students total with realistic data
- **14 Days of submission history**: Randomized attendance patterns

### Smart Batching

- Automatically handles Firestore's 500-operation batch limit
- Processes 2 students per batch (safe limit for ~15 operations each)
- Commits incrementally to prevent errors

### Real-time Progress Tracking

- Progress bar showing current class being generated
- Status messages for each step
- Error handling with user-friendly messages

## Usage

1. **Automatic Display**: The seeder appears in the bottom-right corner when running `npm run dev`
2. **Production Safe**: Only visible in development mode (`import.meta.env.DEV`)
3. **One Click**: Press "🏫 Generate Full School (3 Classes)" button

## Data Structure

### Teachers Collection (`users`)

```javascript
{
  email: "fake@example.com",
  role: "teacher",
  classId: "class_101",
  createdAt: serverTimestamp()
}
```

### Students Collection (`students`)

```javascript
{
  classId: "class_101",
  coins: 50-500 (randomized),
  streak: 0-14 (realistic),
  inventory: ["skin_default", "skin_ninja", ...],
  lastSubmissionDate: "2026-01-03",
  createdAt: serverTimestamp()
}
```

### Submissions Subcollection (`students/{token}/submissions/{date}`)

```javascript
{
  answers: {
    q1: "22:30",
    q2: "23:00",
    q3: "לא",
    // ... all questionnaire answers
  },
  submittedAt: serverTimestamp()
}
```

## Technical Details

- **Library**: `@faker-js/faker` for realistic fake data
- **Batching**: 2 students per batch (30 operations safely under 500 limit)
- **Questions**: Uses actual `questions.json` for realistic answers
- **Attendance**: Randomizes submission days (7-14 days out of 14)

## Safety Features

1. **Development Only**: Automatically disabled in production builds
2. **Error Handling**: Catches and displays Firestore errors
3. **Progress Tracking**: Shows which class is being processed
4. **No Overwrites**: Generates unique tokens to avoid collisions
