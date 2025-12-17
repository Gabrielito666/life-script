# LifeScript

**LifeScript** es un sistema de scripts **CLI** diseñado para ayudarte a organizar tu vida desde la terminal, utilizando una carpeta central `~/life`.  
Dentro de esta carpeta puedes mantener distintos archivos de control personal.  
Actualmente el proyecto se centra en dos archivos principales, aunque nada impide que agregues los que quieras.

---

## Instalación

Por ahora, LifeScript está disponible únicamente para **Debian y distribuciones derivadas**.

Para instalarlo, ejecuta el siguiente comando:

```bash
curl -L -o /tmp/life-script.deb https://github.com/Gabrielito666/life-script/releases/download/v1.0.0/life-script_1.0.0_all.deb && sudo apt install /tmp/life-script.deb
```

Esto descargará el paquete `.deb` y lo instalará usando `apt`.

> ⚠️ **Requisito importante**  
> LifeScript requiere tener **Node.js instalado**, en una versión **igual o superior a la 23**.

---

## Uso general

Todo el flujo de trabajo ocurre dentro de la carpeta: `~/life`.


Ahí encontrarás (o crearás) los archivos principales:

- calendar.txt
- recurring.txt

---

## calendar.txt

Este archivo contiene tus días organizados de forma cronológica.

### Formato básico

```calendar.txt
16-12-2025 tuesday
+ hacer una cosa sin horario
+ [8:45 p.m.] hacer otra cosa con horario específico
+ otra cosa sin horario

17-12-2025 wednesday
+ bla bla bla
```

### Reglas importantes

- Cada día comienza con una **cabecera** en el formato: `DD-MM-YYYY nombre_del_día`

- Las tareas deben comenzar con un signo `+`.
- Los días deben estar en **orden cronológico**.
- Se permiten saltos hacia el futuro, pero **no se permiten fechas anteriores** a las ya registradas.

Puedes editar este archivo manualmente, pero LifeScript ofrece comandos para facilitar el proceso.

---

### Añadir días automáticamente

Para agregar nuevos días al calendario:

```bash
life-script add-calendar-days 10
```

Este comando:
- Añade 10 nuevos días consecutivos
- Parte desde el último día existente en el calendario
- O desde el día actual, si el calendario está vacío

Solo se agregan las **cabeceras de los días**.  
Las tareas las defines tú, porque al final es *tu* calendario.

---

### Archivar días pasados

Para mantener limpio tu flujo diario:

```bash
life-script archive-calendar
```

Este comando:
- Detecta los días ya pasados
- Los elimina del `calendar.txt`
- Los guarda en un archivo oculto llamado `.calendar-archive.txt`

Así conservas el historial sin que estorbe en el día a día.

---

## recurring.txt

Este archivo sirve para definir **tareas recurrentes** que se repiten en el calendario.

### Ejemplo de formato

```recurring.txt
@yearly 18-09
+ comprar empanadas
+ celebrar fiestas patrias

@monthly 20
+ pagar impuestos

@weekly tuesday
+ sacar la basura
+ ir a clases de ajedrez

@daily
+ respirar
+ comer
+ algo que hagas todos los días
```

### Cómo funciona

- Los bloques comienzan con `@` indicando la frecuencia:
- `@yearly`
- `@monthly`
- `@weekly`
- `@daily`
- Luego se definen las acciones con `+`, igual que en `calendar.txt`.

---

### Aplicar tareas recurrentes al calendario

Para insertar automáticamente estas tareas en los días correspondientes del calendario:

```bash
life-script push-recurring
```

Este comando:
- Recorre los días futuros del calendario
- Añade las tareas recurrentes
- Evita duplicar acciones ya existentes

---

## Diagnóstico de errores

Si sospechas que hay errores de sintaxis en `calendar.txt` o `recurring.txt`, puedes ejecutar:

```bash
life-script diagnostic
```

Esto analizará ambos archivos y mostrará en consola si existe algún problema y dónde se encuentra.

---

## Próximos pasos

En el futuro, LifeScript podría incorporar nuevos archivos y comandos para:

- Control de alimentación
- Finanzas personales
- Reflexiones y registro diario
- Otros sistemas de organización personal

La idea es mantenerlo **simple, textual y centrado en el flujo diario desde la terminal**.

