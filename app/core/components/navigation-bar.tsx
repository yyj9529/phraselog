import { CogIcon, HomeIcon, LogOutIcon, MenuIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router";

import LangSwitcher from "./lang-switcher";
import ThemeSwitcher from "./theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import {
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "./ui/sheet";

function UserMenu({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email?: string;
  avatarUrl?: string | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 cursor-pointer rounded-lg">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{name}</span>
          <span className="truncate text-xs">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* <DropdownMenuItem asChild>
          <SheetClose asChild>
            <Link to="/dashboard" viewTransition>
              <HomeIcon className="size-4" />
              Dashboard
            </Link>
          </SheetClose>
        </DropdownMenuItem> */}
        
        <DropdownMenuItem asChild>
          <SheetClose asChild>
            <Link to="/logout" viewTransition>
              <LogOutIcon className="size-4" />
             로그아웃
            </Link>
          </SheetClose>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AuthButtons() {
  return (
    <>
      <Button variant="ghost" asChild>
        <SheetClose asChild>
          <Link to="/login" viewTransition>
            로그인
          </Link>
        </SheetClose>
      </Button>
      
      <Button variant="default" asChild>
        <SheetClose asChild>
          <Link to="/join" viewTransition>
           회원가입
          </Link>
        </SheetClose>
      </Button>
    </>
  );
}

// function Actions() {
//   return (
//     <>
//       <ThemeSwitcher />
      
//       <LangSwitcher />
//     </>
//   );
// }

export function NavigationBar({
  name,
  email,
  avatarUrl,
  loading,
}: {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const isOnLearningPage = pathname === "/phraselog/learning";

  return (
    <nav
      className={
        "mx-auto flex h-16 w-full items-center justify-between border-b px-5 shadow-xs backdrop-blur-lg transition-opacity md:px-10"
      }
    >
      <div className="mx-auto flex h-full w-full max-w-screen-2xl items-center justify-between py-3">
        <Link to="/">
          <h1 className="text-lg font-extrabold">PhraseLog</h1>
        </Link>
        
        <div className="hidden h-full items-center gap-5 md:flex">
        
          {name && (
            <Button asChild variant="default">
              <Link
                to={isOnLearningPage ? "/" : "/phraselog/learning"}
                viewTransition
                className="rounded-lg px-5 py-2.5 text-sm font-semibold"
              >
                {isOnLearningPage ? "새로운 표현 저장하기" : "지난 표현 복습하기"}
              </Link>
            </Button>
          )}
          
          {/* <Separator orientation="vertical" />
          
          <Actions />
          
          <Separator orientation="vertical" /> */}
          
          {loading ? (
            <div className="flex items-center">
              <div className="bg-muted-foreground/20 size-8 animate-pulse rounded-lg" />
            </div>
          ) : (
            <>
              {name ? (
                <UserMenu name={name} email={email} avatarUrl={avatarUrl} />
              ) : (
                <AuthButtons />
              )}
            </>
          )}
        </div>
        
        <SheetTrigger className="size-6 md:hidden">
          <MenuIcon />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetClose asChild>
              <Link to="/phraselog">PhraseLog</Link>
            </SheetClose>
            {name && (
              <SheetClose asChild>
                <Link to="/phraselog/learning">My Learning</Link>
              </SheetClose>
            )}
            <SheetClose asChild>
              <Link to="/contact">Contact</Link>
            </SheetClose>
          </SheetHeader>
          {loading ? (
            <div className="flex items-center">
              <div className="bg-muted-foreground h-4 w-24 animate-pulse rounded-full" />
            </div>
          ) : (
            <SheetFooter>
              {name ? (
                <div className="grid grid-cols-3">
                  <div className="col-span-2 flex w-full justify-between">
                    {/* <Actions /> */}
                  </div>
                  <div className="flex justify-end">
                    <UserMenu name={name} email={email} avatarUrl={avatarUrl} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex justify-between">
                    {/* <Actions /> */}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <AuthButtons />
                  </div>
                </div>
              )}
            </SheetFooter>
          )}
        </SheetContent>
      </div>
    </nav>
  );
}
