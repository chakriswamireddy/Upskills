import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ThemeToggler from "@/app/(frontend)/components/shared/ThemeToggler";
import { logout, getSessionUser } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import { Label } from "@/components/ui/label";
import Logout from "../../actions/Logout";

const navLinks = [
  { label: "Courses", href: "/all-courses" },
  { label: "Dashboard", href: "/dashboard", role: "ADMIN" },
  { label: "My Learning", href: "/my-learning" },
  { label: "Teach", href: "/instructor/my-teachings", role: "INSTRUCTOR" },
];

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="left" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks
                    .filter(
                      (li) =>
                        li?.role && li.role === user?.role?.toLocaleUpperCase()
                    )
                    .map((link) => (
                      <Link key={link.href} href={link.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                        >
                          {link.label}
                        </Button>
                      </Link>
                    ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/all-courses" className="text-xl font-semibold">
            Upskills
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks
              .filter((li) =>
                li?.role ? li.role === user?.role?.toLocaleUpperCase() : true
              )
              .map((link) => (
                <Button
                  key={link.href}
                  asChild
                  variant="ghost"
                  className="relative text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggler />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex">
                <Avatar className="cursor-pointer h-8 w-8">
                  <AvatarFallback> {user?.role.slice(0, 1)} </AvatarFallback>
                </Avatar>
                <Label> {user?.role} </Label>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              {user && (
                <DropdownMenuItem asChild className="text-destructive">
                  <form action={logout.bind(null, user?.role)}>
                    <button type="submit" >
                      Logout
                    </button>
                  </form>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
