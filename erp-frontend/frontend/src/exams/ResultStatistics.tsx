
import React from 'react';

interface ResultStatisticsProps {
  summary: {
    totalMarks: number;
    maxMarks: number;
    overallPercentage: number;
    overallGrade: string;
    studentRank: string;   // Added
    classAverage: string;  // Added
  };
}

const ResultStatistics: React.FC<ResultStatisticsProps> = ({ summary }) => {
  return (
    // Changed to lg:grid-cols-6 to fit all 6 cards nicely
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      
      {/* Existing Card 1: Total Marks */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Total Marks</p>
          <p className="text-xl font-bold text-gray-800">{summary.totalMarks} <span className="text-xs text-gray-400">/ {summary.maxMarks}</span></p>
        </div>
      </div>

      {/* Existing Card 2: Percentage */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Percentage</p>
          <p className="text-xl font-bold text-gray-800">{summary.overallPercentage}%</p>
        </div>
      </div>

      {/* Existing Card 3: Overall Grade */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Grade</p>
          <p className="text-xl font-bold text-gray-800">{summary.overallGrade}</p>
        </div>
      </div>

      {/* Existing Card 4: Status */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Status</p>
          <p className={`text-xl font-bold ${summary.overallGrade === 'F' ? 'text-red-600' : 'text-green-600'}`}>
            {summary.overallGrade === 'F' ? 'Failed' : 'Passed'}
          </p>
        </div>
      </div>

      {/* New Card 5: Student Rank */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Rank</p>
          <p className="text-xl font-bold text-gray-800">#{summary.studentRank}</p>
        </div>
      </div>

      {/* New Card 6: Class Average */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Class Avg</p>
          <p className="text-xl font-bold text-gray-800">{summary.classAverage}</p>
        </div>
      </div>

    </div>
  );
};

export default ResultStatistics;