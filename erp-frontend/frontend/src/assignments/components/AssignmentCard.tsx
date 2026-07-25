import React from 'react';

interface AssignmentCardProps {
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  role: 'teacher' | 'student';
  status?: string;
  onSubmit?: () => void;
  onViewWork?: () => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  title,
  description,
  dueDate,
  maxMarks,
  role,
  status,
  onSubmit,
  onViewWork
}) => {
  return (
    <div className="p-5 bg-white rounded-lg shadow-md border border-gray-100 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
            {maxMarks} Marks
          </span>
        </div>
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{description}</p>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
        <span className="text-gray-500">Due: {dueDate}</span>
        {role === 'teacher' ? (
          <button type="button" className="text-blue-600 hover:underline font-medium" onClick={onViewWork}>
            View Submissions
          </button>
        ) : (
          <button
            type="button"
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
            onClick={onSubmit}
          >
            {status === 'submitted' ? 'View Work' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
};