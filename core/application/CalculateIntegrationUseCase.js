import { NumericalGrid } from '../domain/NumericalGrid.js';
import { TrapezoidalRule } from '../domain/TrapezoidalRule.js';
import { SimpsonOneThirdRule } from '../domain/SimpsonOneThirdRule.js';
import { SimpsonThreeEighthsRule } from '../domain/SimpsonThreeEighthsRule.js';
import { HybridQuadratureRule } from '../domain/HybridQuadratureRule.js';
import { FunctionEvaluator } from './FunctionEvaluator.js';

/**
 * Caso de Uso principal: Orquestación del cálculo de integración numérica,
 * validación de invariantes, cómputo comparativo de métodos y cálculo de errores.
 */
export class CalculateIntegrationUseCase {
  /**
   * Ejecuta el cálculo completo a partir de una configuración de entrada.
   * @param {{
   *   type: 'FUNCTION'|'TABULAR',
   *   functionExpr?: string,
   *   variableName?: string,
   *   a?: number,
   *   b?: number,
   *   n?: number,
   *   x?: number[],
   *   y?: number[],
   *   transformY?: function(number): number,
   *   scaleFactor?: number,
   *   referenceValue?: number,
   *   hybridPlan?: Array<{ startIdx: number, endIdx: number, method: 'SIMPSON_1_3'|'SIMPSON_3_8'|'TRAPEZOID' }>
   * }} input
   */
  static execute(input) {
    const scaleFactor = typeof input.scaleFactor === 'number' ? input.scaleFactor : 1.0;
    let grid;

    if (input.type === 'FUNCTION') {
      const varName = input.variableName || 'x';
      const compiledFn = FunctionEvaluator.compile(input.functionExpr, varName);
      grid = NumericalGrid.fromFunction(compiledFn, input.a, input.b, input.n);
    } else {
      let yValues = input.y;
      if (typeof input.transformY === 'function') {
        yValues = input.y.map(input.transformY);
      }
      grid = new NumericalGrid(input.x, yValues);
    }

    const results = {};

    // 1. Regla del Trapecio Compuesto (siempre aplicable en grillas uniformes)
    try {
      const trap = TrapezoidalRule.integrate(grid);
      results.trapezoid = this._enrichResult(trap, scaleFactor, input.referenceValue);
    } catch (err) {
      results.trapezoid = { error: err.message, applicable: false };
    }

    // 2. Regla de Simpson 1/3 (requiere n par)
    try {
      const s13 = SimpsonOneThirdRule.integrate(grid);
      results.simpson13 = this._enrichResult(s13, scaleFactor, input.referenceValue);
    } catch (err) {
      results.simpson13 = { error: err.message, applicable: false };
    }

    // 3. Regla de Simpson 3/8 (requiere n múltiplo de 3)
    try {
      const s38 = SimpsonThreeEighthsRule.integrate(grid);
      results.simpson38 = this._enrichResult(s38, scaleFactor, input.referenceValue);
    } catch (err) {
      results.simpson38 = { error: err.message, applicable: false };
    }

    // 4. Regla Híbrida / Combinada (para n impar o planes explícitos)
    try {
      let hybrid;
      if (input.hybridPlan && Array.isArray(input.hybridPlan)) {
        hybrid = HybridQuadratureRule.integrateExplicit(grid, input.hybridPlan);
      } else {
        hybrid = HybridQuadratureRule.autoIntegrate(grid);
      }
      results.hybrid = this._enrichResult(hybrid, scaleFactor, input.referenceValue);
    } catch (err) {
      results.hybrid = { error: err.message, applicable: false };
    }

    return {
      grid: {
        n: grid.n,
        h: grid.h,
        a: grid.x[0],
        b: grid.x[grid.n],
        x: grid.x,
        y: grid.y,
        isUniform: grid.isUniform
      },
      scaleFactor,
      referenceValue: input.referenceValue ?? null,
      results
    };
  }

  static _enrichResult(rawResult, scaleFactor, referenceValue) {
    const rawIntegral = rawResult.integral;
    const finalIntegral = rawIntegral * scaleFactor;

    let errorAbsolute = null;
    let errorRelativePct = null;

    if (typeof referenceValue === 'number' && !isNaN(referenceValue)) {
      errorAbsolute = Math.abs(referenceValue - finalIntegral);
      if (Math.abs(referenceValue) > 1e-15) {
        errorRelativePct = (errorAbsolute / Math.abs(referenceValue)) * 100;
      }
    }

    return {
      ...rawResult,
      applicable: true,
      rawIntegral,
      finalIntegral,
      scaleFactor,
      referenceValue: referenceValue ?? null,
      errorAbsolute,
      errorRelativePct,
      formattedValue: finalIntegral.toFixed(6),
      formattedRawValue: rawIntegral.toFixed(6)
    };
  }
}
