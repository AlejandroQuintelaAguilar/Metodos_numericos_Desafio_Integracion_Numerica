/**
 * Value Object / Entidad de Dominio que modela una grilla de discretización numérica.
 * Garantiza invariantes: monotonicidad, congruencia dimensional, consistencia de tipos
 * y verificación rigurosa de espaciamiento uniforme h.
 */
export class NumericalGrid {
  /**
   * @param {number[]} x - Vector de abscisas ordenadas crecientemente.
   * @param {number[]} y - Vector de ordenadas evaluadas.
   * @param {number} [tolerance=1e-6] - Tolerancia para variación de espaciamiento uniforme.
   */
  constructor(x, y, tolerance = 1e-6) {
    this._validateVectors(x, y);

    this.x = Object.freeze([...x]);
    this.y = Object.freeze([...y]);
    this.n = this.x.length - 1; // Número de subintervalos
    this.tolerance = tolerance;

    this.h = (this.x[this.n] - this.x[0]) / this.n;
    this.isUniform = this._checkUniformity();

    Object.freeze(this);
  }

  _validateVectors(x, y) {
    if (!Array.isArray(x) || !Array.isArray(y)) {
      throw new Error('Los vectores de coordenadas x e y deben ser arreglos válidos.');
    }
    if (x.length !== y.length) {
      throw new Error(`Incompatibilidad dimensional: vector x tiene longitud ${x.length} y vector y tiene longitud ${y.length}.`);
    }
    if (x.length < 2) {
      throw new Error(`Se requieren al menos 2 puntos (n >= 1 subintervalo). Recibidos: ${x.length}.`);
    }

    for (let i = 0; i < x.length; i++) {
      if (typeof x[i] !== 'number' || isNaN(x[i]) || !isFinite(x[i])) {
        throw new Error(`Valor no numérico o inválido en abscisa x[${i}]: ${x[i]}`);
      }
      if (typeof y[i] !== 'number' || isNaN(y[i]) || !isFinite(y[i])) {
        throw new Error(`Valor no numérico o inválido en ordenada y[${i}]: ${y[i]}`);
      }
    }

    // Monotonicidad estricta
    for (let i = 0; i < x.length - 1; i++) {
      if (x[i + 1] <= x[i]) {
        throw new Error(`Monotonicidad violada: x[${i + 1}] (${x[i + 1]}) <= x[${i}] (${x[i]}). Los nodos deben ser estrictamente crecientes.`);
      }
    }
  }

  _checkUniformity() {
    for (let i = 0; i < this.n; i++) {
      const deltaX = this.x[i + 1] - this.x[i];
      if (Math.abs(deltaX - this.h) > this.tolerance) {
        return false;
      }
    }
    return true;
  }

  /**
   * Crea una grilla a partir de una función matemática continua en [a, b] con n subintervalos.
   * @param {function(number): number} fn - Función matemática integrable.
   * @param {number} a - Límite inferior.
   * @param {number} b - Límite superior.
   * @param {number} n - Cantidad de subintervalos (n >= 1).
   * @returns {NumericalGrid}
   */
  static fromFunction(fn, a, b, n) {
    if (typeof fn !== 'function') {
      throw new Error('El parámetro fn debe ser una función ejecutable.');
    }
    if (typeof a !== 'number' || typeof b !== 'number' || isNaN(a) || isNaN(b)) {
      throw new Error('Los límites a y b deben ser valores numéricos válidos.');
    }
    if (b <= a) {
      throw new Error(`El límite superior b (${b}) debe ser estrictamente mayor que a (${a}).`);
    }
    if (!Number.isInteger(n) || n < 1) {
      throw new Error(`El número de subintervalos n debe ser un entero positivo mayor o igual a 1. Recibido: ${n}`);
    }

    const h = (b - a) / n;
    const x = new Array(n + 1);
    const y = new Array(n + 1);

    for (let i = 0; i <= n; i++) {
      const xi = i === n ? b : a + i * h; // Evita acumulación de error de coma flotante en el extremo
      const yi = fn(xi);
      if (typeof yi !== 'number' || isNaN(yi) || !isFinite(yi)) {
        throw new Error(`La función produjo un valor no finito o NaN en x = ${xi}: ${yi}`);
      }
      x[i] = xi;
      y[i] = yi;
    }

    return new NumericalGrid(x, y);
  }

  /**
   * Genera una subgrilla delimitada por índices de nodos [startIndex, endIndex].
   * @param {number} startIndex
   * @param {number} endIndex
   * @returns {NumericalGrid}
   */
  slice(startIndex, endIndex) {
    if (startIndex < 0 || endIndex > this.x.length - 1 || startIndex >= endIndex) {
      throw new Error(`Índices de corte inválidos: [${startIndex}, ${endIndex}] para grilla de tamaño ${this.x.length}`);
    }
    return new NumericalGrid(
      this.x.slice(startIndex, endIndex + 1),
      this.y.slice(startIndex, endIndex + 1),
      this.tolerance
    );
  }
}
