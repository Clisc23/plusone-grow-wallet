import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Bell } from "lucide-react";

interface WalletHeaderProps {
  username?: string;
  profileImage?: string;
  onSettings?: () => void;
  onNotifications?: () => void;
}

export const WalletHeader = ({ 
  username = "Guest User", 
  profileImage, 
  onSettings, 
  onNotifications 
}: WalletHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-6 bg-card border-b border-border">
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 ring-2 ring-primary/20">
          <AvatarImage src={profileImage} alt={username} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold text-foreground">PlusOne</h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNotifications}
          className="text-muted-foreground hover:text-foreground"
        >
          <Bell className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettings}
          className="text-muted-foreground hover:text-foreground"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};