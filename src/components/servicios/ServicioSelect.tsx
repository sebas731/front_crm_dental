import { Select } from "@/components/ui/Field";
import type { ServicioDental } from "@/types";

/**
 * Select de servicios agrupado por categoría (padre). Los subservicios
 * aparecen dentro de su `<optgroup>`. Los servicios sin hijos ni padre se
 * muestran como opciones sueltas.
 */
export function ServicioSelect({
  servicios,
  value,
  onChange,
  label = "Servicio",
  required = false,
  placeholder = "Seleccionar…",
}: {
  servicios: ServicioDental[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const categorias = servicios.filter((s) => !s.padre);
  const hijosDe = (id: string) => servicios.filter((s) => s.padre === id);
  const sueltos = categorias.filter((c) => hijosDe(c.id).length === 0);
  const conHijos = categorias.filter((c) => hijosDe(c.id).length > 0);

  return (
    <Select
      label={label}
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {conHijos.map((cat) => (
        <optgroup key={cat.id} label={cat.nombre}>
          {hijosDe(cat.id).map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </optgroup>
      ))}
      {sueltos.length > 0 && (
        <optgroup label="Otros">
          {sueltos.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </optgroup>
      )}
    </Select>
  );
}
