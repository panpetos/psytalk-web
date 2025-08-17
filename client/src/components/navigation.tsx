import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, User, Settings } from "lucide-react";
import { useState } from "react";
import { AuthUser } from "@/types";
import { authService } from "@/lib/auth";

interface NavigationProps {
  user: AuthUser | null;
  onShowLogin: () => void;
  onShowRegister: () => void;
}

export default function Navigation({ user, onShowLogin, onShowRegister }: NavigationProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    return '/dashboard';
  };

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-primary-custom cursor-pointer" data-testid="logo">
                PsychPlatform
              </h1>
            </Link>
            
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/">
                  <a 
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/') 
                        ? 'text-primary-custom' 
                        : 'text-text-custom hover:text-primary-custom'
                    }`}
                    data-testid="nav-home"
                  >
                    Главная
                  </a>
                </Link>
                <Link href="/search">
                  <a 
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      isActive('/search') 
                        ? 'text-primary-custom' 
                        : 'text-text-custom hover:text-primary-custom'
                    }`}
                    data-testid="nav-specialists"
                  >
                    Специалисты
                  </a>
                </Link>
                <a 
                  href="#how-it-works" 
                  className="text-text-custom hover:text-primary-custom px-3 py-2 text-sm font-medium transition-colors"
                  data-testid="nav-how-it-works"
                >
                  Как это работает
                </a>
                <a 
                  href="#about" 
                  className="text-text-custom hover:text-primary-custom px-3 py-2 text-sm font-medium transition-colors"
                  data-testid="nav-about"
                >
                  О нас
                </a>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2" data-testid="user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.firstName[0]}{user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href={getDashboardLink()}>
                    <DropdownMenuItem data-testid="menu-dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Личный кабинет
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem data-testid="menu-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Настройки
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={onShowLogin}
                  data-testid="button-login"
                >
                  Войти
                </Button>
                <Button 
                  className="bg-primary-custom text-white hover:bg-primary-custom/90"
                  onClick={onShowRegister}
                  data-testid="button-register"
                >
                  Регистрация
                </Button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link href="/">
                <a className="block px-3 py-2 text-sm font-medium text-text-custom hover:text-primary-custom">
                  Главная
                </a>
              </Link>
              <Link href="/search">
                <a className="block px-3 py-2 text-sm font-medium text-text-custom hover:text-primary-custom">
                  Специалисты
                </a>
              </Link>
              <a href="#how-it-works" className="block px-3 py-2 text-sm font-medium text-text-custom hover:text-primary-custom">
                Как это работает
              </a>
              <a href="#about" className="block px-3 py-2 text-sm font-medium text-text-custom hover:text-primary-custom">
                О нас
              </a>
              
              {user ? (
                <div className="pt-4 border-t border-gray-200">
                  <Link href={getDashboardLink()}>
                    <a className="block px-3 py-2 text-sm font-medium text-text-custom hover:text-primary-custom">
                      Личный кабинет
                    </a>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-text-custom hover:text-primary-custom"
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={onShowLogin}
                  >
                    Войти
                  </Button>
                  <Button 
                    className="w-full bg-primary-custom text-white hover:bg-primary-custom/90"
                    onClick={onShowRegister}
                  >
                    Регистрация
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
