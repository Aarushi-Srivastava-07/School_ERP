import React from 'react';

interface Subject {
  name: string;
  maxMarks: number;
  obtained: number;
  grade: string;
}

interface MarksTableProps {
  subjects: Subject[];
}

const MarksTable: React.FC<MarksTableProps> = ({ subjects }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-gray-500 border-b border-gray-100">
            <th className="py-3 px-4 font-medium">Subject</th>
            <th className="py-3 px-4 font-medium">Max</th>
            <th className="py-3 px-4 font-medium">Obtained</th>
            <th className="py-3 px-4 font-medium">Grade</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {subjects.map((sub, idx) => (
            <tr key={idx} className="border-b border-gray-50">
              <td className="py-3 px-4 font-medium">{sub.name}</td>
              <td className="py-3 px-4">{sub.maxMarks}</td>
              <td className="py-3 px-4">{sub.obtained}</td>
              <td className="py-3 px-4 font-bold">{sub.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarksTable;