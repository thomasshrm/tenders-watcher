import { useRef, useState } from "react";
import { User } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { useAuth } from "@/features/auth/auth-context";

export function UserMenu() {
    const [open, setOpen] = useState(false);
    const closeTimer = useRef<number | null>(null);
    const { logout } = useAuth();

    const openNow = () => {
        if (closeTimer.current) {
            window.clearTimeout(closeTimer.current);
            closeTimer.current = null;
        }
        setOpen(true);
    }

    const closeSoon = () => {
        closeTimer.current = window.setTimeout(() => setOpen(false), 120);
    };

    return(
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger 
                asChild
                onMouseOver={openNow}
                onMouseLeave={closeSoon} 
            >
                <button 
                    className="h-10 px-6 flex items-center text-neutral-200 hover:text-white transition-colors"
                    aria-label="User menu"
                >
                    <User className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="bg-[#141414] border border-neutral-800 text-xs text-neutral-300 shadow-md"
                onMouseOver={openNow}
                onMouseLeave={closeSoon}
            >
                <DropdownMenuItem
                    onClick={() => console.log("Profile")}
                    className="cursor-pointer hover:bg-neutral-800"
                >
                    <User />Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer hover:bg-neutral-800"
                >
                    <User />Profile
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}