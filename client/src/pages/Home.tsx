import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { Plus, Trash2, BookOpen } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: subjects = [], isLoading: isLoadingSubjects, refetch } = trpc.subjects.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const createSubjectMutation = trpc.subjects.create.useMutation({
    onSuccess: () => {
      setNewSubjectName("");
      setIsDialogOpen(false);
      refetch();
    },
  });

  const deleteSubjectMutation = trpc.subjects.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateSubject = () => {
    if (newSubjectName.trim()) {
      createSubjectMutation.mutate({ name: newSubjectName });
    }
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm("确定要删除这个学科吗？")) {
      deleteSubjectMutation.mutate({ id });
    }
  };

  const handleSubjectClick = (subjectId: string) => {
    setLocation(`/subject/${subjectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          {APP_LOGO && <img src={APP_LOGO} alt="logo" className="w-20 h-20 mx-auto mb-6" />}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{APP_TITLE}</h1>
          <p className="text-gray-600 mb-8 text-lg">个人学业分析系统</p>
          <Button size="lg" onClick={() => setLocation("/login")}>
            登录开始使用
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="logo" className="w-8 h-8" />}
            <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">欢迎，{user?.name || "用户"}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              退出登录
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">我的学科</h2>
            <p className="text-gray-600 mt-1">选择一个学科查看成绩分析</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                添加学科
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新学科</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="输入学科名称（如：数学、英语）"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreateSubject();
                    }
                  }}
                />
                <Button
                  onClick={handleCreateSubject}
                  disabled={!newSubjectName.trim() || createSubjectMutation.isPending}
                  className="w-full"
                >
                  {createSubjectMutation.isPending ? "创建中..." : "创建"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoadingSubjects ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">加载学科中...</p>
          </div>
        ) : subjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">还没有添加任何学科</p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                添加第一个学科
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card
                key={subject.id}
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleSubjectClick(subject.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                      <BookOpen className="w-5 h-5" />
                      {subject.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(subject.id);
                      }}
                      disabled={deleteSubjectMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    创建于 {subject.createdAt ? new Date(subject.createdAt).toLocaleDateString("zh-CN") : "未知"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 底部 */}
      <div className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>JunZhu-SAS © 2024 个人学业分析系统</p>
        </div>
      </div>
    </div>
  );
}

