import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, Video, Phone, MessageSquare, MoreVertical } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppointmentWithDetails } from "@shared/schema";
import { Link } from "wouter";

interface AppointmentCardProps {
  appointment: AppointmentWithDetails;
  userRole: 'client' | 'psychologist';
  onCancel?: (appointmentId: string) => void;
  onReschedule?: (appointmentId: string) => void;
  onStartSession?: (appointmentId: string) => void;
}

export default function AppointmentCard({ 
  appointment, 
  userRole, 
  onCancel, 
  onReschedule, 
  onStartSession 
}: AppointmentCardProps) {
  const formatIcons = {
    video: Video,
    audio: Phone,
    chat: MessageSquare,
  };

  const statusStyles = {
    scheduled: "bg-blue-50 border-primary-custom text-primary-custom",
    in_progress: "bg-green-50 border-green-500 text-green-600",
    completed: "bg-gray-50 border-gray-300 text-gray-600",
    cancelled: "bg-red-50 border-red-300 text-red-600",
  };

  const statusLabels = {
    scheduled: "Запланировано",
    in_progress: "В процессе",
    completed: "Завершено",
    cancelled: "Отменено",
  };

  const Icon = formatIcons[appointment.format];
  const appointmentDate = new Date(appointment.dateTime);
  const now = new Date();
  const isUpcoming = appointmentDate > now && appointment.status === 'scheduled';
  const canStart = appointmentDate <= now && appointment.status === 'scheduled';
  
  const otherUser = userRole === 'client' 
    ? appointment.psychologist.user 
    : appointment.client;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getTimeUntil = () => {
    const diff = appointmentDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `через ${hours} ч ${minutes} мин`;
    } else if (minutes > 0) {
      return `через ${minutes} мин`;
    } else {
      return "сейчас";
    }
  };

  return (
    <Card 
      className={`transition-all ${
        isUpcoming ? 'border-primary-custom bg-blue-50' : 'border-gray-200'
      }`}
      data-testid={`appointment-card-${appointment.id}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarImage src={otherUser.avatar} />
              <AvatarFallback className="bg-primary-custom text-white">
                {getInitials(otherUser.firstName, otherUser.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-custom">
                {userRole === 'client' ? 'Др. ' : ''}{otherUser.firstName} {otherUser.lastName}
              </h3>
              {userRole === 'client' && (
                <p className="text-sm text-gray-600 mb-2">
                  {appointment.psychologist.specialization}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{appointmentDate.toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{appointmentDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon className="h-4 w-4" />
                  <span className="capitalize">{appointment.format}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className={statusStyles[appointment.status]}>
                  {statusLabels[appointment.status]}
                </Badge>
                <span className="text-sm font-medium text-primary-custom">
                  ₽{parseFloat(appointment.price).toLocaleString()}
                </span>
              </div>

              {isUpcoming && (
                <div className="flex items-center text-sm text-primary-custom">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Начинается {getTimeUntil()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {canStart && (
              <Button
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => onStartSession?.(appointment.id)}
                data-testid={`button-start-session-${appointment.id}`}
              >
                {userRole === 'psychologist' ? 'Начать' : 'Присоединиться'}
              </Button>
            )}
            
            {isUpcoming && !canStart && (
              <Link href={`/consultation/${appointment.id}`}>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary-custom text-primary-custom hover:bg-primary-custom hover:text-white"
                  data-testid={`button-prepare-session-${appointment.id}`}
                >
                  Подготовиться
                </Button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  data-testid={`button-options-${appointment.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {appointment.status === 'scheduled' && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => onReschedule?.(appointment.id)}
                      data-testid={`menu-reschedule-${appointment.id}`}
                    >
                      Перенести время
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onCancel?.(appointment.id)}
                      className="text-red-600"
                      data-testid={`menu-cancel-${appointment.id}`}
                    >
                      Отменить
                    </DropdownMenuItem>
                  </>
                )}
                {appointment.status === 'completed' && userRole === 'client' && (
                  <DropdownMenuItem data-testid={`menu-review-${appointment.id}`}>
                    Оставить отзыв
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem data-testid={`menu-details-${appointment.id}`}>
                  Подробности
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {appointment.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Заметки:</strong> {appointment.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
