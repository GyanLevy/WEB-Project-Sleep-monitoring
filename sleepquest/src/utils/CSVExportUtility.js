/**
 * CSV Export Utility for SleepQuest (Hebrew Version)
 * 
 * This utility demonstrates the admin function for exporting
 * anonymous sleep diary data to CSV format.
 * 
 * Data structure:
 * - Each row represents one diary submission (one day)
 * - Each column represents a question
 * - Token column for anonymous identification
 * - Date column for submission date
 */

import questionsData from '../data/questions.json';

/**
 * Get all question headers for CSV columns (Hebrew)
 */
export function getQuestionHeaders() {
  return questionsData.map(q => q.text_he);
}

/**
 * Get all question IDs in order
 */
export function getQuestionIds() {
  return questionsData.map(q => q.id);
}

/**
 * Convert a single response to a CSV row
 */
export function responseToRow(response, questionIds, token) {
  const row = [
    token,                              // Anonymous token
    response.date,                       // Submission date
    response.submittedAt || '',          // Timestamp
  ];

  // Add each answer in order of questions
  questionIds.forEach(qId => {
    const answer = response.answers[qId];
    row.push(answer !== undefined ? String(answer) : '');
  });

  return row;
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert array of rows to CSV string
 */
function rowsToCSV(headers, rows) {
  const headerLine = headers.map(escapeCSVValue).join(',');
  const dataLines = rows.map(row => row.map(escapeCSVValue).join(','));
  return [headerLine, ...dataLines].join('\n');
}

/**
 * Export responses to CSV format
 * 
 * @param {Array} responses - Array of response objects from AuthContext
 * @param {string} token - Anonymous token
 * @returns {Object} - { csv: string, filename: string }
 */
export function exportToCSV(responses, token) {
  const questionIds = getQuestionIds();
  const questionHeaders = getQuestionHeaders();
  
  // Build headers (Hebrew)
  const headers = [
    'קוד גישה',
    'תאריך',
    'זמן שליחה',
    ...questionHeaders
  ];
  
  // Build rows
  const rows = responses.map(response => 
    responseToRow(response, questionIds, token)
  );
  
  // Generate CSV string
  const csv = rowsToCSV(headers, rows);
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `sleepquest_export_${token}_${timestamp}.csv`;
  
  return { csv, filename };
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csv, filename) {
  // Add BOM for Excel Hebrew support
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}

/**
 * Mock admin function to export all data
 * In a real implementation, this would aggregate data from Firestore
 */
export function mockAdminExport() {
  const questionIds = getQuestionIds();
  const questionHeaders = getQuestionHeaders();

  const mockData = {
    students: [
      {
        token: '123456',
        responses: [
          {
            date: '2024-01-15',
            submittedAt: '2024-01-15T08:30:00Z',
            answers: {
              q1: '22:30',
              q2: '22:45',
              q3: 'לא',
              q5: '07:00',
              q6: 15,
              q7: 'לא',
              q8: 'לא',
              q9: '4-טוב',
              q10: 'כן'
            }
          }
        ]
      }
    ]
  };

  // Build headers
  const headers = [
    'קוד גישה',
    'תאריך',
    'זמן שליחה',
    ...questionHeaders
  ];

  // Build all rows
  const allRows = [];
  mockData.students.forEach(student => {
    student.responses.forEach(response => {
      const row = [
        student.token,
        response.date,
        response.submittedAt,
        ...questionIds.map(qId => response.answers[qId] ?? '')
      ];
      allRows.push(row);
    });
  });

  const csv = rowsToCSV(headers, allRows);
  const filename = `sleepquest_admin_export_${new Date().toISOString().split('T')[0]}.csv`;

  return { csv, filename, rowCount: allRows.length };
}

export default {
  exportToCSV,
  downloadCSV,
  mockAdminExport,
  getQuestionHeaders,
  getQuestionIds
};
