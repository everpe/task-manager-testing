# Guía completa: Maestro E2E en Expo

Instalación de [Maestro](https://docs.maestro.dev/) por sistema operativo + cómo
dejar este proyecto Expo (`task-manager`) listo para correr flujos end-to-end.

Los flujos ya viven en [`.maestro/`](.maestro/). Esta guía es cómo instalar la
herramienta y ejecutarlos.

---

## 0. Requisito común a todos los SO: Java 17+

Maestro corre sobre la JVM. Necesitas **JDK 17 o superior** en cualquier SO.

```bash
java -version   # debe reportar 17 o mayor
```

Si no lo tienes:
- **macOS:** `brew install openjdk@17`
- **Linux (Debian/Ubuntu):** `sudo apt install openjdk-17-jdk`
- **Windows:** instala [Temurin 17](https://adoptium.net/) y define `JAVA_HOME`.

---

## 1. Instalación por sistema operativo

### macOS

Opción A — script oficial (recomendada):
```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
```

Opción B — Homebrew:
```bash
brew tap mobile-dev-inc/tap
brew install mobile-dev-inc/tap/maestro
```

El script instala en `~/.maestro/bin`. Si `maestro` no se encuentra, agrega esto
a tu `~/.zshrc`:
```bash
export PATH="$PATH":"$HOME/.maestro/bin"
```

Para probar en **iOS necesitas macOS** con **Xcode** + Command Line Tools:
```bash
xcode-select --install
```

### Linux

```bash
curl -fsSL "https://get.maestro.mobile.dev" | bash
export PATH="$PATH":"$HOME/.maestro/bin"   # agrégalo a ~/.bashrc
```

> En Linux **solo puedes testear Android** (iOS requiere macOS/Xcode). Necesitas
> el Android SDK + un emulador o dispositivo por `adb`.

### Windows (nativo — recomendado para Windows)

Maestro **no se instala con el script `curl` en Windows nativo**. Se instala manual:

1. Descarga `maestro.zip` de la
   [última release](https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro.zip).
2. Descomprime en una ruta estable, p. ej. `C:\maestro`.
3. Agrega `C:\maestro\bin` al PATH (PowerShell):
   ```powershell
   setx PATH "%PATH%;C:\maestro\bin"
   ```
4. Cierra y reabre la terminal.

> En Windows **solo puedes testear Android** (iOS requiere macOS).

### Windows con WSL (no recomendado)

Funciona con el script `curl`, pero configurar el emulador Android desde WSL es
frágil; Maestro recomienda Windows nativo. Si aun así lo quieres, en `~/.bashrc`:
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
export PATH=$PATH:$HOME/.maestro/bin
```
y luego el `curl -fsSL "https://get.maestro.mobile.dev" | bash`.

### Verificar (todos los SO)

```bash
maestro --help
maestro -v
```

| SO             | Instalación       | Android | iOS |
|----------------|-------------------|:-------:|:---:|
| macOS          | curl / brew       | ✅      | ✅  |
| Linux          | curl              | ✅      | ❌  |
| Windows nativo | zip + PATH        | ✅      | ❌  |
| Windows WSL    | curl (frágil)     | ⚠️      | ❌  |

---

## 2. Preparar el proyecto Expo

### Necesitas un *build* real, no Expo Go

Maestro maneja el binario instalado por su `appId`. Expo Go se instala con un
`appId` que no es el tuyo y no expone tus `testID` de forma fiable. Usa un
**development/debug build** propio. Este repo ya tiene las carpetas `ios/` y
`android/` (prebuild), así que se compila localmente **sin EAS**.

### El `appId` es tu bundle identifier / package

En [`app.json`](app.json) este proyecto declara:
- iOS `bundleIdentifier`: `com.taskmanager.app`
- Android `package`: `com.taskmanager.app`

Por eso todos los flows empiezan con:
```yaml
appId: com.taskmanager.app
```

### `testID` en el componente → `id:` en el flow

Maestro localiza elementos por `id:` usando el prop `testID` de React Native:
```tsx
<TextInput testID="input-titulo" ... />
```
```yaml
- tapOn:
    id: "input-titulo"
- inputText: "Mi primera tarea"
```
También puedes seleccionar por texto visible: `tapOn: "Guardar"`.

---

## 3. Compilar e instalar la app en el dispositivo

Compila una vez (instala el build en el simulador/emulador que esté corriendo):

```bash
# iOS (solo macOS): arranca un simulador y compila+instala
npx expo run:ios

# Android: arranca un emulador (o conecta un dispositivo por adb) y compila+instala
npx expo run:android
```

Maestro **autodetecta** el dispositivo en ejecución; no hay servidor que iniciar.
Si necesitas que Maestro arranque uno por ti:
```bash
maestro start-device --platform android   # o ios
```

---

## 4. Ejecutar los flujos E2E

Con la app ya instalada y el dispositivo corriendo:

```bash
# un flujo
maestro test .maestro/crear_tarea.yaml

# toda la carpeta
maestro test .maestro/
```

Herramienta interactiva para inspeccionar la UI y construir flows:
```bash
maestro studio
```

Truco útil ya usado en este repo: reiniciar el estado de la app (limpia
AsyncStorage) al abrir, para que un flow no dependa de corridas previas:
```yaml
- launchApp:
    clearState: true
```

---

## 5. Anatomía de un flow (ejemplos reales del repo)

Un flow es YAML: cabecera con `appId`, luego comandos de arriba a abajo.

```yaml
appId: com.taskmanager.app
---
- launchApp
- assertVisible: "Task Manager"
- tapOn: "Flujo Todo List"
- tapOn:
    id: "input-titulo"
- inputText: "Mi primera tarea de prueba"
- tapOn: "Guardar"
- assertVisible: "Tarea creada exitosamente"
```

Comandos que verás en [`.maestro/`](.maestro/):

| Comando                | Para qué sirve                                  |
|------------------------|-------------------------------------------------|
| `launchApp`            | Abre la app (`clearState: true` la reinicia)    |
| `tapOn` / `id:`        | Toca por texto o por `testID`                   |
| `inputText`            | Escribe en el campo enfocado                    |
| `eraseText`            | Borra el contenido del campo                    |
| `scrollUntilVisible`   | Hace scroll hasta que aparece un elemento       |
| `assertVisible`        | Falla si el texto/elemento no está visible      |
| `assertNotVisible`     | Falla si el texto/elemento **sí** está visible  |

Los flows actuales cubren: crear tarea, crear y eliminar, flujo completo, flujo
transaccional de pago y validaciones de formato del checkout.

---

## Resumen rápido (macOS, de cero a verde)

```bash
brew install openjdk@17
curl -fsSL "https://get.maestro.mobile.dev" | bash
export PATH="$PATH":"$HOME/.maestro/bin"
npx expo run:ios          # o run:android
maestro test .maestro/
```

---

## Fuentes

- [Instalar Maestro CLI (macOS/Linux/Windows)](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli)
- [Maestro Docs](https://docs.maestro.dev/)
- [Maestro en Expo dev builds (blog oficial)](https://maestro.dev/blog/running-maestro-ui-tests-in-an-expo-development-builds)
- [E2E con Maestro en EAS Workflows — Expo Docs](https://docs.expo.dev/eas/workflows/examples/e2e-tests/)
- [E2E en Expo con Maestro sin EAS (Medium)](https://medium.com/@ibrhajjaj/how-to-run-end-to-end-e2e-testing-in-an-expo-react-native-app-using-maestro-without-relying-on-c9bf2051dfb4)
