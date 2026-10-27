/**
 * Evaluador seguro de funciones matemáticas de una variable (x, t, r, y, z).
 * Soporta operadores aritméticos básicos, potencias y funciones trascendentes comunes de Math.
 */
export class FunctionEvaluator {
  /**
   * Transforma una expresión matemática amigable a una función ejecutable segura.
   * Soporta:
   *  - Constantes: pi, e
   *  - Operadores: +, -, *, /, ^ (potencia)
   *  - Funciones: sin, cos, tan, sinh, cosh, tanh, exp, log/ln, sqrt, abs
   *  - Variables: x (por defecto), o especificadas en variableName.
   * @param {string} expression
   * @param {string} [variableName='x']
   * @returns {function(number): number}
   */
  static compile(expression, variableName = 'x') {
    if (!expression || typeof expression !== 'string' || !expression.trim()) {
      throw new Error('La expresión matemática no puede estar vacía.');
    }

    let sanitized = expression.trim().toLowerCase();

    // Reemplazos de constantes y sintaxis
    sanitized = sanitized
      .replace(/\bpi\b/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
      .replace(/\bln\b/g, 'Math.log')
      .replace(/\blog\b/g, 'Math.log10')
      .replace(/\bsqrt\b/g, 'Math.sqrt')
      .replace(/\babs\b/g, 'Math.abs')
      .replace(/\bsinh\b/g, 'Math.sinh')
      .replace(/\bcosh\b/g, 'Math.cosh')
      .replace(/\btanh\b/g, 'Math.tanh')
      .replace(/\bsin\b/g, 'Math.sin')
      .replace(/\bcos\b/g, 'Math.cos')
      .replace(/\btan\b/g, 'Math.tan')
      .replace(/\bexp\b/g, 'Math.exp')
      .replace(/\^/g, '**');

    // Manejo de multiplicación implícita (ej. 2x -> 2*x, 2(x) -> 2*(x), )x -> )*x)
    const v = variableName;
    const vRegex = new RegExp(`(\\d)(${v})`, 'g');
    sanitized = sanitized.replace(vRegex, '$1*$2');
    sanitized = sanitized.replace(/(\))(\()/g, '$1*$2');
    sanitized = sanitized.replace(/(\d)(\()/g, '$1*$2');
    sanitized = sanitized.replace(new RegExp(`(\\))(${v})`, 'g'), `$1*$2`);

    // Prohibir palabras clave peligrosas
    const dangerousKeywords = [
      'window', 'document', 'process', 'global', 'require', 'import',
      'function', 'eval', 'constructor', 'prototype', 'settimeout', 'setinterval',
      'fetch', 'xmlhttprequest', 'localstorage', 'sessionstorage'
    ];
    for (const kw of dangerousKeywords) {
      if (sanitized.toLowerCase().includes(kw)) {
        throw new Error(`Término prohibido por seguridad detectado: ${kw}`);
      }
    }

    // Validación de seguridad estricta para prevenir inyecciones
    const allowedChars = /^[0-9a-zA-Z_\s\+\-\*\/\(\)\.,\^\*\*\s]+$/;
    if (!allowedChars.test(sanitized)) {
      throw new Error('La expresión contiene caracteres o sintaxis no permitidos.');
    }

    try {
      // Función pura encapsulada con variable parametrizada
      const fn = new Function('Math', variableName, `
        'use strict';
        return (${sanitized});
      `);

      // Prueba de ejecución en un punto de prueba neutro
      const testVal = fn(Math, 1);
      if (typeof testVal !== 'number') {
        throw new Error('La función no retorna un valor numérico.');
      }

      return function evaluatedFunction(val) {
        const result = fn(Math, val);
        if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
          throw new Error(`Evaluación no finita (NaN o Infinito) al evaluar en ${variableName} = ${val}`);
        }
        return result;
      };
    } catch (err) {
      throw new Error(`Error de sintaxis en la expresión matemática "${expression}": ${err.message}`);
    }
  }
}
