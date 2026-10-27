/**
 * Regla del Trapecio Compuesto para grillas uniformes.
 * T(h) = h * [ (f_0 + f_n)/2 + sum_{i=1}^{n-1} f_i ]
 *      = (h / 2) * [ f_0 + 2*f_1 + 2*f_2 + ... + 2*f_{n-1} + f_n ]
 */
export class TrapezoidalRule {
  /**
   * Ejecuta la integración por trapecio compuesto sobre la grilla provista.
   * @param {import('./NumericalGrid.js').NumericalGrid} grid
   * @returns {{
   *   methodName: string,
   *   integral: number,
   *   n: number,
   *   h: number,
   *   weights: number[],
   *   terms: { index: number, x: number, y: number, weight: number, contribution: number }[],
   *   formulaText: string
   * }}
   */
  static integrate(grid) {
    if (!grid.isUniform) {
      throw new Error('La regla del Trapecio Compuesto estándar requiere un espaciamiento uniforme h.');
    }

    const { n, h, x, y } = grid;
    const weights = new Array(n + 1);
    const terms = new Array(n + 1);

    let sum = 0;
    for (let i = 0; i <= n; i++) {
      let w;
      if (i === 0 || i === n) {
        w = 1;
      } else {
        w = 2;
      }
      weights[i] = w * (h / 2);
      const contribution = w * y[i];
      sum += contribution;

      terms[i] = {
        index: i,
        x: x[i],
        y: y[i],
        weight: weights[i],
        multiplier: w,
        contribution: contribution * (h / 2)
      };
    }

    const integral = (h / 2) * sum;

    return {
      methodName: 'Trapecio Compuesto',
      code: 'TRAPEZOID',
      integral,
      n,
      h,
      weights,
      terms,
      formulaText: 'T = (h/2) * [f_0 + 2*sum(f_i) + f_n]'
    };
  }
}
