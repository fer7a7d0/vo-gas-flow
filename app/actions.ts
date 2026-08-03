"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { obtenerTanquePorClave } from "@/lib/tanques"

export type ActionResult = { ok: boolean; error?: string }

export async function actualizarNivel(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") || "").trim()
  const tanqueClave = String(formData.get("tanqueClave") || "").trim()
  const cantidadRaw = String(formData.get("cantidad") || "")
  const unidad = String(formData.get("unidad") || "").trim()
  const nota = String(formData.get("nota") || "").trim()

  if (!id) return { ok: false, error: "Tanque no vinculado en base de datos. Crea ese registro para poder guardar nivel." }

  const tanqueConfig = obtenerTanquePorClave(tanqueClave)
  if (!tanqueConfig) {
    return { ok: false, error: "No se encontró la configuración de capacidad para este tanque." }
  }

  const nivelMedido = Number(cantidadRaw)
  if (!Number.isFinite(nivelMedido) || nivelMedido < 0 || nivelMedido > tanqueConfig.capacidadMaxima) {
    return {
      ok: false,
      error: `El nivel debe ser un valor entre 0 y ${tanqueConfig.capacidadMaxima} para ${tanqueConfig.nombreUI}.`,
    }
  }
  if (!unidad) {
    return { ok: false, error: "Debes indicar una unidad de medida." }
  }

  const porcentajeNuevo = Number(((nivelMedido / tanqueConfig.capacidadMaxima) * 100).toFixed(2))

  const supabase = await createClient()
  let materiaId = id
  let cantidadAnterior = 0

  const { data: actual, error: readError } = await supabase
    .from("materias_primas")
    .select("id, cantidad")
    .eq("id", materiaId)
    .single()

  if (readError || !actual) {
    return { ok: false, error: "No se encontró el tanque solicitado." }
  }

  cantidadAnterior = Number(actual.cantidad) || 0

  // Actualizar el nivel actual
  const { error: updateError } = await supabase
    .from("materias_primas")
    .update({ cantidad: porcentajeNuevo, unidad, actualizado_en: new Date().toISOString() })
    .eq("id", materiaId)

  if (updateError) {
    return { ok: false, error: "No se pudo actualizar el nivel." }
  }

  const detalleNivel = `Lectura real: ${nivelMedido}/${tanqueConfig.capacidadMaxima}`
  const notaCompleta = nota ? `${nota} | ${detalleNivel}` : detalleNivel

  // Registrar el movimiento en el historial
  const { error: histError } = await supabase.from("movimientos").insert({
    materia_prima_id: materiaId,
    cantidad_anterior: cantidadAnterior,
    cantidad_nueva: porcentajeNuevo,
    unidad,
    nota: notaCompleta,
  })

  if (histError) {
    return { ok: false, error: "El nivel se actualizó pero no se pudo guardar el historial." }
  }

  revalidatePath("/")
  return { ok: true }
}
