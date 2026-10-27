import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { NumericalGrid } from '../core/domain/NumericalGrid.js';
import { TrapezoidalRule } from '../core/domain/TrapezoidalRule.js';
import { SimpsonOneThirdRule } from '../core/domain/SimpsonOneThirdRule.js';
import { SimpsonThreeEighthsRule } from '../core/domain/SimpsonThreeEighthsRule.js';
import { HybridQuadratureRule } from '../core/domain/HybridQuadratureRule.js';
import { FunctionEvaluator } from '../core/application/FunctionEvaluator.js';
import { CalculateIntegrationUseCase } from '../core/application/CalculateIntegrationUseCase.js';
import { EXERCISE_PRESETS } from '../core/application/ExercisePresets.js';

describe('1. Verificación Mínima Obligatoria de Rúbrica (Caso Base f(x) = x² en [0, 2])', () => {
  const exact = 8 / 3;

  it('Simpson 1/3 con n=4 debe ser numéricamente exacto (polinomio grado 2)', () => {
    const grid = NumericalGrid.fromFunction(x => x ** 2, 0, 2, 4);
    const result = SimpsonOneThirdRule.integrate(grid);
    assert.ok(Math.abs(result.integral - exact) < 1e-12, `Esperado ${exact}, obtenido ${result.integral}`);
  });

  it('Simpson 1/3 con n=8 debe ser numéricamente exacto', () => {
    const grid = NumericalGrid.fromFunction(x => x ** 2, 0, 2, 8);
    const result = SimpsonOneThirdRule.integrate(grid);
    assert.ok(Math.abs(result.integral - exact) < 1e-12, `Esperado ${exact}, obtenido ${result.integral}`);
  });

  it('Trapecio compuesto con n=4 converge con orden O(h^2)', () => {
    const grid4 = NumericalGrid.fromFunction(x => x ** 2, 0, 2, 4);
    const res4 = TrapezoidalRule.integrate(grid4);
    // Para f(x)=x^2, T(h) = (0.5/2)*[0 + 2*(0.25+1+2.25) + 4] = 0.25*[11] = 2.75
    assert.ok(Math.abs(res4.integral - 2.75) < 1e-9);

    const grid8 = NumericalGrid.fromFunction(x => x ** 2, 0, 2, 8);
    const res8 = TrapezoidalRule.integrate(grid8);
    // Para n=8, T(h) = 2.6875
    assert.ok(Math.abs(res8.integral - 2.6875) < 1e-9);
    assert.ok(Math.abs(res8.integral - exact) < Math.abs(res4.integral - exact));
  });

  it('Simpson 3/8 con n=6 es exacto para grado 2', () => {
    const grid6 = NumericalGrid.fromFunction(x => x ** 2, 0, 2, 6);
    const res6 = SimpsonThreeEighthsRule.integrate(grid6);
    assert.ok(Math.abs(res6.integral - exact) < 1e-12);
  });
});

describe('2. Validación Cruzada con Solucionario Oficial Docente', () => {
  it('Ejercicio 19: Transporte Urbano (Distancia recorrida)', () => {
    const preset = EXERCISE_PRESETS.ex19;
    const output = CalculateIntegrationUseCase.execute({
      type: 'TABULAR',
      x: preset.x,
      y: preset.y,
      scaleFactor: preset.scaleFactor,
      hybridPlan: preset.hybridPlan,
      referenceValue: preset.referenceValues.hybrid
    });

    // Trapecio docente: 0.147083 mi
    assert.equal(output.results.trapezoid.formattedValue, '0.147083');
    // Simpson combinado (1/3 + 3/8): 0.147072 mi
    assert.equal(output.results.hybrid.formattedValue, '0.147072');
  });

  it('Ejercicio 20: Ensayo de Elasticidad (Trabajo mecánico)', () => {
    const preset = EXERCISE_PRESETS.ex20;
    const output = CalculateIntegrationUseCase.execute({
      type: 'TABULAR',
      x: preset.x,
      y: preset.y,
      scaleFactor: preset.scaleFactor,
      hybridPlan: preset.hybridPlan,
      referenceValue: preset.referenceValues.hybrid
    });

    // Trapecio docente: 4.544000 lb·in
    assert.equal(output.results.trapezoid.formattedValue, '4.544000');
    // Simpson combinado (4 con 1/3 + 3 con 3/8): 4.577167 lb·in
    assert.equal(output.results.hybrid.formattedValue, '4.577167');
  });

  it('Ejercicio 21: Perfil Topográfico', () => {
    const preset = EXERCISE_PRESETS.ex21;
    const output = CalculateIntegrationUseCase.execute({
      type: 'TABULAR',
      x: preset.x,
      y: preset.y,
      hybridPlan: preset.hybridPlan
    });

    // Trapecio: 36.400000
    assert.equal(output.results.trapezoid.formattedValue, '36.400000');
    // Simpson 1/3 (8 intervalos) + Trapecio (1 intervalo): 36.850000
    assert.equal(output.results.hybrid.formattedValue, '36.850000');
  });

  it('Ejercicio 22: Cable Suspendido (Catenaria)', () => {
    const preset = EXERCISE_PRESETS.ex22;
    const output = CalculateIntegrationUseCase.execute({
      type: 'FUNCTION',
      functionExpr: preset.functionExpr,
      variableName: preset.variable,
      a: preset.a,
      b: preset.b,
      n: preset.defaultN,
      referenceValue: preset.exactValue
    });

    // Trapecio n=8 docente: 44.042044 ft
    assert.equal(output.results.trapezoid.formattedValue, '44.042044');
    // Simpson 1/3 n=8 docente: 43.899213 ft
    assert.equal(output.results.simpson13.formattedValue, '43.899213');
  });

  it('Ejercicio 23: Red de Abastecimiento de Agua (Caudal en Tubería)', () => {
    const preset = EXERCISE_PRESETS.ex23;
    const output = CalculateIntegrationUseCase.execute({
      type: 'FUNCTION',
      functionExpr: preset.functionExpr,
      variableName: preset.variable,
      a: preset.a,
      b: preset.b,
      n: preset.defaultN,
      referenceValue: preset.exactValue
    });

    // Trapecio n=8 docente: 11.681778 in³/s
    assert.equal(output.results.trapezoid.formattedValue, '11.681778');
    // Simpson 1/3 n=8 docente: 12.151244 in³/s
    assert.equal(output.results.simpson13.formattedValue, '12.151244');
  });

  it('Ejercicio 24: Diseño de Trayectoria (Cardioide)', () => {
    const preset = EXERCISE_PRESETS.ex24;
    const output = CalculateIntegrationUseCase.execute({
      type: 'FUNCTION',
      functionExpr: preset.functionExpr,
      variableName: preset.variable,
      a: preset.a,
      b: preset.b,
      n: preset.defaultN,
      referenceValue: preset.exactValue
    });

    // Trapecio n=8 docente: 78.969264
    assert.equal(output.results.trapezoid.formattedValue, '78.969264');
    // Simpson 1/3 n=8 docente: 80.010767
    assert.equal(output.results.simpson13.formattedValue, '80.010767');
  });

  it('Ejercicio 25: Energía Gravitatoria (Satélite)', () => {
    const preset = EXERCISE_PRESETS.ex25;
    const output = CalculateIntegrationUseCase.execute({
      type: 'FUNCTION',
      functionExpr: preset.functionExpr,
      variableName: preset.variable,
      a: preset.a,
      b: preset.b,
      n: preset.defaultN,
      referenceValue: preset.exactValue
    });

    // Trapecio docente: ~3.48662008e9 J
    const trapVal = output.results.trapezoid.finalIntegral;
    assert.ok(Math.abs(trapVal - 3.48662008e9) < 50, `Obtenido: ${trapVal}`);

    // Simpson 1/3 docente: ~3.48623690e9 J
    const simpVal = output.results.simpson13.finalIntegral;
    assert.ok(Math.abs(simpVal - 3.48623690e9) < 50, `Obtenido: ${simpVal}`);
  });

  it('Ejercicio 27: Sólido Alargado (Volumen de Revolución)', () => {
    const preset = EXERCISE_PRESETS.ex27;
    const output = CalculateIntegrationUseCase.execute({
      type: 'TABULAR',
      x: preset.x,
      y: preset.y,
      transformY: preset.customTransform,
      scaleFactor: preset.scaleFactor
    });

    // Trapecio docente: 199.404740 in³
    assert.equal(output.results.trapezoid.formattedValue, '199.404740');
    // Simpson 1/3 docente: 201.842092 in³
    assert.equal(output.results.simpson13.formattedValue, '201.842092');
  });
});

describe('3. Robustez, Manejo de Errores y Validaciones de Dominio', () => {
  it('Debe rechazar grillas con x no monótonas crecientes', () => {
    assert.throws(() => {
      new NumericalGrid([0, 2, 1, 3], [1, 2, 3, 4]);
    }, /Monotonicidad violada/);
  });

  it('Debe rechazar dimensiones dispares en x e y', () => {
    assert.throws(() => {
      new NumericalGrid([0, 1, 2], [1, 2]);
    }, /Incompatibilidad dimensional/);
  });

  it('Debe rechazar Simpson 1/3 cuando n es impar', () => {
    const grid = new NumericalGrid([0, 1, 2, 3], [0, 1, 4, 9]); // n=3 (impar)
    assert.throws(() => {
      SimpsonOneThirdRule.integrate(grid);
    }, /Simpson 1\/3 requiere obligatoriamente un número par/);
  });

  it('Debe rechazar Simpson 3/8 cuando n no es múltiplo de 3', () => {
    const grid = new NumericalGrid([0, 1, 2, 3, 4], [0, 1, 4, 9, 16]); // n=4
    assert.throws(() => {
      SimpsonThreeEighthsRule.integrate(grid);
    }, /Simpson 3\/8 requiere que n sea múltiplo de 3/);
  });

  it('FunctionEvaluator bloquea palabras clave no seguras', () => {
    assert.throws(() => {
      FunctionEvaluator.compile('fetch("http://malicious.site")');
    }, /Término prohibido por seguridad detectado/);
  });
});
