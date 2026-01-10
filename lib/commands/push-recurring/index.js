const fs = require("fs").promises;
const ROUTES = require("../../routes");
const parseCalendar = require("../../parse-calendar");
const parseRecurring = require("../../parse-recurring");
const LifeScriptError = require("../../life-script-error");
const daysToString = require("../../days-to-string");
const weekdayNames = require("../../weekday-names");
const Command = require("../../command");

const PushRecurringCommand = class extends Command
{
	constructor()
	{
		super("push-recurring");
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
				if(
					(rule.timeRule.tag === "@daily")
					||
					(rule.timeRule.tag === "@weekly" && weekdayNames[day.date.getDay()] === rule.timeRule.dayname)
					||
					(rule.timeRule.tag === "@monthly" && day.date.getDate() === rule.timeRule.daynumber)
					||
					(
						rule.timeRule.tag === "@yearly"
						&&
						day.date.getMonth() === rule.timeRule.monthnumber-1
						&&
						day.date.getDate() === rule.timeRule.daynumber
					)
				)
				{
					rule.body.forEach(activity =>
					{
						if(!clonedDay.body.some(ac => ac.content === activity.content))
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
