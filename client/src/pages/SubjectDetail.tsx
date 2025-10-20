import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Plus, Trash2, ArrowLeft, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState, useEffect } from "react";
import ScoreCurveChart from "@/components/ScoreCurveChart";
import DatePicker from "@/components/DatePicker";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SubjectDetail({ params }: { params: { subjectId: string } }) {
  const subjectId = params.subjectId;
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    examDate: new Date().toISOString().split("T")[0],
    examType: "月考" as const,
    totalScore: 100,
    actualScore: 0,
    difficulty: "中等" as const,
    ranking: 0,
    totalStudents: 0,
  });

  // 获取学科信息
  const { data: subjects = [] } = trpc.subjects.list.useQuery(undefined, { enabled: isAuthenticated });
  const subject = subjects.find((s) => s.id === subjectId);

  // 获取考试记录
  const { data: examRecords = [], refetch: refetchExams } = trpc.examRecords.list.useQuery(
    { subjectId },
    { enabled: isAuthenticated && !!subjectId }
  );

  // 获取排名数据
  const [rankingData, setRankingData] = useState<Record<string, any>>({});

  // 获取排名数据 - 为每个考试记录单独查询
  const rankingQueries = examRecords.map((exam) =>
    trpc.examRankings.get.useQuery(
      { examRecordId: exam.id },
      { enabled: isAuthenticated && !!exam.id }
    )
  );

  useEffect(() => {
    const rankings: Record<string, any> = {};
    examRecords.forEach((exam, index) => {
      const query = rankingQueries[index];
      if (query?.data) {
        rankings[exam.id] = query.data;
      }
    });
    setRankingData(rankings);
  }, [rankingQueries]);

  // 创建考试记录
  const createExamMutation = trpc.examRecords.create.useMutation({
    onSuccess: () => {
      setFormData({
        examDate: new Date().toISOString().split("T")[0],
        examType: "月考" as const,
        totalScore: 100,
        actualScore: 0,
        difficulty: "中等" as const,
        ranking: 0,
        totalStudents: 0,
      });
      setIsDialogOpen(false);
      refetchExams();
    },
  });

  // 保存排名
  const saveRankingMutation = trpc.examRankings.upsert.useMutation();

  // 删除考试记录
  const deleteExamMutation = trpc.examRecords.delete.useMutation({
    onSuccess: () => {
      refetchExams();
    },
  });

  // 删除排名
  const deleteRankingMutation = trpc.examRankings.delete.useMutation();

  const handleCreateExam = async () => {
    if (formData.actualScore > formData.totalScore) {
      alert("实际得分不能大于卷面总分");
      return;
    }
    
    try {
      // 先创建考试记录
      await createExamMutation.mutateAsync({
        subjectId,
        examDate: formData.examDate,
        examType: formData.examType as any,
        totalScore: formData.totalScore,
        actualScore: formData.actualScore,
        difficulty: formData.difficulty as any,
      });
      
      // 然后保存排名（如果有）
      if (formData.ranking > 0) {
        // 等待考试记录刷新，然后获取最新的考试ID
        setTimeout(async () => {
          const latestExam = examRecords[examRecords.length - 1];
          if (latestExam) {
            await saveRankingMutation.mutateAsync({
              examRecordId: latestExam.id,
              ranking: formData.ranking,
              totalStudents: formData.totalStudents,
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error("Failed to create exam:", error);
    }
  };

  const handleDeleteExam = (id: string) => {
    if (confirm("u786e定u8981删除这条记录吗？")) {
      deleteExamMutation.mutate({ id });
      deleteRankingMutation.mutateAsync({ examRecordId: id }).catch(() => {});
    }
  };

  // 计算成绩趋势
  const calculateScoreTrend = () => {
    if (examRecords.length < 2) return "none";
    const lastFive = examRecords.slice(-5);
    let upCount = 0,
      downCount = 0;
    for (let i = 1; i < lastFive.length; i++) {
      const curr = parseFloat(lastFive[i].scoreRatio as string);
      const prev = parseFloat(lastFive[i - 1].scoreRatio as string);
      if (curr > prev) upCount++;
      else if (curr < prev) downCount++;
    }
    if (upCount > downCount) return "up";
    if (downCount > upCount) return "down";
    return "fluctuate";
  };

  // 计算排名趋势
  const calculateRankingTrend = () => {
    const rankedExams = examRecords.filter((e) => rankingData[e.id]);
    if (rankedExams.length < 2) return "none";
    const lastFive = rankedExams.slice(-5);
    let upCount = 0,
      downCount = 0;
    for (let i = 1; i < lastFive.length; i++) {
      const curr = rankingData[lastFive[i].id]?.ranking || 0;
      const prev = rankingData[lastFive[i - 1].id]?.ranking || 0;
      if (curr < prev) upCount++; // 排名数字小 = 排名上升
      else if (curr > prev) downCount++;
    }
    if (upCount > downCount) return "up";
    if (downCount > upCount) return "down";
    return "fluctuate";
  };

  // 获取排名变化
  const getRankingChange = (examId: string, index: number) => {
    if (index === 0) return null;
    const currentRanking = rankingData[examId]?.ranking;
    const prevRanking = rankingData[examRecords[index - 1]?.id]?.ranking;
    if (!currentRanking || !prevRanking) return null;
    const change = prevRanking - currentRanking;
    return change;
  };

  const scoreTrend = calculateScoreTrend();
  const rankingTrend = calculateRankingTrend();

  const getBackgroundGradient = () => {
    switch (scoreTrend) {
      case "up":
        return "bg-gradient-to-br from-green-50 to-green-100";
      case "down":
        return "bg-gradient-to-br from-red-50 to-red-100";
      case "fluctuate":
        return "bg-gradient-to-br from-blue-50 to-blue-100";
      default:
        return "bg-gray-50";
    }
  };

  const getTrendMessage = () => {
    switch (scoreTrend) {
      case "up":
        return "✓ 分数呈上升趋势";
      case "down":
        return "⚠ 分数呈下降趋势";
      case "fluctuate":
        return "~ 分数波动";
      default:
        return "";
    }
  };

  const rankingChartData = examRecords
    .filter((exam) => rankingData[exam.id])
    .map((exam) => ({
      date: exam.examDate.slice(-5),
      ranking: rankingData[exam.id]?.ranking || 0,
    }));

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">学科不存在</p>
          <Button onClick={() => setLocation("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getBackgroundGradient()} transition-colors duration-500 animate-fade-in`}>
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200 animate-slide-in-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                添加考试成绩
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>添加考试成绩</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">考试日期</label>
                  <DatePicker
                    value={formData.examDate}
                    onChange={(date) => setFormData({ ...formData, examDate: date })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">考试类型</label>
                  <Select value={formData.examType} onValueChange={(value: any) => setFormData({ ...formData, examType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="小测">小测</SelectItem>
                      <SelectItem value="周测">周测</SelectItem>
                      <SelectItem value="月考">月考</SelectItem>
                      <SelectItem value="期中考">期中考</SelectItem>
                      <SelectItem value="期末考">期末考</SelectItem>
                      <SelectItem value="模拟考">模拟考</SelectItem>
                      <SelectItem value="中考">中考</SelectItem>
                      <SelectItem value="高考">高考</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">卷面总分</label>
                    <Input
                      type="number"
                      value={formData.totalScore}
                      onChange={(e) => setFormData({ ...formData, totalScore: parseFloat(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">实际得分</label>
                    <Input
                      type="number"
                      value={formData.actualScore}
                      onChange={(e) => setFormData({ ...formData, actualScore: parseFloat(e.target.value) || 0 })}
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">难易程度</label>
                  <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="简单">简单</SelectItem>
                      <SelectItem value="中等">中等</SelectItem>
                      <SelectItem value="困难">困难</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">班级排名</label>
                    <Input
                      type="number"
                      value={formData.ranking || ""}
                      onChange={(e) => setFormData({ ...formData, ranking: parseFloat(e.target.value) || 0 })}
                      min="0"
                      placeholder="可选"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">班级总人数</label>
                    <Input
                      type="number"
                      value={formData.totalStudents || ""}
                      onChange={(e) => setFormData({ ...formData, totalStudents: parseFloat(e.target.value) || 0 })}
                      min="0"
                      placeholder="可选"
                    />
                  </div>
                </div>

                <Button onClick={handleCreateExam} disabled={createExamMutation.isPending} className="w-full">
                  {createExamMutation.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 趋势提示 */}
      {getTrendMessage() && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm font-medium">
            {scoreTrend === "up" && <TrendingUp className="w-5 h-5 text-green-600" />}
            {scoreTrend === "down" && <TrendingDown className="w-5 h-5 text-red-600" />}
            <span className={scoreTrend === "up" ? "text-green-600" : scoreTrend === "down" ? "text-red-600" : "text-blue-600"}>
              {getTrendMessage()}
            </span>
          </div>
        </div>
      )}

      {/* 主内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {examRecords.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">还没有添加任何考试成绩</p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                添加第一条成绩
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* 成绩曲线 */}
            <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle>成绩趋势分析</CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreCurveChart records={examRecords} />
              </CardContent>
            </Card>

            {/* 排名曲线 */}
            {rankingChartData.length > 0 && (
              <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <CardTitle>排名趋势分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={rankingChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis reversed domain={["dataMin - 2", "dataMax + 2"]} />
                      <Tooltip formatter={(value) => `排名: ${value}`} />
                      <Line
                        type="monotone"
                        dataKey="ranking"
                        stroke={rankingTrend === "up" ? "#10b981" : rankingTrend === "down" ? "#ef4444" : "#3b82f6"}
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* 考试记录列表 */}
            <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle>考试记录</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {examRecords.map((exam, index) => {
                    const ranking = rankingData[exam.id];
                    const rankingChange = getRankingChange(exam.id, index);

                    return (
                      <div key={exam.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">{exam.examDate}</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              {exam.examType}
                            </span>
                            {exam.difficulty === "困难" && (
                              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">难</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">成绩比值</p>
                              <p className="font-semibold text-lg text-blue-600">
                                {(parseFloat(exam.scoreRatio as string) * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">得分</p>
                              <p className="font-semibold">
                                {exam.actualScore}/{exam.totalScore}
                              </p>
                            </div>
                            {ranking && (
                              <>
                                <div>
                                  <p className="text-gray-600">班级排名</p>
                                  <p className="font-semibold">
                                    {ranking.ranking}/{ranking.totalStudents}
                                  </p>
                                </div>
                                {rankingChange !== null && (
                                  <div>
                                    <p className="text-gray-600">排名变化</p>
                                    <p className={`font-semibold flex items-center gap-1 ${rankingChange > 0 ? "text-green-600" : rankingChange < 0 ? "text-red-600" : "text-gray-600"}`}>
                                      {rankingChange > 0 && (
                                        <>
                                          <ArrowUpRight className="w-4 h-4" />
                                          上升 {rankingChange} 名
                                        </>
                                      )}
                                      {rankingChange < 0 && (
                                        <>
                                          <ArrowDownRight className="w-4 h-4" />
                                          下降 {Math.abs(rankingChange)} 名
                                        </>
                                      )}
                                      {rankingChange === 0 && "持平"}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExam(exam.id)}
                          disabled={deleteExamMutation.isPending}
                          className="ml-4"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

