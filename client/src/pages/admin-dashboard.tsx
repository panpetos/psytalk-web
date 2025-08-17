import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  BarChart3, 
  Users, 
  UserCheck, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  UserX,
  Trash2,
  ShieldCheck,
  Settings
} from "lucide-react";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

type TabType = 'overview' | 'users' | 'approvals' | 'payments' | 'reports';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [, navigate] = useLocation();
  const currentUser = authService.getCurrentUser();
  const { toast } = useToast();

  const { data: stats = {} } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: !!currentUser && currentUser.role === 'admin',
  });

  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: !!currentUser && currentUser.role === 'admin' && activeTab === 'users',
  });

  const { data: pendingPsychologists = [], refetch: refetchPending } = useQuery({
    queryKey: ['/api/admin/psychologists/pending'],
    enabled: !!currentUser && currentUser.role === 'admin' && activeTab === 'approvals',
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Доступ запрещен</h2>
            <p className="text-gray-600">
              Эта страница доступна только для администраторов
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApprovePsychologist = async (psychologistId: string) => {
    try {
      const response = await fetch(`/api/admin/psychologists/${psychologistId}/approve`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        toast({
          title: "Психолог одобрен",
          description: "Специалист успешно верифицирован и может принимать клиентов",
        });
        // Refresh both pending list and users list
        refetchPending();
        refetchUsers();
        // Invalidate psychologist search cache so approved psychologists appear in search
        queryClient.invalidateQueries({ queryKey: ['/api/psychologists/search'] });
      } else {
        throw new Error('Failed to approve');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось одобрить специалиста",
        variant: "destructive",
      });
    }
  };

  const handleRejectPsychologist = async (psychologistId: string, psychologistName: string) => {
    if (!confirm(`Вы уверены, что хотите отклонить заявку психолога ${psychologistName}? Профиль будет удален.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/psychologists/${psychologistId}/reject`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Успешно",
          description: `Заявка психолога ${psychologistName} отклонена`,
        });
        refetchPending();
        refetchUsers();
      } else {
        throw new Error('Не удалось отклонить заявку');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: `Не удалось отклонить заявку: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleUserAction = async (userId: string, action: string, user: any) => {
    try {
      let response;
      let successMessage = "";
      
      switch (action) {
        case 'freeze':
          response = await fetch(`/api/admin/users/${userId}/freeze`, {
            method: 'PUT',
          });
          successMessage = `Пользователь ${user.firstName} ${user.lastName} заморожен`;
          break;
        case 'unfreeze':
          response = await fetch(`/api/admin/users/${userId}/unfreeze`, {
            method: 'PUT',
          });
          successMessage = `Пользователь ${user.firstName} ${user.lastName} разморожен`;
          break;
        case 'delete':
          if (!confirm(`Вы уверены, что хотите удалить пользователя ${user.firstName} ${user.lastName}? Это действие нельзя отменить.`)) {
            return;
          }
          response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
          });
          successMessage = `Пользователь ${user.firstName} ${user.lastName} удален`;
          break;
        case 'approve':
          // For psychologists - find their psychologist profile and approve it
          const psychologist = await fetch(`/api/psychologists/user/${userId}`);
          if (psychologist.ok) {
            const psychData = await psychologist.json();
            await handleApprovePsychologist(psychData.id);
            return; // handleApprovePsychologist already shows success message
          } else {
            throw new Error('Профиль психолога не найден');
          }
        default:
          break;
      }
      
      if (response && response.ok) {
        toast({
          title: "Успешно",
          description: successMessage,
        });
        refetchUsers();
        if (action === 'approve') {
          queryClient.invalidateQueries({ queryKey: ['/api/psychologists/search'] });
        }
      } else {
        throw new Error('Операция не выполнена');
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: `Не удалось выполнить операцию: ${error}`,
        variant: "destructive",
      });
    }
  };

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: BarChart3 },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'approvals', label: 'Верификация', icon: UserCheck },
    { id: 'payments', label: 'Платежи', icon: CreditCard },
    { id: 'reports', label: 'Отчеты', icon: FileText },
  ] as const;

  const recentActivities = [
    {
      id: 1,
      type: 'user_registration',
      message: 'Новая регистрация психолога',
      details: 'Др. Елена Смирнова зарегистрировалась на платформе',
      time: '2 мин назад',
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
    },
    {
      id: 2,
      type: 'appointment',
      message: 'Новая запись на сессию',
      details: 'Клиент записался к Др. Петровой на завтра',
      time: '15 мин назад',
      icon: Clock,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      id: 3,
      type: 'moderation',
      message: 'Требуется модерация',
      details: 'Отзыв клиента ожидает проверки',
      time: '1 час назад',
      icon: AlertTriangle,
      color: 'text-yellow-600 bg-yellow-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-custom">Панель администратора</h1>
          <p className="text-gray-600 mt-2">
            Управление платформой психологической помощи
          </p>
        </div>

        {/* Admin Navigation */}
        <Card className="mb-8">
          <nav className="flex space-x-8 px-6" data-testid="admin-nav">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'text-primary-custom border-b-2 border-primary-custom'
                      : 'text-gray-500 hover:text-primary-custom'
                  }`}
                  data-testid={`tab-${tab.id}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Всего пользователей</p>
                      <p className="text-2xl font-bold text-text-custom" data-testid="stat-total-users">
                        {(stats as any)?.totalUsers || 0}
                      </p>
                    </div>
                    <div className="bg-primary-custom text-white p-3 rounded-lg">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+12%</span>
                    <span className="text-gray-600 ml-2">за месяц</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Активных психологов</p>
                      <p className="text-2xl font-bold text-text-custom" data-testid="stat-active-psychologists">
                        {(stats as any)?.activePsychologists || 0}
                      </p>
                    </div>
                    <div className="bg-secondary-custom text-white p-3 rounded-lg">
                      <UserCheck className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+8%</span>
                    <span className="text-gray-600 ml-2">за месяц</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Сессий за месяц</p>
                      <p className="text-2xl font-bold text-text-custom" data-testid="stat-monthly-sessions">
                        {(stats as any)?.monthlySessions || 0}
                      </p>
                    </div>
                    <div className="bg-accent-custom text-white p-3 rounded-lg">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+15%</span>
                    <span className="text-gray-600 ml-2">за месяц</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Доход платформы</p>
                      <p className="text-2xl font-bold text-text-custom" data-testid="stat-platform-revenue">
                        ₽{(stats as any)?.platformRevenue ? parseFloat((stats as any).platformRevenue).toLocaleString() : 0}
                      </p>
                    </div>
                    <div className="bg-yellow-500 text-white p-3 rounded-lg">
                      <CreditCard className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-green-600">+23%</span>
                    <span className="text-gray-600 ml-2">за месяц</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-text-custom mb-6">
                      Недавняя активность
                    </h3>
                    <div className="space-y-4">
                      {recentActivities.map((activity) => {
                        const Icon = activity.icon;
                        return (
                          <div key={activity.id} className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${activity.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-text-custom">{activity.message}</p>
                              <p className="text-sm text-gray-600">{activity.details}</p>
                            </div>
                            <span className="text-sm text-gray-500">{activity.time}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Pending Tasks and System Health */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-text-custom mb-4">Ожидающие задачи</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Верификация документов</span>
                        <Badge variant="destructive" data-testid="pending-verifications">
                          {(pendingPsychologists as any[]).length}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Модерация отзывов</span>
                        <Badge className="bg-yellow-100 text-yellow-600">3</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Споры по платежам</span>
                        <Badge className="bg-orange-100 text-orange-600">2</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-text-custom mb-4">Состояние системы</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Сервер</span>
                        <div className="flex items-center text-green-600">
                          <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                          <span className="text-sm">Работает</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">База данных</span>
                        <div className="flex items-center text-green-600">
                          <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                          <span className="text-sm">Работает</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Видео сервис</span>
                        <div className="flex items-center text-yellow-600">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full mr-1"></div>
                          <span className="text-sm">Нагрузка</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-text-custom mb-6">Управление пользователями</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Пользователь</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Роль</th>
                      <th className="text-left py-3 px-4">Статус</th>
                      <th className="text-left py-3 px-4">Дата регистрации</th>
                      <th className="text-left py-3 px-4">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(users as any[]).map((user: any) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.firstName[0]}{user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={user.role === 'admin' ? 'destructive' : 'default'}
                            className={
                              user.role === 'psychologist' ? 'bg-secondary-custom text-white' :
                              user.role === 'client' ? 'bg-primary-custom text-white' : ''
                            }
                          >
                            {user.role === 'admin' ? 'Администратор' :
                             user.role === 'psychologist' ? 'Психолог' : 'Клиент'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={user.isVerified ? 'default' : 'secondary'}>
                            {user.isVerified ? 'Верифицирован' : 'Не верифицирован'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" data-testid={`button-manage-${user.id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {user.role === 'psychologist' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleUserAction(user.id, 'approve', user)}
                                    data-testid={`action-approve-${user.id}`}
                                  >
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Одобрить как психолога
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.id, user.isFrozen ? 'unfreeze' : 'freeze', user)}
                                data-testid={`action-freeze-${user.id}`}
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                {user.isFrozen ? 'Разморозить' : 'Заморозить'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.id, 'delete', user)}
                                className="text-red-600 focus:text-red-600"
                                data-testid={`action-delete-${user.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Удалить пользователя
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-text-custom mb-6">
                Верификация психологов
              </h2>
              {(pendingPsychologists as any[]).length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Нет ожидающих верификации
                  </h3>
                  <p className="text-gray-600">
                    Все специалисты прошли проверку документов
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(pendingPsychologists as any[]).map((psychologist: any) => (
                    <div key={psychologist.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={psychologist.user.avatar} />
                            <AvatarFallback className="bg-primary-custom text-white">
                              {psychologist.user.firstName[0]}{psychologist.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-text-custom">
                              Др. {psychologist.user.firstName} {psychologist.user.lastName}
                            </h3>
                            <p className="text-gray-600 mb-2">{psychologist.specialization}</p>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Опыт:</strong> {psychologist.experience} лет
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Образование:</strong> {psychologist.education}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Email:</strong> {psychologist.user.email}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Описание:</strong> {psychologist.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            className="bg-green-600 text-white hover:bg-green-700"
                            onClick={() => handleApprovePsychologist(psychologist.id)}
                            data-testid={`button-approve-${psychologist.id}`}
                          >
                            Одобрить
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleRejectPsychologist(psychologist.id, `${psychologist.user?.firstName} ${psychologist.user?.lastName}`)}
                            data-testid={`button-reject-${psychologist.id}`}
                          >
                            Отклонить
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Управление платежами
                </h3>
                <p className="text-gray-600">
                  Система управления платежами будет доступна в следующей версии
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Отчеты и аналитика
                </h3>
                <p className="text-gray-600">
                  Подробные отчеты и аналитика будут доступны в следующей версии
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
