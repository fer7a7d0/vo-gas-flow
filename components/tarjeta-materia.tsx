"use client"

import { useState, useTransition } from "react"
import { actualizarNivel } from "@/app/actions"
import { Button } from "@/components/ui/button"

export type Materia = {
  id: string
  nombre: string
  cantidad: number
  unidad: string
  actualizado_en: string
  tanque?: string
}

function clampPorcentaje(valor: number) {
  if (!Number.isFinite(valor)) return 0
  return Math.max(0, Math.min(100, valor))
}

function colorNivel(porcentaje: number) {
  if (porcentaje < 30) {
    return {
      barra: "bg-rose-500",
      halo: "shadow-[0_0_18px_rgba(244,63,94,0.45)]",
      chip: "bg-rose-500/10 text-rose-700 border-rose-300/50 dark:text-rose-300",
      estado: "Critico",
    }
  }

  if (porcentaje <= 60) {
    return {
      barra: "bg-amber-500",
      halo: "shadow-[0_0_18px_rgba(245,158,11,0.45)]",
      chip: "bg-amber-500/10 text-amber-700 border-amber-300/50 dark:text-amber-300",
      estado: "Atencion",
    }
  }

  return {
    barra: "bg-emerald-500",
    halo: "shadow-[0_0_18px_rgba(16,185,129,0.45)]",
    chip: "bg-emerald-500/10 text-emerald-700 border-emerald-300/50 dark:text-emerald-300",
    estado: "Optimo",
  }
}

export function TarjetaMateria({ materia }: { materia: Materia }) {
  const [cantidad, setCantidad] = useState(String(clampPorcentaje(materia.cantidad)))
  const [nota, setNota] = useState("")
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const porcentajeActual = clampPorcentaje(Number(cantidad))
  const semaforo = colorNivel(porcentajeActual)
  const nombreTanque = materia.tanque ?? materia.nombre
  const tanqueDisponible = Boolean(materia.id)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMensaje(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await actualizarNivel(formData)
      if (res.ok) {
        setMensaje({ tipo: "ok", texto: "Nivel registrado correctamente." })
        setNota("")
      } else {
        setMensaje({ tipo: "error", texto: res.error ?? "Ocurrió un error." })
      }
    })
  }

  return (
    <article className="flex min-h-[420px] flex-col gap-4 rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-tight">{nombreTanque}</h2>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${semaforo.chip}`}>
          {semaforo.estado}
        </span>
      </header>

      <div className="grid grid-cols-[1fr_auto] items-center gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Nivel actual</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-card-foreground">{porcentajeActual}%</p>
          <p className="text-xs text-muted-foreground">Capacidad nominal: 100%</p>
        </div>

        <div className="relative h-44 w-20 overflow-hidden rounded-t-[1.6rem] rounded-b-lg border-2 border-border bg-muted/80 p-1">
          <div className="absolute inset-x-1 bottom-1 top-1 overflow-hidden rounded-t-[1.2rem] rounded-b-md bg-gradient-to-b from-muted to-background">
            <div
              className={`absolute inset-x-0 bottom-0 transition-all duration-500 ${semaforo.barra} ${semaforo.halo}`}
              style={{ height: `${porcentajeActual}%` }}
            />
          </div>
          <div className="absolute -top-2 left-1/2 h-2 w-10 -translate-x-1/2 rounded-t-md border border-border bg-muted" />
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={materia.id} />
        <input type="hidden" name="nombre" value={nombreTanque} />
        <input type="hidden" name="unidad" value="%" />

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-muted-foreground">Registrar nivel (%)</span>
            <input
              name="cantidad"
              type="number"
              min="0"
              max="100"
              step="0.1"
              inputMode="decimal"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              disabled={!tanqueDisponible || isPending}
              required
              className="rounded-md border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-muted-foreground">Nota (opcional)</span>
          <input
            name="nota"
            type="text"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Motivo del cambio, entrada, salida..."
            disabled={!tanqueDisponible || isPending}
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
          />
        </label>

        <Button type="submit" disabled={!tanqueDisponible || isPending} className="w-full">
          {isPending ? "Guardando..." : "Guardar nivel"}
        </Button>

        {!tanqueDisponible && (
          <p className="text-sm text-amber-700">
            Tanque pendiente de vincular en base de datos.
          </p>
        )}

        {mensaje && (
          <p
            role="status"
            className={
              mensaje.tipo === "ok"
                ? "text-sm text-emerald-700"
                : "text-sm text-rose-700"
            }
          >
            {mensaje.texto}
          </p>
        )}
      </form>
    </article>
  )
}
