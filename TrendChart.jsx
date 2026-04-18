import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const TrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="trend-chart-container glass empty">
        <p>Awaiting additional data points for trend analysis...</p>
      </div>
    );
  }

  // If only one data point, we simulate a small trend or just show the point
  const displayData = data.length === 1 
    ? [{ date: 'Start', revenue: 0, profit: 0 }, ...data]
    : data;

  return (
    <div className="trend-chart-container glass">
      <header className="chart-header">
        <h3>Financial Performance Trend</h3>
        <div className="chart-legend">
          <span className="legend-item"><span className="dot revenue"></span> Revenue</span>
          <span className="legend-item"><span className="dot profit"></span> Profit</span>
        </div>
      </header>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={displayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--foreground-rgb), 0.1)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="hsla(var(--foreground-rgb), 0.5)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsla(var(--foreground-rgb), 0.5)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsla(var(--background-rgb), 0.8)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid hsla(var(--foreground-rgb), 0.1)',
                borderRadius: '12px',
                color: 'hsl(var(--foreground))'
              }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--accent))" 
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              strokeWidth={3}
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="hsl(var(--success))" 
              fillOpacity={1} 
              fill="url(#colorProfit)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendChart;
