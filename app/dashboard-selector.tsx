"use client"

import { useState } from "react"
import { TarjetaMateria, type Materia } from "@/components/tarjeta-materia"
import { Button } from "@/components/ui/button"

type ResumenTanque = {
  nombre: string
  porcentaje: number
  estado: {
    texto: string
    colorBarra: string
    colorChip: string
  }
}

type DashboardSelectorProps = {
  resumenTanques: ResumenTanque[]
  materias: Materia[]
  error: boolean | null
}

export function DashboardSelector({ resumenTanques, materias, error }: DashboardSelectorProps) {
  const [tanqueSeleccionado, setTanqueSeleccionado] = useState<string | null>(null)

  const materiaPorNombre = new Map(materias.map((m) => [m.tanque ?? m.nombre, m]))
  const materiaSeleccionada = tanqueSeleccionado ? materiaPorNombre.get(tanqueSeleccionado) : null

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:py-12">
        <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">Panel de planta</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-card-foreground text-balance">
            Dashboard de tanques termo
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground text-pretty">
            Visualiza el nivel actual
          </p>

          {!tanqueSeleccionado && (
            <section className="mt-5 rounded-xl border border-border bg-background/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                  Resumen general de niveles
                </h2>
                <p className="text-xs text-muted-foreground">Ordenado de menor a mayor</p>
              </div>

              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {resumenTanques.map((tanque) => (
                  <li key={tanque.nombre}>
                    <button
                      onClick={() => setTanqueSeleccionado(tanque.nombre)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-all hover:bg-card/80 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-card-foreground">{tanque.nombre}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold tabular-nums text-card-foreground">
                            {tanque.porcentaje}%
                          </span>
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tanque.estado.colorChip}`}>
                            {tanque.estado.texto}
                          </span>
                        </div>
                      </div>

                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${tanque.estado.colorBarra}`}
                          style={{ width: `${tanque.porcentaje}%` }}
                        />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </header>

        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            No se pudieron cargar los datos. Intenta de nuevo más tarde.
          </p>
        )}

        {tanqueSeleccionado && materiaSeleccionada && (
          <section className="flex flex-col gap-4">
            <Button
              onClick={() => setTanqueSeleccionado(null)}
              variant="outline"
              className="w-fit"
            >
              ← Volver al resumen
            </Button>
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <TarjetaMateria materia={materiaSeleccionada} />
              </div>
            </div>
          </section>
        )}

        {!tanqueSeleccionado && !error && materias.every((m) => !m.id) && (
          <p className="rounded-lg border border-amber-300/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Ningún tanque coincide con los nombres esperados. Crea los registros en la tabla materias_primas para habilitar el guardado.
          </p>
        )}
      </main>
    </div>
  )
}
