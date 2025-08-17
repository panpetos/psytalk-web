import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Video, Phone, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { SearchFilters } from "@/types";
import PsychologistCard from "@/components/psychologist-card";

export default function PsychologistSearch() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState("");

  const formatFilters = useCallback((filters: SearchFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, String(value));
        }
      }
    });
    return params.toString();
  }, []);

  const { data: psychologists = [], isLoading } = useQuery({
    queryKey: ['/api/psychologists/search', formatFilters(filters)],
    queryFn: async () => {
      const queryString = formatFilters(filters);
      const url = queryString ? `/api/psychologists/search?${queryString}` : '/api/psychologists/search';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch psychologists');
      return response.json();
    },
    enabled: true,
  });

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredPsychologists = (psychologists as any[]).filter((psychologist: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      psychologist.user.firstName.toLowerCase().includes(query) ||
      psychologist.user.lastName.toLowerCase().includes(query) ||
      psychologist.specialization.toLowerCase().includes(query) ||
      psychologist.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-custom mb-4">Найти психолога</h1>
          <p className="text-gray-600">Выберите специалиста, который подходит именно вам</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-text-custom mb-4">Фильтры</h3>
                
                {/* Search Input */}
                <div className="mb-6">
                  <Label htmlFor="search">Поиск</Label>
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Имя, специализация..."
                    className="mt-2"
                    data-testid="input-search"
                  />
                </div>

                {/* Specialization Filter */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-text-custom mb-2 block">
                    Специализация
                  </Label>
                  <Select 
                    value={filters.specialization || undefined} 
                    onValueChange={(value) => handleFilterChange('specialization', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger data-testid="select-specialization">
                      <SelectValue placeholder="Все специализации" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все специализации</SelectItem>
                      <SelectItem value="anxiety">Тревожные расстройства</SelectItem>
                      <SelectItem value="depression">Депрессия</SelectItem>
                      <SelectItem value="relationships">Отношения</SelectItem>
                      <SelectItem value="family">Семейная терапия</SelectItem>
                      <SelectItem value="trauma">Травмы</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Filter */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-text-custom mb-2 block">
                    Цена за сессию (₽)
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="От"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-20"
                        data-testid="input-min-price"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        placeholder="До"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-20"
                        data-testid="input-max-price"
                      />
                    </div>
                  </div>
                </div>

                {/* Format Filter */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-text-custom mb-2 block">
                    Формат консультации
                  </Label>
                  <div className="space-y-2">
                    {[
                      { value: 'video', label: 'Видео', icon: Video },
                      { value: 'audio', label: 'Аудио', icon: Phone },
                      { value: 'chat', label: 'Чат', icon: MessageSquare },
                    ].map((format) => (
                      <div key={format.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={format.value}
                          checked={filters.formats?.includes(format.value) || false}
                          onCheckedChange={(checked) => {
                            const currentFormats = filters.formats || [];
                            if (checked) {
                              handleFilterChange('formats', [...currentFormats, format.value]);
                            } else {
                              handleFilterChange('formats', currentFormats.filter(f => f !== format.value));
                            }
                          }}
                          data-testid={`checkbox-format-${format.value}`}
                        />
                        <Label htmlFor={format.value} className="flex items-center space-x-2 cursor-pointer">
                          <format.icon className="h-4 w-4" />
                          <span>{format.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full bg-primary-custom text-white hover:bg-primary-custom/90"
                  onClick={() => setFilters({})}
                  variant="outline"
                  data-testid="button-clear-filters"
                >
                  Очистить фильтры
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Psychologist Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredPsychologists.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-lg font-semibold text-text-custom mb-2">
                  Психологи не найдены
                </h3>
                <p className="text-gray-600 mb-4">
                  Попробуйте изменить параметры поиска
                </p>
                <Button 
                  onClick={() => {
                    setFilters({});
                    setSearchQuery('');
                  }}
                  variant="outline"
                  data-testid="button-reset-search"
                >
                  Сбросить поиск
                </Button>
              </Card>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600">
                    Найдено {filteredPsychologists.length} специалистов
                  </p>
                  <Select defaultValue="rating">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">По рейтингу</SelectItem>
                      <SelectItem value="price-low">Цена: по возрастанию</SelectItem>
                      <SelectItem value="price-high">Цена: по убыванию</SelectItem>
                      <SelectItem value="experience">По опыту</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPsychologists.map((psychologist: any) => (
                    <PsychologistCard 
                      key={psychologist.id} 
                      psychologist={psychologist} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                  <nav className="flex space-x-2">
                    <Button variant="outline" disabled>
                      Предыдущая
                    </Button>
                    <Button className="bg-primary-custom text-white">1</Button>
                    <Button variant="outline">2</Button>
                    <Button variant="outline">3</Button>
                    <Button variant="outline">
                      Следующая
                    </Button>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
