"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { Briefcase, User, MapPin, LogIn, LogOut, Loader2, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, loginWithGoogle, logout, loading } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { name: "Proyección", href: "/proyeccion", icon: Briefcase },
    { name: "Remoto 100%", href: "/remoto", icon: MapPin },
    { name: "Mi Perfil", href: "/perfil", icon: User },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-white font-bold text-xl group">
          <Sparkles className="h-6 w-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            DataJobMatch
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {user && navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors hover:text-white ${
                  isActive ? "text-indigo-400" : "text-gray-400"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300 hidden sm:inline-block">
                Hola, {user.displayName?.split(" ")[0] || "Trader"}
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-1.5 text-sm font-medium text-gray-400 hover:text-red-400 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline-block">Salir</span>
              </button>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center space-x-2 bg-white text-gray-900 px-4 py-2 rounded-full font-medium text-sm hover:bg-gray-100 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Login con Google</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {user && (
        <div className="md:hidden flex border-t border-gray-800 bg-gray-950/90 py-2 justify-around">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center p-2 text-xs font-medium transition-colors ${
                  isActive ? "text-indigo-400" : "text-gray-400"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
