import { createClient } from "@/lib/supabase/server"
import { TarjetaMateria, type Materia } from "@/components/tarjeta-materia"

export default async function Home() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("materias_primas")
    .select("id, nombre, cantidad, unidad, actualizado_en, movimientos(id, cantidad_anterior, cantidad_nueva, unidad, nota, creado_en)")
    .order("nombre", { ascending: true })
    .order("creado_en", { ascending: false, referencedTable: "movimientos" })

  const materias = (data ?? []) as Materia[]

  return (
    <div className="min-h-screen bg-background font-sans">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            Registro de niveles de materia prima
          </h1>
          <p className="text-muted-foreground text-pretty">
            Consulta y actualiza los niveles de existencia de cada gas. Cada cambio queda guardado en el historial.
          </p>
        </header>

        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            No se pudieron cargar los datos. Intenta de nuevo más tarde.
          </p>
        )}

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {materias.map((materia) => (
            <TarjetaMateria key={materia.id} materia={materia} />
          ))}
        </section>

        {!error && materias.length === 0 && (
          <p className="text-muted-foreground">No hay productos registrados.</p>
        )}
      </main>
    </div>
  )
}
