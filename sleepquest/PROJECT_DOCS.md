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
│   │   ├── QuestionnaireFlow.jsx # Step-by-step questions
│   │   ├── CompletionScreen.jsx  # Success + game button
│   │   └── StreakDisplay.jsx     # Gamification component
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

| File                    | Purpose                                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `LoginScreen.jsx`       | Login form with 6-digit token input. Validates token format, creates/fetches user in Firestore                              |
| `QuestionnaireFlow.jsx` | Step-by-step question display with progress bar. Handles conditional logic (Q8 depends on Q7). Submits answers to Firestore |
| `CompletionScreen.jsx`  | Success screen after diary submission. Shows confetti animation, streak, and "Access Daily Game" button                     |
| `StreakDisplay.jsx`     | Gamification component showing current streak, progress bar with day markers, motivational messages                         |

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
