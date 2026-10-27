/**
 * Regla de Simpson 1/3 Compuesta para grillas uniformes.
 * Requiere que el número de subintervalos n sea par (n >= 2).
 * S = (h / 3) * [ f_0 + f_n + 4 * sum_{i impar} f_i + 2 * sum_{i par interior} f_i ]
 */
export class SimpsonOneThirdRule {
  /**
   * Ejecuta la integración por Simpson 1/3 sobre la grilla.
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
      throw new Error('Simpson 1/3 requiere espaciamiento uniforme h.');
    }
    const { n, h, x, y } = grid;

    if (n < 2) {
      throw new Error(`Simpson 1/3 requiere al menos 2 subintervalos (n >= 2). Recibido: n = ${n}.`);
    }
    if (n % 2 !== 0) {
      throw new Error(`Simpson 1/3 requiere obligatoriamente un número par de subintervalos (n par). Recibido: n = ${n}.`);
    }

    const weights = new Array(n + 1);
    const terms = new Array(n + 1);
    let sum = 0;

    for (let i = 0; i <= n; i++) {
      let m;
      if (i === 0 || i === n) {
        m = 1;
      } else if (i % 2 === 1) {
        m = 4;
      } else {
        m = 2;
      }

      weights[i] = m * (h / 3);
      const contribution = m * y[i];
      sum += contribution;

      terms[i] = {
        index: i,
        x: x[i],
        y: y[i],
        multiplier: m,
        weight: weights[i],
        contribution: contribution * (h / 3)
      };
    }

    const integral = (h / 3) * sum;

    return {
      methodName: 'Simpson 1/3 Compuesto',
      code: 'SIMPSON_1_3',
      integral,
      n,
      h,
      weights,
      terms,
      formulaText: 'S = (h/3) * [f_0 + 4*sum(f_impar) + 2*sum(f_par) + f_n]'
    };
  }
}
