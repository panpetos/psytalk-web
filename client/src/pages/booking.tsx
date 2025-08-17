import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Phone, MessageSquare, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";
import { BookingData } from "@/types";
import { apiRequest } from "@/lib/queryClient";

export default function Booking() {
  const { psychologistId } = useParams<{ psychologistId: string }>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [format, setFormat] = useState<'video' | 'audio' | 'chat'>('video');
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<'selection' | 'payment' | 'confirmation'>('selection');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = authService.getCurrentUser();

  const { data: psychologist, isLoading } = useQuery({
    queryKey: ['/api/psychologists', psychologistId],
    enabled: !!psychologistId,
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: BookingData) => {
      const response = await apiRequest('POST', '/api/appointments', {
        clientId: currentUser?.id,
        psychologistId: bookingData.psychologistId,
        dateTime: bookingData.dateTime.toISOString(),
        format: bookingData.format,
        price: psychologist?.price,
        notes: bookingData.notes,
      });
      return response.json();
    },
    onSuccess: () => {
      setStep('confirmation');
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Запись успешна",
        description: "Ваша консультация забронирована. Подробности отправлены на email.",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка бронирования",
        description: "Попробуйте еще раз или выберите другое время",
        variant: "destructive",
      });
    },
  });

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Необходима авторизация</h2>
            <p className="text-gray-600 mb-4">
              Для записи на консультацию необходимо войти в систему
            </p>
            <Button className="bg-primary-custom text-white hover:bg-primary-custom/90">
              Войти в систему
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-custom mx-auto mb-4"></div>
          <p>Загрузка информации о специалисте...</p>
        </div>
      </div>
    );
  }

  if (!psychologist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Специалист не найден</h2>
            <p className="text-gray-600">
              Возможно, специалист больше не принимает клиентов
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBooking = () => {
    if (!selectedTime) {
      toast({
        title: "Выберите время",
        description: "Пожалуйста, выберите время для консультации",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    bookingMutation.mutate({
      psychologistId: psychologist.id,
      dateTime: bookingDateTime,
      format,
      notes,
    });
  };

  const timeSlots = [
    "09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30"
  ];

  const formatIcons = {
    video: Video,
    audio: Phone,
    chat: MessageSquare,
  };

  const formatLabels = {
    video: 'Видео звонок',
    audio: 'Аудио звонок',
    chat: 'Текстовый чат',
  };

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center p-8">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-text-custom mb-2">
                Консультация забронирована!
              </h1>
              <p className="text-gray-600">
                Подтверждение отправлено на ваш email
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold mb-4">Детали консультации:</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Специалист:</strong> Др. {psychologist.user.firstName} {psychologist.user.lastName}</p>
                <p><strong>Дата:</strong> {selectedDate.toLocaleDateString('ru-RU')}</p>
                <p><strong>Время:</strong> {selectedTime} - {
                  (() => {
                    const [hours, minutes] = selectedTime.split(':').map(Number);
                    const endTime = new Date();
                    endTime.setHours(hours, minutes + 50);
                    return endTime.toTimeString().slice(0, 5);
                  })()
                }</p>
                <p><strong>Формат:</strong> {formatLabels[format]}</p>
                <p><strong>Стоимость:</strong> ₽{parseFloat(psychologist.price).toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full bg-primary-custom text-white hover:bg-primary-custom/90"
                onClick={() => window.location.href = '/dashboard'}
              >
                Перейти в личный кабинет
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/search'}
              >
                Найти других специалистов
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden">
          {/* Psychologist Header */}
          <div className="bg-gradient-to-r from-primary-custom to-secondary-custom p-8 text-white">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24 border-4 border-white">
                <AvatarImage src={psychologist.user.avatar} />
                <AvatarFallback className="bg-white text-primary-custom text-lg">
                  {psychologist.user.firstName[0]}{psychologist.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Др. {psychologist.user.firstName} {psychologist.user.lastName}
                </h1>
                <p className="text-blue-100 mb-2">{psychologist.specialization}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                    <span>{psychologist.rating} ({psychologist.totalReviews} отзывов)</span>
                  </div>
                  <span>• {psychologist.experience} лет опыта</span>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="bg-primary-custom text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <span className="ml-2 text-primary-custom font-medium">Выбор времени</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300"></div>
                <div className="flex items-center">
                  <div className="bg-gray-300 text-gray-500 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <span className="ml-2 text-gray-500">Оплата</span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300"></div>
                <div className="flex items-center">
                  <div className="bg-gray-300 text-gray-500 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <span className="ml-2 text-gray-500">Подтверждение</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar Selection */}
              <div>
                <h3 className="text-xl font-semibold text-text-custom mb-4">
                  Выберите дату и время
                </h3>
                
                <div className="border rounded-xl p-4 mb-6">
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Дата консультации</Label>
                    <div className="mt-2 p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-primary-custom" />
                        <span>{selectedDate.toLocaleDateString('ru-RU', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Доступное время:
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 text-sm rounded-lg border transition-colors ${
                            selectedTime === time
                              ? 'bg-primary-custom text-white border-primary-custom'
                              : 'border-gray-200 hover:border-primary-custom hover:text-primary-custom'
                          }`}
                          data-testid={`time-slot-${time}`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div>
                <h3 className="text-xl font-semibold text-text-custom mb-4">
                  Детали сессии
                </h3>
                
                <div className="space-y-6">
                  {/* Format Selection */}
                  <div>
                    <Label className="text-sm font-medium text-text-custom mb-3 block">
                      Формат консультации
                    </Label>
                    <RadioGroup value={format} onValueChange={setFormat as (value: string) => void}>
                      {(['video', 'audio', 'chat'] as const).map((formatOption) => {
                        const Icon = formatIcons[formatOption];
                        return (
                          <div 
                            key={formatOption}
                            className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              format === formatOption ? 'border-primary-custom bg-blue-50' : 'border-gray-200 hover:border-primary-custom'
                            }`}
                          >
                            <RadioGroupItem value={formatOption} id={formatOption} />
                            <Icon className="h-5 w-5 text-primary-custom" />
                            <Label htmlFor={formatOption} className="cursor-pointer flex-1">
                              {formatLabels[formatOption]}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  {/* Session Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium text-text-custom mb-2 block">
                      Дополнительная информация (по желанию)
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Опишите кратко, с какими вопросами вы хотели бы обратиться..."
                      rows={3}
                      data-testid="textarea-notes"
                    />
                  </div>

                  {/* Booking Summary */}
                  <Card className="bg-muted-custom">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-text-custom mb-4">Детали бронирования</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Дата:</span>
                          <span>{selectedDate.toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Время:</span>
                          <span>{selectedTime || 'Не выбрано'} {selectedTime && '- '}
                            {selectedTime && (() => {
                              const [hours, minutes] = selectedTime.split(':').map(Number);
                              const endTime = new Date();
                              endTime.setHours(hours, minutes + 50);
                              return endTime.toTimeString().slice(0, 5);
                            })()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Формат:</span>
                          <span>{formatLabels[format]}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                          <span>Итого:</span>
                          <span>₽{parseFloat(psychologist.price).toLocaleString()}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-primary-custom text-white mt-4 hover:bg-primary-custom/90" 
                        onClick={handleBooking}
                        disabled={!selectedTime || bookingMutation.isPending}
                        data-testid="button-proceed-payment"
                      >
                        {bookingMutation.isPending ? 'Бронирование...' : 'Перейти к оплате'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
