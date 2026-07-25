import React, { useState } from 'react';
import { AssignmentCard } from '../components/AssignmentCard';
import StudentSubmitAssignment from './StudentSubmitAssignment';

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number;
  status: 'pending' | 'submitted';
};


export const StudentDashboard: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted'>('all');
  const [submitOpen, setSubmitOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);

  const mockAssignments: Assignment[] = [
    {
      id: '1',
      title: 'Quadratic Equations Homework',
      description: 'Solve problems 1 to 10 from Chapter 4. Show all steps neatly in your notebook and upload a PDF scan.',
      dueDate: '2026-07-05',
      maxMarks: 100,
      status: 'pending',
    },
    {
      id: '2',
      title: 'Physics Lab Report',
      description: 'Submit your practical experiment report on Ohm\'s Law. Include the circuit diagram, observations table, and conclusion.',
      dueDate: '2026-06-28',
      maxMarks: 50,
      status: 'submitted',
    },
    {
      id: '3',
      title: 'English Essay - Tech Evolution',
      description: 'Write a 500-word essay on how Artificial Intelligence is altering modern classroom learning dynamics.',
      dueDate: '2026-07-12',
      maxMarks: 20,
      status: 'pending',
    }
  ];

  const filteredAssignments = mockAssignments.filter((assignment) => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Assignments</h1>
          <p className="text-gray-500 mt-1">Track your homework, deadlines, and submission statuses.</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 self-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              filter === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              filter === 'pending' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              filter === 'submitted' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">No assignments found matching this status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              title={assignment.title}
              description={assignment.description}
              dueDate={assignment.dueDate}
              maxMarks={assignment.maxMarks}
              role="student"
              status={assignment.status}
              onSubmit={() => {
                setActiveAssignment(assignment);
                setSubmitOpen(true);
              }}
            />
          ))}
        </div>
      )}
        {submitOpen && activeAssignment && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
              <StudentSubmitAssignment
                assignmentId={activeAssignment.id}
                assignmentTitle={activeAssignment.title}
                onClose={() => setSubmitOpen(false)}
              />
            </div>
          </div>
        )}

    </div>
  );
};