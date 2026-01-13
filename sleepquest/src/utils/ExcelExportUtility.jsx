/**
 * Excel Export Utility for SleepQuest - FIXED VERSION
 * Exports actual student response data from Firestore to Excel format
 *
 * Features:
 * - Fetches real data from Firestore
 * - Exports student responses with questions
 * - Supports all question types
 * - Hebrew language support
 * - Proper Excel formatting
 */

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

/**
 * Get all approved questions from Firestore
 */
export async function getQuestionsFromFirestore(db) {
  try {
    console.log('📝 Fetching questions from Firestore...');

    // Use Firebase SDK v9+ syntax
    const questionsRef = collection(db, 'questions');
    const q = query(
      questionsRef,
      where('status', '==', 'approved'),
      orderBy('createdAt', 'asc')
    );

    const questionsSnapshot = await getDocs(q);

    const questions = [];
    questionsSnapshot.forEach(doc => {
      questions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Found ${questions.length} approved questions`);
    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw new Error(`Failed to fetch questions: ${error.message}`);
  }
}

/**
 * Get all student submissions from Firestore
 */
export async function getStudentSubmissionsFromFirestore(db) {
  try {
    console.log('📋 Fetching student submissions...');

    const submissionsRef = collection(db, 'submissions');
    const q = query(submissionsRef, orderBy('submittedAt', 'desc'));

    const submissionsSnapshot = await getDocs(q);

    const submissions = [];
    submissionsSnapshot.forEach(doc => {
      submissions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Found ${submissions.length} total submissions`);
    return submissions;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw new Error(`Failed to fetch submissions: ${error.message}`);
  }
}

/**
 * Get responses for a specific class
 */
export async function getClassSubmissionsFromFirestore(db, classId) {
  try {
    console.log(`📋 Fetching submissions for class ${classId}...`);

    const submissionsRef = collection(db, 'submissions');
    const q = query(
      submissionsRef,
      where('classId', '==', classId),
      orderBy('submittedAt', 'desc')
    );

    const submissionsSnapshot = await getDocs(q);

    const submissions = [];
    submissionsSnapshot.forEach(doc => {
      submissions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Found ${submissions.length} submissions for class ${classId}`);
    return submissions;
  } catch (error) {
    console.error(`Error fetching submissions for class ${classId}:`, error);
    throw new Error(`Failed to fetch submissions for class: ${error.message}`);
  }
}

/**
 * Format answer based on question type
 */
export function formatAnswer(answer, question) {
  if (answer === undefined || answer === null) return '';

  switch (question.type) {
    case 'time':
      return String(answer);
    case 'number':
      return String(answer);
    case 'radio':
    case 'checkbox':
      return String(answer);
    case 'text':
      return String(answer);
    default:
      return String(answer);
  }
}

/**
 * Build rows for Excel export
 */
export function buildExcelRows(submissions) {
  const rows = [];

  submissions.forEach(submission => {
    // Handle both Timestamp and string dates
    let submittedAt = '';
    if (submission.submittedAt) {
      if (submission.submittedAt.toDate && typeof submission.submittedAt.toDate === 'function') {
        submittedAt = new Date(submission.submittedAt.toDate()).toLocaleString('he-IL');
      } else if (typeof submission.submittedAt === 'string') {
        submittedAt = new Date(submission.submittedAt).toLocaleString('he-IL');
      }
    }

    const row = {
      token: submission.studentToken || submission.id.substring(0, 6),
      classId: submission.classId || '',
      submittedAt: submittedAt,
      answers: submission.answers || {},
      submissionId: submission.id
    };

    rows.push(row);
  });

  return rows;
}

/**
 * Create Excel workbook using SheetJS library
 * Requires: npm install xlsx
 */
export async function createExcelWorkbook(submissions, questions) {
  try {
    // Dynamically import XLSX
    const XLSX = await import('xlsx');

    if (!XLSX) {
      throw new Error('XLSX library not found. Install with: npm install xlsx');
    }

    console.log('📊 Creating Excel workbook...');

    // Build headers
    const headers = [
      'קוד תלמיד',
      'כיתה',
      'תאריך שליחה'
    ];

    // Add question headers
    questions.forEach(q => {
      headers.push(q.text_he || q.id);
    });

    // Build data rows
    const dataRows = [];

    submissions.forEach(submission => {
      // Handle both Timestamp and string dates
      let submittedAt = '';
      if (submission.submittedAt) {
        if (submission.submittedAt.toDate && typeof submission.submittedAt.toDate === 'function') {
          submittedAt = new Date(submission.submittedAt.toDate()).toLocaleString('he-IL');
        } else if (typeof submission.submittedAt === 'string') {
          submittedAt = new Date(submission.submittedAt).toLocaleString('he-IL');
        }
      }

      const row = [
        submission.studentToken || submission.id.substring(0, 6),
        submission.classId || '',
        submittedAt
      ];

      // Add answers for each question
      questions.forEach(q => {
        const answer = submission.answers?.[q.id];
        row.push(formatAnswer(answer, q));
      });

      dataRows.push(row);
    });

    // Create worksheet
    const wsData = [headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = headers.map(header => {
      return { wch: Math.max(header.length + 2, 12) };
    });
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'תשובות');

    console.log(`✅ Workbook created with ${dataRows.length} rows`);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `sleepquest_submissions_${timestamp}.xlsx`;

    return { wb, filename };
  } catch (error) {
    console.error('Error creating Excel workbook:', error);
    throw new Error(`Failed to create workbook: ${error.message}`);
  }
}

/**
 * Download Excel file
 */
export async function downloadExcel(wb, filename) {
  try {
    console.log(`⬇️ Downloading ${filename}...`);

    const XLSX = await import('xlsx');

    if (!XLSX) {
      throw new Error('XLSX library not found');
    }

    XLSX.writeFile(wb, filename);
    console.log('✅ Download complete!');
  } catch (error) {
    console.error('Error downloading Excel:', error);
    throw new Error(`Failed to download file: ${error.message}`);
  }
}

/**
 * Main export function - orchestrates the entire process
 */
export async function exportStudentDataToExcel(db, classId = null) {
  try {
    console.log('📊 Starting Excel export...');

    // Verify db is valid
    if (!db) {
      throw new Error('Database not initialized. Check firebase configuration.');
    }

    // Fetch questions from Firestore
    const questions = await getQuestionsFromFirestore(db);

    if (questions.length === 0) {
      throw new Error('No approved questions found. Teacher questions need to be approved first.');
    }

    // Fetch submissions from Firestore
    let submissions;
    if (classId) {
      submissions = await getClassSubmissionsFromFirestore(db, classId);
    } else {
      submissions = await getStudentSubmissionsFromFirestore(db);
    }

    if (submissions.length === 0) {
      throw new Error('No student submissions found to export. Students need to submit answers first.');
    }

    // Create Excel workbook
    const { wb, filename } = await createExcelWorkbook(submissions, questions);

    // Download
    await downloadExcel(wb, filename);

    console.log('✅ Export complete!');

    return {
      success: true,
      filename,
      submissionCount: submissions.length,
      questionCount: questions.length
    };
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
}

/**
 * Export utility object
 */
export default {
  exportStudentDataToExcel,
  getQuestionsFromFirestore,
  getStudentSubmissionsFromFirestore,
  getClassSubmissionsFromFirestore,
  createExcelWorkbook,
  downloadExcel,
  buildExcelRows,
  formatAnswer
};