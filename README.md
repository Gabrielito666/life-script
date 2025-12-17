# LifeScript

**LifeScript** is a **CLI-based scripting system** designed to help you organize your life from the terminal, using a central `~/life` folder.  
Inside this directory you can keep different personal control files.  
At the moment, the project focuses on two main files, although nothing prevents you from adding your own.

---

## Installation

For now, LifeScript is available only for **Debian and Debian-based distributions**.

To install it, run:

```bash
curl -L -o /tmp/life-script.deb https://github.com/Gabrielito666/life-script/releases/download/v1.0.0/life-script_1.0.0_all.deb && sudo apt install /tmp/life-script.deb
```

This will download the `.deb` package and install it using `apt`.

> ⚠️ **Important requirement**  
> LifeScript requires **Node.js** to be installed, version **23 or higher**.

---

## General usage

All the workflow happens inside the: `~/life`


directory.
There you will find (or create) the main files:

- `calendar.txt`
- `recurring.txt`

---

## calendar.txt

This file contains your days organized in chronological order.

### Basic format

```calendar.txt
16-12-2025 tuesday
+ do something without a specific time
+ [8:45 p.m.] do something else at a specific time
+ another task without a time

17-12-2025 wednesday
+ bla bla bla
```

### Important rules

- Each day starts with a **header** in the format: `DD-MM-YYYY day_name`

- Task lines must start with a `+` sign.
- Days must be in **chronological order**.
- Skips to the future are allowed, but **going back in time is not**.

You can edit this file manually, but LifeScript provides commands to make the process easier.

---

### Adding days automatically

To add new days to the calendar:

```bash
life-script add-calendar-days 10
```

This command:
- Adds 10 consecutive new days
- Starts from the last day already present in the calendar
- Or from today, if the calendar is empty

Only the **day headers** are added.  
You are responsible for writing the events — after all, it’s *your* calendar.

---

### Archiving past days

To keep your daily workflow clean:

```bash
life-script archive-calendar
```

This command:
- Detects days that are already in the past
- Removes them from `calendar.txt`
- Stores them in a hidden file called `.calendar-archive.txt`

This way you keep your history without cluttering your current workflow.

---

## recurring.txt

This file is used to define **recurring tasks** that should be applied to the calendar.

### Format example

```recurring.txt
@yearly 18-09
+ buy empanadas
+ celebrate national holidays

@monthly 20
+ pay taxes

@weekly tuesday
+ take out the trash
+ go to chess class

@daily
+ breathe
+ eat
+ something you do every day
```

### How it works

- Blocks start with `@`, indicating the recurrence type:
- `@yearly`
- `@monthly`
- `@weekly`
- `@daily`
- Actions are defined with `+`, just like in `calendar.txt`.

---

### Applying recurring tasks to the calendar

To automatically insert these tasks into the corresponding days:

```bash
life-script push-recurring
```

This command:
- Iterates over upcoming days in the calendar
- Inserts recurring tasks where appropriate
- Avoids duplicating actions that already exist

---

## Diagnostics

If you suspect syntax errors in `calendar.txt` or `recurring.txt`, you can run:

```bash
life-script diagnostic
```

This will analyze both files and report any issues directly in the terminal.

---

## Next steps

In the future, LifeScript may include additional files and commands for:

- Food tracking
- Personal finances
- Daily reflections
- Other personal organization systems

The goal is to keep it **simple, text-based, and centered around a terminal-driven daily workflow**.

