import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { formatCodesForDisplay } from "../utils/generateStudentCodes";

export default function ClassStudentCodes({ teacherState }) {
  const [allCodes, setAllCodes] = useState([]);
  const [unusedCodes, setUnusedCodes] = useState([]);
  const [usedCodes, setUsedCodes] = useState([]);
  const [classData, setClassData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTeacherData();
  }, [teacherState]);

  const loadTeacherData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Use teacherState directly from props
      if (!teacherState) {
        setError("❌ Teacher data not available");
        setIsLoading(false);
        return;
      }

      // Get all teacher codes
      const codes = teacherState.studentCodes || [];
      setAllCodes(codes);

      // Get class data if teacher has a class
      if (teacherState.classId) {
        const classesRef = collection(db, "classes");
        const classesSnapshot = await getDocs(classesRef);
        const classDoc = classesSnapshot.docs.find(
          (doc) => doc.id === teacherState.classId,
        );

        if (classDoc) {
          setClassData(classDoc.data());
        }

        // Check which codes have been used (check lastSubmissionDate)
        await checkCodeUsage(codes);
      } else {
        // No class assigned - all codes are unused
        setUnusedCodes(codes);
        setUsedCodes([]);
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Error loading teacher data:", err);
      setError(`❌ Failed to load data: ${err.message}`);
      setIsLoading(false);
    }
  };

  const checkCodeUsage = async (codes) => {
    try {
      const unused = [];
      const used = [];

      // Get all students in this teacher's class
      const studentsRef = collection(db, "students");
      const classStudentsSnapshot = await getDocs(
        query(studentsRef, where("classId", "==", teacherState.classId)),
      );

      // Check each student's lastSubmissionDate
      classStudentsSnapshot.docs.forEach((doc) => {
        const studentData = doc.data();
        const code = doc.id;

        // If code is in our codes list
        if (codes.includes(code)) {
          // Check if lastSubmissionDate is null
          if (!studentData.lastSubmissionDate) {
            unused.push(code);
          } else {
            used.push(code);
          }
        }
      });

      codes.forEach((code) => {
        if (!unused.includes(code) && !used.includes(code)) {
          unused.push(code);
        }
      });

      setUnusedCodes(unused);
      setUsedCodes(used);
      console.log(
        `✅ ${unused.length} unused codes, ${used.length} used codes`,
      );
    } catch (err) {
      console.error("Error checking code usage:", err);
      setError(`❌ Failed to check code usage: ${err.message}`);
    }
  };

  // Copy single code
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Print codes
  const handlePrintCodes = () => {
    const printWindow = window.open("", "", "height=600,width=800");
    const html = `
      <html>
        <head>
          <title>Unused Student Codes - ${classData?.name || "Class"}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .codes { columns: 2; column-gap: 30px; }
            .code { 
              font-size: 18px; 
              font-weight: bold; 
              padding: 10px; 
              margin: 5px 0;
              border: 1px solid #ddd;
              border-radius: 4px;
              background: #f9f9f9;
              font-family: monospace;
            }
            @media print {
              body { margin: 0; padding: 10mm; }
            }
          </style>
        </head>
        <body>
          <h1>${classData?.name || "Student Codes"}</h1>
          <p>Unused Codes: ${unusedCodes.length} | Generated: ${new Date().toLocaleDateString()}</p>
          <div class="codes">
            ${unusedCodes.map((code, idx) => `<div class="code">${idx + 1}. ${code}</div>`).join("")}
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  // Filter codes based on search
  const filteredCodes = unusedCodes.filter((code) => code.includes(searchTerm));

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 p-8 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Checking code usage...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-6">
        <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          📋 קודים לסטודנט שלא מומשו
        </h1>
        {classData && (
          <p className="text-slate-600 dark:text-slate-400">
            {unusedCodes.length} קודים שלא מומשו • {classData.name}
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            {allCodes.length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Total Codes
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {unusedCodes.length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Unused (Available)
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {usedCodes.length}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Used (Students signed up)
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <button
          onClick={handlePrintCodes}
          disabled={unusedCodes.length === 0}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition"
        >
          🖨️ הדפס
        </button>
        <button
          onClick={loadTeacherData}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition"
        >
          🔄 רענן
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="חיפוש קוד שלא מומש..."
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Codes Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden mb-8">
        {unusedCodes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              כל הקודים מומשו!
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              All {allCodes.length} כל הקודים מומשו! 🌟
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-6">
            {filteredCodes.length > 0 ? (
              filteredCodes.map((code) => (
                <div
                  key={code}
                  onClick={() => handleCopyCode(code)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition transform hover:scale-105 ${
                    copiedCode === code
                      ? "bg-green-100 dark:bg-green-500/20 border-green-400"
                      : "bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-indigo-400"
                  }`}
                >
                  <div className="font-mono font-bold text-center text-slate-900 dark:text-white text-sm">
                    {code}
                  </div>
                  <div className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1">
                    {copiedCode === code ? "✅ Copied!" : "Click to copy"}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-slate-500 dark:text-slate-400">
                לא נמצא קוד שלא מומש"{searchTerm}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
