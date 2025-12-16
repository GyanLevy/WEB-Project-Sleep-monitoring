# SleepQuest - Project Documentation

## Overview

SleepQuest is a mobile-first React SPA for collecting daily sleep diary data from adolescent students. Built with React + Vite, Firebase Firestore, and Hebrew RTL localization.

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase Firestore
- **Routing**: React Router DOM v7
- **Language**: Hebrew (RTL)

---

## Project Structure

```
sleepquest/
├── index.html              # HTML entry point (RTL, Hebrew meta)
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite + Tailwind config
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Router and protected routes
│   ├── index.css           # Tailwind + custom animations
│   ├── firebase.js         # Firebase SDK config
│   ├── components/
│   │   ├── LoginScreen.jsx       # Token login UI
│   │   ├── QuestionnaireFlow.jsx # Step-by-step questions (presentation)
│   │   ├── CompletionScreen.jsx  # Success + game button
│   │   ├── StreakDisplay.jsx     # Gamification component
│   │   └── ui/                   # Reusable UI components
│   │       ├── Button.jsx            # Styled button component
│   │       ├── Card.jsx              # Card container component
│   │       ├── LoadingSpinner.jsx    # Loading indicator
│   │       ├── ProgressBar.jsx       # Progress indicator
│   │       └── index.js              # UI components barrel export
│   ├── hooks/
│   │   └── useQuestionnaireLogic.js  # Questionnaire state & logic
│   ├── context/
│   │   └── AuthContext.jsx       # State + Firestore logic
│   ├── data/
│   │   └── questions.json        # 11 Hebrew questions
│   └── utils/
│       └── CSVExportUtility.js   # Data export helper
```

---

## File Descriptions

### Root Files

| File             | Purpose                                                               |
| ---------------- | --------------------------------------------------------------------- |
| `index.html`     | HTML template with RTL direction, Hebrew meta tags, Heebo font        |
| `package.json`   | Project dependencies (react, firebase, react-router-dom, tailwindcss) |
| `vite.config.js` | Vite build config with Tailwind CSS plugin                            |

### src/ - Source Code

| File          | Purpose                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `main.jsx`    | React DOM render entry point                                                                                      |
| `App.jsx`     | React Router setup with protected routes. Redirects unauthenticated users to login, submitted users to completion |
| `index.css`   | Tailwind CSS imports + custom animations (confetti, shimmer, stars background)                                    |
| `firebase.js` | Firebase SDK initialization with Firestore. Contains project credentials                                          |

### src/components/ - UI Components

| File                    | Purpose                                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `LoginScreen.jsx`       | Login form with 6-digit token input. Validates token format, creates/fetches user in Firestore            |
| `QuestionnaireFlow.jsx` | Presentation component for step-by-step question display. Delegates logic to `useQuestionnaireLogic` hook |
| `CompletionScreen.jsx`  | Success screen after diary submission. Shows confetti animation, streak, and "Access Daily Game" button   |
| `StreakDisplay.jsx`     | Gamification component showing current streak, progress bar with day markers, motivational messages       |

#### src/components/ui/ - Reusable UI Components

| File                 | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `Button.jsx`         | Styled button component with RTL support and loading state |
| `Card.jsx`           | Card container component for consistent layout styling     |
| `LoadingSpinner.jsx` | Loading indicator with animation                           |
| `ProgressBar.jsx`    | Progress indicator for questionnaire completion            |
| `index.js`           | Barrel export for easy importing of all UI components      |

### src/hooks/ - Custom React Hooks

| File                       | Purpose                                                                                                                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useQuestionnaireLogic.js` | Encapsulates questionnaire state management and business logic. Handles: question filtering (conditional logic), navigation (next/back), answer management, form submission. Returns state and action handlers to presentation components |

### src/context/ - State Management

| File              | Purpose                                                                                                                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AuthContext.jsx` | React Context for global state. Manages: token, streak, submissions. Functions: login(), logout(), submitDiary(), hasSubmittedToday(). Persists to Firestore with localStorage token cache |

### src/data/ - Static Data

| File             | Purpose                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `questions.json` | 11 Hebrew sleep diary questions. Each has: id, text_he, type, options_he. Q8 has conditional logic (shows only if Q7 ≠ "0") |

### src/utils/ - Utilities

| File                  | Purpose                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `CSVExportUtility.js` | Helper functions for exporting Firestore data to CSV format. Includes Hebrew headers, BOM for Excel compatibility |

---

## Firestore Data Structure

```
students/{token}
├── classId: string
├── streak: number
├── lastSubmissionDate: "YYYY-MM-DD"
├── createdAt: timestamp
└── submissions/{date}
      ├── submittedAt: timestamp
      └── answers: { q1_class: "ט", q2_gender: "בן", ... }
```

---

## Architecture Notes

### Component Refactoring (Dec 2025)

The application was refactored to meet academic standards for React best practices:

1. **Separation of Concerns**: Logic extracted from presentation components into custom hooks
2. **Single Responsibility**: Large components broken down into smaller, focused UI components
3. **Reusability**: Common UI elements (Button, Card, LoadingSpinner, ProgressBar) abstracted into `src/components/ui/`
4. **Maintainability**: Business logic in `useQuestionnaireLogic` hook can be tested independently

### Recent Bug Fixes

**Temporal Dead Zone Error (Dec 15, 2025)**:

- **Issue**: `handleSubmit` was called in `handleNext` but declared after it, causing "Cannot access variable before it is declared" error
- **Fix**: Reordered function declarations in `useQuestionnaireLogic.js` to declare `handleSubmit` before `handleNext`
- **Additional**: Added `handleSubmit` to `handleNext`'s dependency array, updated `handleAnswer` dependencies to use full `currentQuestion` object per React Compiler inference

---

## Key Features

1. **Anonymous Authentication**: 6-digit tokens, no PII
2. **Daily Submission Limit**: One diary per day per token
3. **Streak Tracking**: Consecutive day counting
4. **Conditional Questions**: Q8 skipped if Q7="0"
5. **Hebrew RTL**: Full right-to-left layout
6. **Mobile-First**: Optimized for phone screens

---

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build
```
