
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ChartData } from '../types';

interface TimeDistributionChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const totalMinutes = data.value;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return (
            <div className="p-2 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
                <p className="font-bold text-gray-100">{`${data.name}`}</p>
                <p className="text-sm text-gray-300">{`Total: ${hours}h ${minutes}m`}</p>
            </div>
        );
    }
    return null;
};


export const TimeDistributionChart: React.FC<TimeDistributionChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
        <div className="flex items-center justify-center h-full min-h-[300px]">
            <p className="text-gray-400">Log some time to see your distribution.</p>
        </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
