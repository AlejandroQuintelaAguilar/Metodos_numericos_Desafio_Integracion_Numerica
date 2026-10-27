/**
 * Regla de Simpson 3/8 Compuesta para grillas uniformes.
 * Requiere que el número de subintervalos n sea múltiplo de 3 (n >= 3, n % 3 === 0).
 * S = (3h / 8) * [ f_0 + f_n + 3 * sum_{i no multiplo de 3} f_i + 2 * sum_{i multiplo de 3 interior} f_i ]
 */
export class SimpsonThreeEighthsRule {
  /**
   * Ejecuta la integración por Simpson 3/8 sobre la grilla.
   * @param {import('./NumericalGrid.js').NumericalGrid} grid
   * @returns {{
   *   methodName: string,
   *   integral: number,
   *   n: number,
   *   h: number,
   *   weights: number[],
   *   terms: { index: number, x: number, y: number, multiplier: number, weight: number, contribution: number }[],
   *   formulaText: string
   * }}
   */
  static integrate(grid) {
    if (!grid.isUniform) {
      throw new Error('Simpson 3/8 requiere espaciamiento uniforme h.');
    }
    const { n, h, x, y } = grid;

    if (n < 3) {
      throw new Error(`Simpson 3/8 requiere al menos 3 subintervalos (n >= 3). Recibido: n = ${n}.`);
    }
    if (n % 3 !== 0) {
      throw new Error(`Simpson 3/8 requiere que n sea múltiplo de 3 (n % 3 === 0). Recibido: n = ${n}.`);
    }

    const weights = new Array(n + 1);
    const terms = new Array(n + 1);
    let sum = 0;

    for (let i = 0; i <= n; i++) {
      let m;
      if (i === 0 || i === n) {
        m = 1;
      } else if (i % 3 === 0) {
        m = 2;
      } else {
        m = 3;
      }

      weights[i] = m * (3 * h / 8);
      const contribution = m * y[i];
      sum += contribution;

      terms[i] = {
        index: i,
        x: x[i],
        y: y[i],
        multiplier: m,
        weight: weights[i],
        contribution: contribution * (3 * h / 8)
      };
    }

    const integral = (3 * h / 8) * sum;

    return {
      methodName: 'Simpson 3/8 Compuesto',
      code: 'SIMPSON_3_8',
      integral,
      n,
      h,
      weights,
      terms,
      formulaText: 'S = (3h/8) * [f_0 + 3*sum(f_no_mult3) + 2*sum(f_mult3_int) + f_n]'
    };
  }
}
