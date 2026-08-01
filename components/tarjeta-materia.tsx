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

export function TarjetaMateria({ materia }: { materia: Materia }) {
  const [cantidad, setCantidad] = useState(String(materia.cantidad))
  const [unidad, setUnidad] = useState(materia.unidad)
  const [nota, setNota] = useState("")
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null)
  const [verHistorial, setVerHistorial] = useState(false)
  const [isPending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMensaje(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await actualizarNivel(formData)
      if (res.ok) {
        setMensaje({ tipo: "ok", texto: "Nivel actualizado y registrado en el historial." })
        setNota("")
      } else {
        setMensaje({ tipo: "error", texto: res.error ?? "Ocurrió un error." })
      }
    })
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-balance">{materia.nombre}</h2>
        <span className="rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
          {materia.cantidad} {materia.unidad}
        </span>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={materia.id} />

        <div className="flex gap-3">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium text-muted-foreground">Cantidad</span>
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

          <label className="flex w-28 flex-col gap-1 text-sm">
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
            placeholder="Motivo del cambio, entrada, salida..."
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Guardando..." : "Actualizar nivel"}
        </Button>

        {mensaje && (
          <p
            role="status"
            className={
              mensaje.tipo === "ok"
                ? "text-sm text-primary"
                : "text-sm text-destructive"
            }
          >
            {mensaje.texto}
          </p>
        )}
      </form>

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
                    {m.cantidad_anterior} → {m.cantidad_nueva} {m.unidad}
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
