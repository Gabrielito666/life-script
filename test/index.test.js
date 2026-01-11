const { describe, test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const LifeScriptError = require("../lib/life-script-error");

const writeCalendar = (str) => fs.writeFileSync(ROUTES.absolute_paths["calendar.txt"], str, "utf-8");
const removeCalendar = () => fs.unlinkSync(ROUTES.absolute_paths["calendar.txt"]);

const writeRecurring = (str) => fs.writeFileSync(ROUTES.absolute_paths["recurring.txt"], str, "utf-8");
const removeRecurring = () => fs.unlinkSync(ROUTES.absolute_paths["recurring.txt"]);

const removeArchive = () => fs.unlinkSync(ROUTES.absolute_paths[".calendar-archive.txt"]);

const parseBlocks = require("../lib/parse-blocks");
const parseCalendar = require("../lib/parse-calendar");
const parseRecurring = require("../lib/parse-recurring");

const AddCalendarDaysCommand = require("../lib/commands/add-calendar-days");
const ArchiveCalendarCommand = require("../lib/commands/archive-calendar");
const PushRecurringCommand = require("../lib/commands/push-recurring");

const ROUTES = require("../lib/routes");

const randomBlocks = `MI HEADER
+ uno
+ dos

MI SEGUNDO HEADER
+ tres
+ cuatro`;

const invalidBlocks = 
`+ MI BLOQUE INVALIDO

porque parte con un +`;
const randomBlocksParsed = [
	{
		header: { content: "MI HEADER", lineNumber: 1},
		body: [
			{ content: "+ uno", lineNumber: 2 },
			{ content: "+ dos", lineNumber: 3 },
		]
	},
	{
		header: { content: "MI SEGUNDO HEADER", lineNumber: 5},
		body: [
			{ content: "+ tres", lineNumber: 6 },
			{ content: "+ cuatro", lineNumber: 7 },
		]
	}
];

test("all tests", { concurrency : 1 }, async(t) =>
{
	// PARSE BLOCK TEST
	await t.test("Parse a random block", ()=>
	{
		//from string
		const blocks = parseBlocks.fromString(randomBlocks);
		
		assert.deepStrictEqual(blocks, randomBlocksParsed);

		//from filename
		writeCalendar(randomBlocks);
		const blocks2 = parseBlocks.fromFilename("calendar.txt");

		assert.deepStrictEqual(blocks2, randomBlocksParsed);
		removeCalendar()
	});
	await t.test("parse an invalid block", () =>
	{
		//from string
		const blocks = parseBlocks.fromString(invalidBlocks);
		assert.ok(blocks instanceof LifeScriptError);

		//from filename
		writeCalendar(invalidBlocks);
		const blocks2 = parseBlocks.fromFilename("calendar.txt");
		
		assert.ok(blocks2 instanceof LifeScriptError);
		removeCalendar();
	});


	//PARSE CALENDAR TESTS
	await t.test("Parse a valid calendar", () => 
	{
		writeCalendar(`
			11-01-2026 sunday
			+ actividad 1
			+ actividad 2

			12-01-2026 monday
			+ actividad 3
		`);
		const calendar = parseCalendar();
		assert.deepStrictEqual(calendar, [
			{
				header: { content: "11-01-2026 sunday", lineNumber: 2 },
				date: new Date(2026, 0, 11),
				body: [
					{ content: "+ actividad 1",lineNumber: 3 },
					{ content: "+ actividad 2",lineNumber: 4 },
				]
			},
			{
				header: { content: "12-01-2026 monday", lineNumber: 6 },
				date: new Date(2026, 0, 12),
				body: [
					{ content: "+ actividad 3",lineNumber: 7 },
				]
			}
		]);
		removeCalendar();
	});

	await t.test("Parse ivalid calendar", () =>
	{
		writeCalendar(`
			11-01-2026 saturday
			+ 1
			+ 2
			+ 3
		`);

		assert.ok(parseCalendar() instanceof LifeScriptError);
		removeCalendar();

		writeCalendar(`
			11-01-2026 sunday
			+ 1
			+ 2
			+ 3

			10-01-2026 saturday
			+ 4
			+ 5
		`);
		assert.ok(parseCalendar() instanceof LifeScriptError);
		removeCalendar();
	});

	await t.test("parse recurring", () =>
	{
		writeRecurring(`
			@daily
			+ a
			+ b

			@weekly monday
			+ a
			+ b

			@monthly 1
			+ a

			@yearly 1-12
			+ a
			+ b

			@unique 1-12-2026
			+ a

			@interval 1-12-2026 2
			+ a
			+ b

			@comment este es el primer comentario
			+ tiene sus 
			+ lineas extra

			@comment este es otro comentario

			@comment este es el ultimo
			+ jajaja
		`);
		const result = parseRecurring();
		assert.ok(Array.isArray(result));
		for(const r of result)
		{
			assert.ok(Array.isArray(r.body));
			assert.ok(typeof r.header.content === "string");
			assert.ok(typeof r.header.lineNumber === "number");
			assert.ok(typeof r.checker === "function");
		}

		removeRecurring();
	});
	await t.test("parse invalid recurring", () =>
	{
		writeRecurring(`@daily 1\n+ 1`);
		assert.ok(parseRecurring() instanceof LifeScriptError);
		
		writeRecurring(`@weekly 1 \n+ 1`);
		assert.ok(parseRecurring() instanceof LifeScriptError);

		writeRecurring(`@weekly domingo\n+ 1`);
		assert.ok(parseRecurring() instanceof LifeScriptError);
	
		writeRecurring(`@monthly 40\n+ 1`);
		assert.ok(parseRecurring() instanceof LifeScriptError);

		writeRecurring(`@monthly 10-10 1\n+ 1`);
		assert.ok(parseRecurring() instanceof LifeScriptError);

		writeRecurring(`@yearly 1\n+ 1`);
		assert.ok(parseRecurring() instanceof LifeScriptError);

		writeRecurring(`@unique el domingo\n+ 1`);
		assert.ok(parseRecurring() instanceof LifeScriptError);

		writeRecurring(`@unique 1/12\n+ 1`);
		assert.ok(parseRecurring() instanceof LifeScriptError);

		writeRecurring(`@inteval 1 1\n+ 1`);
		assert.ok(parseRecurring() instanceof LifeScriptError);

		writeRecurring(`@interval 10-10 2 1\n+ 1`);
		assert.ok(parseRecurring() instanceof LifeScriptError);

		writeRecurring(`@interval 10-10-2025 dia-por-medio 1\n+ 1`);
		assert.ok(parseRecurring() instanceof LifeScriptError);

		writeRecurring(`@mi-custom-tag 1\n+ 1`);
		assert.ok(parseRecurring() instanceof LifeScriptError);

		removeRecurring();
	});
	// TEST COMMANDS
	//ADD_CALENDAR_DAYS
	await t.test("add-calendar-days test", async() =>
	{
		writeCalendar("");
		const addCalendarDays = new AddCalendarDaysCommand();

		await addCalendarDays.run(2);

		const calendar = parseCalendar();
		assert.ok(Array.isArray(calendar));
		assert.ok(calendar.length === 2);
		assert.ok(calendar[0].date instanceof Date);
		assert.ok(calendar[1].date instanceof Date);

		writeCalendar("");
		process.argv = ["node", "index.js", "add-calendar-days", "2"];
		await addCalendarDays.cli();
	
		const calendar2 = parseCalendar();

		assert.ok(Array.isArray(calendar));
		assert.ok(calendar2.length === 2);
		assert.ok(calendar2[0].date instanceof Date);
		assert.ok(calendar2[1].date instanceof Date);

		process.argv = ["node", "index.js"];
		removeCalendar();
	});
	// ARCHIVE_CALENDAR
	await t.test("archive-calendar test", async() =>
	{
		const archiveCalendar = new ArchiveCalendarCommand();

		const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

		function formatBlock(date) {
			const dd = String(date.getDate()).padStart(2, "0");
			const mm = String(date.getMonth() + 1).padStart(2, "0");
			const yyyy = date.getFullYear();
			const dayName = days[date.getDay()];

			return `${dd}-${mm}-${yyyy} ${dayName}\n+ a\n+ b`;
		}

		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);

		const beforeYesterday = new Date(today);
		beforeYesterday.setDate(today.getDate() - 2);

		const result = [
		  formatBlock(beforeYesterday),
		  "",
		  formatBlock(yesterday),
		  "",
		  formatBlock(today)
		].join("\n");
		

		writeCalendar(result);
		await archiveCalendar.run();
		
		const calendar = parseCalendar();
		assert.ok(Array.isArray(calendar))
		assert.ok(calendar.length === 1);
		assert.ok(calendar[0].header.content === formatBlock(today).split("\n")[0]);

		const archive = fs.readFileSync(ROUTES.absolute_paths[".calendar-archive.txt"], "utf-8");
	
		assert.equal(archive, [formatBlock(beforeYesterday), "", formatBlock(yesterday)].join("\n"));
		
		removeArchive();
		writeCalendar(result);
		await archiveCalendar.cli();

		const calendar2 = parseCalendar();
		assert.ok(Array.isArray(calendar))
		assert.ok(calendar2.length === 1);
		assert.ok(calendar2[0].header.content === formatBlock(today).split("\n")[0]);

		const archive2 = fs.readFileSync(ROUTES.absolute_paths[".calendar-archive.txt"], "utf-8");
		
		assert.equal(archive2, [formatBlock(beforeYesterday), "", formatBlock(yesterday)].join("\n"));

		removeArchive();
	});
	
	//PUSH RECURRING TESTS
	await t.test("push recurring daily tests", async() =>
	{
		removeCalendar();
		writeCalendar("");	
		const addCalndarDays = new AddCalendarDaysCommand();
		const pushRecurring = new PushRecurringCommand();

		await addCalndarDays.run(10);
		
		writeRecurring(`@daily\n+ tarea 1`);
		await pushRecurring.run();

		const result = parseCalendar();

		assert.ok(Array.isArray(result));
		for(const r of result)
		{
			assert.equal(r.body[0].content, "+ tarea 1");
			assert.equal(r.body.length, 1);
		}

		writeCalendar("");
		writeRecurring(`@daily\n+ tarea 1`);
	
		await pushRecurring.cli();

		const result2 = parseCalendar();

		assert.ok(Array.isArray(result2));
		for(const r of result2)
		{
			assert.equal(r.body[0].content, "+ tarea 1");
			assert.equal(r.body.length, 1);
		}		
	});

	await t.test("push recurring weekly monday tests", async() =>
	{
		removeCalendar();
		writeCalendar("");
		const addCalendarDays = new AddCalendarDaysCommand();
		const pushRecurring = new PushRecurringCommand();

		await addCalendarDays.run(30);

		writeRecurring(`@weekly monday\n+ tarea semanal lunes`);
		await pushRecurring.run();

		const result = parseCalendar();
		assert.ok(Array.isArray(result));
		
		let mondayCount = 0;
		for(const r of result)
		{
			const dayOfWeek = r.date.getDay();
			if(r.body.length > 0)
			{
				assert.equal(dayOfWeek, 1);
				assert.equal(r.body[0].content, "+ tarea semanal lunes");
				mondayCount++;
			}
		}
		
		assert.ok(mondayCount > 0);

		writeCalendar("");
		await addCalendarDays.run(30);
		writeRecurring(`@weekly monday\n+ tarea semanal lunes`);

		await pushRecurring.cli();

		const result2 = parseCalendar();

		assert.ok(Array.isArray(result2));
		let mondayCount2 = 0;
		for(const r of result2)
		{
			const dayOfWeek = r.date.getDay();
			if(r.body.length > 0)
			{
				assert.equal(dayOfWeek, 1);
				assert.equal(r.body[0].content, "+ tarea semanal lunes");
				mondayCount2++;
			}
		}
		
		assert.ok(mondayCount2 > 0);
	});

	await t.test("push recurring monthly day 02 tests", async() =>
	{
		removeCalendar();
		writeCalendar("");
		const addCalendarDays = new AddCalendarDaysCommand();
		const pushRecurring = new PushRecurringCommand();

		await addCalendarDays.run(90);

		writeRecurring(`@monthly 02\n+ tarea mensual dia 2`);
		await pushRecurring.run();

		const result = parseCalendar();

		assert.ok(Array.isArray(result));
		
		let day02Count = 0;
		for(const r of result)
		{
			const dayOfMonth = r.date.getDate();
			if(r.body.length > 0)
			{
				assert.equal(dayOfMonth, 2);
				assert.equal(r.body[0].content, "+ tarea mensual dia 2");
				day02Count++;
			}
		}
		
		assert.ok(day02Count > 0);

		writeCalendar("");
		await addCalendarDays.run(90);

		writeRecurring(`@monthly 02\n+ tarea mensual dia 2`);

		await pushRecurring.cli();

		const result2 = parseCalendar();

		assert.ok(Array.isArray(result2));
		
		let day02Count2 = 0;
		for(const r of result2)
		{
			const dayOfMonth = r.date.getDate();
			if(r.body.length > 0)
			{
				assert.equal(dayOfMonth, 2);
				assert.equal(r.body[0].content, "+ tarea mensual dia 2");
				day02Count2++;
			}
		}
		
		assert.ok(day02Count2 > 0);
	});

	await t.test("push recurring yearly 02-02 tests", async() =>
	{
		removeCalendar();
		writeCalendar("");
		const addCalendarDays = new AddCalendarDaysCommand();
		const pushRecurring = new PushRecurringCommand();

		await addCalendarDays.run(400);

		writeRecurring(`@yearly 02-02\n+ tarea anual 2 febrero`);
		await pushRecurring.run();

		const result = parseCalendar();

		assert.ok(Array.isArray(result));
		
		let feb02Count = 0;
		for(const r of result)
		{
			const dayOfMonth = r.date.getDate();
			const month = r.date.getMonth();
			if(r.body.length > 0)
			{
				assert.equal(month, 1);
				assert.equal(dayOfMonth, 2);
				assert.equal(r.body[0].content, "+ tarea anual 2 febrero");
				feb02Count++;
			}
		}
		
		assert.ok(feb02Count > 0);

		writeCalendar("");
		await addCalendarDays.run(400);

		writeRecurring(`@yearly 02-02\n+ tarea anual 2 febrero`);

		await pushRecurring.cli();

		const result2 = parseCalendar();

		assert.ok(Array.isArray(result2));
		
		let feb02Count2 = 0;
		for(const r of result2)
		{
			const dayOfMonth = r.date.getDate();
			const month = r.date.getMonth();
			if(r.body.length > 0)
			{
				assert.equal(month, 1);
				assert.equal(dayOfMonth, 2);
				assert.equal(r.body[0].content, "+ tarea anual 2 febrero");
				feb02Count2++;
			}
		}
		
		assert.ok(feb02Count2 > 0);
	});

	await t.test("push recurring unique dd-mm-yyyy tests", async() =>
	{
		removeCalendar();
		writeCalendar("");
		const addCalendarDays = new AddCalendarDaysCommand();
		const pushRecurring = new PushRecurringCommand();

		await addCalendarDays.run(1000);

		const targetDate = new Date();
		targetDate.setDate(targetDate.getDate() + 500);
		
		const day = String(targetDate.getDate()).padStart(2, '0');
		const month = String(targetDate.getMonth() + 1).padStart(2, '0');
		const year = targetDate.getFullYear();
		
		writeRecurring(`@unique ${day}-${month}-${year}\n+ tarea unica`);
		await pushRecurring.run();

		const result = parseCalendar();

		assert.ok(Array.isArray(result));
		
		let uniqueCount = 0;
		for(const r of result)
		{
			if(r.body.length > 0)
			{
				assert.equal(r.date.getDate(), targetDate.getDate());
				assert.equal(r.date.getMonth(), targetDate.getMonth());
				assert.equal(r.date.getFullYear(), targetDate.getFullYear());
				assert.equal(r.body[0].content, "+ tarea unica");
				uniqueCount++;
			}
		}
		
		assert.equal(uniqueCount, 1);

		writeCalendar("");

		await addCalendarDays.run(1000);
		writeRecurring(`@unique ${day}-${month}-${year}\n+ tarea unica`);

		await pushRecurring.cli();

		const result2 = parseCalendar();

		assert.ok(Array.isArray(result2));
		
		let uniqueCount2 = 0;
		for(const r of result2)
		{
			if(r.body.length > 0)
			{
				assert.equal(r.date.getDate(), targetDate.getDate());
				assert.equal(r.date.getMonth(), targetDate.getMonth());
				assert.equal(r.date.getFullYear(), targetDate.getFullYear());
				assert.equal(r.body[0].content, "+ tarea unica");
				uniqueCount2++;
			}
		}
		
		assert.equal(uniqueCount2, 1);
	});

	await t.test("push recurring interval dd-mm-yyyy 2 tests", async() =>
	{
		removeCalendar();
		writeCalendar("");
		const addCalendarDays = new AddCalendarDaysCommand();
		const pushRecurring = new PushRecurringCommand();

		await addCalendarDays.run(300);

		const startDate = new Date();
		startDate.setDate(startDate.getDate() + 10);
		
		const day = String(startDate.getDate()).padStart(2, '0');
		const month = String(startDate.getMonth() + 1).padStart(2, '0');
		const year = startDate.getFullYear();
		
		writeRecurring(`@interval ${day}-${month}-${year} 2\n+ tarea intervalo 2`);
		await pushRecurring.run();

		const result = parseCalendar();
		assert.ok(Array.isArray(result));
		
		let intervalCount = 0;
		let lastFoundDate = null;
		
		for(const r of result)
		{
			if(r.body.length > 0)
			{
				assert.equal(r.body[0].content, "+ tarea intervalo 2");
				
				if(lastFoundDate !== null)
				{
					const daysDiff = Math.round((r.date - lastFoundDate) / (1000 * 60 * 60 * 24));
					assert.equal(daysDiff, 2);
				}
				
				lastFoundDate = r.date;
				intervalCount++;
			}
		}
		
		assert.ok(intervalCount > 0);

		writeCalendar("");
		await addCalendarDays.run(300);
		writeRecurring(`@interval ${day}-${month}-${year} 2\n+ tarea intervalo 2`);

		await pushRecurring.cli();

		const result2 = parseCalendar();

		assert.ok(Array.isArray(result2));
		
		let intervalCount2 = 0;
		let lastFoundDate2 = null;
		
		for(const r of result2)
		{
			if(r.body.length > 0)
			{
				assert.equal(r.body[0].content, "+ tarea intervalo 2");
				
				if(lastFoundDate2 !== null)
				{
					const daysDiff = Math.round((r.date - lastFoundDate2) / (1000 * 60 * 60 * 24));
					assert.equal(daysDiff, 2);
				}
				
				lastFoundDate2 = r.date;
				intervalCount2++;
			}
		}
		
		assert.ok(intervalCount2 > 0);
	});

	await t.test("push recurring interval dd-mm-yyyy 3 tests", async() =>
	{
		removeCalendar();
		writeCalendar("");
		const addCalendarDays = new AddCalendarDaysCommand();
		const pushRecurring = new PushRecurringCommand();

		await addCalendarDays.run(300);

		const startDate = new Date();
		startDate.setDate(startDate.getDate() + 15);
		
		const day = String(startDate.getDate()).padStart(2, '0');
		const month = String(startDate.getMonth() + 1).padStart(2, '0');
		const year = startDate.getFullYear();
		
		writeRecurring(`@interval ${day}-${month}-${year} 3\n+ tarea intervalo 3`);
		await pushRecurring.run();

		const result = parseCalendar();

		assert.ok(Array.isArray(result));
		
		let intervalCount = 0;
		let lastFoundDate = null;
		
		for(const r of result)
		{
			if(r.body.length > 0)
			{
				assert.equal(r.body[0].content, "+ tarea intervalo 3");
				
				if(lastFoundDate !== null)
				{
					const daysDiff = Math.round((r.date - lastFoundDate) / (1000 * 60 * 60 * 24));
					assert.equal(daysDiff, 3);
				}
				
				lastFoundDate = r.date;
				intervalCount++;
			}
		}
		
		assert.ok(intervalCount > 0);

		writeCalendar("");
		await addCalendarDays.run(300);
		writeRecurring(`@interval ${day}-${month}-${year} 3\n+ tarea intervalo 3`);

		await pushRecurring.cli();

		const result2 = parseCalendar();

		assert.ok(Array.isArray(result2));
		
		let intervalCount2 = 0;
		let lastFoundDate2 = null;
		
		for(const r of result2)
		{
			if(r.body.length > 0)
			{
				assert.equal(r.body[0].content, "+ tarea intervalo 3");
				
				if(lastFoundDate2 !== null)
				{
					const daysDiff = Math.round((r.date - lastFoundDate2) / (1000 * 60 * 60 * 24));
					assert.equal(daysDiff, 3);
				}
				
				lastFoundDate2 = r.date;
				intervalCount2++;
			}
		}
		
		assert.ok(intervalCount2 > 0);
	});

	await t.test("push recurring comment tests", async() =>
	{
		removeCalendar();
		writeCalendar("");
		const addCalendarDays = new AddCalendarDaysCommand();
		const pushRecurring = new PushRecurringCommand();

		await addCalendarDays.run(30);

		writeRecurring(`@comment esto es un comentario\n@daily\n+ tarea diaria real`);
		await pushRecurring.run();

		const result = parseCalendar();

		assert.ok(Array.isArray(result));
		
		for(const r of result)
		{
			if(r.body.length > 0)
			{
				assert.equal(r.body[0].content, "+ tarea diaria real");
				assert.equal(r.body.length, 1);
			}
		}

		writeCalendar("");
		await addCalendarDays.run(30);
		writeRecurring(`@comment esto es un comentario\n@daily\n+ tarea diaria real`);

		await pushRecurring.cli();

		const result2 = parseCalendar();

		assert.ok(Array.isArray(result2));
		
		for(const r of result2)
		{
			if(r.body.length > 0)
			{
				assert.equal(r.body[0].content, "+ tarea diaria real");
				assert.equal(r.body.length, 1);
			}
		}
	});
	await t.test("push recurring should not duplicate existing tasks", async() =>
	{
		removeCalendar();
		writeCalendar("");
		const addCalendarDays = new AddCalendarDaysCommand();
		const pushRecurring = new PushRecurringCommand();

		await addCalendarDays.run(10);

		writeRecurring(`@daily\n+ tarea diaria 1\n+ tarea diaria 2`);
		await pushRecurring.run();

		const result = parseCalendar();

		assert.ok(Array.isArray(result));
		for(const r of result)
		{
			assert.equal(r.body.length, 2);
			assert.equal(r.body[0].content, "+ tarea diaria 1");
			assert.equal(r.body[1].content, "+ tarea diaria 2");
		}

		// Segunda ejecución sin cambios - no debe duplicar
		await pushRecurring.run();

		const result2 = parseCalendar();

		assert.ok(Array.isArray(result2));
		for(const r of result2)
		{
			assert.equal(r.body.length, 2);
			assert.equal(r.body[0].content, "+ tarea diaria 1");
			assert.equal(r.body[1].content, "+ tarea diaria 2");
		}

		// Marcar una tarea como completada y ejecutar de nuevo
		const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
		const calendarContent = result2.map(day =>
		{
			const dd = String(day.date.getDate()).padStart(2, '0');
			const mm = String(day.date.getMonth() + 1).padStart(2, '0');
			const yyyy = day.date.getFullYear();
			const dayName = dayNames[day.date.getDay()];
			const dateStr = `${dd}-${mm}-${yyyy} ${dayName}`;
			return `${dateStr}\n+ tarea diaria 1 [x]\n+ tarea diaria 2`;
		}).join('\n\n');

		writeCalendar(calendarContent);
		await pushRecurring.run();

		const result3 = parseCalendar();
		assert.ok(Array.isArray(result3));
		for(const r of result3)
		{
			assert.equal(r.body.length, 2);
			const contents = r.body.map(b => b.content);
			assert.ok(contents.includes("+ tarea diaria 1 [x]") || contents.includes("+ tarea diaria 1"));
			assert.ok(contents.includes("+ tarea diaria 2"));
		}

		// Agregar nueva tarea y ejecutar - debe añadir solo la nueva
		writeRecurring(`@daily\n+ tarea diaria 1\n+ tarea diaria 2\n+ tarea diaria 3`);

		await pushRecurring.run();

		const result4 = parseCalendar();

		assert.ok(Array.isArray(result4));
		for(const r of result4)
		{
			assert.equal(r.body.length, 3);
			const contents = r.body.map(b => b.content);
			assert.ok(contents.includes("+ tarea diaria 1 [x]") || contents.includes("+ tarea diaria 1"));
			assert.ok(contents.includes("+ tarea diaria 2"));
			assert.ok(contents.includes("+ tarea diaria 3"));
		}
	});
});
