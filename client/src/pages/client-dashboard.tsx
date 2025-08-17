import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageSquare, User, CreditCard, Search, Star, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";
import { authService } from "@/lib/auth";
import AppointmentCard from "@/components/appointment-card";
import { useToast } from "@/hooks/use-toast";
import type { AppointmentWithDetails, Appointment } from "@shared/schema";

type TabType = 'appointments' | 'messages' | 'profile' | 'billing';

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('appointments');
  const [, navigate] = useLocation();
  const currentUser = authService.getCurrentUser();
  const { toast } = useToast();

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ['/api/appointments/client', currentUser?.id],
    enabled: !!currentUser?.id && activeTab === 'appointments',
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages', currentUser?.id],
    enabled: !!currentUser?.id && activeTab === 'messages',
  });

  if (!currentUser || currentUser.role !== 'client') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Доступ запрещен</h2>
            <p className="text-gray-600">
              Эта страница доступна только для клиентов
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter((apt) => 
    new Date(apt.dateTime) > new Date() && apt.status === 'scheduled'
  );

  const pastAppointments = appointments.filter((apt) => 
    new Date(apt.dateTime) < new Date() || apt.status === 'completed'
  );

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

  const handleStartSession = (appointmentId: string) => {
    window.location.href = `/consultation/${appointmentId}`;
  };

  const tabs = [
    { id: 'appointments', label: 'Мои консультации', icon: Calendar },
    { id: 'messages', label: 'Сообщения', icon: MessageSquare },
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'billing', label: 'Платежи', icon: CreditCard },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-custom">Личный кабинет</h1>
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

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-custom">
                      Предстоящие консультации
                    </h2>
                    <Link href="/search">
                      <Button 
                        className="bg-primary-custom text-white hover:bg-primary-custom/90"
                        data-testid="button-book-new-session"
                      >
                        Записаться
                      </Button>
                    </Link>
                  </div>

                  {appointmentsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : upcomingAppointments.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Нет предстоящих консультаций
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Найдите подходящего специалиста и запишитесь на консультацию
                      </p>
                      <Link href="/search">
                        <Button 
                          className="bg-primary-custom text-white hover:bg-primary-custom/90"
                          data-testid="button-find-psychologist"
                        >
                          Найти психолога
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment: any) => (
                        <AppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          userRole="client"
                          onCancel={handleCancelAppointment}
                          onReschedule={handleRescheduleAppointment}
                          onStartSession={handleStartSession}
                        />
                      ))}
                    </div>
                  )}

                  {/* Past Sessions */}
                  {pastAppointments.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-text-custom mb-4">
                        Прошедшие консультации
                      </h3>
                      <div className="space-y-3">
                        {pastAppointments.slice(0, 3).map((appointment: any) => (
                          <div 
                            key={appointment.id} 
                            className="border rounded-xl p-4 hover:bg-gray-50 transition-colors"
                            data-testid={`past-appointment-${appointment.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-text-custom">
                                  Др. {appointment.psychologist.user.firstName} {appointment.psychologist.user.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(appointment.dateTime).toLocaleDateString('ru-RU')} • {appointment.format}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  className="text-primary-custom hover:text-blue-600"
                                  data-testid={`button-leave-review-${appointment.id}`}
                                >
                                  Оставить отзыв
                                </Button>
                                <Link href={`/booking/${appointment.psychologist.id}`}>
                                  <Button 
                                    size="sm"
                                    variant="outline"
                                    className="text-secondary-custom hover:text-green-600"
                                    data-testid={`button-book-again-${appointment.id}`}
                                  >
                                    Записаться снова
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-text-custom mb-4">Статистика</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Всего сессий:</span>
                      <span className="font-medium" data-testid="stat-total-sessions">
                        {appointments.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Активных психологов:</span>
                      <span className="font-medium" data-testid="stat-active-psychologists">
                        {new Set(appointments.map((apt) => apt.psychologist.id)).size}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Следующая сессия:</span>
                      <span className="font-medium text-primary-custom" data-testid="stat-next-session">
                        {upcomingAppointments.length > 0 ? 'Сегодня' : 'Не запланировано'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Favorite Psychologists */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-text-custom mb-4">Мои психологи</h3>
                  {appointments.length === 0 ? (
                    <p className="text-gray-600 text-sm">
                      Здесь будут отображаться ваши психологи после первых консультаций
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {Array.from(new Map(appointments.map((apt) => [apt.psychologist.id, apt.psychologist])).values())
                        .slice(0, 3)
                        .map((psychologist) => (
                        <div key={psychologist.id} className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={psychologist.user.avatar || undefined} />
                            <AvatarFallback className="bg-primary-custom text-white">
                              {psychologist.user.firstName[0]}{psychologist.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-text-custom text-sm">
                              Др. {psychologist.user.firstName} {psychologist.user.lastName}
                            </p>
                            <p className="text-xs text-gray-600">{psychologist.specialization}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-primary-custom hover:text-primary-custom/90"
                            data-testid={`button-message-${psychologist.id}`}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Book */}
              <div className="bg-gradient-to-r from-primary-custom to-secondary-custom rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2">Нужна помощь?</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Найдите подходящего специалиста
                </p>
                <Link href="/search">
                  <Button 
                    className="bg-white text-primary-custom hover:bg-gray-100 transition"
                    data-testid="button-find-psychologist-sidebar"
                  >
                    Найти психолога
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Система сообщений
                </h3>
                <p className="text-gray-600">
                  Функция обмена сообщениями будет доступна в следующей версии
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-text-custom mb-6">Профиль</h2>
              <div className="max-w-md space-y-4">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-text-custom">{currentUser.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <Badge variant={currentUser.isVerified ? "default" : "secondary"}>
                    {currentUser.isVerified ? "Верифицирован" : "Не верифицирован"}
                  </Badge>
                </div>
                <Button 
                  onClick={() => navigate("/edit-profile")}
                  className="bg-primary-custom text-white hover:bg-primary-custom/90 flex items-center gap-2"
                  data-testid="button-edit-profile"
                >
                  <Settings className="h-4 w-4" />
                  Редактировать профиль
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  История платежей
                </h3>
                <p className="text-gray-600">
                  Информация о платежах будет доступна в следующей версии
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
