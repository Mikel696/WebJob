"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { ExternalLink, BookmarkPlus, BookmarkCheck, MapPin, Building, BriefcaseIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OfferCard({ offer, matchPercentage }) {
  const { user, userProfile, updateProfileData } = useAuth();
  const isSaved = userProfile?.savedOffers?.includes(offer.id);
  const [saving, setSaving] = useState(false);

  const handleSaveOffer = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para guardar ofertas");
      return;
    }

    setSaving(true);
    try {
      let updatedSavedOffers = [...(userProfile.savedOffers || [])];
      
      if (isSaved) {
        updatedSavedOffers = updatedSavedOffers.filter(id => id !== offer.id);
        toast.success("Oferta removida de guardados");
      } else {
        updatedSavedOffers.push(offer.id);
        toast.success("Oferta guardada en tu perfil");
      }

      await updateProfileData({ savedOffers: updatedSavedOffers });
    } catch (error) {
      toast.error("Error al actualizar la oferta");
    } finally {
      setSaving(false);
    }
  };

  // Determinar color del badge según match
  const matchColor = matchPercentage >= 80 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                    matchPercentage >= 50 ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
                    "text-gray-400 bg-gray-400/10 border-gray-400/20";

  return (
    <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-lg hover:border-indigo-500/50 transition-all group group-hover:shadow-indigo-500/10 flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors line-clamp-2">
            {offer.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mt-2">
            <span className="flex items-center gap-1.5"><Building className="h-4 w-4" /> {offer.company}</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {offer.location}</span>
            <span className="flex items-center gap-1.5"><BriefcaseIcon className="h-4 w-4" /> {offer.isRemote ? "Remoto" : "Presencial/Híbrido"}</span>
          </div>
        </div>
        
        {/* Match Percentage Badge */}
        <div className={`flex flex-col items-center justify-center px-4 py-2 border rounded-xl ${matchColor}`}>
          <span className="text-2xl font-black">{matchPercentage}%</span>
          <span className="text-xs uppercase font-semibold tracking-wider opacity-80">Match</span>
        </div>
      </div>

      <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-grow">
        {offer.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800/50 mt-auto">
        <span className="text-xs text-gray-500">
          Publicado hace {offer.scrapedAt ? formatDistanceToNow(offer.scrapedAt.toDate ? offer.scrapedAt.toDate() : new Date(offer.scrapedAt), { locale: es }) : "poco"}
        </span>
        
        <div className="flex gap-2">
          <button
            onClick={handleSaveOffer}
            disabled={saving}
            className={`p-2.5 rounded-lg transition-colors border ${
              isSaved 
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20" 
                : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 hover:border-gray-600"
            }`}
            title={isSaved ? "Remover de guardados" : "Guardar oferta"}
          >
            {isSaved ? <BookmarkCheck className="h-5 w-5" /> : <BookmarkPlus className="h-5 w-5" />}
          </button>
          
          <a
            href={offer.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
          >
            <span>Ver y Aplicar</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
