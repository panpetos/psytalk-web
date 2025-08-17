import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, DollarSign, Settings, Clock, CheckCircle, MessageSquare } from "lucide-react";
import { authService } from "@/lib/auth";
import AppointmentCard from "@/components/appointment-card";
import { useToast } from "@/hooks/use-toast";

type TabType = 'schedule' | 'clients' | 'earnings' | 'profile';

export default function PsychologistDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const currentUser = authService.getCurrentUser();
  const { toast } = useToast();

  const { data: psychologist } = useQuery({
    queryKey: ['/api/psychologists/user', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments/psychologist', psychologist?.id],
    enabled: !!psychologist?.id && activeTab === 'schedule',
  });

  if (!currentUser || currentUser.role !== 'psychologist') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Доступ запрещен</h2>
            <p className="text-gray-600">
              Эта страница доступна только для психологов
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const today = new Date();
  const todayAppointments = appointments.filter((apt: any) => {
    const aptDate = new Date(apt.dateTime);
    return aptDate.toDateString() === today.toDateString();
  });

  const upcomingAppointments = appointments.filter((apt: any) => 
    new Date(apt.dateTime) > new Date() && apt.status === 'scheduled'
  );

  const completedAppointments = appointments.filter((apt: any) => 
    apt.status === 'completed'
  );

  const handleStartSession = (appointmentId: string) => {
    window.location.href = `/consultation/${appointmentId}`;
  };

  const handleCancelAppointment = (appointmentId: string) => {
    toast({
      title: "Функция в разработке",
      description: "Отмена записи будет доступна в следующей версии",
    });
  };

  const handleRescheduleAppointment = (appointmentId: string) => {
    toast({
      title: "Функция в разработке",
      description: "Перенос записи будет доступен в следующей версии",
    });
  };

  const tabs = [
    { id: 'schedule', label: 'Расписание', icon: Calendar },
    { id: 'clients', label: 'Клиенты', icon: Users },
    { id: 'earnings', label: 'Доходы', icon: DollarSign },
    { id: 'profile', label: 'Профиль', icon: Settings },
  ] as const;

  // Calculate stats
  const todayEarnings = todayAppointments.reduce((sum: number, apt: any) => 
    sum + parseFloat(apt.price), 0
  );

  const activeClients = new Set(appointments.map((apt: any) => apt.client.id)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-custom">Кабинет психолога</h1>
          <p className="text-gray-600 mt-2">
            Добро пожаловать, {currentUser.firstName} {currentUser.lastName}!
          </p>
        </div>

        {/* Dashboard Navigation */}
        <Card className="mb-8">
          <nav className="flex space-x-8 px-6" data-testid="dashboard-nav">
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

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Schedule */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-custom">
                      Сегодняшнее расписание
                    </h2>
                    <div className="text-sm text-gray-500">
                      {today.toLocaleDateString('ru-RU', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>

                  {appointmentsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-start space-x-4 p-4 border rounded-xl">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : todayAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Нет записей на сегодня
                      </h3>
                      <p className="text-gray-600">
                        У вас свободный день. Можете отдохнуть или заблокировать время.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments.map((appointment: any) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          userRole="psychologist"
                          onCancel={handleCancelAppointment}
                          onReschedule={handleRescheduleAppointment}
                          onStartSession={handleStartSession}
                        />
                      ))}
                    </div>
                  )}

                  {/* Free time slots */}
                  {todayAppointments.length > 0 && (
                    <div className="mt-6">
                      <div className="border-2 border-dashed border-gray-300 p-4 rounded-xl text-center">
                        <p className="text-gray-500">18:00 - 19:00</p>
                        <p className="text-sm text-gray-400 mb-2">Свободное время</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-primary-custom hover:text-primary-custom/90"
                          data-testid="button-block-time"
                        >
                          Заблокировать время
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Today's Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-text-custom mb-4">Сегодня</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-custom text-white p-2 rounded-lg">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium" data-testid="stat-today-sessions">
                          {todayAppointments.length} сессий
                        </p>
                        <p className="text-sm text-gray-600">Запланировано</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-secondary-custom text-white p-2 rounded-lg">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium" data-testid="stat-today-earnings">
                          ₽{todayEarnings.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Доход за день</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-accent-custom text-white p-2 rounded-lg">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium" data-testid="stat-active-clients">
                          {activeClients} клиентов
                        </p>
                        <p className="text-sm text-gray-600">Активные</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-text-custom mb-4">Быстрые действия</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-left p-3 h-auto"
                      data-testid="button-manage-schedule"
                    >
                      <Calendar className="h-5 w-5 text-primary-custom mr-3" />
                      <span>Управление расписанием</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-left p-3 h-auto"
                      data-testid="button-view-messages"
                    >
                      <MessageSquare className="h-5 w-5 text-secondary-custom mr-3" />
                      <span>Сообщения от клиентов</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-left p-3 h-auto"
                      onClick={() => setActiveTab('earnings')}
                      data-testid="button-earnings-report"
                    >
                      <DollarSign className="h-5 w-5 text-accent-custom mr-3" />
                      <span>Отчет о доходах</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Status */}
              <div className="bg-gradient-to-r from-secondary-custom to-green-600 rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2">Статус профиля</h3>
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">
                    {psychologist?.isApproved ? 'Верифицирован' : 'На модерации'}
                  </span>
                </div>
                <p className="text-sm text-green-100 mb-4">
                  {psychologist?.isApproved 
                    ? 'Ваш профиль активен и виден клиентам'
                    : 'Ваш профиль проходит проверку'
                  }
                </p>
                <Button 
                  className="bg-white text-secondary-custom hover:bg-gray-100 transition"
                  onClick={() => setActiveTab('profile')}
                  data-testid="button-edit-profile"
                >
                  Редактировать профиль
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-text-custom mb-6">Мои клиенты</h2>
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Пока нет клиентов
                  </h3>
                  <p className="text-gray-600">
                    Клиенты появятся здесь после первых записей на консультации
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...new Map(appointments.map((apt: any) => [apt.client.id, apt.client])).values()]
                    .map((client: any) => {
                      const clientAppointments = appointments.filter((apt: any) => apt.client.id === client.id);
                      const lastAppointment = clientAppointments[clientAppointments.length - 1];
                      
                      return (
                        <Card key={client.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-primary-custom text-white rounded-full flex items-center justify-center">
                                {client.firstName[0]}{client.lastName[0]}
                              </div>
                              <div>
                                <p className="font-medium text-text-custom">
                                  {client.firstName} {client.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {clientAppointments.length} сессий
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mb-3">
                              Последняя сессия: {new Date(lastAppointment.dateTime).toLocaleDateString('ru-RU')}
                            </p>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                История
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-text-custom mb-6">Статистика доходов</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Сегодня</p>
                      <p className="text-2xl font-bold text-primary-custom">
                        ₽{todayEarnings.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Этот месяц</p>
                      <p className="text-2xl font-bold text-secondary-custom">
                        ₽{appointments.reduce((sum: number, apt: any) => sum + parseFloat(apt.price), 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Всего сессий</p>
                      <p className="text-2xl font-bold text-accent-custom">
                        {completedAppointments.length}
                      </p>
                    </div>
                  </div>
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      Подробная аналитика доходов будет доступна в следующей версии
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-text-custom mb-4">Итоги</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Средняя стоимость сессии:</span>
                      <span className="font-medium">
                        ₽{psychologist?.price ? parseFloat(psychologist.price).toLocaleString() : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Рейтинг:</span>
                      <span className="font-medium">{psychologist?.rating || '0.0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Отзывов:</span>
                      <span className="font-medium">{psychologist?.totalReviews || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-text-custom mb-6">Профиль специалиста</h2>
              {psychologist ? (
                <div className="max-w-2xl space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Имя
                      </label>
                      <p className="text-text-custom">{currentUser.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Фамилия
                      </label>
                      <p className="text-text-custom">{currentUser.lastName}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Специализация
                    </label>
                    <p className="text-text-custom">{psychologist.specialization}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Опыт работы
                    </label>
                    <p className="text-text-custom">{psychologist.experience} лет</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Образование
                    </label>
                    <p className="text-text-custom">{psychologist.education}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Описание
                    </label>
                    <p className="text-text-custom">{psychologist.description}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Стоимость сессии
                    </label>
                    <p className="text-text-custom">₽{parseFloat(psychologist.price).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Статус
                    </label>
                    <Badge variant={psychologist.isApproved ? "default" : "secondary"}>
                      {psychologist.isApproved ? "Одобрен" : "На модерации"}
                    </Badge>
                  </div>

                  <Button className="bg-primary-custom text-white hover:bg-primary-custom/90">
                    Редактировать профиль
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">Загрузка информации о профиле...</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
