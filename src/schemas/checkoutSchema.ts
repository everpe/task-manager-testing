import { z } from 'zod';

// \p{L} cubre acentos y ñ; \p{L} en vez de A-Za-z para no rechazar "Peña" o "Bogotá"
const SOLO_LETRAS = /^[\p{L}\s'.-]+$/u;
const SOLO_DIGITOS = /^\d+$/;
const MM_AA = /^(0[1-9]|1[0-2])\/\d{2}$/;

export const checkoutSchema = z.object({
  nombre: z.string().regex(SOLO_LETRAS, 'El nombre solo permite letras'),
  email: z.string().email('Correo electrónico inválido'),
  telefono: z.string().regex(SOLO_DIGITOS, 'El teléfono solo permite números'),
  codigoPostal: z.string().regex(SOLO_DIGITOS, 'El código postal solo permite números'),
  numeroTarjeta: z.string().regex(SOLO_DIGITOS, 'El número de tarjeta solo permite números'),
  vencimiento: z.string().regex(MM_AA, 'El vencimiento debe tener formato MM/AA'),
});

export type CheckoutFields = keyof z.infer<typeof checkoutSchema>;

/** Devuelve { campo: mensaje } con el primer error de cada campo. Vacío = todo válido. */
export function validateCheckout(values: Record<string, string>): Partial<Record<CheckoutFields, string>> {
  const result = checkoutSchema.safeParse(values);
  if (result.success) return {};
  return Object.fromEntries(
    Object.entries(result.error.flatten().fieldErrors).map(([field, msgs]) => [field, msgs?.[0]])
  );
}
