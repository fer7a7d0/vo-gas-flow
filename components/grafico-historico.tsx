"use client"

import { Materia } from "@/components/tarjeta-materia"

type DatoHistorico = {
  fecha: string
  porcentaje: number
  nota?: string
}

type GraficoHistoricoProps = {
  materia: Materia
  datos: DatoHistorico[]
}

export function GraficoHistorico({ materia, datos }: GraficoHistoricoProps) {
  const nombreTanque = materia.tanque ?? materia.nombre

  // Calcular estadísticas
  const porcentajes = datos.map((d) => d.porcentaje)
  const promedio = porcentajes.length > 0 ? Math.round(porcentajes.reduce((a, b) => a + b, 0) / porcentajes.length) : 0
  const criticos = porcentajes.filter((p) => p < 30).length
  const minimo = porcentajes.length > 0 ? Math.min(...porcentajes) : 0
  const maximo = porcentajes.length > 0 ? Math.max(...porcentajes) : 0

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 md:py-12">
        <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">Historial</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-card-foreground text-balance">
            {nombreTanque} - Últimos 14 días
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground text-pretty">
            Comportamiento histórico y estadísticas del nivel
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold tracking-tight text-card-foreground">Estadísticas</h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-background/60 p-4">
              <p className="text-sm font-medium text-muted-foreground">Promedio</p>
              <p className="mt-2 text-2xl font-bold text-card-foreground">{promedio}%</p>
            </div>

            <div className="rounded-lg bg-background/60 p-4">
              <p className="text-sm font-medium text-muted-foreground">Máximo</p>
              <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{maximo}%</p>
            </div>

            <div className="rounded-lg bg-background/60 p-4">
              <p className="text-sm font-medium text-muted-foreground">Mínimo</p>
              <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{minimo}%</p>
            </div>

            <div className="rounded-lg bg-background/60 p-4">
              <p className="text-sm font-medium text-muted-foreground">Críticos</p>
              <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{criticos}x</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold tracking-tight text-card-foreground">Gráfico de línea</h2>
          <div className="flex h-64 items-center justify-center rounded-lg bg-background/60 text-muted-foreground">
            <p className="text-sm">Gráfico se cargará aquí (Recharts)</p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-card-foreground">Historial detallado</h2>
          <div className="flex flex-col gap-2">
            {datos.length > 0 ? (
              datos.map((dato, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 rounded-lg bg-background/60 p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">{dato.fecha}</p>
                    {dato.nota && <p className="text-xs text-muted-foreground">{dato.nota}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-card-foreground">{dato.porcentaje}%</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos históricos disponibles</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
