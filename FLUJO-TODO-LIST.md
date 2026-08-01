# Cómo funciona la pantalla de tareas, paso a paso

Explicación sin tecnicismos del flujo Todo List: qué pasa desde que tocas una tecla
hasta que la tarea aparece en pantalla, y cómo viaja la información entre las piezas.

---

## 1. La analogía: un restaurante

Antes de ver código, quédate con esta imagen. La pantalla de tareas funciona como un
restaurante pequeño:

| Pieza real | En el restaurante | Archivo |
|---|---|---|
| `useCreateTask` | **La cocina y la libreta de pedidos.** Guarda la lista real de tareas, es la única que puede cambiarla y la copia al disco del teléfono. | [src/hooks/useCreateTask.ts](src/hooks/useCreateTask.ts) |
| `CreateTaskScreen` | **El mesero jefe.** No cocina; lleva y trae información entre el cliente y la cocina. | [src/screens/CreateTaskScreen.tsx](src/screens/CreateTaskScreen.tsx) |
| `TaskForm` | **La libreta donde el cliente escribe su pedido.** | [src/components/TaskForm.tsx](src/components/TaskForm.tsx) |
| `TaskList` / `TaskCard` | **Los platos servidos en la mesa.** Solo muestran lo que la cocina preparó. | [src/components/TaskList.tsx](src/components/TaskList.tsx) |
| `ConfirmDeleteDialog` | **El "¿seguro que quiere cancelar el pedido?"** | [src/components/ConfirmDeleteDialog.tsx](src/components/ConfirmDeleteDialog.tsx) |

La regla de oro de todo esto: **solo la cocina tiene la lista real.** Nadie más guarda
una copia. Los demás solo muestran lo que la cocina les enseña, y cuando quieren un
cambio, se lo *piden* a la cocina.

---

## 2. Los tres conceptos que necesitas

### Estado (`state`)

Es **la memoria de un componente**. Una caja con un valor dentro.

```ts
const [tasks, setTasks] = useState<Task[]>([]);
//     ↑        ↑                          ↑
//   el valor  la única forma        valor inicial
//   actual    de cambiarlo          (lista vacía)
```

Lo importante: **cuando cambias el estado, la pantalla se vuelve a dibujar sola.**
No existe un "actualizar la pantalla" manual. Cambias el dato → React redibuja.
Es como una hoja de cálculo: cambias una celda y todas las fórmulas que dependen
de ella se recalculan solas.

### Props

Es **lo que un componente le pasa a otro**, hacia abajo. Como un mesero entregando un
plato: el plato baja del que sabe al que muestra.

```tsx
<TaskList tasks={visibleTasks} />
//          ↑          ↑
//     el nombre    el dato que baja
```

`TaskList` recibe las tareas ya listas. No sabe de dónde salieron ni le importa.

### Callback (función que baja para poder subir)

Props baja *datos*. ¿Y cómo sube la información de vuelta? Con una **función**.

El componente de arriba dice: *"toma este botón rojo, apriétalo cuando pase algo y yo
me encargo"*. El de abajo lo aprieta pero no sabe qué hace.

```tsx
<TaskForm onSubmit={submit} />
//           ↑         ↑
//     "cuando el     la función de la cocina.
//      usuario       TaskForm la llama, pero no
//      guarde..."    sabe qué hace por dentro.
```

**Datos bajan por props. Eventos suben por callbacks.** Ese par es el 90% de React.

---

## 3. El recorrido completo: crear una tarea

Escribes "Comprar pan" y presionas **Guardar**. Esto es lo que ocurre, en orden:

### Paso 1 — Escribes en el campo de texto

`TaskForm` tiene su propia memoria pequeña, solo para lo que estás tecleando:

```ts
const [title, setTitle] = useState('');
```

Cada letra que escribes dispara `onChangeText={setTitle}`. Tecleas la "C" → `title`
pasa a ser `"C"` → el campo se redibuja mostrando "C". Tecleas la "o" → `"Co"`. Y así.

> **Por qué el texto vive aquí y no en la cocina:** es un borrador. Mientras escribes,
> a nadie más le importa. Solo se comparte cuando presionas Guardar. Cada dato debe
> vivir en el lugar más bajo posible donde siga siendo útil.

### Paso 2 — Presionas "Guardar"

Se ejecuta [`handleSubmit`](src/components/TaskForm.tsx#L11):

```ts
const handleSubmit = () => {
  if (!title.trim()) return;   // 1. ¿está vacío? no hago nada
  onSubmit(title);             // 2. le paso el título hacia arriba
  setTitle('');                // 3. limpio el campo
};
```

Fíjate en la línea 2: `TaskForm` **no crea la tarea**. Solo grita "¡el usuario quiere
guardar esto!" y entrega el texto. Quién lo recibe y qué hace con él, no es su problema.

Esto es lo que hace a `TaskForm` reutilizable: sirve igual en esta pantalla, en otra, o
en un test, porque no está casado con ninguna lógica en particular.

### Paso 3 — La pantalla conecta los cables

En [CreateTaskScreen.tsx](src/screens/CreateTaskScreen.tsx#L17) están las dos líneas
más importantes de todo el flujo:

```tsx
const { status, tasks, submit, removeTask, toggleTask } = useCreateTask();
...
<TaskForm onSubmit={submit} />
```

La primera línea abre la cocina y recibe cinco cosas: la lista actual, el estado, y
tres funciones para pedir cambios. La segunda conecta el botón Guardar del formulario
directamente con la función `submit` de la cocina.

O sea: **el `onSubmit(title)` del paso 2 es literalmente `submit(title)` de la cocina.**
El mesero solo tendió el cable.

### Paso 4 — La cocina prepara la tarea

Llega a [`submit`](src/hooks/useCreateTask.ts#L9):

```ts
const submit = async (title: string) => {
  const task: Task = {
    id: Date.now().toString(),          // identificador único
    title: title.trim(),                // sin espacios sobrantes
    status: 'pending',                  // nace pendiente
    createdAt: new Date().toISOString(),
  };
  setTasks((prev) => [task, ...prev]);  // la agrego adelante
  setStatus('success');
};
```

El texto plano `"Comprar pan"` se convirtió en un objeto completo con id, estado y fecha.

Sobre `setTasks((prev) => [task, ...prev])`: se lee como *"toma la lista anterior
(`prev`) y hazme una nueva con la tarea nueva primero, seguida de todas las que ya
estaban"*. Los `...` significan "y todo lo demás tal cual".

> **Detalle sutil pero clave:** no modifica la lista vieja, **crea una lista nueva**.
> React detecta el cambio comparando "¿es la misma lista de antes?". Si la modificaras
> por dentro, seguiría siendo la misma caja y React no notaría nada — la pantalla no se
> actualizaría. Por eso siempre se crea una lista nueva.

### Paso 5 — Todo se redibuja solo

`setTasks` cambió la memoria de la cocina. Automáticamente:

1. `CreateTaskScreen` se vuelve a ejecutar, ahora con `tasks` = 1 tarea.
2. Se recalcula el filtro: `filterTasksByStatus(tasks, filter)`.
3. `TaskList` recibe la lista nueva y se dibuja de nuevo.
4. Aparece "Comprar pan" en pantalla y el aviso verde "Tarea creada exitosamente".

Nadie ordenó "actualiza la pantalla". Cambió el dato y la interfaz siguió.

### El viaje en una línea

```
tecleas → TaskForm guarda el borrador
        → presionas Guardar → onSubmit(title) sube el texto
        → submit(title) crea el objeto y actualiza la lista
        → React redibuja → la tarea aparece
```

---

## 4. Marcar una tarea como completada

Mismo patrón, camino más largo porque la tarjeta está más abajo.

**Bajando (datos y funciones):**

```
CreateTaskScreen  →  <TaskList onToggle={toggleTask} />
TaskList          →  <TaskCard onToggle={onToggle} />        (la pasa tal cual)
TaskCard          →  <Pressable onPress={() => onToggle(task.id)} />
```

`TaskList` es un simple **pasamanos**: recibe la función y la entrega sin tocarla.

**Subiendo (el evento):** tocas "○ Pendiente" en una tarjeta. `TaskCard` es el único
que sabe *cuál* tarea eres, así que agrega ese dato al subir: `onToggle(task.id)`.

Llega a [`toggleTask`](src/hooks/useCreateTask.ts#L21):

```ts
setTasks((prev) =>
  prev.map((t) =>
    t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t
  )
);
```

En español: *"recorre todas las tareas; a la que tenga este id, dale la vuelta a su
estado; a las demás, déjalas idénticas"*.

Y otra vez: lista nueva → React redibuja → la tarjeta ahora dice "✓ Completada" en verde.

---

## 5. Eliminar: cuando el estado vive en la pantalla

Este caso es distinto y vale la pena entenderlo. Borrar tiene **dos pasos**: pedirlo y
confirmarlo. Entre uno y otro hay que recordar *qué* tarea se iba a borrar.

Esa memoria intermedia no vive en la cocina, vive en la pantalla:

```ts
const [pendingDelete, setPendingDelete] = useState<string | null>(null);
```

`null` significa "nadie está por borrarse". El recorrido:

1. **Tocas "Eliminar"** en una tarjeta → `onDelete(task.id)`.
2. La pantalla conectó ese callback directo a `setPendingDelete`. Ahora
   `pendingDelete = "1735..."`.
3. `pendingDelete !== null` pasa a ser verdadero → el modal se abre.
   El modal no tiene un botón "abrir": **existe cuando el dato dice que existe.**
4. Con el id busca el título para mostrarlo:
   `tasks.find((t) => t.id === pendingDelete)`.
5. Presionas Cancelar → `setPendingDelete(null)` → el modal desaparece, nada cambió.
   Presionas Eliminar → `removeTask(pendingDelete)` va a la cocina, y después
   `setPendingDelete(null)` cierra el modal.

**Por qué esta memoria no está en la cocina:** "qué tarea tiene el modal abierto" es un
asunto puramente visual y temporal. La cocina guarda *tareas*, no estados de ventanas.
Si mañana quitas el modal y borras directo, la cocina no se entera.

---

## 6. Los filtros: dato derivado

Los botones Todas / Pendientes / Completadas parecen complicados y son la parte más
simple. La pantalla guarda solo cuál botón está activo:

```ts
const [filter, setFilter] = useState<FilterStatus>('all');
```

Y en cada dibujado calcula la lista visible:

```ts
const visibleTasks = filterTasksByStatus(tasks, filter);
```

Lo que **no** hay aquí: ninguna lista de "tareas filtradas" guardada en memoria.
Se recalcula cada vez, a partir de las dos únicas verdades (`tasks` y `filter`).

> **La regla general:** si un dato se puede *calcular* a partir de otro, no lo guardes.
> Dos copias del mismo dato terminan desincronizadas — filtras, borras una tarea, y la
> lista filtrada sigue mostrándola. Lo que se calcula al vuelo nunca se desincroniza.

El cálculo real está en [filterTasks.ts](src/utils/filterTasks.ts) y es una función
suelta, sin React: entra una lista y un filtro, sale una lista. Por eso es la pieza
más fácil de probar de todo el proyecto.

---

## 7. Dónde quedan guardadas las tareas

Las tareas viven en la memoria de la app mientras está abierta, **y además se copian al
disco del teléfono** con AsyncStorage. Cierras la app, la vuelves a abrir y siguen ahí.

AsyncStorage es como una libreta pegada a la nevera: guarda texto simple bajo un nombre.
Aquí el nombre es `'tasks'` y el texto es la lista entera convertida a JSON.

Son dos momentos automáticos, ninguno lo dispara el usuario:

**Al abrir la pantalla — leer la libreta**

```ts
useEffect(() => {
  AsyncStorage.getItem('tasks').then((raw) => {
    if (raw) setTasks(JSON.parse(raw));
  });
}, []);
```

`useEffect` con `[]` al final significa *"haz esto una sola vez, al montar"*. Lee lo
guardado y lo mete en la memoria. Si no hay nada, la lista arranca vacía.

**Cada vez que la lista cambia — reescribir la libreta**

```ts
useEffect(() => {
  if (!loaded.current) return;
  AsyncStorage.setItem('tasks', JSON.stringify(tasks));
}, [tasks]);
```

El `[tasks]` al final significa *"haz esto cada vez que `tasks` cambie"*. Crear, marcar
completada o eliminar → se guarda solo. No hay que acordarse de guardar en cada acción.

> **La línea rara del principio.** `if (!loaded.current) return` evita un accidente: al
> abrir la app la lista arranca vacía por un instante, antes de que termine la lectura.
> Sin esa línea, ese `[]` momentáneo se guardaría encima de las tareas reales y las
> borraría. `loaded` es un interruptor que dice "ya terminé de leer, ahora sí puedes
> guardar". Se usa `useRef` y no `useState` porque cambiarlo no debe redibujar nada.

Ambas escrituras llevan `.catch(() => {})`: si el disco falla, la app sigue funcionando
en memoria en vez de romperse. Guardar es un extra, no un requisito para operar.

Detalle aparte: `submit` es `async` aunque hoy no espere a nadie. Así, el día que las
tareas se manden a un servidor real, cambia solo esa función y ni la pantalla ni el
formulario se enteran.

---

## 8. El mapa completo

```
┌─ CreateTaskScreen ─────────────────────────────────────────┐
│                                                            │
│  useCreateTask()  ← la cocina: tasks, submit,              │
│         │           removeTask, toggleTask                 │
│         │                                                  │
│  pendingDelete    ← memoria propia: qué borrar             │
│  filter           ← memoria propia: qué botón está activo  │
│         │                                                  │
│         ▼                                                  │
│  ┌─────────────┐   onSubmit ─────────────────► submit      │
│  │  TaskForm   │   (sube el texto)                         │
│  └─────────────┘                                           │
│                                                            │
│  ┌─────────────┐   tasks ◄──── filterTasksByStatus(...)    │
│  │  TaskList   │   onToggle ─────────────────► toggleTask  │
│  │  └TaskCard  │   onDelete ─────────────────► setPending  │
│  └─────────────┘                                           │
│                                                            │
│  ┌─────────────────────┐  visible ◄── pendingDelete!==null │
│  │ ConfirmDeleteDialog │  onConfirm ────────► removeTask   │
│  └─────────────────────┘                                   │
└────────────────────────────────────────────────────────────┘
```

**Las cuatro ideas que resumen todo:**

1. **Los datos bajan, los eventos suben.** Props hacia abajo, callbacks hacia arriba.
2. **Un solo dueño por dato.** Las tareas viven en un lugar; los demás las muestran.
3. **Cambias el dato, la pantalla se actualiza sola.** Nunca al revés.
4. **Lo que se puede calcular, no se guarda.** Los filtros son el ejemplo.

---

## 9. Dónde mirar cada cosa

| Quieres entender... | Abre |
|---|---|
| Dónde viven las tareas, cómo cambian y cómo se guardan | [src/hooks/useCreateTask.ts](src/hooks/useCreateTask.ts) |
| Cómo se conecta todo | [src/screens/CreateTaskScreen.tsx](src/screens/CreateTaskScreen.tsx) |
| El formulario | [src/components/TaskForm.tsx](src/components/TaskForm.tsx) |
| Cómo se dibuja cada tarea | [src/components/TaskCard.tsx](src/components/TaskCard.tsx) |
| El filtrado | [src/utils/filterTasks.ts](src/utils/filterTasks.ts) |
| Que el flujo completo funciona | [\_\_tests\_\_/integration/CreateTaskScreen.test.tsx](__tests__/integration/CreateTaskScreen.test.tsx) |

El test de integración es la mejor prueba de que la explicación es cierta: escribe en el
campo, presiona Guardar y verifica que la tarea aparezca — exactamente el recorrido de
la sección 3.
