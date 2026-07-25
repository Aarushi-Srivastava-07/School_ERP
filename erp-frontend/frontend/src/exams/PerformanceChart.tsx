import type { FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ChartProps {
  subjects: { name: string; obtained: number }[];
}

const PerformanceChart: FC<ChartProps> = ({ subjects }) => {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={subjects} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: '#F3F4F6' }} />
          <Bar dataKey="obtained" radius={[4, 4, 0, 0]}>
            {subjects.map((_, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4F46E5' : '#818CF8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
