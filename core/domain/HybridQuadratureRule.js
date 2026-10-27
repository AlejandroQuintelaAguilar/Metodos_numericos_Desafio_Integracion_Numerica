import { TrapezoidalRule } from './TrapezoidalRule.js';
import { SimpsonOneThirdRule } from './SimpsonOneThirdRule.js';
import { SimpsonThreeEighthsRule } from './SimpsonThreeEighthsRule.js';

/**
 * Regla de Cuadratura Híbrida / Compuesta.
 * Permite integrar particiones contiguas combinando métodos (ej. Simpson 1/3 + Simpson 3/8 para n=7,
 * o Simpson 1/3 + Trapecio para n impar).
 */
export class HybridQuadratureRule {
  /**
   * Integra una grilla dividiéndola en segmentos contiguos especificados.
   * @param {import('./NumericalGrid.js').NumericalGrid} grid
   * @param {Array<{ startIdx: number, endIdx: number, method: 'SIMPSON_1_3'|'SIMPSON_3_8'|'TRAPEZOID' }>} segments
   */
  static integrateExplicit(grid, segments) {
    if (!grid.isUniform) {
      throw new Error('La integración híbrida requiere una grilla globalmente uniforme.');
    }

    let totalIntegral = 0;
    const globalWeights = new Array(grid.n + 1).fill(0);
    const segmentResults = [];

    // Validar contigüidad
    let currentIdx = 0;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (seg.startIdx !== currentIdx) {
        throw new Error(`Discontinuidad en partición de segmentos: segmento ${i} inicia en ${seg.startIdx}, pero el anterior finalizó en ${currentIdx}.`);
      }
      if (seg.endIdx <= seg.startIdx || seg.endIdx > grid.n) {
        throw new Error(`Límites inválidos en segmento ${i}: [${seg.startIdx}, ${seg.endIdx}].`);
      }
      currentIdx = seg.endIdx;
    }
    if (currentIdx !== grid.n) {
      throw new Error(`Los segmentos no cubren la grilla completa: cubren hasta índice ${currentIdx}, se requiere hasta ${grid.n}.`);
    }

    // Procesar cada segmento
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const subGrid = grid.slice(seg.startIdx, seg.endIdx);
      let subResult;

      switch (seg.method) {
        case 'SIMPSON_1_3':
          subResult = SimpsonOneThirdRule.integrate(subGrid);
          break;
        case 'SIMPSON_3_8':
          subResult = SimpsonThreeEighthsRule.integrate(subGrid);
          break;
        case 'TRAPEZOID':
          subResult = TrapezoidalRule.integrate(subGrid);
          break;
        default:
          throw new Error(`Método desconocido para segmento híbrido: ${seg.method}`);
      }

      totalIntegral += subResult.integral;

      // Acumular pesos en la grilla global
      for (let j = 0; j <= subGrid.n; j++) {
        const globalIdx = seg.startIdx + j;
        globalWeights[globalIdx] += subResult.weights[j];
      }

      segmentResults.push({
        segmentIndex: i,
        startIdx: seg.startIdx,
        endIdx: seg.endIdx,
        xStart: grid.x[seg.startIdx],
        xEnd: grid.x[seg.endIdx],
        nSub: subGrid.n,
        method: seg.method,
        methodName: subResult.methodName,
        integral: subResult.integral,
        weights: subResult.weights
      });
    }

    const terms = grid.x.map((xi, idx) => ({
      index: idx,
      x: xi,
      y: grid.y[idx],
      weight: globalWeights[idx],
      contribution: globalWeights[idx] * grid.y[idx]
    }));

    return {
      methodName: 'Método Combinado Híbrido',
      code: 'HYBRID',
      integral: totalIntegral,
      n: grid.n,
      h: grid.h,
      weights: globalWeights,
      terms,
      segments: segmentResults,
      formulaText: 'I_total = sum(I_segmentos)'
    };
  }

  /**
   * Resuelve de manera automática particiones comunes para n impar o especial:
   * - Si n = 7: 4 intervalos Simpson 1/3 + 3 intervalos Simpson 3/8 (Problemas 19 y 20).
   * - Si n = 9: 8 intervalos Simpson 1/3 + 1 Trapecio (o Simpson 3/8 completo).
   * - Si n impar > 3: (n - 3) Simpson 1/3 + 3 Simpson 3/8.
   * - Si n par: Simpson 1/3 puro.
   * @param {import('./NumericalGrid.js').NumericalGrid} grid
   * @param {'AUTO_3_8'|'AUTO_TRAP'} [oddStrategy='AUTO_3_8']
   */
  static autoIntegrate(grid, oddStrategy = 'AUTO_3_8') {
    const n = grid.n;

    if (n % 2 === 0) {
      return SimpsonOneThirdRule.integrate(grid);
    }

    // n es impar
    if (n === 1) {
      return TrapezoidalRule.integrate(grid);
    }

    if (n === 3) {
      return SimpsonThreeEighthsRule.integrate(grid);
    }

    if (oddStrategy === 'AUTO_TRAP') {
      // (n - 1) subintervalos con Simpson 1/3 + 1 subintervalo con Trapecio
      return this.integrateExplicit(grid, [
        { startIdx: 0, endIdx: n - 1, method: 'SIMPSON_1_3' },
        { startIdx: n - 1, endIdx: n, method: 'TRAPEZOID' }
      ]);
    }

    // Por defecto AUTO_3_8:
    // (n - 3) subintervalos (que es par ya que n es impar y impar - 3 = par) con Simpson 1/3
    // y los últimos 3 con Simpson 3/8.
    return this.integrateExplicit(grid, [
      { startIdx: 0, endIdx: n - 3, method: 'SIMPSON_1_3' },
      { startIdx: n - 3, endIdx: n, method: 'SIMPSON_3_8' }
    ]);
  }
}
