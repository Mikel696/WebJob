"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sparkles, BarChart2, Briefcase, Globe2, ArrowRight } from "lucide-react";

export default function Home() {
  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/proyeccion");
    }
  }, [user, loading, router]);

  if (loading || user) return null; // Previene flash de UI

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Hero Section */}
      <div className="space-y-6 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full text-indigo-400 font-medium text-sm mb-4">
          <Sparkles className="h-4 w-4" />
          <span>El primer Job Board inteligente para Analistas de Datos</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
          Encuentra tu próximo empleo con <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">precisión algorítmica</span>
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Nuestra plataforma analiza tu perfil técnico y hace match con ofertas de LinkedIn, Computrabajo y portales remotos, destacando tu nivel de compatibilidad en segundos.
        </p>

        <div className="pt-8">
          <button
            onClick={loginWithGoogle}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-white/10 border border-white/20 font-pj rounded-xl hover:bg-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative flex items-center gap-2">
              Comenzar Ahora - Es Gratis
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-16 px-4">
        
        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl flex flex-col items-center text-center hover:border-indigo-500/50 transition-colors">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
            <BarChart2 className="h-7 w-7 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Matching Inteligente</h3>
          <p className="text-gray-400">Evaluamos tus herramientas (SQL, Python, Power BI) contra los requisitos exactos de la vacante.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl flex flex-col items-center text-center hover:border-cyan-500/50 transition-colors">
          <div className="w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center mb-6">
            <Globe2 className="h-7 w-7 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">100% Remoto o Local</h3>
          <p className="text-gray-400">Filtros estrictos para encontrar oportunidades globales o en empresas top de Colombia.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <Briefcase className="h-7 w-7 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Ingreso Inmediato</h3>
          <p className="text-gray-400">Destacamos vacantes con alto match y procesos de selección cortos para que generes ingresos rápidamente.</p>
        </div>

      </div>
    </div>
  );
}
