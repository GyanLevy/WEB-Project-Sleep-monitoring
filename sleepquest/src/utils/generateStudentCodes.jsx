/**
 * generateStudentCodes.jsx
 * 
 * Utility functions for generating and validating student codes
 */

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Generate unique student codes
 * @param {number} count - Number of codes to generate
 * @returns {Promise<string[]>} Array of unique student codes
 */
export async function generateStudentCodes(count) {
  const codes = [];
  const existingCodes = await getExistingCodes();

  while (codes.length < count) {
    const code = generateRandomCode();
    
    // Ensure uniqueness
    if (!codes.includes(code) && !existingCodes.has(code)) {
      codes.push(code);
    }
  }

  return codes;
}

/**
 * Generate a single random code
 * Format: 6 uppercase alphanumeric characters (e.g., "A1B2C3")
 */
function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Get all existing student codes from Firestore
 * @returns {Promise<Set<string>>} Set of existing codes
 */
async function getExistingCodes() {
  try {
    const studentsRef = collection(db, 'students');
    const snapshot = await getDocs(studentsRef);
    const codes = new Set(snapshot.docs.map(doc => doc.id));
    return codes;
  } catch (error) {
    console.error('Error fetching existing codes:', error);
    return new Set();
  }
}

/**
 * Validate class name format
 * Must match pattern: class_XXX where XXX is a number
 * @param {string} className - Class name to validate
 * @returns {boolean} True if valid
 */
export function validateClassName(className) {
  const pattern = /^class_\d+$/i;
  return pattern.test(className.trim());
}

/**
 * Format codes for display/download
 * @param {string[]} codes - Array of student codes
 * @returns {string} Formatted string with numbered codes
 */
export function formatCodesForDisplay(codes) {
  if (!codes || codes.length === 0) {
    return 'No codes generated';
  }

  return codes.map((code, index) => `${index + 1}. ${code}`).join('\n');
}
