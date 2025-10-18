import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Plus, Trash2, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import ScoreCurveChart from "@/components/ScoreCurveChart";

export default function SubjectDetail({ params }: { params: { subjectId: string } }) {
  const subjectId = params.subjectId;
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    examDate: "",
    examType: "小测" as const,
    totalScore: "",
    actualScore: "",
    difficulty: "中等" as const,
  });

  // 获取学科信息
  const { data: subjects = [] } = trpc.subjects.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const subject = subjects.find((s) => s.id === subjectId);

  // 获取考试记录
  const { data: examRecords = [], isLoading: isLoadingRecords, refetch } = trpc.examRecords.list.useQuery(
    { subjectId },
    { enabled: isAuthenticated && !!subjectId }
  );

  // 创建考试记录
  const createExamMutation = trpc.examRecords.create.useMutation({
    onSuccess: () => {
      setFormData({
        examDate: "",
        examType: "小测",
        totalScore: "",
        actualScore: "",
        difficulty: "中等",
      });
      setIsDialogOpen(false);
      refetch();
    },
  });

  // 删除考试记录
  const deleteExamMutation = trpc.examRecords.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // 计算趋势
  const trend = useMemo(() => {
    if (examRecords.length < 2) return "none";
    
    const ratios = examRecords.map((r) => parseFloat(r.scoreRatio as string));
    const recentRatios = ratios.slice(-5);
    
    let upCount = 0;
    let downCount = 0;
    
    for (let i = 1; i < recentRatios.length; i++) {
      if (recentRatios[i] > recentRatios[i - 1]) upCount++;
      else if (recentRatios[i] < recentRatios[i - 1]) downCount++;
    }
    
    if (upCount > downCount) return "up";
    if (downCount > upCount) return "down";
    return "fluctuate";
  }, [examRecords]);

  const handleCreateExam = () => {
    if (
      formData.examDate &&
      formData.totalScore &&
      formData.actualScore &&
      !isNaN(Number(formData.totalScore)) &&
      !isNaN(Number(formData.actualScore))
    ) {
      createExamMutation.mutate({
        subjectId,
        examDate: formData.examDate,
        examType: formData.examType,
        totalScore: Number(formData.totalScore),
        actualScore: Number(formData.actualScore),
        difficulty: formData.difficulty,
      });
    }
  };

  const handleDeleteExam = (id: string) => {
    if (confirm("确定要删除这条考试记录吗？")) {
      deleteExamMutation.mutate({ id });
    }
  };

  // 获取背景渐变类
  const getBackgroundClass = () => {
    switch (trend) {
      case "up":
        return "bg-gradient-to-br from-green-50 via-green-50 to-emerald-100";
      case "down":
        return "bg-gradient-to-br from-red-50 via-red-50 to-rose-100";
      case "fluctuate":
        return "bg-gradient-to-br from-blue-50 via-blue-50 to-cyan-100";
      default:
        return "bg-gradient-to-br from-gray-50 to-gray-100";
    }
  };

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">学科不存在</p>
          <Button onClick={() => setLocation("/")} variant="outline">
            返回首页
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${getBackgroundClass()}`}>
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{subject.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            {trend === "up" && (
              <div className="flex items-center gap-1 text-green-600 font-semibold">
                <TrendingUp className="w-5 h-5" />
                分数呈上升趋势
              </div>
            )}
            {trend === "down" && (
              <div className="flex items-center gap-1 text-red-600 font-semibold">
                <TrendingDown className="w-5 h-5" />
                分数呈下降趋势
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Score Chart */}
        {examRecords.length > 0 && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>成绩趋势曲线</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreCurveChart records={examRecords} />
            </CardContent>
          </Card>
        )}

        {/* Add Exam Button */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">考试记录</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    考试日期
                  </label>
                  <Input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) =>
                      setFormData({ ...formData, examDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    考试类型
                  </label>
                  <Select
                    value={formData.examType}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        examType: value as any,
                      })
                    }
                  >
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      卷面总分
                    </label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData.totalScore}
                      onChange={(e) =>
                        setFormData({ ...formData, totalScore: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      实际得分
                    </label>
                    <Input
                      type="number"
                      placeholder="85"
                      value={formData.actualScore}
                      onChange={(e) =>
                        setFormData({ ...formData, actualScore: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    难易程度
                  </label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        difficulty: value as any,
                      })
                    }
                  >
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
                <Button
                  onClick={handleCreateExam}
                  disabled={
                    !formData.examDate ||
                    !formData.totalScore ||
                    !formData.actualScore ||
                    createExamMutation.isPending
                  }
                  className="w-full"
                >
                  {createExamMutation.isPending ? "保存中..." : "保存"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Exam Records List */}
        {isLoadingRecords ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">加载考试记录中...</p>
          </div>
        ) : examRecords.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600 mb-4">还没有添加任何考试记录</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>添加第一条记录</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>添加考试成绩</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        考试日期
                      </label>
                      <Input
                        type="date"
                        value={formData.examDate}
                        onChange={(e) =>
                          setFormData({ ...formData, examDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        考试类型
                      </label>
                      <Select
                        value={formData.examType}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            examType: value as any,
                          })
                        }
                      >
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          卷面总分
                        </label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={formData.totalScore}
                          onChange={(e) =>
                            setFormData({ ...formData, totalScore: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          实际得分
                        </label>
                        <Input
                          type="number"
                          placeholder="85"
                          value={formData.actualScore}
                          onChange={(e) =>
                            setFormData({ ...formData, actualScore: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        难易程度
                      </label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            difficulty: value as any,
                          })
                        }
                      >
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
                    <Button
                      onClick={handleCreateExam}
                      disabled={
                        !formData.examDate ||
                        !formData.totalScore ||
                        !formData.actualScore ||
                        createExamMutation.isPending
                      }
                      className="w-full"
                    >
                      {createExamMutation.isPending ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {examRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          {record.examDate}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {record.examType}
                        </span>
                        {record.difficulty === "困难" && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            难
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">卷面总分</p>
                          <p className="font-semibold text-lg">{record.totalScore}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">实际得分</p>
                          <p className="font-semibold text-lg text-blue-600">
                            {record.actualScore}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">成绩比值</p>
                          <p className="font-semibold text-lg text-green-600">
                            {(parseFloat(record.scoreRatio as string) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExam(record.id)}
                      disabled={deleteExamMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

