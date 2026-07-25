import React from 'react';
import { AssignmentCard } from '../components/AssignmentCard';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  submissionCount: number;
}

export const TeacherDashboard: React.FC = () => {
  const mockCreatedAssignments: Assignment[] = [
    {
      id: '1',
      title: 'Quadratic Equations Homework',
      description: 'Solve problems 1 to 10 from Chapter 4. Show all steps neatly in your notebook and upload a PDF scan.',
      dueDate: '2026-07-05',
      maxMarks: 100,
      submissionCount: 14,
    },
    {
      id: '2',
      title: 'Physics Lab Report',
      description: 'Submit your practical experiment report on Ohm\'s Law. Include the circuit diagram, observations table, and conclusion.',
      dueDate: '2026-06-28',
      maxMarks: 50,
      submissionCount: 28,
    }
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage created assignments and review student submissions.</p>
        </div>

        <button 
          onClick={() => (window.location.href = "/teacher/assignments/create")}
          className="bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-blue-700 transition self-start"
        >
          + New Assignment
        </button>
      </div>

      {mockCreatedAssignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">You haven't posted any assignments yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCreatedAssignments.map((assignment) => (
            <div key={assignment.id} className="relative">
              <AssignmentCard
                title={assignment.title}
                description={assignment.description}
                dueDate={assignment.dueDate}
                maxMarks={assignment.maxMarks}
                role="teacher"
              />
              <div className="absolute top-4 right-24 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                {assignment.submissionCount} Turned In
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};