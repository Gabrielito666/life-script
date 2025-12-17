# LifeScript

Es un sistema de scripts cli para manejar una carpeta `~/life` dentro de la cual organizar la vida. A dia de hoy solo hay soporte para 2 archivos principales (lo que no significa que no puedas ponerle los archivos que quieras).

## Instalación

para instalar life-script debes ejecutar:

```bash
curl
```

Esto instalará el archivo en `~/.life-script` y configurará un alias en `~/.bashrc`. Para desinstalar solo debes ejecutar:
```bash
rm -rf ~/.life-script
```
y luego eliminar el alias en `~.bashrc`.

En el caso de actualizar solo desinstala y vuelve a instalar.

## uso

Dentro de tu carpeta `~/life` ubicarás tus archivos de utilidad. Los princpales por ahora son:

- calendar.txt
- recurring.txt

### calendar

dentro de calendar.txt tendrás dias ordenados. El formato es:

```calendar.txt
16-12-2025 tuesday
+ hacer una cosa sin horario
+ [8:45 p.m.] Hacer otra cosa pero en un horario espesífico
+ otra cosa sin horario

17-12-2025 wensday
+ bla bla bla
```

las reglas son que la cabecera de cada día debe tener el formato indicado y las lineas del cuerpo un signo + al comenzar. Además solo se permiten dias cronoglógicos. Se adminten saltos pero no saltos al pasado, solo al futuro.

Los días se pueden añadir a mano, pero la forma más sencilla es usando el comando:

```bash
life-script add-calendar-days 10
```

En este ejemplo añadí 10 días. Puedes pasar el numero que quieras. Esto añadirá 10 nuevos días desde el último dia en el calendario o desde hoy.

Esto solo añadirá las cabeceras de los días. Los eventos debes ponerlos tu, mal que mal es tu calendario.

Para archivar los días pasados hay un script muy simple:

```bash
life-script archive-calendar
```

esto tomará todos los días ya pasados, los quitará y los llevará a un archivo oculto llamado `.calendar-archive.txt`, esto guarda tus días pero los quita de tu flujo diario.

### recurring

recurring.txt es un archivo para programar tareas recurrentes en el calendario.

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

Como ves es bastánte intuitivo. Los tags comienzan con @ indicando tareas anuales, mensules, diarias y semanales.
Luego con signo + tal cual las acciones de calendar.

Para añadir las tareas recurrentes a los días proximos que figuren en tu calendario debes ejecutar:

```bash
life-script push-recurring
```

Esto rellenará los días que no incluyan dichas acciones segun lo que hayas indicado.

### diagnostic

hay un comando para diagnosticar posibles errores de sintaxis en calendar.txt o recurring.txt

```bash
life-script diagnostic
```

Esto te mostrará en consola si hay probelams o no.

## proximos pasos

En el futuro quiero añadir más funcionalidades para archivos de control de la alimentación o finanzas y reflexiones.
