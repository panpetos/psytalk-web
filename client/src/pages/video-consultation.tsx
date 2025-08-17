import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  MessageSquare, 
  Monitor, 
  X,
  Send,
  Clock
} from "lucide-react";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function VideoConsultation() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [sessionTime, setSessionTime] = useState(0);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'psychologist',
      text: 'Добро пожаловать на сессию! Как дела?',
      time: '14:02',
    }
  ]);

  const currentUser = authService.getCurrentUser();
  const { toast } = useToast();

  const { data: appointment, isLoading } = useQuery({
    queryKey: ['/api/appointments', appointmentId],
    enabled: !!appointmentId,
  });

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatSessionTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: currentUser?.role || 'client',
        text: chatMessage.trim(),
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, newMessage]);
      setChatMessage("");
    }
  };

  const handleEndSession = () => {
    toast({
      title: "Сессия завершена",
      description: "Спасибо за консультацию. Отзыв и оценка будут доступны в личном кабинете.",
    });
    
    // Redirect based on user role
    if (currentUser?.role === 'client') {
      window.location.href = '/dashboard';
    } else if (currentUser?.role === 'psychologist') {
      window.location.href = '/dashboard';
    }
  };

  if (!currentUser) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center text-white">
            <h2 className="text-xl font-semibold mb-4">Доступ запрещен</h2>
            <p className="text-gray-300">
              Для участия в консультации необходимо войти в систему
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Подключение к сессии...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center text-white">
            <h2 className="text-xl font-semibold mb-4">Сессия не найдена</h2>
            <p className="text-gray-300">
              Консультация не существует или была отменена
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const otherUser = currentUser.role === 'client' 
    ? appointment.psychologist.user 
    : appointment.client;

  return (
    <div className="fixed inset-0 bg-gray-900" data-testid="video-consultation">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">
              Консультация с {currentUser.role === 'client' ? 'Др. ' : ''}{otherUser.firstName} {otherUser.lastName}
            </h2>
            <Badge className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
              ● В эфире
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <span data-testid="session-timer">{formatSessionTime(sessionTime)}</span>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-black">
          {/* Main video area (remote participant) */}
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="bg-primary-custom rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold">
                  {otherUser.firstName[0]}{otherUser.lastName[0]}
                </span>
              </div>
              <p className="text-xl font-medium">
                {currentUser.role === 'client' ? 'Др. ' : ''}{otherUser.firstName} {otherUser.lastName}
              </p>
              <p className="text-gray-400">
                {isVideoOff ? 'Видео отключено' : 'Видео включено'}
              </p>
            </div>
          </div>

          {/* Picture-in-picture (local participant) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white">
            <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="bg-gray-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <span className="text-xl font-bold">
                    {currentUser.firstName[0]}{currentUser.lastName[0]}
                  </span>
                </div>
                <p className="text-sm">Вы</p>
                {isAudioMuted && (
                  <div className="absolute top-2 right-2 bg-red-600 rounded-full p-1">
                    <MicOff className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className={`absolute top-0 right-0 w-80 h-full bg-white shadow-xl transition-transform duration-300 ${
            showChat ? 'translate-x-0' : 'translate-x-full'
          }`} data-testid="chat-panel">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text-custom">Чат</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowChat(false)}
                    data-testid="button-close-chat"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${
                        message.sender === currentUser.role ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div className={`max-w-xs rounded-lg p-3 ${
                        message.sender === currentUser.role 
                          ? 'bg-primary-custom text-white' 
                          : 'bg-gray-100 text-text-custom'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <span className="text-xs opacity-75">{message.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Напишите сообщение..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                    data-testid="input-chat-message"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    className="bg-primary-custom text-white hover:bg-primary-custom/90"
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-6">
          <div className="flex items-center justify-center space-x-4">
            {/* Audio toggle */}
            <Button
              className={`p-4 rounded-full transition ${
                isAudioMuted 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              data-testid="button-toggle-audio"
            >
              {isAudioMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            {/* Video toggle */}
            <Button
              className={`p-4 rounded-full transition ${
                isVideoOff 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              onClick={() => setIsVideoOff(!isVideoOff)}
              data-testid="button-toggle-video"
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>

            {/* Screen share */}
            <Button
              className={`p-4 rounded-full transition ${
                isScreenSharing 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              data-testid="button-toggle-screen-share"
            >
              <Monitor className="h-6 w-6" />
            </Button>

            {/* Chat toggle */}
            <Button
              className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-full transition"
              onClick={() => setShowChat(!showChat)}
              data-testid="button-toggle-chat"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>

            {/* End call */}
            <Button
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition"
              onClick={handleEndSession}
              data-testid="button-end-session"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>

          {/* Session info */}
          <div className="text-center mt-4 text-gray-400 text-sm">
            <p>Защищенное соединение • Запись не ведется</p>
          </div>
        </div>
      </div>
    </div>
  );
}
