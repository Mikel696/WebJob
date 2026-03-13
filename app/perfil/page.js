"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { Save, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PerfilPage() {
  const { user, userProfile, updateProfileData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    experience: "",
    education: "",
    portfolio: "",
    skills: [],
  });
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
    if (userProfile) {
      setFormData({
        experience: userProfile.experience || "",
        education: userProfile.education || "",
        portfolio: userProfile.portfolio || "",
        skills: userProfile.skills || [],
      });
    }
  }, [user, userProfile, authLoading, router]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (formData.skills.includes(skillInput.trim())) {
      toast.error("Esta habilidad ya está en tu lista");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, skillInput.trim()],
    }));
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const success = await updateProfileData(formData);
    setSaving(false);
    
    if (success) {
      toast.success("Perfil guardado y actualizado exitosamente");
    } else {
      toast.error("Hubo un error al guardar tu perfil");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          Mi Perfil Profesional
        </h1>
        <p className="text-gray-400 mt-2">
          Completa tus datos para que el algoritmo encuentre las mejores ofertas para ti.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-2xl shadow-xl">
        {/* SKILLS SECTION */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300">
            Habilidades Técnicas (Skills)
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              disabled={saving}
              placeholder="Ej: Python, SQL, Power BI..."
              className="flex-1 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              onClick={handleAddSkill}
              type="button"
              disabled={saving}
              className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-full text-sm flex items-center space-x-2 transition-all hover:bg-indigo-500/20"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  disabled={saving}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>
            ))}
            {formData.skills.length === 0 && (
              <span className="text-sm text-gray-500">No hay habilidades agregadas.</span>
            )}
          </div>
        </div>

        {/* EXPERIENCE & EDUCATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Años de Experiencia Relevante (Resumen)
            </label>
            <textarea
              rows="4"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              disabled={saving}
              placeholder="Ej: 3 años de experiencia en análisis de datos usando SQL y Python..."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Estudios Actuales / Certificaciones
            </label>
            <textarea
              rows="4"
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              disabled={saving}
              placeholder="Ej: Ing. Sistemas, Certificación Google Data Analytics..."
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* PORTFOLIO */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Enlace a Portafolio o LinkedIn
          </label>
          <input
            type="url"
            value={formData.portfolio}
            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
            disabled={saving}
            placeholder="https://github.com/tu-usuario"
            className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* SAVE BUTTON */}
        <div className="pt-4 border-t border-gray-800">
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            <span>{saving ? "Guardando..." : "Guardar Perfil"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
