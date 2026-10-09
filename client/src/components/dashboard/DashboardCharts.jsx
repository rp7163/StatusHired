import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { STAGES_CONFIG } from '../../types/index.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { subWeeks, startOfWeek, endOfWeek, isWithinInterval, format } from 'date-fns';

export const DashboardCharts = ({ applications }) => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  const chartTheme = useMemo(() => {
    return {
      textColor: isDark ? '#8AA097' : '#54635B',
      tooltipBg: isDark ? '#0F1813' : '#FFFFFF',
      tooltipBorder: isDark ? '#1D2A23' : '#E1EBE5',
      tooltipText: isDark ? '#E8F5EE' : '#0C1A13',
      accentColor: '#10B981',
    };
  }, [isDark]);

  // 1. Applications over last 8 weeks (Soft Area Chart, minimal axes, no gridlines)
  const timelineData = useMemo(() => {
    const weeks = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const targetDate = subWeeks(now, i);
      const start = startOfWeek(targetDate, { weekStartsOn: 1 });
      const end = endOfWeek(targetDate, { weekStartsOn: 1 });

      const count = applications.filter((app) => {
        const appDate = new Date(app.created_at || app.applied_date || now);
        return isWithinInterval(appDate, { start, end });
      }).length;

      const label = i === 0 ? 'This week' : format(start, 'MMM d');
      weeks.push({ name: label, count });
    }

    return weeks;
  }, [applications]);

  // 2. Stage breakdown as thin horizontal bars using stage colors
  const stageData = useMemo(() => {
    const stages = ['saved', 'applied', 'assessment', 'interview', 'selected', 'rejected'];
    const total = applications.length || 1;
    return stages.map((st) => {
      const cfg = STAGES_CONFIG[st];
      const count = applications.filter((a) => a.stage === st).length;
      const percentage = applications.length > 0 ? Math.round((count / total) * 100) : 0;
      return {
        id: st,
        label: cfg.label,
        count,
        percentage,
        color: cfg.dotColor,
      };
    });
  }, [applications]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Chart 1: Applications Over Time (Soft Area Chart, single accent color, no gridlines, minimal axes) */}
      <div className="apple-card p-6 flex flex-col justify-between transition-colors">
        <div>
          <h4 className="font-bold text-[17px] text-[#0C1A13] dark:text-[#E8F5EE] tracking-tight">
            Applications
          </h4>
          <p className="text-[13px] text-[#54635B] dark:text-[#8AA097] mt-0.5 mb-6">Last 8 weeks activity</p>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="appleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke={chartTheme.textColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke={chartTheme.textColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  borderColor: chartTheme.tooltipBorder,
                  borderRadius: '14px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  color: chartTheme.tooltipText,
                  fontSize: '13px',
                  padding: '8px 12px',
                }}
              />

              <Area
                type="monotone"
                dataKey="count"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#appleAreaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Pipeline by stage as thin horizontal bars using stage colors */}
      <div className="apple-card p-6 flex flex-col justify-between transition-colors">
        <div>
          <h4 className="font-bold text-[17px] text-[#0C1A13] dark:text-[#E8F5EE] tracking-tight">
            Pipeline breakdown
          </h4>
          <p className="text-[13px] text-[#54635B] dark:text-[#8AA097] mt-0.5 mb-6">
            Distribution across stages
          </p>
        </div>

        <div className="space-y-3.5 flex-1 flex flex-col justify-center">
          {stageData.map((item) => (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />

                  <span className="font-medium text-[#0C1A13] dark:text-[#E8F5EE]">{item.label}</span>
                </div>
                <span className="text-[#54635B] dark:text-[#8AA097] tabular-nums">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#E1EBE5]/70 dark:bg-[#142019] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
