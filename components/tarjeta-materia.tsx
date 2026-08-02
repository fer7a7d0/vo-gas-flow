"use client"

import { useState, useTransition } from "react"
import { actualizarNivel } from "@/app/actions"
import { Button } from "@/components/ui/button"

type Movimiento = {
  id: string
  cantidad_anterior: number
  cantidad_nueva: number
  unidad: string
  nota: string | null
  creado_en: string
}

export type Materia = {
  id: string
  nombre: string
  cantidad: number
  capacidad_maxima: number
  unidad: string
  actualizado_en: string
  movimientos: Movimiento[]
}

const UNIDADES = ["m3", "L", "kg", "ton", "psi"]

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function TanqueTermo({ porcentaje }: { porcentaje: number }) {
  const pct = Math.max(0, Math.min(100, porcentaje))
  // color del líquido según nivel: bajo = destructive, medio = chart-4, lleno = primary
  const color = pct < 20 ? "bg-destructive" : pct < 50 ? "bg-chart-4" : "bg-primary"

  return (
    <div className="flex flex-col items-center gap-2" aria-hidden="true">
      <div className="relative h-40 w-20 overflow-hidden rounded-2xl border-2 border-border bg-muted">
        <div
          className={`absolute inset-x-0 bottom-0 transition-[height] duration-500 ease-out ${color}`}
          style={{ height: `${pct}%` }}
        />
        {/* marcas de nivel */}
        <div className="absolute inset-0 flex flex-col justify-between py-2">
          {[100, 75, 50, 25].map((m) => (
            <span key={m} className="mx-2 border-t border-border/40" />
          ))}
        </div>
      </div>
      <span className="text-xl font-bold tabular-nums text-foreground">{pct.toFixed(0)}%</span>
    </div>
  )
}

export function TarjetaMateria({ materia }: { materia: Materia }) {
  const [cantidad, setCantidad] = useState(String(materia.cantidad))
  const [capacidad, setCapacidad] = useState(String(materia.capacidad_maxima))
  const [unidad, setUnidad] = useState(materia.unidad)
  const [nota, setNota] = useState("")
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null)
  const [verHistorial, setVerHistorial] = useState(false)
  const [isPending, startTransition] = useTransition()

  // porcentaje en vivo mientras el usuario captura
  const cantidadNum = Number(cantidad)
  const capacidadNum = Number(capacidad)
  const porcentaje =
    Number.isFinite(cantidadNum) && Number.isFinite(capacidadNum) && capacidadNum > 0
      ? (cantidadNum / capacidadNum) * 100
      : 0

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMensaje(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await actualizarNivel(formData)
      if (res.ok) {
        setMensaje({ tipo: "ok", texto: "Nivel actualizado." })
        setNota("")
      } else {
        setMensaje({ tipo: "error", texto: res.error ?? "Ocurrió un error." })
      }
    })
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <h2 className="text-lg font-semibold text-balance">{materia.nombre}</h2>

      <div className="flex items-start gap-5">
        <TanqueTermo porcentaje={porcentaje} />

        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-3">
          <input type="hidden" name="id" value={materia.id} />

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-muted-foreground">Cantidad actual</span>
            <input
              name="cantidad"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              className="rounded-md border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              <span className="font-medium text-muted-foreground">Capacidad máx.</span>
              <input
                name="capacidad_maxima"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                required
                className="rounded-md border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="flex w-24 flex-col gap-1 text-sm">
              <span className="font-medium text-muted-foreground">Unidad</span>
              <select
                name="unidad"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-muted-foreground">Nota (opcional)</span>
            <input
              name="nota"
              type="text"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Motivo del cambio..."
              className="rounded-md border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Guardando..." : "Guardar nivel"}
          </Button>

          {mensaje && (
            <p
              role="status"
              className={mensaje.tipo === "ok" ? "text-sm text-primary" : "text-sm text-destructive"}
            >
              {mensaje.texto}
            </p>
          )}
        </form>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setVerHistorial((v) => !v)}
          className="self-start text-sm font-medium text-muted-foreground hover:text-foreground"
          aria-expanded={verHistorial}
        >
          {verHistorial ? "Ocultar historial" : `Ver historial (${materia.movimientos.length})`}
        </button>

        {verHistorial && (
          <ul className="flex flex-col gap-2">
            {materia.movimientos.length === 0 && (
              <li className="text-sm text-muted-foreground">Sin movimientos registrados.</li>
            )}
            {materia.movimientos.map((m) => (
              <li key={m.id} className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-foreground">
                    {m.cantidad_anterior} {"->"} {m.cantidad_nueva} {m.unidad}
                  </span>
                  <time className="text-xs">{formatFecha(m.creado_en)}</time>
                </div>
                {m.nota && <p className="mt-1 text-xs">{m.nota}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
