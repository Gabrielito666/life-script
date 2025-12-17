falta:

- help()
- install.sh
- update.sh
- uninstall.sh
- archive en routes
- estandarización de las variables de entorno

# Life-Script

la idea tras life-script es gestionar un directorio de archivos de organización vital y mental.

El directorio live consta de archivos principales y subdirectorios utilitarios:

- someday.md
- projects.md
- recurring.txt
- calendar.txt
- todo.md
- thoughts-index.md
- thoughts/

la idea de lifescript es poder analizar la estructura de archivos, normalizar estructura y algunas funciones utilitarias

```
life-script archive-calendar # archivar dias antiguos
life-script add-calendar-days 10 # añadir un año al calendario
life-script diagnostic # revisar si alguna parte del directorio tiene algun error de sintaxis
life-script make-thought # crea un archivo de reflexión para indexarlo segun fecha
life-script push-recurring # añade actividades recurrentes a calendar basandose en el archivo recurring
```

## calendar.md

el calendario tiene estructura de bloques simples

```
22-11-2025 Sabado
+ hacer una cosa sin horario
+ [8:45 p.m.] Hacer otra cosa pero en un horario espesífico
+ otra cosa sin horario

23-11-2025 Domingo
```

La idea es que puedas archivar los días pasados con `life-script archive-calendar`... en el caso de estar vacíos u estar borrados no se archivan

con `life-script make-days 365` puedes crear un año de días vaciós desde el día actual hasta un año despues

## recurring

En este archivo puedes estableces actividades recurrentes para automatizar en el calendario

```
@yearly 22-11
+ evento anual
+ [8:56 p.m.] Evento anual con horario

@monthly 22
+ evento mensual

@weekly wensday
+ evento semanal

@daily
+ evento diario
```

Esto añadira eventos al calendario segun corresponda al ejecutar `life-script push-recurring`.

hay algunos tipos de dato que se pueden usar junto a los @tags

| Tipo | ejemplo | default |
| dia  | 22      | 1       |
| mes  | 11      | 1       |
|nombre| martes  | lunes   |


Junto a @yearly se puede poner [dia]-[mes].
Junto a @monthly se puede poner el numero del día (ojo que los ultimos días del mes a veces no existen).
Junto a @weekly se puede poner el nombre del día.
junto a @daily no va nada
	
## thoughts
	
Es un directorio con archivos.md y un indice puesto en thoughts-index.md

Un archivo de reflexión también tiene un formato especial.

```
### 22-11-2025 11:40
# Titulo

Esta reflexión tiene que ver con bla bla bla

## Resumen

finalmente me quedo con a, b, c
```

una vez creado el archivo `life-script index-thoughts`... de esta forma se indexará con el titulo fecha y resumen en thoughts-index.md (este archivo no debiese tocarlo nadie, solo life-script. de todas formas si alguien lo tocara la proxima vez que se llame a index-thoughts se reharía normalmente).

es imporante respetar el formato de:
```
### Fecha (generado automáticamente)
# Título (echo por tí)
parrafos de reflexión
## Resumen
parrafo unico de resumen
```

Los parrafos de reflexión pueden tener dentro subtitulos ## en adelante (a mas pequeños) pero no se pueden llamar Resumen

El parrafo de resumen debe ser único y de menos de x caracteres para que no se eche a perder el índice.

## el resto
	
los demás son archivos libres y de uso peronal para ordenar ideas y mantener proyectos en primera fila.
