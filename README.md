# Plataforma de Integración Numérica · Desafío La Paz 2026

[![Tests](https://img.shields.io/badge/Unit%20Tests-17%20Passed-emerald.svg)](tests/integration.test.js)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20Hexagonal-blue.svg)](core/)
[![License](https://img.shields.io/badge/License-MIT-slate.svg)](LICENSE)

Sistema computacional de alta precisión bajo **Arquitectura Limpia (Hexagonal)** para la resolución, análisis de convergencia y visualización interactiva de integrales aplicadas a problemas de ingeniería en La Paz, Bolivia.

---

## 🏛️ Arquitectura del Sistema

El proyecto sigue una estricta separación de responsabilidades:

```
DESAFIO 27_10_26/
├── core/                               # Núcleo desacoplado de dependencias externas
│   ├── domain/                         # Capa de Dominio (Entidades puras y algoritmos)
│   │   ├── NumericalGrid.js            # Entidad/Value Object: grilla x_i, y_i, h, monotonicidad
│   │   ├── TrapezoidalRule.js          # Algoritmo Trapecio Compuesto
│   │   ├── SimpsonOneThirdRule.js      # Algoritmo Simpson 1/3 Compuesto (n par)
│   │   ├── SimpsonThreeEighthsRule.js  # Algoritmo Simpson 3/8 Compuesto (n mult. de 3)
│   │   └── HybridQuadratureRule.js     # Particionador adaptativo para n impar o compuesto
│   └── application/                    # Capa de Aplicación (Casos de uso)
│       ├── CalculateIntegrationUseCase.js # Orquestador de cómputo y análisis de errores
│       ├── FunctionEvaluator.js        # Parser seguro de funciones matemáticas
│       └── ExercisePresets.js          # Catálogo canónico de los ejercicios 19 al 27
├── tests/
│   └── integration.test.js             # Suite de 17 pruebas unitarias automatizadas
├── docs/
│   └── INFORME_TECNICO.md              # Informe técnico formal de 2 páginas con notación KaTeX
├── js/
│   └── main.js                         # Adaptador de interfaz web interactiva
├── css/
│   └── style.css                       # Estilos complementarios y microinteracciones
├── index.html                          # Dashboard web interactivo responsivo
└── package.json                        # Configuración ES Modules y scripts de test
```

---

## 🚀 Despliegue y Ejecución

### 1. Ejecutar Pruebas Automatizadas (Unit Tests)
Para validar la exactitud numérica frente al solucionario docente y el caso de control $f(x)=x^2$:
```bash
npm test
```

### 3. Despliegue en Producción (GitHub Pages)
Dado que la arquitectura es estática y modular (ES6 nativo sin build overhead):
1. El repositorio está alojado en: `https://github.com/AlejandroQuintelaAguilar/Metodos_numericos_Desafio_Integracion_Numerica`
2. En GitHub: Ve a **Settings** > **Pages** > **Build and deployment**.
3. Selecciona **Source**: `Deploy from a branch`, **Branch**: `main` / `root`, y presiona **Save**.
4. La aplicación estará en línea inmediatamente en:
   `https://alejandroquintelaaguilar.github.io/Metodos_numericos_Desafio_Integracion_Numerica/`

---

## 📊 Matriz de Problemas Soportados

| Ejercicio | Dominio de Ingeniería | Tipo | Modelo / Integral | Método Óptimo |
|---|---|---|---|---|
| **Base** | Verificación Docente | Función | $f(x)=x^2$ en $[0, 2]$ | Simpson 1/3 ($8/3$) |
| **19** | Transporte Urbano | Tabulado | $d = \frac{1}{3600}\int_0^7 v(t)dt$ | Simpson Híbrido ($1/3 + 3/8$) |
| **20** | Ensayo de Elasticidad | Tabulado | $W = \int_0^{2.8} F(x)dx$ | Simpson Híbrido ($1/3 + 3/8$) |
| **21** | Perfil Topográfico | Tabulado | $A = \int_1^{10} y(x)dx$ | Simpson 1/3 + Trapecio |
| **22** | Cable Suspendido (Catenaria) | Función | $L = \int_{-12}^{26} \cosh(x/24)dx$ | Simpson 1/3 ($n=8$) |
| **23** | Red de Abastecimiento de Agua| Función | $Q = \int_0^{0.25} 160\pi r (1-r/0.25)^{1/7}dr$ | Simpson 1/3 ($n=8$) |
| **24** | Trayectoria de Cardioide | Función | $L = \int_0^{2\pi} 20\sin(t/2)dt$ | Simpson 1/3 ($n=8$) |
| **25** | Energía Gravitatoria (Satélite)| Función | $\Delta U = mg_0 R^2 \int_0^h (R+y)^{-2}dy$ | Simpson 1/3 ($n=8$) |
| **26** | Superficie Lacustre | Tabulado | $A = \int_{40}^{260} w(x)dx$ | Simpson Híbrido |
| **27** | Sólido de Revolución | Tabulado | $V = \pi \int_0^{12} (d/2)^2 dz$ | Simpson 1/3 ($n=12$) |
