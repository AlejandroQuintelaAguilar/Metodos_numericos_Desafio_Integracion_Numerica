import { CalculateIntegrationUseCase } from '../core/application/CalculateIntegrationUseCase.js';
import { EXERCISE_PRESETS } from '../core/application/ExercisePresets.js';

// Estado global de la aplicación
let currentMode = 'FUNCTION';
let chartInstance = null;
let currentCustomTransform = null;
let currentHybridPlan = null;

// Elementos DOM
const dom = {
  selectExercise: document.getElementById('selectExercise'),
  exerciseContextCard: document.getElementById('exerciseContextCard'),
  badgeDomain: document.getElementById('badgeDomain'),
  badgeUnits: document.getElementById('badgeUnits'),
  exerciseDescription: document.getElementById('exerciseDescription'),
  btnRubricVerification: document.getElementById('btnRubricVerification'),

  tabFunction: document.getElementById('tabFunction'),
  tabTabular: document.getElementById('tabTabular'),
  panelFunction: document.getElementById('panelFunction'),
  panelTabular: document.getElementById('panelTabular'),

  inputFunctionExpr: document.getElementById('inputFunctionExpr'),
  inputLimitA: document.getElementById('inputLimitA'),
  inputLimitB: document.getElementById('inputLimitB'),
  inputSubintervalsN: document.getElementById('inputSubintervalsN'),
  inputVariable: document.getElementById('inputVariable'),
  inputTabularText: document.getElementById('inputTabularText'),

  inputScaleFactor: document.getElementById('inputScaleFactor'),
  inputReferenceValue: document.getElementById('inputReferenceValue'),
  btnExecuteCalculation: document.getElementById('btnExecuteCalculation'),

  validationAlert: document.getElementById('validationAlert'),
  alertIcon: document.getElementById('alertIcon'),
  alertText: document.getElementById('alertText'),

  diagN: document.getElementById('diagN'),
  diagH: document.getElementById('diagH'),
  diagUniform: document.getElementById('diagUniform'),

  metricTrapezoid: document.getElementById('metricTrapezoid'),
  metricTrapezoidError: document.getElementById('metricTrapezoidError'),
  metricSimpson13: document.getElementById('metricSimpson13'),
  metricSimpson13Error: document.getElementById('metricSimpson13Error'),
  metricHybrid: document.getElementById('metricHybrid'),
  metricHybridError: document.getElementById('metricHybridError'),
  metricHybridTitle: document.getElementById('metricHybridTitle'),

  tableWeightsBody: document.getElementById('tableWeightsBody'),
  canvasChart: document.getElementById('quadratureChart'),
  chartSubtitle: document.getElementById('chartSubtitle')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadPreset('baseline');
});

function setupEventListeners() {
  // Cambio de modo
  dom.tabFunction.addEventListener('click', () => setMode('FUNCTION'));
  dom.tabTabular.addEventListener('click', () => setMode('TABULAR'));

  // Selector de escenarios
  dom.selectExercise.addEventListener('change', (e) => {
    loadPreset(e.target.value);
  });

  // Botón Calibración rápida docente
  dom.btnRubricVerification.addEventListener('click', () => {
    dom.selectExercise.value = 'baseline';
    loadPreset('baseline');
  });

  // Botón Ejecutar
  dom.btnExecuteCalculation.addEventListener('click', runCalculation);
}

function setMode(mode) {
  currentMode = mode;
  if (mode === 'FUNCTION') {
    dom.tabFunction.className = 'px-3 py-1 rounded-md bg-blue-600 text-white transition shadow';
    dom.tabTabular.className = 'px-3 py-1 rounded-md text-slate-400 hover:text-white transition';
    dom.panelFunction.classList.remove('hidden');
    dom.panelTabular.classList.add('hidden');
  } else {
    dom.tabTabular.className = 'px-3 py-1 rounded-md bg-blue-600 text-white transition shadow';
    dom.tabFunction.className = 'px-3 py-1 rounded-md text-slate-400 hover:text-white transition';
    dom.panelTabular.classList.remove('hidden');
    dom.panelFunction.classList.add('hidden');
  }
}

function loadPreset(presetKey) {
  hideAlert();
  currentCustomTransform = null;
  currentHybridPlan = null;

  if (presetKey === 'custom') {
    dom.badgeDomain.textContent = 'Modo Libre';
    dom.badgeUnits.textContent = 'Unidades: Personalizadas';
    dom.exerciseDescription.textContent = 'Ingrese cualquier función continua o tabla de datos discreta.';
    return;
  }

  const preset = EXERCISE_PRESETS[presetKey];
  if (!preset) return;

  dom.badgeDomain.textContent = preset.domain;
  dom.badgeUnits.textContent = `Unidades: ${preset.unitsIntegral || preset.units || 'u'}`;
  dom.exerciseDescription.textContent = preset.description;

  dom.inputScaleFactor.value = preset.scaleFactor;
  dom.inputReferenceValue.value = (preset.exactValue ?? preset.referenceValues?.hybrid ?? preset.referenceValues?.exact ?? preset.referenceValues?.historicalReference ?? '') || '';

  currentHybridPlan = preset.hybridPlan || null;
  currentCustomTransform = preset.customTransform || null;

  if (preset.type === 'FUNCTION') {
    setMode('FUNCTION');
    dom.inputFunctionExpr.value = preset.functionExpr;
    dom.inputLimitA.value = preset.a;
    dom.inputLimitB.value = preset.b;
    dom.inputSubintervalsN.value = preset.defaultN;
    dom.inputVariable.value = preset.variable || 'x';
  } else if (preset.type === 'TABULAR') {
    setMode('TABULAR');
    let text = 'x, y\n';
    for (let i = 0; i < preset.x.length; i++) {
      text += `${preset.x[i]}, ${preset.y[i]}\n`;
    }
    dom.inputTabularText.value = text.trim();
  }

  runCalculation();
}

function runCalculation() {
  hideAlert();

  try {
    const scaleFactor = parseFloat(dom.inputScaleFactor.value) || 1.0;
    const refValInput = dom.inputReferenceValue.value.trim();
    const referenceValue = refValInput !== '' ? parseFloat(refValInput) : null;

    let payload = {
      type: currentMode,
      scaleFactor,
      referenceValue,
      transformY: currentCustomTransform,
      hybridPlan: currentHybridPlan
    };

    if (currentMode === 'FUNCTION') {
      const expr = dom.inputFunctionExpr.value.trim();
      const a = parseFloat(dom.inputLimitA.value);
      const b = parseFloat(dom.inputLimitB.value);
      const n = parseInt(dom.inputSubintervalsN.value, 10);
      const variableName = dom.inputVariable.value.trim() || 'x';

      if (!expr) throw new Error('Debe especificar una función matemática.');
      if (isNaN(a) || isNaN(b)) throw new Error('Los límites a y b deben ser valores numéricos.');
      if (isNaN(n) || n < 1) throw new Error('El número de subintervalos n debe ser un entero >= 1.');

      payload.functionExpr = expr;
      payload.a = a;
      payload.b = b;
      payload.n = n;
      payload.variableName = variableName;
    } else {
      const parsedData = parseTabularInput(dom.inputTabularText.value);
      payload.x = parsedData.x;
      payload.y = parsedData.y;
    }

    const output = CalculateIntegrationUseCase.execute(payload);
    renderResults(output);
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

function parseTabularInput(text) {
  if (!text || !text.trim()) {
    throw new Error('La tabla de datos no contiene registros.');
  }

  const lines = text.trim().split(/\r?\n/);
  const x = [];
  const y = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;

    // Detectar encabezados de texto (ej. "x, y" o "t, v")
    const parts = line.split(/[,\t\s]+/).filter(Boolean);
    if (parts.length < 2) continue;

    const valX = parseFloat(parts[0]);
    const valY = parseFloat(parts[1]);

    if (isNaN(valX) || isNaN(valY)) {
      // Si la primera línea tiene letras, asumimos que es cabecera
      if (i === 0) continue;
      throw new Error(`Línea ${i + 1} inválida: "${line}". Valores deben ser numéricos.`);
    }

    x.push(valX);
    y.push(valY);
  }

  if (x.length < 2) {
    throw new Error('Se requieren al menos 2 pares de datos (x, y) válidos.');
  }

  return { x, y };
}

function renderResults(output) {
  const { grid, results } = output;

  // Actualizar Diagnósticos
  dom.diagN.textContent = grid.n;
  dom.diagH.textContent = grid.h.toFixed(6);
  if (grid.isUniform) {
    dom.diagUniform.textContent = 'SÍ (Uniforme)';
    dom.diagUniform.className = 'text-xs font-bold text-emerald-400 font-mono mt-1';
  } else {
    dom.diagUniform.textContent = 'NO (Irregular)';
    dom.diagUniform.className = 'text-xs font-bold text-amber-400 font-mono mt-1';
  }

  // 1. Trapecio
  if (results.trapezoid.applicable) {
    dom.metricTrapezoid.textContent = results.trapezoid.formattedValue;
    if (results.trapezoid.errorRelativePct !== null) {
      dom.metricTrapezoidError.textContent = `Error: ${results.trapezoid.errorRelativePct.toFixed(4)}% (E_a: ${results.trapezoid.errorAbsolute.toExponential(4)})`;
    } else {
      dom.metricTrapezoidError.textContent = 'Sin valor de ref.';
    }
  } else {
    dom.metricTrapezoid.textContent = 'N/A';
    dom.metricTrapezoidError.textContent = results.trapezoid.error;
  }

  // 2. Simpson 1/3
  if (results.simpson13.applicable) {
    dom.metricSimpson13.textContent = results.simpson13.formattedValue;
    if (results.simpson13.errorRelativePct !== null) {
      dom.metricSimpson13Error.textContent = `Error: ${results.simpson13.errorRelativePct.toFixed(4)}% (E_a: ${results.simpson13.errorAbsolute.toExponential(4)})`;
    } else {
      dom.metricSimpson13Error.textContent = 'Sin valor de ref.';
    }
  } else {
    dom.metricSimpson13.textContent = 'No aplicable';
    dom.metricSimpson13Error.textContent = results.simpson13.error;
  }

  // 3. Simpson 3/8 o Híbrido
  const hybridOr38 = results.hybrid.applicable ? results.hybrid : results.simpson38;
  if (hybridOr38 && hybridOr38.applicable) {
    dom.metricHybridTitle.textContent = hybridOr38.methodName;
    dom.metricHybrid.textContent = hybridOr38.formattedValue;
    if (hybridOr38.errorRelativePct !== null) {
      dom.metricHybridError.textContent = `Error: ${hybridOr38.errorRelativePct.toFixed(4)}% (E_a: ${hybridOr38.errorAbsolute.toExponential(4)})`;
    } else {
      dom.metricHybridError.textContent = 'Sin valor de ref.';
    }
  } else {
    dom.metricHybridTitle.textContent = 'Simpson 3/8 / Híbrido';
    dom.metricHybrid.textContent = 'No aplicable';
    dom.metricHybridError.textContent = hybridOr38?.error || 'Condición n no cumplida';
  }

  // Tabla de Pesos
  renderWeightsTable(grid, results);

  // Gráfico
  renderChart(grid);
}

function renderWeightsTable(grid, results) {
  dom.tableWeightsBody.innerHTML = '';
  const n = grid.n;

  const trapWeights = results.trapezoid.applicable ? results.trapezoid.weights : null;
  const simpsonWeights = results.simpson13.applicable
    ? results.simpson13.weights
    : (results.hybrid.applicable ? results.hybrid.weights : (results.simpson38.applicable ? results.simpson38.weights : null));

  for (let i = 0; i <= n; i++) {
    const row = document.createElement('tr');

    const wT = trapWeights ? trapWeights[i].toFixed(6) : '-';
    const wS = simpsonWeights ? simpsonWeights[i].toFixed(6) : '-';

    row.innerHTML = `
      <td class="py-2 px-3 text-slate-400 font-bold">${i}</td>
      <td class="py-2 px-3 font-mono">${grid.x[i].toFixed(4)}</td>
      <td class="py-2 px-3 font-mono text-blue-300">${grid.y[i].toFixed(6)}</td>
      <td class="py-2 px-3 font-mono text-amber-300">${wT}</td>
      <td class="py-2 px-3 font-mono text-emerald-300">${wS}</td>
    `;
    dom.tableWeightsBody.appendChild(row);
  }
}

function renderChart(grid) {
  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = dom.canvasChart.getContext('2d');
  const points = grid.x.map((xi, idx) => ({ x: xi, y: grid.y[idx] }));

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'f(x) / Datos y_i',
          data: points,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: 'origin',
          tension: 0.15,
          pointBackgroundColor: '#60a5fa',
          pointBorderColor: '#1e3a8a',
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: '#94a3b8', font: { family: 'ui-monospace, monospace', size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: (context) => `x: ${context.parsed.x.toFixed(4)}, y: ${context.parsed.y.toFixed(4)}`
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Coordenada x', color: '#64748b', font: { size: 10 } },
          ticks: { color: '#94a3b8', font: { family: 'monospace' } },
          grid: { color: 'rgba(51, 65, 85, 0.3)' }
        },
        y: {
          title: { display: true, text: 'f(x)', color: '#64748b', font: { size: 10 } },
          ticks: { color: '#94a3b8', font: { family: 'monospace' } },
          grid: { color: 'rgba(51, 65, 85, 0.3)' }
        }
      }
    }
  });

  dom.chartSubtitle.textContent = `Grilla de ${grid.n} subintervalos [${grid.x[0].toFixed(2)}, ${grid.x[grid.n].toFixed(2)}]`;
}

function showAlert(message, type = 'error') {
  dom.validationAlert.classList.remove('hidden', 'bg-red-900/30', 'border-red-700/60', 'text-red-300', 'bg-emerald-900/30', 'border-emerald-700/60', 'text-emerald-300');
  if (type === 'error') {
    dom.validationAlert.classList.add('bg-red-900/30', 'border-red-700/60', 'text-red-300');
    dom.alertIcon.innerHTML = `<svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`;
  } else {
    dom.validationAlert.classList.add('bg-emerald-900/30', 'border-emerald-700/60', 'text-emerald-300');
    dom.alertIcon.innerHTML = `<svg class="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>`;
  }
  dom.alertText.textContent = message;
}

function hideAlert() {
  dom.validationAlert.classList.add('hidden');
}
