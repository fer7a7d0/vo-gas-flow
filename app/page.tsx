import { createClient } from "@/lib/supabase/server"
import { type Materia } from "@/components/tarjeta-materia"
import { TANQUES, normalizarNombre } from "@/lib/tanques"
import { DashboardSelector } from "@/app/dashboard-selector"

function clampPorcentaje(valor: number) {
  if (!Number.isFinite(valor)) return 0
  return Math.round(Math.max(0, Math.min(100, valor)))
}

function estadoNivel(porcentaje: number) {
  if (porcentaje < 30) {
    return {
      texto: "Critico",
      colorBarra: "bg-rose-500",
      colorChip: "bg-rose-500/10 text-rose-700 border-rose-300/50 dark:text-rose-300",
    }
  }

  if (porcentaje <= 60) {
    return {
      texto: "Atencion",
      colorBarra: "bg-amber-500",
      colorChip: "bg-amber-500/10 text-amber-700 border-amber-300/50 dark:text-amber-300",
    }
  }

  return {
    texto: "Optimo",
    colorBarra: "bg-emerald-500",
    colorChip: "bg-emerald-500/10 text-emerald-700 border-emerald-300/50 dark:text-emerald-300",
  }
}

export default async function Home() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("materias_primas")
    .select("id, nombre, cantidad, unidad, actualizado_en")
    .order("nombre", { ascending: true })

  const materiasDB = (data ?? []) as Materia[]
  const materiasNormalizadas = new Map(materiasDB.map((m) => [normalizarNombre(m.nombre), m]))

  const materias = TANQUES.map((tanque) => {
    const encontrada = tanque.aliases
      .map((a) => materiasNormalizadas.get(normalizarNombre(a)))
      .find(Boolean)

    if (encontrada) {
      return {
        ...encontrada,
        tanque: tanque.nombreUI,
        claveTanque: tanque.clave,
        capacidadMaxima: tanque.capacidadMaxima,
      }
    }

    return {
      id: "",
      nombre: tanque.nombreUI,
      cantidad: 0,
      unidad: "%",
      actualizado_en: "",
      tanque: tanque.nombreUI,
      claveTanque: tanque.clave,
      capacidadMaxima: tanque.capacidadMaxima,
    }
  })

  const resumenTanques = materias
    .map((materia) => {
      const porcentaje = clampPorcentaje(Number(materia.cantidad))
      return {
        nombre: materia.tanque ?? materia.nombre,
        porcentaje,
        estado: estadoNivel(porcentaje),
      }
    })
    .sort((a, b) => a.porcentaje - b.porcentaje)

  return (
    <DashboardSelector
      resumenTanques={resumenTanques}
      materias={materias}
      error={error}
    />
  )
}
