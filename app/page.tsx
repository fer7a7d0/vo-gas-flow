import { createClient } from "@/lib/supabase/server"
import { TarjetaMateria, type Materia } from "@/components/tarjeta-materia"
import { TANQUES, normalizarNombre } from "@/lib/tanques"

function clampPorcentaje(valor: number) {
  if (!Number.isFinite(valor)) return 0
  return Math.max(0, Math.min(100, valor))
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

          <section className="mt-5 rounded-xl border border-border bg-background/60 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-foreground uppercase">Resumen general de niveles</h2>
              <p className="text-xs text-muted-foreground">Ordenado de menor a mayor</p>
            </div>

            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {resumenTanques.map((tanque) => (
                <li key={tanque.nombre} className="rounded-lg border border-border bg-card px-3 py-2.5">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-card-foreground">{tanque.nombre}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums text-card-foreground">{tanque.porcentaje}%</span>
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
                </li>
              ))}
            </ul>
          </section>
        </header>

        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            No se pudieron cargar los datos. Intenta de nuevo más tarde.
          </p>
        )}

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {materias.map((materia) => (
            <TarjetaMateria key={materia.tanque} materia={materia} />
          ))}
        </section>

        {!error && materias.every((m) => !m.id) && (
          <p className="rounded-lg border border-amber-300/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            Ningún tanque coincide con los nombres esperados. Crea los registros en la tabla materias_primas para habilitar el guardado.
          </p>
        )}
      </main>
    </div>
  )
}
