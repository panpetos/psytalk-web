import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Video, Phone, MessageSquare } from "lucide-react";
import { Link } from "wouter";

interface PsychologistCardProps {
  psychologist: {
    id: string;
    specialization: string;
    experience: number;
    description: string;
    price: string;
    formats: string[];
    rating: string;
    totalReviews: number;
    user: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

export default function PsychologistCard({ psychologist }: PsychologistCardProps) {
  const formatIcons = {
    video: Video,
    audio: Phone,
    chat: MessageSquare,
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < fullStars 
                ? 'text-yellow-400 fill-yellow-400' 
                : i === fullStars && hasHalfStar
                ? 'text-yellow-400 fill-yellow-400/50'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`psychologist-card-${psychologist.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={psychologist.user.avatar} />
            <AvatarFallback className="bg-primary-custom text-white">
              {getInitials(psychologist.user.firstName, psychologist.user.lastName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-text-custom mb-1">
              Др. {psychologist.user.firstName} {psychologist.user.lastName}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{psychologist.specialization}</p>
            
            <div className="flex items-center mb-2">
              {renderStars(psychologist.rating)}
              <span className="text-sm text-gray-600 ml-2">
                {psychologist.rating} ({psychologist.totalReviews} отзывов)
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">
              {psychologist.experience} лет опыта
            </p>
            
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {psychologist.description}
            </p>
            
            {/* Format badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {psychologist.formats.map((format) => {
                const Icon = formatIcons[format as keyof typeof formatIcons];
                return (
                  <Badge key={format} variant="secondary" className="flex items-center space-x-1">
                    <Icon className="h-3 w-3" />
                    <span className="capitalize">{format}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-lg font-semibold text-primary-custom">
            ₽{parseFloat(psychologist.price).toLocaleString()}/сессия
          </span>
          <Link href={`/booking/${psychologist.id}`}>
            <Button 
              className="bg-primary-custom text-white hover:bg-primary-custom/90"
              data-testid={`button-book-${psychologist.id}`}
            >
              Записаться
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
