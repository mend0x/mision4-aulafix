# AulaFix — M4 · Full Contact Forms

**Alumno:** @Mendo · Web Development I · U-tad

Aplicación web para registrar y consultar incidencias en las instalaciones universitarias. Desarrollada con React, React Hook Form, Zod y TanStack Query v5.

Permite comunicar problemas relacionados con ordenadores, pizarras digitales, monitores, mobiliario y tabletas gráficas. Incluye una categoría «Otro» que habilita un campo adicional obligatorio.

Las incidencias se almacenan mediante una API REST local utilizando JSON Server. El diseño está inspirado en las interfaces de 2010–2012, especialmente Windows 7 Aero.

## Instalación y ejecución

Requisitos: Node.js, npm y dos terminales para ejecutar el frontend y la API local.

Desde la carpeta del proyecto:

```bash
npm ci
```

**Terminal 1 — Servidor de desarrollo:**

```bash
npm run dev
```

**Terminal 2 — API local:**

```bash
npm run api
```

Direcciones utilizadas:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001/incidencias`

El puerto de Vite puede cambiar si el predeterminado está ocupado. Utiliza la dirección que aparezca en la terminal.

Es necesario mantener ambos servidores ejecutándose. Si solo se inicia React, la aplicación no podrá consultar ni registrar incidencias.

Para comprobar la compilación:

```bash
npm run build
```

El proyecto incluye `db.json` con un array vacío para permitir registrar incidencias desde cero.

## Cómo utilizarlo

1. Introduce un número de aula entre 0 y 500.
2. Selecciona una categoría de incidencia.
3. Si seleccionas «Otro», aparecerá un campo adicional para especificar el problema.
4. Escribe una descripción de al menos diez caracteres.
5. Introduce un correo universitario con formato `nombre.apellido@live.u-tad.com`.
6. Pulsa «Registrar incidencia».

React Hook Form recoge los valores y Zod comprueba las validaciones antes de permitir el envío.

Cuando la API confirma el registro, se muestra un mensaje de éxito, se limpia el formulario y se actualiza automáticamente el listado.

Las incidencias se conservan en `db.json` aunque se recargue la página o se reinicie el frontend.

## Estructura y responsabilidades

| Archivo | Responsabilidad | Contenido del temario |
| --- | --- | --- |
| `src/main.jsx` | Montaje de React y QueryClientProvider | React, TanStack Query v5 |
| `src/App.jsx` | Composición del formulario y listado | React, JSX, componentes |
| `src/components/Formulario.jsx` | Registro de incidencias, validaciones visuales y mutación | React Hook Form, zodResolver, useMutation |
| `src/components/ListaIncidencias.jsx` | Consulta y representación de incidencias | useQuery, estados, map y keys |
| `src/schemas.js` | Esquema centralizado de validación | Zod, refine, enum y mensajes personalizados |
| `src/api.js` | Peticiones GET/POST y validación de respuestas | fetch, async/await, JSON y safeParse |
| `src/index.css` | Presentación responsive inspirada en Windows 7 Aero | CSS |
| `db.json` | Almacenamiento local de incidencias | API REST mediante JSON Server |

Se han separado la interfaz, la validación y las peticiones HTTP para evitar concentrar toda la lógica en un único componente.

## Validación con React Hook Form y Zod

El formulario utiliza `useForm()` con `register`, `handleSubmit` y `formState`.

`zodResolver` conecta React Hook Form con `esquemaRegistro`, definido en `schemas.js`. El esquema centraliza las reglas, evitando duplicar validaciones entre los componentes.

Las condiciones implementadas son:

| Campo | Validación |
| --- | --- |
| `aula` | Número entero entre 0 y 500, sin aceptar cadenas vacías |
| `categorias` | Valor incluido en el enumerado de categorías permitidas |
| `campoOtro` | Obligatorio únicamente si la categoría es «Otro» |
| `descripcion` | Cadena de al menos diez caracteres |
| `email` | Correo válido con estructura `nombre.apellido@live.u-tad.com` |

La validación del aula utiliza `.refine()` junto con `Number.isInteger()` para comprobar el valor numérico.

El campo `campoOtro` utiliza un refinamiento aplicado al objeto completo, porque su obligatoriedad depende de la categoría seleccionada.

Los errores se muestran junto a los campos mediante `formState.errors`. Se utilizan etiquetas HTML asociadas a sus entradas, atributos `aria-invalid` y mensajes con `role="alert"`.

El formulario incluye `noValidate` para que Zod sea responsable de las reglas de validación, en lugar de combinar sus mensajes con los del navegador.

## Peticiones HTTP y TanStack Query

La API utiliza dos operaciones:

- `GET /incidencias`: recupera las incidencias existentes.
- `POST /incidencias`: registra una nueva incidencia.

Ambas se implementan con `fetch` y `async/await`, comprobando `respuesta.ok` antes de procesar el JSON.

TanStack Query v5 se encarga del estado remoto:

- `useQuery()` consulta los registros mediante `obtenerIncidencias`.
- `queryKey: ["incidencias"]` identifica la consulta en la caché.
- `useMutation()` ejecuta `crearIncidencia` para enviar nuevos registros.
- `invalidateQueries()` invalida la consulta tras un POST correcto y provoca la actualización del listado.

No se utiliza `useEffect` para gestionar manualmente las peticiones. TanStack Query proporciona la caché, los estados de petición y la sincronización de datos.

La interfaz distingue entre carga inicial, error de consulta, lista vacía, resultados disponibles, envío pendiente, error de registro y registro completado.

## Bonus — Validación de respuestas con safeParse

Además de validar el formulario, AulaFix comprueba los datos recibidos desde la API.

En `api.js` se utiliza el mismo esquema de Zod:

```javascript
const resultado = z.array(esquemaRegistro).safeParse(datos);
```

`z.array()` exige que la respuesta sea una lista de incidencias y `safeParse()` comprueba que sus elementos cumplan el esquema.

Si la validación falla, se lanza un error personalizado:

```javascript
if (!resultado.success) {
    console.error(resultado.error);
    throw new Error(
        "La API ha devuelto incidencias con datos corruptos"
    );
}
```

TanStack Query captura el error y `ListaIncidencias.jsx` lo comunica al usuario.

Se utiliza `retry: false` para evitar reintentos innecesarios durante la demostración de respuestas corruptas.

La función devuelve los datos originales después de validarlos, conservando el identificador `id` añadido por JSON Server para las keys de React.

### Demostración del bonus

Se ha realizado la siguiente prueba manual:

1. Registrar una incidencia válida desde el formulario.
2. Abrir `db.json` y modificar su descripción para dejarla vacía.
3. Recargar la aplicación.
4. Comprobar que `safeParse()` detecta la incidencia inválida y que la interfaz muestra el error.
5. Restaurar los datos válidos y comprobar que la consulta vuelve a funcionar.

La prueba confirmó que AulaFix detecta una respuesta corrupta sin intentar representar los datos incorrectos.

El repositorio se entrega con `db.json` limpio. No se incluyen incidencias de prueba.

## Experiencia de usuario y diseño

Se ha elegido una estética inspirada en el software de 2010–2012, con referencias visuales a Windows 7 Aero.

La interfaz utiliza degradados azules, botones brillantes, bordes con relieve, sombras suaves y paneles diferenciados.

El CSS adapta el formulario y las tarjetas de incidencias a pantallas más pequeñas.

Se ha priorizado mantener el formulario legible y comunicar los errores cerca de los campos correspondientes.

La presentación se implementa mediante CSS, sin añadir librerías externas de componentes.

## Uso de IA

**Herramienta:** ChatGPT (OpenAI).

Se ha utilizado ChatGPT como apoyo para estudiar el temario de la Unidad 4, comprender las librerías, revisar código, localizar errores, proponer implementaciones y redactar documentación.

**Trabajo desarrollado y revisado durante el proceso**

La idea de AulaFix se eligió como una solución sencilla a un problema real de las instalaciones universitarias.

Se trabajó progresivamente en la definición del esquema de Zod, las funciones de la API y el componente de listado, revisando errores y comprendiendo conceptos como `.refine()`, `z.object()`, `fetch`, `response.ok` y `useQuery()`.

Las comprobaciones en el navegador y la prueba de datos corruptos se realizaron en el entorno local.

**Qué se delegó a la IA**

ChatGPT proporcionó explicaciones y propuestas de código para:

- Organizar el esquema de validación y corregir los refinamientos.
- Conectar React Hook Form con Zod mediante `zodResolver`.
- Completar el formulario JSX y su lógica de envío.
- Integrar `useMutation` e `invalidateQueries`.
- Configurar `QueryClientProvider`.
- Resolver problemas de dependencias, exportaciones e importaciones.
- Proponer el CSS inspirado en Windows 7 Aero.
- Incorporar la validación de respuestas mediante `safeParse`.
- Redactar y organizar el presente README.

La asistencia no se limitó a sugerencias: parte del código, especialmente el formulario completo y los estilos, fue propuesta directamente por la IA.

**Prompts reales utilizados**

> «Cual es la mejor manera de desarrollar "campoOtro" en schemas.js»

> «Proporciona un css similar al de la mision 3, estilo aero 2010/2011»

> «De que manera puedo usar safeParse para que sea sencillo de explicar»

Se mantuvo como criterio utilizar los conceptos explicados en el temario de la asignatura y evitar funcionalidades innecesarias.

## Autopsia

### 1. Utilizar Zod como única fuente de validación

Se optó por centralizar las reglas en `schemas.js` en lugar de distribuirlas entre los componentes JSX.

Esto facilita reutilizar el esquema para validar tanto los datos introducidos por el usuario como la respuesta de la API.

El refinamiento de `campoOtro` se aplica al objeto completo porque necesita conocer simultáneamente la categoría y el contenido de otro campo.

### 2. Separar las peticiones HTTP de los componentes

Las operaciones GET y POST se encuentran en `api.js`.

Se descartó incluir directamente las llamadas `fetch` dentro de los componentes para separar la comunicación con el servidor de la presentación.

`ListaIncidencias.jsx` se limita a consultar y mostrar los datos, mientras que `Formulario.jsx` gestiona su creación.

### 3. Utilizar TanStack Query en lugar de gestionar manualmente el estado remoto

Se eligió `useQuery` para consultar incidencias y `useMutation` para registrarlas.

La invalidación tras un POST evita tener que mantener manualmente una segunda copia de la lista mediante `useState`.

La desventaja es incorporar una dependencia específica para gestionar datos que, en este proyecto, tienen una estructura sencilla. Sin embargo, permite demostrar el funcionamiento del estado remoto exigido por M4.

### 4. Mantener la API en local

Se eligió JSON Server para disponer de almacenamiento persistente sin desarrollar un backend propio.

Permite trabajar con peticiones REST y un archivo JSON fácilmente inspeccionable.

Se descartó añadir autenticación, base de datos externa o despliegue en la nube para mantener el proyecto dentro del alcance de la misión.

El coste de esta decisión es que la API debe iniciarse por separado y los registros no se comparten entre ordenadores.

### 5. Validar también los datos recibidos

Aunque el formulario comprueba los datos antes de enviarlos, una respuesta de la API puede contener información incorrecta.

`safeParse()` detecta estas situaciones antes de representar las incidencias.

Se decidió rechazar la respuesta completa cuando algún registro no cumple el esquema, en lugar de mostrar parcialmente los registros válidos.

Este enfoque facilita detectar y demostrar los errores, aunque una sola incidencia corrupta impide mostrar el resto.

## Verificación

**Comprobaciones realizadas durante el desarrollo:**

- Arranque de la aplicación React y de la API local.
- Corrección de dependencias e importaciones que impedían cargar la interfaz.
- Funcionamiento de la aplicación con peticiones locales.
- Detección de una incidencia corrupta mediante `safeParse()`.

**Comprobaciones manuales recomendadas antes de entregar:**

1. Enviar el formulario vacío y revisar los mensajes de validación.
2. Probar aulas negativas, superiores a 500 y con valores decimales.
3. Seleccionar «Otro» y comprobar que exige especificar el problema.
4. Introducir un correo ajeno al dominio universitario.
5. Registrar una incidencia válida y verificar que aparece sin recargar manualmente.
6. Confirmar que los datos se guardan en `db.json`.
7. Detener la API y comprobar el mensaje de error.
8. Recuperar la conexión y verificar la carga del listado.
9. Ejecutar `npm run build` y revisar cualquier error de compilación.

No se incluyen pruebas automatizadas propias en esta versión. Las comprobaciones manuales descritas no sustituyen una suite de tests.

## Limitaciones conocidas

- La API solo funciona mientras JSON Server esté ejecutándose en el equipo local.
- No existe autenticación ni separación de usuarios.
- JSON Server no aplica automáticamente las reglas de Zod en el servidor. La validación del formulario es una comprobación del cliente, no una garantía de seguridad.
- El sistema no incluye edición, eliminación ni gestión de estados de las incidencias.
- El esquema del correo exige exactamente un nombre y un apellido separados por un punto; otros formatos legítimos de correo universitario podrían rechazarse.
- La descripción utiliza una longitud mínima de diez caracteres, sin eliminar previamente los espacios de los extremos.
- Una incidencia corrupta provoca el rechazo de la respuesta completa del listado.
- Los datos permanecen en el archivo local `db.json` y no se sincronizan entre dispositivos.

**Proyecto académico desarrollado por Sergio Mendo para M4 · Full Contact Forms — Web Development I, U-tad.**
