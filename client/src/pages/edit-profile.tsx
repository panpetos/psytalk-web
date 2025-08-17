import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { authService } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, Psychologist } from "@shared/schema";

export default function EditProfile() {
  const [, navigate] = useLocation();
  const currentUser = authService.getCurrentUser();
  const { toast } = useToast();
  
  // User form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  
  // Psychologist form state
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState(0);
  const [education, setEducation] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [formats, setFormats] = useState<string[]>([]);
  const [certifications, setCertifications] = useState("");

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    enabled: !!currentUser,
  });

  const { data: psychologist } = useQuery<Psychologist>({
    queryKey: ['/api/psychologists/user', currentUser?.id],
    enabled: !!currentUser && currentUser.role === 'psychologist',
  });

  // Populate forms when data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (psychologist) {
      setSpecialization(psychologist.specialization || "");
      setExperience(psychologist.experience || 0);
      setEducation(psychologist.education || "");
      setDescription(psychologist.description || "");
      setPrice(psychologist.price || "");
      setFormats(psychologist.formats || []);
      setCertifications((psychologist.certifications || []).join(", "));
    }
  }, [psychologist]);

  const updateUserMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('PUT', `/api/users/${currentUser?.id}`, data),
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Профиль пользователя обновлен",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    },
  });

  const updatePsychologistMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('PUT', `/api/psychologists/${psychologist?.id}`, data),
    onSuccess: () => {
      toast({
        title: "Успешно",
        description: "Профиль психолога обновлен",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/psychologists/user', currentUser?.id] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить профиль психолога",
        variant: "destructive",
      });
    },
  });

  const handleSaveUser = () => {
    if (!firstName || !lastName || !email) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    updateUserMutation.mutate({
      firstName,
      lastName,
      email,
    });
  };

  const handleSavePsychologist = () => {
    if (!specialization || !education || !description || !price) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    updatePsychologistMutation.mutate({
      specialization,
      experience: Number(experience),
      education,
      description,
      price,
      formats,
      certifications: certifications.split(",").map(cert => cert.trim()).filter(cert => cert),
    });
  };

  const handleFormatChange = (format: string, checked: boolean) => {
    if (checked) {
      setFormats([...formats, format]);
    } else {
      setFormats(formats.filter(f => f !== format));
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Доступ запрещен</h2>
            <p className="text-gray-600">Пожалуйста, войдите в систему</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navigateBack = () => {
    if (currentUser.role === 'admin') {
      navigate('/admin');
    } else if (currentUser.role === 'psychologist') {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={navigateBack}
            className="flex items-center gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          <h1 className="text-2xl font-bold">Редактирование профиля</h1>
        </div>

        <div className="space-y-6">
          {/* User Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Имя</label>
                  <Input 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    data-testid="input-first-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Фамилия</label>
                  <Input 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>
              <Button 
                onClick={handleSaveUser}
                disabled={updateUserMutation.isPending}
                className="flex items-center gap-2"
                data-testid="button-save-user"
              >
                <Save className="h-4 w-4" />
                {updateUserMutation.isPending ? "Сохранение..." : "Сохранить основную информацию"}
              </Button>
            </CardContent>
          </Card>

          {/* Psychologist Profile Section */}
          {currentUser.role === 'psychologist' && psychologist && (
            <Card>
              <CardHeader>
                <CardTitle>Профессиональная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Специализация</label>
                  <Select value={specialization} onValueChange={setSpecialization}>
                    <SelectTrigger data-testid="select-specialization">
                      <SelectValue placeholder="Выберите специализацию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Семейная терапия">Семейная терапия</SelectItem>
                      <SelectItem value="Когнитивно-поведенческая терапия">Когнитивно-поведенческая терапия</SelectItem>
                      <SelectItem value="Гештальт-терапия">Гештальт-терапия</SelectItem>
                      <SelectItem value="Психоанализ">Психоанализ</SelectItem>
                      <SelectItem value="Детская психология">Детская психология</SelectItem>
                      <SelectItem value="Нейропсихология">Нейропсихология</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Опыт работы (лет)</label>
                    <Input 
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(Number(e.target.value))}
                      data-testid="input-experience"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Стоимость консультации (руб)</label>
                    <Input 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      data-testid="input-price"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Образование</label>
                  <Input 
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    data-testid="input-education"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Сертификаты (через запятую)</label>
                  <Input 
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    placeholder="Например: КПТ, Семейная терапия"
                    data-testid="input-certifications"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Описание</label>
                  <Textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Расскажите о своем подходе к работе, методах, опыте..."
                    data-testid="textarea-description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Форматы консультаций</label>
                  <div className="flex flex-wrap gap-4">
                    {['video', 'audio', 'chat'].map((format) => (
                      <div key={format} className="flex items-center space-x-2">
                        <Checkbox
                          id={format}
                          checked={formats.includes(format)}
                          onCheckedChange={(checked) => handleFormatChange(format, checked as boolean)}
                          data-testid={`checkbox-format-${format}`}
                        />
                        <label htmlFor={format} className="capitalize">
                          {format === 'video' && 'Видео'}
                          {format === 'audio' && 'Аудио'}
                          {format === 'chat' && 'Чат'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSavePsychologist}
                  disabled={updatePsychologistMutation.isPending}
                  className="flex items-center gap-2"
                  data-testid="button-save-psychologist"
                >
                  <Save className="h-4 w-4" />
                  {updatePsychologistMutation.isPending ? "Сохранение..." : "Сохранить профессиональную информацию"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}