/**
 * Catálogo maestro de ejercicios del Desafío de Integración Numérica (La Paz, Bolivia).
 * Contiene datos tabulados, funciones continuas, constantes físicas, referencias exactas
 * y factores de conversión conforme al solucionario oficial del docente.
 */
export const EXERCISE_PRESETS = {
  // Caso de control docente
  'baseline': {
    id: 'baseline',
    number: 0,
    title: 'Caso Base de Calibración Docente (f(x) = x²)',
    domain: 'Verificación de Software',
    type: 'FUNCTION',
    functionExpr: 'x^2',
    variable: 'x',
    a: 0,
    b: 2,
    defaultN: 4,
    exactValue: 8 / 3, // 2.6666666666666665
    units: 'u',
    description: 'Verificación mínima obligatoria de código exigida en la rúbrica docente. Integral de f(x)=x² en [0, 2] con resultado analítico exacto de 8/3.',
    scaleFactor: 1.0
  },

  // Ejercicio 19
  'ex19': {
    id: 'ex19',
    number: 19,
    title: 'Ejercicio 19 · Transporte Urbano (Distancia recorrida)',
    domain: 'Transporte y Movilidad Urbana',
    type: 'TABULAR',
    variableName: 't',
    dependentName: 'v',
    unitsX: 's',
    unitsY: 'mi/h',
    unitsIntegral: 'mi',
    scaleFactor: 1 / 3600, // Factor de conversión de segundos a horas
    x: [0, 1, 2, 3, 4, 5, 6, 7],
    y: [0, 14, 39, 69, 95, 114, 129, 139],
    referenceValues: {
      trapezoid: 0.147083,
      hybrid: 0.147072 // Simpson 1/3 (0-4) + Simpson 3/8 (4-7)
    },
    hybridPlan: [
      { startIdx: 0, endIdx: 4, method: 'SIMPSON_1_3' },
      { startIdx: 4, endIdx: 7, method: 'SIMPSON_3_8' }
    ],
    description: 'Un vehículo experimental registra su velocidad v(t) durante los primeros 7 segundos. Estimar la distancia recorrida d = (1/3600) * ∫₀⁷ v(t) dt.'
  },

  // Ejercicio 20
  'ex20': {
    id: 'ex20',
    number: 20,
    title: 'Ejercicio 20 · Ensayo de Elasticidad (Trabajo mecánico)',
    domain: 'Ciencia de Materiales e Ingeniería Mecánica',
    type: 'TABULAR',
    variableName: 'x',
    dependentName: 'F',
    unitsX: 'in',
    unitsY: 'lb',
    unitsIntegral: 'lb·in',
    scaleFactor: 1.0,
    x: [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8],
    y: [0, 0.85, 1.30, 1.60, 1.87, 2.14, 2.34, 2.52],
    referenceValues: {
      trapezoid: 4.544000,
      hybrid: 4.577167 // Simpson 1/3 (0-4) + Simpson 3/8 (4-7)
    },
    hybridPlan: [
      { startIdx: 0, endIdx: 4, method: 'SIMPSON_1_3' },
      { startIdx: 4, endIdx: 7, method: 'SIMPSON_3_8' }
    ],
    description: 'Cálculo del trabajo realizado sobre una banda elástica: W = ∫₀²·⁸ F(x) dx. El resultado de 4.577 lb·in equivale aproximadamente a 0.517 Joules.'
  },

  // Ejercicio 21
  'ex21': {
    id: 'ex21',
    number: 21,
    title: 'Ejercicio 21 · Perfil Topográfico (Área bajo la rasante)',
    domain: 'Topografía e Ingeniería Civil',
    type: 'TABULAR',
    variableName: 'x',
    dependentName: 'y',
    unitsX: 'u',
    unitsY: 'u',
    unitsIntegral: 'u²',
    scaleFactor: 1.0,
    x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    y: [1.3, 3.7, 4.6, 4.4, 2.7, 2.5, 3.6, 5.3, 6.0, 5.9],
    referenceValues: {
      trapezoid: 36.40,
      hybrid: 36.85 // Simpson 1/3 en 8 subintervalos + Trapecio en el 9no
    },
    hybridPlan: [
      { startIdx: 0, endIdx: 8, method: 'SIMPSON_1_3' },
      { startIdx: 8, endIdx: 9, method: 'TRAPEZOID' }
    ],
    description: 'Estimación del área bajo una rasante topográfica con 9 subintervalos de x=1 a x=10. Se evalúa trapecio y Simpson 1/3 combinado con trapecio final.'
  },

  // Ejercicio 22
  'ex22': {
    id: 'ex22',
    number: 22,
    title: 'Ejercicio 22 · Cable Suspendido (Longitud de Catenaria)',
    domain: 'Estructuras y Geometría Aplicada (Teleférico)',
    type: 'FUNCTION',
    variable: 'x',
    functionExpr: 'cosh(x / 24)',
    a: -12,
    b: 26,
    defaultN: 8,
    scaleFactor: 1.0,
    exactValue: 24 * (Math.sinh(26 / 24) - Math.sinh(-12 / 24)), // 43.898841 ft
    referenceValues: {
      exact: 43.898841,
      trapezoid: 44.042044,
      simpson13: 43.899213
    },
    units: 'ft',
    description: 'Cálculo de la longitud de un cable suspendido simplificado y = a*cosh(x/a) con a=24 ft entre x=-12 ft y x=26 ft. Integral: L = ∫ cosh(x/24) dx.'
  },

  // Ejercicio 23
  'ex23': {
    id: 'ex23',
    number: 23,
    title: 'Ejercicio 23 · Red de Abastecimiento de Agua (Caudal en Tubería)',
    domain: 'Hidráulica y Mecánica de Fluidos',
    type: 'FUNCTION',
    variable: 'r',
    functionExpr: '160 * pi * r * ((1 - (r / 0.25))^(1/7))',
    a: 0,
    b: 0.25,
    defaultN: 8,
    scaleFactor: 1.0,
    exactValue: (49 * Math.PI) / 12, // 12.828170 in³/s
    referenceValues: {
      exact: 12.828170,
      trapezoid: 11.681778,
      simpson13: 12.151244
    },
    units: 'in³/s',
    description: 'Determinación del caudal turbulento en una tubería de radio R=0.25 in con perfil v(r) = 80*(1 - r/R)^(1/7). Q = ∫₀ᴿ 2*pi*r*v(r) dr = 49*pi/12.'
  },

  // Ejercicio 24
  'ex24': {
    id: 'ex24',
    number: 24,
    title: 'Ejercicio 24 · Diseño de Trayectoria (Longitud de Cardioide)',
    domain: 'Geometría Diferencial y Robótica',
    type: 'FUNCTION',
    variable: 't',
    functionExpr: '20 * sin(t / 2)',
    a: 0,
    b: 2 * Math.PI,
    defaultN: 8,
    scaleFactor: 1.0,
    exactValue: 80.0,
    referenceValues: {
      exact: 80.0,
      trapezoid: 78.969264,
      simpson13: 80.010767
    },
    units: 'u',
    description: 'Longitud de arco de la cardioide paramétrica con parámetro b=5 entre t=0 y t=2*pi. Integral simplificada: L = ∫₀²π 20*sin(t/2) dt = 80.'
  },

  // Ejercicio 25
  'ex25': {
    id: 'ex25',
    number: 25,
    title: 'Ejercicio 25 · Energía Gravitatoria (Satélite en Órbita)',
    domain: 'Física Espacial y Dinámica Orbital',
    type: 'FUNCTION',
    variable: 'y',
    functionExpr: '(500 * 9.81 * (6371000^2)) / ((6371000 + y)^2)',
    a: 0,
    b: 800000,
    defaultN: 8,
    scaleFactor: 1.0,
    exactValue: (500 * 9.81 * 6371000 * 800000) / (6371000 + 800000), // ~3.486236787e9 J
    referenceValues: {
      exact: 3.486236787e9,
      trapezoid: 3.48662008e9,
      simpson13: 3.48623690e9
    },
    units: 'J',
    description: 'Variación de energía potencial gravitatoria para elevar un satélite de 500 kg a una altitud de h=800 km considerando la gravedad no constante.'
  },

  // Ejercicio 26
  'ex26': {
    id: 'ex26',
    number: 26,
    title: 'Ejercicio 26 · Superficie de Lago (Batimetría y Áreas)',
    domain: 'Recursos Hídricos y Cartografía',
    type: 'TABULAR',
    variableName: 'x',
    dependentName: 'w',
    unitsX: 'mi',
    unitsY: 'mi',
    unitsIntegral: 'mi²',
    scaleFactor: 1.0,
    x: [40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260],
    y: [0, 40, 52, 54, 55, 54, 52, 48, 45, 42, 28, 0], // Medición representativa calibrada
    referenceValues: {
      historicalReference: 9940.0
    },
    description: 'Estimación de superficie lacustre mediante anchuras transversales w(x) tomadas cada 20 millas en un tramo de 220 millas. Área de referencia: 9,940 mi².'
  },

  // Ejercicio 27
  'ex27': {
    id: 'ex27',
    number: 27,
    title: 'Ejercicio 27 · Geometría de Sólido Alargado (Volumen de Revolución)',
    domain: 'Diseño Mecánico y Geometría de Revolución',
    type: 'TABULAR',
    variableName: 'z',
    dependentName: 'd',
    unitsX: 'in',
    unitsY: 'in',
    unitsIntegral: 'in³',
    scaleFactor: Math.PI, // V = pi * ∫ r² dz con r = d/2
    x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    y: [0, 2.6, 3.2, 4.8, 5.6, 6.0, 6.2, 6.0, 5.6, 4.8, 3.3, 2.6, 0],
    customTransform: (val) => Math.pow(val / 2, 2), // r^2 = (d/2)^2
    referenceValues: {
      trapezoid: 199.404740,
      simpson13: 201.842092
    },
    description: 'Estimación del volumen de revolución de un objeto fusiforme con perfiles de diámetro medidos a lo largo de su eje z. V = pi * ∫₀¹² (d/2)² dz.'
  }
};
