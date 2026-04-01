---
name: coder
description: Habilidad principal para escribir y modificar código de manera efectiva y segura.
---

# 💻 Coder Skill

Escribes código que funciona. Cero plantillas. Cero "placeholders". Código funcional, probado y limpio. Siempre responde en el idioma del usuario.

## Cómo Trabajas
Lee primero, luego edita. Comprende el contexto antes de tocar cualquier archivo. Usa las herramientas de búsqueda para encontrar lo que necesitas. Vuelve con soluciones, no con preguntas básicas que podrías haber respondido leyendo el código.

### 🛠 Herramientas y Uso
- `view_file`: Para explorar y entender el código existente.
- `write_to_file`: Para crear nuevos archivos (sin necesidad de crear los directorios manualmente).
- `replace_file_content` / `multi_replace_file_content`: Para realizar ediciones en archivos existentes. Usa `replace_file_content` si es un solo bloque continuo o `multi_replace_file_content` si cambias varias partes en el archivo. **Nunca sobreescribas un archivo entero** si solo vas a cambiar algunas líneas.
- `run_command`: Para correr comandos en PowerShell, como tests de Angular, compilar el proyecto o levantar el nodo.

**Importante:** Las rutas en las herramientas deben ser **rutas absolutas**, y ten en cuenta que estás en un sistema operativo Windows (PowerShell).

## 🏗 Realizando Cambios
1. **Precisión:** Al usar las herramientas de reemplazo, asegúrate de incluir el espaciado e indentación exactos en el contenido objetivo (*TargetContent*).
2. **Lee antes de editar:** Siempre usa `view_file` en el archivo que planeas modificar para ver su estado actual en las líneas correctas.

## ✅ Verificando tu Trabajo
Después de realizar los cambios, debes probarlos o asegurar que compilan sin errores de tipado:
- En frontend (Angular, TypeScript): ejecuta los comandos relevantes que garanticen que tu código no rompe la construcción (`ng build` o similar, si se solicita).
- En backend (Node.js en `price-service/` u otro): revisa logs o pruébalo con un script rápido.
El output / resultado de compilación es la prueba. Si falla, arréglalo antes de reportar la tarea como terminada.

## 🐛 Corrigiendo Bugs
1. Lee los archivos relevantes. Entiende qué hacen.
2. Encuentra la causa raíz del problema analizando logs o rastreando el flujo de datos.
3. Arregla con precisión usando `replace_file_content`.
4. Explícale brevemente al usuario qué cambió y por qué.

## ✨ Añadiendo Funcionalidades y Contexto del Proyecto
- El proyecto usa **Angular** para el frontend (TypeScript, componentes standalone, servicios como `inversion.service`) y **Node.js** en el backend.
- Mantén el estiio del repositorio. No impongas el tuyo propio.
- Mantén el código simple y directo. Resuelve el problema pedido sin sobre-ingeniería innecesaria.

## 📏 Reglas Estrictas
1. **Cero Placeholders.** Nunca uses `// TODO: Implementar aquí` en código final. Cada función o lógica que escribes debe estar completa y en funcionamiento.
2. **Variables de Entorno.** No escribas claves secretas directamente en el código; utiliza el sistema de entornos respectivo (sea `environment.ts` de Angular o `.env` en Node con variables globales).
3. **No asumas el contenido de los archivos.** Tu memoria puede fallarte si hubo cambios. Siempre usa `view_file` para estar 100% seguro de la línea que vas a modificar.