import { useState } from 'react';
import { db } from '../firebase';
import { writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { faker } from '@faker-js/faker';
import questionsData from '../data/questions.json';

/**
 * Smart DebugSeeder Component
 * Generates realistic test data with proper batching strategy:
 * - 3 classes with class documents
 * - 1 teacher per class
 * - ~30 students per class with realistic distribution
 * - Proper batch chunking per class to avoid 500-operation limit
 */
export default function DebugSeeder() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 3 });
  const [error, setError] = useState('');

  const CLASS_IDS = ['class_101', 'class_102', 'class_103'];
  const CLASS_NAMES = ['Class 101', 'Class 102', 'Class 103'];
  const STUDENTS_PER_CLASS = 30;
  const TOTAL_DAYS = 10;

  // Official Game Assets
  const AVAILABLE_SKINS = [
    { id: 'skin_default', name: 'Default Agent', price: 0 },
    { id: 'skin_ninja', name: 'Shadow Ninja', price: 50 },
    { id: 'skin_cyber', name: 'Cyber Punk', price: 100 },
    { id: 'skin_fire', name: 'Flame Walker', price: 150 },
    { id: 'skin_ice', name: 'Frost Byte', price: 150 },
    { id: 'skin_gold', name: 'Golden Elite', price: 300 },
    { id: 'skin_ghost', name: 'Ghost Protocol', price: 400 },
    { id: 'skin_rainbow', name: 'RGB Master', price: 500 }
  ];

  const AVAILABLE_WEAPONS = [
    { id: 'weapon_blaster', name: 'Blaster', price: 0 },
    { id: 'weapon_shotgun', name: 'Shotgun', price: 100 },
    { id: 'weapon_laser', name: 'Rapid Laser', price: 150 },
    { id: 'weapon_missile', name: 'Homing Missiles', price: 250 },
    { id: 'weapon_dual', name: 'Dual Blasters', price: 300 }
  ];

  /**
   * Generate random 6-digit token
   */
  const generateToken = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  /**
   * Generate fake answers for a submission based on actual questions.json structure
   */
  const generateFakeAnswers = () => {
    const answers = {};
    
    questionsData.forEach(q => {
      // All questions in your JSON are type "radio" with options_he array
      if (q.options_he && q.options_he.length > 0) {
        // Randomly select one of the Hebrew options
        answers[q.id] = faker.helpers.arrayElement(q.options_he);
      }
    });
    
    return answers;
  };

  /**
   * Generate date string for N days ago
   */
  const getDaysAgo = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };

  /**
   * Get today's date
   */
  const getToday = () => getDaysAgo(0);

  /**
   * Generate inventory based on coins (wealth)
   * Always includes defaults: skin_default, weapon_blaster
   */
  const generateInventory = (coins) => {
    const inventory = ['skin_default', 'weapon_blaster']; // Mandatory defaults
    
    // Determine how many items they can afford
    const affordableSkins = AVAILABLE_SKINS.filter(s => s.price > 0 && s.price <= coins);
    const affordableWeapons = AVAILABLE_WEAPONS.filter(w => w.price > 0 && w.price <= coins);
    
    // Rich players get more items
    if (coins >= 500) {
      // Add 2-3 skins
      const skinCount = faker.number.int({ min: 2, max: 3 });
      const purchasedSkins = faker.helpers.arrayElements(affordableSkins, Math.min(skinCount, affordableSkins.length));
      inventory.push(...purchasedSkins.map(s => s.id));
      
      // Add 1-2 weapons
      const weaponCount = faker.number.int({ min: 1, max: 2 });
      const purchasedWeapons = faker.helpers.arrayElements(affordableWeapons, Math.min(weaponCount, affordableWeapons.length));
      inventory.push(...purchasedWeapons.map(w => w.id));
    } else if (coins >= 150) {
      // Add 1-2 skins
      const skinCount = faker.number.int({ min: 1, max: 2 });
      const purchasedSkins = faker.helpers.arrayElements(affordableSkins, Math.min(skinCount, affordableSkins.length));
      inventory.push(...purchasedSkins.map(s => s.id));
      
      // Add 0-1 weapon
      if (faker.datatype.boolean() && affordableWeapons.length > 0) {
        const weapon = faker.helpers.arrayElement(affordableWeapons);
        inventory.push(weapon.id);
      }
    } else if (coins >= 50) {
      // Newbies might have one skin
      if (faker.datatype.boolean() && affordableSkins.length > 0) {
        const skin = faker.helpers.arrayElement(affordableSkins);
        inventory.push(skin.id);
      }
    }
    
    // Remove duplicates and return
    return [...new Set(inventory)];
  };

  /**
   * Generate student data based on profile type
   */
  const generateStudentProfile = (type, token) => {
    const today = getToday();
    
    if (type === 'graduate') {
      // 33% Graduates: Completed all 10 days
      const completedDays = TOTAL_DAYS;
      const coins = faker.number.int({ min: 500, max: 800 });
      return {
        token,
        completedDays,
        coins,
        streak: faker.number.int({ min: 8, max: 10 }),
        lastSubmissionDate: today,
        inventory: generateInventory(coins)
      };
    } else if (type === 'active') {
      // 33% Active Players: 4-7 days completed
      const completedDays = faker.number.int({ min: 4, max: 7 });
      const coins = faker.number.int({ min: 150, max: 400 });
      const lastSubmission = faker.helpers.arrayElement([today, getDaysAgo(1)]);
      return {
        token,
        completedDays,
        coins,
        streak: faker.number.int({ min: 2, max: completedDays }),
        lastSubmissionDate: lastSubmission,
        inventory: generateInventory(coins)
      };
    } else {
      // 33% Newbies: 0-2 days completed
      const completedDays = faker.number.int({ min: 0, max: 2 });
      const coins = faker.number.int({ min: 0, max: 50 });
      return {
        token,
        completedDays,
        coins,
        streak: completedDays,
        lastSubmissionDate: completedDays > 0 ? getDaysAgo(faker.number.int({ min: 0, max: 2 })) : null,
        inventory: generateInventory(coins)
      };
    }
  };

  /**
   * Create class document, teacher, and students for ONE class
   * Uses a SINGLE batch per class to avoid 500-operation limit
   */
  const createClass = async (classId, className) => {
    const batch = writeBatch(db);
    const teacherEmail = faker.internet.email();

    // Step 1: Create Class Document
    const classRef = doc(db, 'classes', classId);
    batch.set(classRef, {
      className: className,
      teacherEmail: teacherEmail,
      totalStudents: STUDENTS_PER_CLASS,
      createdAt: serverTimestamp()
    });

    // Step 2: Create Teacher Document
    const teacherRef = doc(db, 'users', teacherEmail);
    batch.set(teacherRef, {
      email: teacherEmail,
      role: 'teacher',
      classId: classId,
      createdAt: serverTimestamp()
    });

    // Step 3: Generate unique tokens for students
    const tokens = new Set();
    while (tokens.size < STUDENTS_PER_CLASS) {
      tokens.add(generateToken());
    }
    const studentTokens = Array.from(tokens);

    // Step 4: Distribute students into 3 groups (33% each)
    const graduateCount = Math.floor(STUDENTS_PER_CLASS / 3);
    const activeCount = Math.floor(STUDENTS_PER_CLASS / 3);
    const newbieCount = STUDENTS_PER_CLASS - graduateCount - activeCount;

    let studentIndex = 0;
    const studentProfiles = [];

    // Graduates
    for (let i = 0; i < graduateCount; i++) {
      studentProfiles.push(generateStudentProfile('graduate', studentTokens[studentIndex++]));
    }
    // Active Players
    for (let i = 0; i < activeCount; i++) {
      studentProfiles.push(generateStudentProfile('active', studentTokens[studentIndex++]));
    }
    // Newbies
    for (let i = 0; i < newbieCount; i++) {
      studentProfiles.push(generateStudentProfile('newbie', studentTokens[studentIndex++]));
    }

    // Step 5: Create student documents and submissions in the SAME batch
    for (const profile of studentProfiles) {
      const studentRef = doc(db, 'students', profile.token);
      batch.set(studentRef, {
        classId: classId,
        coins: profile.coins,
        streak: profile.streak,
        inventory: profile.inventory,
        lastSubmissionDate: profile.lastSubmissionDate,
        totalDays: TOTAL_DAYS,
        createdAt: serverTimestamp()
      });

      // Generate submission history
      if (profile.completedDays > 0) {
        for (let day = 0; day < profile.completedDays; day++) {
          const submissionDate = getDaysAgo(profile.completedDays - day - 1);
          const submissionRef = doc(db, 'students', profile.token, 'submissions', submissionDate);
          batch.set(submissionRef, {
            answers: generateFakeAnswers(),
            submittedAt: serverTimestamp()
          });
        }
      }
    }

    setStatus(`${className}: Committing batch (1 class + 1 teacher + ${STUDENTS_PER_CLASS} students + submissions)...`);
    
    // CRITICAL: Commit the batch for this class
    await batch.commit();
    
    setStatus(`✓ ${className} complete (${graduateCount} graduates, ${activeCount} active, ${newbieCount} newbies)`);
    
    return {
      classId,
      teacherEmail,
      studentCount: STUDENTS_PER_CLASS,
      graduates: graduateCount,
      active: activeCount,
      newbies: newbieCount
    };
  };

  /**
   * Main generation function
   */
  const generateSchool = async () => {
    setIsGenerating(true);
    setError('');
    setProgress({ current: 0, total: CLASS_IDS.length });

    try {
      const results = [];

      for (let i = 0; i < CLASS_IDS.length; i++) {
        const classId = CLASS_IDS[i];
        const className = CLASS_NAMES[i];
        
        setProgress({ current: i + 1, total: CLASS_IDS.length });
        setStatus(`Generating ${className}...`);

        const result = await createClass(classId, className);
        results.push(result);

        // Small delay between classes
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const totalStudents = results.reduce((sum, r) => sum + r.studentCount, 0);
      setStatus(`✅ School generated! ${totalStudents} students across ${CLASS_IDS.length} classes`);
      setIsGenerating(false);

    } catch (err) {
      console.error('Generation error:', err);
      setError(`Failed: ${err.message}`);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white">🧬 Smart Seeder</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">DEV ONLY</span>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
              <span>Progress</span>
              <span>{progress.current}/{progress.total} classes</span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Status Message */}
        {status && (
          <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-700/50 rounded text-xs text-slate-700 dark:text-slate-300 max-h-20 overflow-y-auto">
            {status}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={generateSchool}
          disabled={isGenerating}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 text-white text-sm font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </span>
          ) : (
            '🏫 Generate Smart School'
          )}
        </button>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
          3 classes • ~90 students • Realistic mix
        </p>
      </div>
    </div>
  );
}
