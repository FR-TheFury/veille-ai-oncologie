
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Shield, Eye, Settings, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserMenu = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user || !profile) return null;

  const initials = profile.first_name && profile.last_name 
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : profile.email[0].toUpperCase();

  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.email;

  const getRoleIcon = () => {
    switch (profile.role) {
      case 'admin': return <Shield className="w-3 h-3 mr-1" />;
      case 'manager': return <Settings className="w-3 h-3 mr-1" />;
      case 'lecteur': return <Eye className="w-3 h-3 mr-1" />;
      default: return <Eye className="w-3 h-3 mr-1" />;
    }
  };

  const getRoleBadgeVariant = () => {
    switch (profile.role) {
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      case 'lecteur': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <Badge variant={getRoleBadgeVariant()} className="text-xs">
                {getRoleIcon()}
                <span className="capitalize">{profile.role}</span>
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {profile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Mon profil</span>
        </DropdownMenuItem>
        {isAdmin() && (
          <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
            <Users className="mr-2 h-4 w-4" />
            <span>Administration</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
