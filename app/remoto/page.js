"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import OfferCard from "@/components/OfferCard";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { calculateMatchPercentage } from "@/lib/matching";
import { Loader2, AlertCircle, Globe } from "lucide-react";

export default function RemotoPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOffers() {
      try {
        // Filtrar query inicial por trabajos remotos
        const q = query(
          collection(db, "offers"),
          where("isRemote", "==", true),
          orderBy("scrapedAt", "desc"),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const offersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const userSkills = userProfile?.skills || [];
        const offersWithMatch = offersList.map((offer) => {
          const matchPercentage = calculateMatchPercentage(
            userSkills,
            offer.title + " " + offer.description
          );
          return { ...offer, matchPercentage };
        });

        // Filtrado estricto: Solo ofertas remotas con más del 50% de match para "Ingreso Inmediato"
        // o si el usuario no tiene habilidades configuradas, se muestran igual para que no quede vacío.
        const filteredOffers = userSkills.length > 0 
            ? offersWithMatch.filter(o => o.matchPercentage >= 50)
            : offersWithMatch;

        filteredOffers.sort((a, b) => b.matchPercentage - a.matchPercentage);
        setOffers(filteredOffers);
      } catch (error) {
        console.error("Error fetching remote offers:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchOffers();
    }
  }, [userProfile, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
        <p className="text-gray-400 animate-pulse">Buscando oportunidades globales 100% remotas...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <Globe className="h-16 w-16 text-cyan-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Inicia Sesión para ver Ofertas Remotas</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Conéctate para ver vacantes internacionales o nacionales 100% remotas compatibles con tu perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center space-x-3">
          <Globe className="h-8 w-8 text-cyan-400 mr-2 inline" />
          Ingreso Inmediato (100% Remoto)
        </h1>
        <p className="text-gray-400 mt-2">
          Feed estrictamente filtrado: Trabajos remotos con alto nivel de compatibilidad con tus habilidades actuales.
        </p>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-20 border border-gray-800 rounded-2xl bg-gray-900/50">
          <p className="text-gray-400">No se encontraron ofertas remotas altamente compatibles en este momento.</p>
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
