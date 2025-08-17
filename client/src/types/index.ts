export interface AuthUser {
  id: string;
  email: string;
  role: 'client' | 'psychologist' | 'admin';
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified: boolean;
}

export interface SearchFilters {
  specialization?: string;
  minPrice?: number;
  maxPrice?: number;
  formats?: string[];
}

export interface BookingData {
  psychologistId: string;
  dateTime: Date;
  format: 'video' | 'audio' | 'chat';
  notes?: string;
}
