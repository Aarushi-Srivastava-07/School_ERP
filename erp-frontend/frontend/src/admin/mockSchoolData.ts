// const grades = ["LKG", "UKG", ...Array.from({length: 12}, (_, i) => `Grade ${i + 1}`)];
// const sections = ["A", "B", "C", "D", "E"];

// export const generateSchoolData = () => {
//   return grades.map(grade => ({
//     grade,
//     sections: sections.map(secName => ({
//       name: `${grade}-${secName}`,
//       classAvg: parseFloat((60 + Math.random() * 35).toFixed(2)),
//       topStudent: "Generated Student",
//       studentCount: 30 + Math.floor(Math.random() * 10)
//     }))
//   }));
// };

// export const mockSchoolResults = generateSchoolData();

const grades = ["LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];
const sections = ["A", "B", "C", "D", "E"];

// Helper to generate a random name
const getRandomName = () => {
  const names = ["Aarav", "Ishaan", "Priya", "Ananya", "Rohan", "Sneha", "Vikram", "Meera", "Karan", "Diya"];
  return names[Math.floor(Math.random() * names.length)];
};

export const generateSchoolData = () => {
  return grades.map((grade) => {
    const sectionsData = sections.map((secName) => {
      // 1. Generate 30-40 students per section
      const studentCount = 30 + Math.floor(Math.random() * 10);
      const students = Array.from({ length: studentCount }, () => ({
        name: getRandomName(),
        score: Math.floor(60 + Math.random() * 40), // Score between 60-100
      }));

      // 2. Sort students by score to determine rank
      const sortedStudents = [...students].sort((a, b) => b.score - a.score);

      return {
        name: `${grade}-${secName}`,
        classAvg: parseFloat(
          (sortedStudents.reduce((sum, s) => sum + s.score, 0) / studentCount).toFixed(2)
        ),
        students: sortedStudents, // List of all students ranked
        topStudents: sortedStudents.slice(0, 5), // Top 5 for quick preview
      };
    });

    // 3. Calculate Grade-wide Top Student (the best among all sections in this grade)
    const allGradeStudents = sectionsData.flatMap(s => s.students).sort((a, b) => b.score - a.score);
    
    return {
      grade,
      sections: sectionsData,
      gradeTopStudents: allGradeStudents.slice(0, 5) // Top 5 across the entire grade
    };
  });
};

export const mockSchoolResults = generateSchoolData();