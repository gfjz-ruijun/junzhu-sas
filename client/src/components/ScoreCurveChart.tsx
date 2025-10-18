import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from "recharts";

interface ExamRecord {
  id: string;
  subjectId: string;
  examDate: string;
  examType: string;
  totalScore: number;
  actualScore: number;
  scoreRatio: string | number;
  difficulty: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

interface ScoreCurveChartProps {
  records: ExamRecord[];
}

export default function ScoreCurveChart({ records }: ScoreCurveChartProps) {
  // 准备图表数据
  const chartData = records.map((record, index) => ({
    index,
    date: record.examDate,
    examType: record.examType,
    difficulty: record.difficulty,
    scoreRatio: parseFloat(record.scoreRatio as string) * 100,
    actualScore: record.actualScore,
    totalScore: record.totalScore,
  }));

  // 计算平均成绩比值
  const avgRatio =
    chartData.length > 0
      ? (chartData.reduce((sum, item) => sum + item.scoreRatio, 0) / chartData.length).toFixed(1)
      : 0;

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{data.date}</p>
          <p className="text-sm text-gray-600">考试类型: {data.examType}</p>
          <p className="text-sm text-gray-600">难度: {data.difficulty}</p>
          <p className="text-sm text-blue-600 font-semibold">成绩比值: {data.scoreRatio.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">
            {data.actualScore}/{data.totalScore}
          </p>
        </div>
      );
    }
    return null;
  };

  // 创建自定义点，难题用红色标记
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const isHard = payload.difficulty === "困难";
    const color = isHard ? "#ef4444" : "#3b82f6";
    const radius = isHard ? 7 : 5;

    return (
      <g>
        <circle cx={cx} cy={cy} r={radius} fill={color} stroke="white" strokeWidth={2} />
        {isHard && (
          <text
            x={cx}
            y={cy - 15}
            textAnchor="middle"
            fill="#ef4444"
            fontSize="12"
            fontWeight="bold"
          >
            难
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: "考试日期", position: "insideBottomRight", offset: -5 }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#6b7280"
            label={{ value: "成绩比值(%)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
          />
          {/* 平均线 */}
          <ReferenceLine
            y={parseFloat(avgRatio as string)}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            label={{
              value: `平均: ${avgRatio}%`,
              position: "right",
              fill: "#6b7280",
              fontSize: 12,
            }}
          />
          {/* 90%及格线 */}
          <ReferenceLine
            y={90}
            stroke="#10b981"
            strokeDasharray="5 5"
            opacity={0.5}
            label={{
              value: "优秀(90%)",
              position: "right",
              fill: "#10b981",
              fontSize: 11,
            }}
          />
          {/* 80%良好线 */}
          <ReferenceLine
            y={80}
            stroke="#3b82f6"
            strokeDasharray="5 5"
            opacity={0.5}
            label={{
              value: "良好(80%)",
              position: "right",
              fill: "#3b82f6",
              fontSize: 11,
            }}
          />
          <Line
            type="monotone"
            dataKey="scoreRatio"
            stroke="#3b82f6"
            dot={<CustomDot />}
            activeDot={{ r: 8 }}
            strokeWidth={2.5}
            name="成绩比值"
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* 统计信息 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">总考试次数</p>
          <p className="text-2xl font-bold text-blue-600">{chartData.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">平均成绩</p>
          <p className="text-2xl font-bold text-green-600">{avgRatio}%</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">最高成绩</p>
          <p className="text-2xl font-bold text-purple-600">
            {chartData.length > 0
              ? Math.max(...chartData.map((d) => d.scoreRatio)).toFixed(1)
              : "0"}
            %
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">最低成绩</p>
          <p className="text-2xl font-bold text-red-600">
            {chartData.length > 0
              ? Math.min(...chartData.map((d) => d.scoreRatio)).toFixed(1)
              : "0"}
            %
          </p>
        </div>
      </div>

      {/* 成绩等级说明 */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">成绩等级划分</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-700">100%</div>
            <div className="text-xs text-gray-600">满分</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-green-600">90-99%</div>
            <div className="text-xs text-gray-600">优秀</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-blue-600">80-89%</div>
            <div className="text-xs text-gray-600">良好</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-yellow-600">70-79%</div>
            <div className="text-xs text-gray-600">及格</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-red-600">&lt;70%</div>
            <div className="text-xs text-gray-600">需改进</div>
          </div>
        </div>
      </div>
    </div>
  );
}

