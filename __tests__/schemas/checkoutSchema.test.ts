import { validateCheckout } from '../../src/schemas/checkoutSchema';

const validos = {
  nombre: 'Juan Pérez',
  email: 'juan@correo.com',
  telefono: '3000000000',
  codigoPostal: '110111',
  numeroTarjeta: '4111111111111111',
  vencimiento: '12/28',
};

const con = (cambios: Partial<typeof validos>) => validateCheckout({ ...validos, ...cambios });

describe('validateCheckout', () => {
  it('no reporta errores con datos válidos', () => {
    expect(validateCheckout(validos)).toEqual({});
  });

  it('acepta nombres con acentos, ñ y apóstrofes', () => {
    expect(con({ nombre: "Ñoño D'Ávila-Peña" }).nombre).toBeUndefined();
  });

  it.each(['Juan123', 'Juan!', '3000'])('rechaza el nombre %s', (nombre) => {
    expect(con({ nombre }).nombre).toBe('El nombre solo permite letras');
  });

  it.each(['juan-correo.com', 'juan@', '@correo.com', 'juan @correo.com'])(
    'rechaza el correo %s',
    (email) => {
      expect(con({ email }).email).toBe('Correo electrónico inválido');
    }
  );

  it.each(['300ABC0000', '+573000000000', '300 000 0000', '300-000'])(
    'rechaza el teléfono %s',
    (telefono) => {
      expect(con({ telefono }).telefono).toBe('El teléfono solo permite números');
    }
  );

  it.each(['11O1A1', '110-111', 'AB1234'])('rechaza el código postal %s', (codigoPostal) => {
    expect(con({ codigoPostal }).codigoPostal).toBe('El código postal solo permite números');
  });

  it.each(['4111-1111-1111-1111', '4111 1111 1111 1111', '4111abcd'])(
    'rechaza la tarjeta %s',
    (numeroTarjeta) => {
      expect(con({ numeroTarjeta }).numeroTarjeta).toBe(
        'El número de tarjeta solo permite números'
      );
    }
  );

  it.each(['01/28', '09/30', '12/99'])('acepta el vencimiento %s', (vencimiento) => {
    expect(con({ vencimiento }).vencimiento).toBeUndefined();
  });

  it.each(['13/28', '00/28', '12/2028', '1228', '1/28', 'MM/AA'])(
    'rechaza el vencimiento %s',
    (vencimiento) => {
      expect(con({ vencimiento }).vencimiento).toBe('El vencimiento debe tener formato MM/AA');
    }
  );

  it('reporta todos los campos inválidos a la vez', () => {
    const errores = validateCheckout({
      nombre: 'Juan123',
      email: 'juan-correo.com',
      telefono: '300ABC',
      codigoPostal: 'AB123',
      numeroTarjeta: '4111-1111',
      vencimiento: '13/2028',
    });
    expect(Object.keys(errores)).toHaveLength(6);
  });
});
