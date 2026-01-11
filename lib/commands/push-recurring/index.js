const fs = require("fs").promises;
const ROUTES = require("../../routes");
const parseCalendar = require("../../parse-calendar");
const parseRecurring = require("../../parse-recurring");
const LifeScriptError = require("../../life-script-error");
const daysToString = require("../../days-to-string");
const Command = require("../../command");

const PushRecurringCommand = class extends Command
{
	constructor()
	{
		super(
			"push-recurring",
			"Add recurring events to the days on the calendar using the recurring.txt file as a template.",
			"life-script push-recurring"
		);
	}

	async run()
	{
		const calendarDays = parseCalendar();
		if(calendarDays instanceof LifeScriptError) return calendarDays;

		const recurringRules = parseRecurring();
		if(recurringRules instanceof LifeScriptError) return recurringRules;

		/**@type {parseCalendar.CalendarDay[]}*/
		const oldDays = [];
		/**@type {parseCalendar.CalendarDay[]}*/
		const futureDays = [];

		const todayMorning = new Date();
		todayMorning.setHours(0, 0, 0, 0);

		for(const day of calendarDays)
		{
			if(day < todayMorning) oldDays.push(day);
			else futureDays.push(day);
		}
		const modificatedFutureDays = futureDays.map(day =>
		{
			/**@type {parseCalendar.CalendarDay}*/
			const clonedDay = { ...day, body: [...day.body] };
			for(const rule of recurringRules)
			{
				if(rule.checker(day))
				{
					rule.body.forEach(activity =>
					{
						//solo si el día no incluye la actividad (excluyendo [✓] o [x])
						const dayIncludesActivity = clonedDay.body.some(ac =>
						{
							const cleanLine = ac.content
								.replace(/\[([x✓])\]/gi, '')  // Eliminar todos los [x] o [✓]
								.replace(/\s+/g, ' ')          // Normalizar espacios múltiples a uno solo
								.trim();

							const cleanActivity = activity.content
								.replace(/\[([x✓])\]/gi, '')
								.replace(/\s+/g, ' ')
								.trim();

							return cleanLine === cleanActivity;
						});
						if(!dayIncludesActivity)
						{
							clonedDay.body.push(activity);
						}
					});
				}
			}
			return clonedDay;
		});
		
		const oldDaysString = daysToString(oldDays);
		const futureDaysModificatedString = daysToString(modificatedFutureDays);

		const newFileString = oldDaysString + "\n\n" + futureDaysModificatedString;

		await  fs.writeFile(ROUTES.absolute_paths[ROUTES.filenames.calendar], newFileString, "utf-8");

		return void 0;
	}
	cli()
	{
		if(Command.rawArgsPostCommand.length > 0) return new LifeScriptError("command", "This command does not require any arguments.");
		return this.run();
	}
}

/**
 * @module ./lib/commands/push-recurring
 */
module.exports = PushRecurringCommand;
