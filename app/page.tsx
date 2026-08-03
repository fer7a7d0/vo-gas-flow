import { createClient } from "@/lib/supabase/server"
import { TarjetaMateria, type Materia } from "@/components/tarjeta-materia"

type ConfigTanque = {
  clave: string
  nombreUI: string
  aliases: string[]
}

const TANQUES: ConfigTanque[] = [
  { clave: "AR", nombreUI: "Ar", aliases: ["ar", "argon", "argón"] },
  { clave: "N2", nombreUI: "N2", aliases: ["n2", "nitrogeno", "nitrógeno"] },
  { clave: "O2", nombreUI: "O2", aliases: ["o2", "oxigeno", "oxígeno"] },
  {
    clave: "CO2_1",
    nombreUI: "CO2 #1",
    aliases: ["co2 #1", "co2 1", "co2-1", "bioxido de carbono #1", "bióxido de carbono #1"],
  },
  {
    clave: "CO2_2",
    nombreUI: "CO2 #2",
    aliases: ["co2 #2", "co2 2", "co2-2", "bioxido de carbono #2", "bióxido de carbono #2"],
  },
]

function normalizarNombre(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
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
      }
    }

    return {
      id: "",
      nombre: tanque.nombreUI,
      cantidad: 0,
      unidad: "%",
      actualizado_en: "",
      tanque: tanque.nombreUI,
    }
  })

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:py-12">
        <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">Panel de planta</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-card-foreground text-balance">
            Dashboard de tanques termo
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground text-pretty">
            Visualiza el nivel actual de Ar, N2, O2, CO2 #1 y CO2 #2. Cada tanque permite registrar su nivel de forma directa.
          </p>
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
