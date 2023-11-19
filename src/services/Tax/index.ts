class Tax {
  static calcularTasaImpuestoEfectiva(ingresoAnual: number): number {
    const tramos = [
      [14000, 0.105],
      [48000, 0.175],
      [70000, 0.3],
      [116640, 0.33],
      [Infinity, 0.39],
    ];

    let ingresoReduce = ingresoAnual;
    const acc = 0.015 * ingresoAnual;

    const indice = tramos.reduce((accumulator, current, index, array) => {
      const [tope, tasa] = current;
      if (ingresoReduce <= 0) return accumulator;
      const [previous] = array[index - 1] ?? [0];
      const base = Math.min(ingresoReduce, tope - previous);

      accumulator += base * tasa;
      ingresoReduce -= base;

      return accumulator;
    }, 0);

    const nuevoImpuesto = indice + acc;
    const tasaImpuestoEfectiva = nuevoImpuesto / ingresoAnual;

    return tasaImpuestoEfectiva;
  }
}
