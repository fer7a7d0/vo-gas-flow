"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type ActionResult = { ok: boolean; error?: string }

export async function actualizarNivel(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") || "")
  const cantidadRaw = String(formData.get("cantidad") || "")
  const unidad = String(formData.get("unidad") || "").trim()
  const nota = String(formData.get("nota") || "").trim()

  if (!id) return { ok: false, error: "Falta el identificador del producto." }

  const cantidadNueva = Number(cantidadRaw)
  if (!Number.isFinite(cantidadNueva) || cantidadNueva < 0) {
    return { ok: false, error: "La cantidad debe ser un número válido mayor o igual a cero." }
  }
  if (!unidad) {
    return { ok: false, error: "Debes indicar una unidad de medida." }
  }

  const supabase = await createClient()

  // Leer el nivel actual para registrar el histórico
  const { data: actual, error: readError } = await supabase
    .from("materias_primas")
    .select("cantidad")
    .eq("id", id)
    .single()

  if (readError || !actual) {
    return { ok: false, error: "No se encontró el producto." }
  }

  const cantidadAnterior = Number(actual.cantidad)

  // Actualizar el nivel actual
  const { error: updateError } = await supabase
    .from("materias_primas")
    .update({ cantidad: cantidadNueva, unidad, actualizado_en: new Date().toISOString() })
    .eq("id", id)

  if (updateError) {
    return { ok: false, error: "No se pudo actualizar el nivel." }
  }

  // Registrar el movimiento en el historial
  const { error: histError } = await supabase.from("movimientos").insert({
    materia_prima_id: id,
    cantidad_anterior: cantidadAnterior,
    cantidad_nueva: cantidadNueva,
    unidad,
    nota: nota || null,
  })

  if (histError) {
    return { ok: false, error: "El nivel se actualizó pero no se pudo guardar el historial." }
  }

  revalidatePath("/")
  return { ok: true }
}
