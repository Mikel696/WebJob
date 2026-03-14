"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import OfferCard from "@/components/OfferCard";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { calculateMatchPercentage } from "@/lib/matching";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function ProyeccionPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);

  useEffect(() => {
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "offers"),
        orderBy("scrapedAt", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const offersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calcular el porcentaje de coincidencia para cada oferta
      const userSkills = userProfile?.skills || [];
      const offersWithMatch = offersList.map((offer) => {
        const matchPercentage = calculateMatchPercentage(
          userSkills,
          offer.title + " " + offer.description
        );
        return { ...offer, matchPercentage };
      });

      // Ordenar por mayor porcentaje de coincidencia
      offersWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);
      setOffers(offersWithMatch);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchOffers();
    }
  }, [userProfile, authLoading]);

  const handleRefreshOffers = async () => {
    setIsScraping(true);
    toast.info("Iniciando búsqueda de nuevas ofertas. Esto puede tomar unos minutos...", { id: 'scrape-toast' });
    
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        toast.success("¡Nuevas ofertas encontradas y guardadas!", { id: 'scrape-toast' });
        // Recargar las ofertas desde Firebase
        await fetchOffers();
      } else {
        toast.error("Hubo un problema al buscar ofertas: " + data.message, { id: 'scrape-toast' });
      }
    } catch (error) {
      toast.error("Error de conexión al intentar actualizar", { id: 'scrape-toast' });
    } finally {
      setIsScraping(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-gray-400 animate-pulse">Analizando mercado y cruzando datos...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <AlertCircle className="h-16 w-16 text-indigo-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Inicia Sesión para ver Proyección</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Debes iniciar sesión y completar tu perfil para que nuestro algoritmo pueda cruzar tus habilidades con las ofertas del mercado.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            Proyección: Analista de Datos
          </h1>
          <p className="text-gray-400 mt-2">
            Ofertas relevantes nacionales ordenadas por afinidad con tu perfil actual.
          </p>
        </div>
        <button
          onClick={handleRefreshOffers}
          disabled={isScraping}
          className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg border border-gray-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isScraping ? 'animate-spin' : ''}`} />
          <span>{isScraping ? "Buscando ofertas..." : "Actualizar Ofertas"}</span>
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-20 border border-gray-800 rounded-2xl bg-gray-900/50">
          <p className="text-gray-400">No se encontraron ofertas. El scraper se ejecutará pronto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              matchPercentage={offer.matchPercentage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
