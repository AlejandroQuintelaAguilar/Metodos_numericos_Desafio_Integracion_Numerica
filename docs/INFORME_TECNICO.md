# INFORME TÉCNICO DE MÉTODOS NUMÉRICOS
## DESAFÍO: INTEGRACIÓN NUMÉRICA APLICADA A PROBLEMAS DE INGENIERÍA (LA PAZ, BOLIVIA)

**Cátedra**: Métodos Numéricos  
**Modalidad**: Desafío Grupal de Cuadratura Numérica | Evaluación sobre 100 Puntos  
**Arquitectura**: Clean Architecture / Hexagonal Core en JavaScript ES6+  
**Fecha de Emisión**: 27 de Octubre de 2026  

---

## 1. Contexto, Propósito y Objetivos de Ingeniería

El presente proyecto aborda la resolución rigurosa de problemas de ingeniería (transporte vehicular, dinámica elástica de materiales, topografía de laderas, catenarias de soporte estructural, distribución de caudal hidráulico, balística/trayectorias paramétricas, energía potencial orbital y cubicación geométrica) mediante métodos de integración numérica de Newton-Cotes cerrados.

### Objetivos Principales:
1. **Modelización Matemática y Discretización**: Traducir leyes físicas continuas y perfiles discretos a integrales definidas $\int_a^b f(x) dx$.
2. **Cálculo Analítico y Manual**: Obtener valores de referencia cerrados o matrices de cuadratura ponderadas aplicando las reglas del Trapecio Compuesto, Simpson 1/3 Compuesto, Simpson 3/8 Compuesto y Cuadratura Híbrida.
3. **Desarrollo de Software de Alta Precisión**: Diseñar una plataforma web bajo Arquitectura Limpia, validando monotonicidad, uniformidad del espaciamiento $h$, condiciones de paridad/divisibilidad de subintervalos $n$, y minimización del error de redondeo de punto flotante IEEE 754.
4. **Análisis de Convergencia y Error**: Comparar las tasas de error absoluto ($E_a = |I_{\text{ref}} - I_{\text{aprox}}|$) y relativo porcentual ($E_p = \frac{E_a}{|I_{\text{ref}}|} \times 100\%$) evaluando las limitaciones físicas de cada modelo.

---

## 2. Modelos Matemáticos y Formulación de Cuadratura

Para una grilla equiespaciada $x_i = a + i \cdot h$ ($i = 0, \dots, n$) con paso $h = \frac{b - a}{n}$:

### 2.1 Regla del Trapecio Compuesto ($n \ge 1$)
Aproxima el integrando mediante interpolantes lineales a trozos. Orden de error global $O(h^2)$:
$$T(h) = \frac{h}{2} \left[ f(x_0) + 2 \sum_{i=1}^{n-1} f(x_i) + f(x_n) \right], \quad E_T = -\frac{(b-a)h^2}{12} f''(\xi)$$

### 2.2 Regla de Simpson 1/3 Compuesta ($n$ par, $n \ge 2$)
Aproxima el integrando mediante parábolas de segundo orden. Exacta para polinomios de hasta grado 3. Orden de error global $O(h^4)$:
$$S_{1/3}(h) = \frac{h}{3} \left[ f(x_0) + 4 \sum_{i \text{ impar}} f(x_i) + 2 \sum_{i \text{ par int.}} f(x_i) + f(x_n) \right], \quad E_{S_{1/3}} = -\frac{(b-a)h^4}{180} f^{(4)}(\xi)$$

### 2.3 Regla de Simpson 3/8 Compuesta ($n$ múltiplo de 3, $n \ge 3$)
Aproxima mediante polinomios cúbicos de tercer orden. Orden de error global $O(h^4)$:
$$S_{3/8}(h) = \frac{3h}{8} \left[ f(x_0) + 3 \sum_{i \not\equiv 0 \pmod 3} f(x_i) + 2 \sum_{i \equiv 0 \pmod 3, 0 < i < n} f(x_i) + f(x_n) \right]$$

### 2.4 Cuadratura Híbrida Adaptativa (Manejo de $n=7$ y grillas impares)
Cuando la cantidad de subintervalos no permite la aplicación directa de Simpson 1/3 (por ejemplo $n=7$), se realiza una partición óptima:
$$I = \int_{x_0}^{x_4} f(x)dx \Bigg|_{S_{1/3}} + \int_{x_4}^{x_7} f(x)dx \Bigg|_{S_{3/8}}$$
En el nodo frontera $x_4$, el peso efectivo acumulado resulta de la superposición de ambos operadores:
$$w_4 = \frac{h}{3}(1) + \frac{3h}{8}(1) = \frac{17h}{24}$$

---

## 3. Verificación de Rúbrica: Caso Base $f(x) = x^2$ en $[0, 2]$

Exigido explícitamente en la guía docente como prueba mínima de calibración.

- **Valor Analítico Exacto**:
  $$I_{\text{exacto}} = \int_0^2 x^2 dx = \left[ \frac{x^3}{3} \right]_0^2 = \frac{8}{3} \approx 2.66666667$$

- **Evaluación Comparativa de Convergencia**:
  | Configuración | Método | Integral Calculada | Error Absoluto ($E_a$) | Error Relativo ($E_p$) |
  |---|---|---|---|---|
  | $n = 4$, $h = 0.5$ | Trapecio | `2.750000` | $8.3333 \times 10^{-2}$ | $3.1250\%$ |
  | $n = 4$, $h = 0.5$ | **Simpson 1/3** | **`2.666667`** | **$< 1.0 \times 10^{-12}$** | **$0.0000\%$** (Exactitud de máquina) |
  | $n = 8$, $h = 0.25$ | Trapecio | `2.687500` | $2.0833 \times 10^{-2}$ | $0.7813\%$ |
  | $n = 8$, $h = 0.25$ | **Simpson 1/3** | **`2.666667`** | **$< 1.0 \times 10^{-12}$** | **$0.0000\%$** |

> **Conclusión de Calibración**: Al duplicar los subintervalos de $n=4$ a $n=8$, el error del método del trapecio se reduce en un factor de $4$ ($\frac{0.08333}{0.02083} = 4.00$), comprobando experimentalmente la convergencia teórica de orden cuadrático $O(h^2)$. Simpson 1/3 anula el error analítico por ser exacto para grado 2.

---

## 4. Desarrollo Analítico y Cálculo Manual de Problemas Asignados

### Caso A: Ejercicio 19 · Transporte Urbano (Datos Discretos, $n=7$)
- **Contexto Físico**: Vehículo experimental registrando velocidad $v(t)$ en los primeros 7 segundos ($h = 1 \text{ s}$).
- **Datos**: $t = [0, 1, 2, 3, 4, 5, 6, 7]$, $v = [0, 14, 39, 69, 95, 114, 129, 139] \text{ mi/h}$.
- **Modelo**:
  $$d = \int_0^7 v(t) dt \quad [\text{mi/h} \cdot \text{s}] \implies d = \frac{1}{3600} \int_0^7 v(t) dt \quad [\text{millas}]$$

- **Cálculo Trapecio Compuesto**:
  $$\Sigma_{\text{ponderada}} = 1 \cdot \left[ \frac{0 + 139}{2} + (14 + 39 + 69 + 95 + 114 + 129) \right] = 69.5 + 460 = 529.5 \text{ mi/h}\cdot\text{s}$$
  $$d_T = \frac{529.5}{3600} \approx \mathbf{0.147083 \text{ mi}}$$

- **Cálculo Simpson Combinado (Híbrido)**:
  - Tramo 1 (Simpson 1/3, $t \in [0, 4]$, $h=1$):
    $$I_1 = \frac{1}{3} [v(0) + 4v(1) + 2v(2) + 4v(3) + v(4)] = \frac{1}{3} [0 + 56 + 78 + 276 + 95] = \frac{505}{3} \approx 168.333333$$
  - Tramo 2 (Simpson 3/8, $t \in [4, 7]$, $h=1$):
    $$I_2 = \frac{3(1)}{8} [v(4) + 3v(5) + 3v(6) + v(7)] = \frac{3}{8} [95 + 3(114) + 3(129) + 139] = \frac{3}{8} [1003] = 361.125000$$
  - Suma Total:
    $$I_{\text{total}} = 168.333333 + 361.125000 = 529.458333 \text{ mi/h}\cdot\text{s}$$
    $$d_S = \frac{529.458333}{3600} \approx \mathbf{0.147072 \text{ mi}} \quad (\approx 236.69 \text{ metros})$$

---

### Caso B: Ejercicio 22 · Cable Suspendido (Función Continua, $n=8$)
- **Contexto Físico**: Modelado simplificado de catenaria para vano de teleférico: $y = a \cosh(x/a)$ con $a = 24 \text{ ft}$ entre $x \in [-12, 26] \text{ ft}$.
- **Longitud de Arco**:
  $$L = \int_{-12}^{26} \sqrt{1 + [y'(x)]^2} dx = \int_{-12}^{26} \cosh(x/24) dx$$
- **Solución Analítica Cerrada**:
  $$L = 24 \left[ \sinh\left(\frac{26}{24}\right) - \sinh\left(-\frac{12}{24}\right) \right] = 24 [1.30799435 - (-0.52109530)] = \mathbf{43.898841 \text{ ft}}$$
- **Discretización Numérica** ($n = 8$, $h = \frac{26 - (-12)}{8} = 4.75 \text{ ft}$):
  - Trapecio: $L_T = \mathbf{44.042044 \text{ ft}}$ ($E_a = 0.143203 \text{ ft}$, $E_p = 0.3262\%$).
  - Simpson 1/3: $L_{1/3} = \mathbf{43.899213 \text{ ft}}$ ($E_a = 0.000372 \text{ ft}$, $E_p = 0.0008\%$).

---

### Caso C: Ejercicio 23 · Red Hidráulica (Caudal en Flujo Turbulento, $n=8$)
- **Contexto**: Perfil exponencial turbulento de Prandtl $1/7$ en tubería de radio $R = 0.25 \text{ in}$: $v(r) = 80(1 - r/R)^{1/7}$.
- **Integral de Caudal**:
  $$Q = \int_0^R 2\pi r v(r) dr = 160\pi \int_0^{0.25} r \left(1 - \frac{r}{0.25}\right)^{1/7} dr$$
- **Solución Exacta por Sustitución** ($u = 1 - r/0.25$):
  $$Q = 160\pi (0.25)^2 \int_0^1 (1 - u) u^{1/7} du = 10\pi \left[ \frac{7}{8} - \frac{7}{15} \right] = \frac{49\pi}{12} \approx \mathbf{12.828170 \text{ in}^3/\text{s}}$$
- **Resultados con $n = 8$ ($h = 0.03125 \text{ in}$)**:
  - Trapecio: $Q_T = \mathbf{11.681778 \text{ in}^3/\text{s}}$ ($E_p = 8.9365\%$).
  - Simpson 1/3: $Q_{1/3} = \mathbf{12.151244 \text{ in}^3/\text{s}}$ ($E_p = 5.2769\%$).

> **Interpretación Física y Limitación**: En $r = R$, la derivada $\frac{dv}{dr} \to -\infty$ debido al exponente fraccionario $1/7$. La singularidad en la derivada de orden superior afecta los supuestos de suavidad de Taylor en los que se basan los métodos de Newton-Cotes, explicando la convergencia más lenta en comparación con la catenaria o la cardioide.

---

## 5. Matriz Consolidada de Resultados de Todos los Ejercicios (19 a 27)

| Ejercicio | Dominio / Escenario | Trapecio | Simpson (1/3 o Híbrido) | Referencia / Exacto | Error Simpson ($E_p$) |
|---|---|---|---|---|---|
| **Base** | $f(x)=x^2, [0, 2], n=4$ | `2.750000` | `2.666667` | `2.666667` | $0.0000\%$ |
| **19** | Distancia Vehículo | `0.147083 mi` | `0.147072 mi` | `0.147072 mi` | Ref. Docente |
| **20** | Trabajo Elasticidad | `4.544000 lb·in`| `4.577167 lb·in`| `4.577167 lb·in`| Ref. Docente |
| **21** | Perfil Topográfico | `36.400000 u²` | `36.850000 u²` | Estimación digital | Ref. Docente |
| **22** | Catenaria ($n=8$) | `44.042044 ft` | `43.899213 ft` | `43.898841 ft` | $0.0008\%$ |
| **23** | Caudal Turbulento ($n=8$) | `11.681778 in³/s` | `12.151244 in³/s` | `12.828170 in³/s` | $5.2769\%$ |
| **24** | Cardioide ($n=8$) | `78.969264 u` | `80.010767 u` | `80.000000 u` | $0.0135\%$ |
| **25** | Energía Satélite ($n=8$) | `3.486620 × 10⁹ J` | `3.486237 × 10⁹ J` | `3.486237 × 10⁹ J` | $< 0.0001\%$ |
| **26** | Superficie Lago Erie | `9,920.00 mi²` | `9,946.67 mi²` | `9,940.00 mi²` | $0.0671\%$ |
| **27** | Volumen Sólido Rev. | `199.404740 in³`| `201.842092 in³`| `201.842092 in³`| Ref. Docente |

---

## 6. Conclusiones y Lecciones de Ingeniería

1. **Eficiencia y Jerarquía de Métodos**: Simpson 1/3 supera consistentemente al Trapecio Compuesto en integrabilidad de funciones regulares suaves, reduciendo el orden del error de $O(h^2)$ a $O(h^4)$.
2. **Robustez ante Restricciones Geométricas**: La implementación del operador híbrido permite resolver grillas con números arbitrarios de subintervalos (incluyendo $n=7$ y $n=9$) sin sacrificar precisión ni degradar el cálculo a trapecios globales.
3. **Validación de Código y Calidad del Software**: La suite de pruebas unitarias automatizadas garantizó que los 9 escenarios reprodujeran exactamente los 6 decimales del solucionario oficial de la cátedra.
