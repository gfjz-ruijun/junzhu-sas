import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface ExamRecord {
  id: string;
  examDate: string;
  scoreRatio: string | number;
  ranking?: number;
}

interface SubjectPreviewCardProps {
  name: string;
  examRecords: ExamRecord[];
  onClick: () => void;
}

export default function SubjectPreviewCard({
  name,
  examRecords,
  onClick,
}: SubjectPreviewCardProps) {
  // 计算成绩趋势
  const scoreData = examRecords.slice(-5).map((record) => ({
    date: record.examDate.slice(-5),
    score: parseFloat(record.scoreRatio as string) * 100,
  }));

  // 计算排名趋势
  const rankingData = examRecords
    .filter((r) => r.ranking)
    .slice(-5)
    .map((record) => ({
      date: record.examDate.slice(-5),
      ranking: record.ranking,
    }));

  // 判断成绩趋势
  const getScoreTrend = () => {
    if (scoreData.length < 2) return "none";
    let upCount = 0,
      downCount = 0;
    for (let i = 1; i < scoreData.length; i++) {
      const curr = scoreData[i]?.score ?? 0;
      const prev = scoreData[i - 1]?.score ?? 0;
      if (curr > prev) upCount++;
      else if (curr < prev) downCount++;
    }
    if (upCount > downCount) return "up";
    if (downCount > upCount) return "down";
    return "fluctuate";
  };

  // 判断排名趋势
  const getRankingTrend = () => {
    if (rankingData.length < 2) return "none";
    let upCount = 0,
      downCount = 0;
    for (let i = 1; i < rankingData.length; i++) {
      const curr = rankingData[i]?.ranking ?? 0;
      const prev = rankingData[i - 1]?.ranking ?? 0;
      if (curr < prev) upCount++; // 排名数字小=排名上升
      else if (curr > prev) downCount++;
    }
    if (upCount > downCount) return "up";
    if (downCount > upCount) return "down";
    return "fluctuate";
  };

  const scoreTrend = getScoreTrend();
  const rankingTrend = getRankingTrend();

  const getScoreTrendColor = () => {
    switch (scoreTrend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      case "fluctuate":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getScoreTrendBg = () => {
    switch (scoreTrend) {
      case "up":
        return "bg-green-50";
      case "down":
        return "bg-red-50";
      case "fluctuate":
        return "bg-blue-50";
      default:
        return "bg-gray-50";
    }
  };

  const getRankingLineColor = () => {
    switch (rankingTrend) {
      case "up":
        return "#10b981";
      case "down":
        return "#ef4444";
      default:
        return "#3b82f6";
    }
  };

  return (
    <Card
      onClick={onClick}
      className={`hover:shadow-lg transition-all cursor-pointer ${getScoreTrendBg()}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 成绩趋势 */}
        {scoreData.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">成绩趋势</h4>
              <div className={`flex items-center gap-1 text-sm font-semibold ${getScoreTrendColor()}`}>
                {scoreTrend === "up" && (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    上升
                  </>
                )}
                {scoreTrend === "down" && (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    下降
                  </>
                )}
                {scoreTrend === "fluctuate" && <span>波动</span>}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={scoreData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => `${Number(value).toFixed(1)}%`}
                  contentStyle={{ fontSize: "12px" }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={
                    scoreTrend === "up"
                      ? "#10b981"
                      : scoreTrend === "down"
                        ? "#ef4444"
                        : "#3b82f6"
                  }
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 排名趋势 */}
        {rankingData.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">排名趋势</h4>
              <div className={`text-sm font-semibold`} style={{ color: getRankingLineColor() }}>
                {rankingTrend === "up" && "上升"}
                {rankingTrend === "down" && "下降"}
                {rankingTrend === "fluctuate" && "波动"}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={rankingData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tick={{ fontSize: 11 }}
                  reversed
                />
                <Tooltip
                  formatter={(value) => `排名: ${value}`}
                  contentStyle={{ fontSize: "12px" }}
                />
                <Line
                  type="monotone"
                  dataKey="ranking"
                  stroke={getRankingLineColor()}
                  dot={false}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 统计信息 */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-600">考试次数</p>
            <p className="text-lg font-bold text-gray-900">{examRecords.length}</p>
          </div>
          {scoreData.length > 0 && (
            <div>
              <p className="text-xs text-gray-600">最新成绩</p>
              <p className="text-lg font-bold text-blue-600">
                {(scoreData[scoreData.length - 1]?.score ?? 0).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

