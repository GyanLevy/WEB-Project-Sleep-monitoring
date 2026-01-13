# סיכום פרויקט - SleepQuest

מסמך זה מציג סקירה מקיפה של ארכיטקטורת הפרויקט, החבילות והקבצים המרכזיים.
הפרויקט בנוי בטכנולוגיית React עם Vite ומשתמש ב-Firebase לשירותי Backend (אימות, מסד נתונים).

---

## 📁 src/components

חבילה זו מכילה את רכיבי הממשק (UI) והדפים של האפליקציה.

### 📄 App.jsx

**תיאור:** הרכיב הראשי שמנהל את הניתוב (Routing) באפליקציה.
**פונקציות עיקריות:**

- `AppRoutes`: מגדיר את כל הנתיבים (Routes) עבור תלמידים, מורים ומנהלים.
- `ProtectedRoute`: רכיב עוטף (Wrapper) שמוודא שהמשתמש מחובר לפני גישה לדפים מוגנים.

### 📄 LoginScreen.jsx

**תיאור:** מסך הכניסה הראשי לתלמידים. מאפשר כניסה באמצעות קוד גישה בן 6 ספרות.
**פונקציות עיקריות:**

- `handleLogin`: מבצע אימות מול `AuthContext` עם קוד הגישה שהוזן.

### 📄 QuestionnaireFlow.jsx

**תיאור:** תהליך מילוי יומן השינה. מציג שאלות בזו אחר זו ושומר את התשובות.
**פונקציות עיקריות:**

- `QuestionnaireFlow`: מנהל את המעבר בין השאלות והצגת סרגל ההתקדמות.

### 📄 GameView.jsx

**תיאור:** רכיב המציג את המשחק (Game) בתוך `iframe` ומנהל את התקשורת הדו-כיוונית בין האתר למשחק.
**פונקציות עיקריות:**

- `handleIframeLoad`: מזריק את נתוני המשתמש (מטבעות, רצף, סקינים) לתוך המשחק בעת הטעינה.
- `updateCoins`: מקבל עדכוני מטבעות מהמשחק ושומר אותם ב-Firebase.

### 📄 TeacherDashboard.jsx

**תיאור:** לוח הבקרה של המורה. מציג נתונים על הכיתה ומאפשר ניהול שאלות.
**פונקציות עיקריות:**

- `TeacherDashboard`: טוען ומציג את השאלות והתשובות של הכיתה.

### 📄 AdminDashboard.jsx

**תיאור:** לוח הבקרה של המנהל. מאפשר צפייה בכל הכיתות, אישור שאלות חדשות, וייצוא נתונים.
**פונקציות עיקריות:**

- `handleQuestionApproval`: מאשר או דוחה שאלות שהוגשו על ידי מורים.
- `handleExportData`: מייצא את נתוני התשובות לקובץ Excel.

---

## 📁 src/context

חבילה זו מכילה את ניהול המצב (State Management) הגלובלי של האפליקציה באמצעות React Context.

### 📄 AuthContext.jsx

**תיאור:** מנהל את האימות והנתונים של התלמיד (Student).
**פונקציות עיקריות:**

- `login`: מבצע כניסה באמצעות קוד תלמיד וטוען את נתוני המשתמש מ-Firestore.
- `submitQuestionnaire`: שומר את תשובות יומן השינה ב-Firebase ומעדכן את הרצף (Streak) והמטבעות.
- `getQuestions`: טוען את השאלות המאושרות הרלוונטיות לכיתה של התלמיד.

### 📄 AdminContext.jsx

**תיאור:** מנהל את האימות והנתונים של המנהל (Admin).
**פונקציות עיקריות:**

- `loginAdmin`: מבצע כניסה למנהל מערכת.
- `loadClasses`: טוען את רשימת כל הכיתות והסטטיסטיקות שלהן.
- `handleQuestionApproval`: מעדכן את סטטוס השאלה (מאושר/נדחה) במסד הנתונים.

### 📄 TeacherContext.jsx

**תיאור:** מנהל את האימות והנתונים של המורה (Teacher).
**פונקציות עיקריות:**

- `loginTeacher`: מבצע כניסה לחשבון מורה.
- `addQuestion`: מוסיף שאלה חדשה למאגר (בסטטוס "ממתין לאישור").

---

## 📁 src/hooks

חבילה זו מכילה Hooks מותאמים אישית לשימוש חוזר ולוגיקה עסקית.

### 📄 useQuestionnaireLogic.jsx

**תיאור:** מכיל את הלוגיקה של שאלון יומן השינה (ניהול מצב, מעבר בין שאלות, אימות).
**פונקציות עיקריות:**

- `handleAnswer`: שומר את התשובה לשאלה הנוכחית.
- `handleNext`: בודק אם ניתן להתקדם ומעביר לשאלה הבאה או מבצע שליחה.
- `submitDiary`: שולח את כל התשובות לשרת דרך `AuthContext`.

### 📄 useAuth.jsx

**תיאור:** Hook פשוט המספק גישה נוחה ל-`AuthContext`.
**פונקציות עיקריות:**

- `useAuth`: מחזיר את אובייקט ה-Context או זורק שגיאה אם משתמשים בו מחוץ ל-Provider.

---

## 📁 src/utils

חבילה זו מכילה פונקציות עזר (Utilities) ושירותים כלליים.

### 📄 ExcelExportUtility.jsx

**תיאור:** שירות לייצוא נתונים לקבצי Excel.
**פונקציות עיקריות:**

- `exportStudentDataToExcel`: הפונקציה הראשית שמנהלת את תהליך הייצוא.
- `createExcelWorkbook`: יוצרת את קובץ האקסל בפועל (Workbook) מתוך הנתונים הגולמיים.
- `buildExcelRows`: מעבדת את נתוני ה-Firebase לשורות טבלה שטוחות וקריאות.

### 📄 firebaseErrors.jsx

**תיאור:** מתרגם שגיאות של Firebase להודעות ידידותיות בעברית.
**פונקציות עיקריות:**

- `getFirebaseErrorMessage`: מקבלת קוד שגיאה ומחזירה מחרוזת בעברית.

---

## 📁 src/data

חבילה זו מכילה קבצי נתונים סטטיים.

### 📄 questions.json

**תיאור:** קובץ גיבוי המכיל מאגר שאלות ברירת מחדל (בשימוש כאשר אין חיבור למסד הנתונים או לאתחול).

---
