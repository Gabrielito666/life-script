const fs = require("fs").promises;
const ROUTES = require("../../routes");
const parseCalendar = require("../../parse-calendar");
const LifeScriptError = require("../../life-script-error");
const weekdayNames = require("../../weekday-names");
const Command = require("../../command");
/**
 * @typedef {import("../../life-script-error")} LifeScriptError
 */

/**
 * @param {Date} date
 * @returns {string}
 */
const getDayHeaderStr = date =>
{
	const dd = date.getDate();
	const mm = date.getMonth() +1;
	const yy = date.getFullYear();
	const dayname = weekdayNames[date.getDay()];
	return `${dd}-${mm}-${yy} ${dayname}`;
};

/**
 * @class AddCalendarDaysCommand
 * @extends {Command}
 */
const AddCalendarDaysCommand = class extends Command
{
	constructor()
	{
		super(
			"add-calendar-days",
			"Receive a number and add that number of days to the calendar.",
			"life-script add-calendar-days 10"
		);
	}
	/**
	 * @param {number} num
	 * @returns {Promise<void|LifeScriptError>}
	 */
	async run(num)
	{
		const calendarDays = parseCalendar();
		if(calendarDays instanceof LifeScriptError)
		{
			return calendarDays;
		}
		const dates = calendarDays.map(d => d.date);
		if(dates.length === 0)
		{
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(today.getDate() - 1);
			dates.push(yesterday);
		}

		const lastDate = dates[dates.length -1];
		const datesToAdd = Array
			.from({length: num}, (_, i) =>
			{
				const newDate = new Date(lastDate);
				newDate.setDate(lastDate.getDate() + i + 1);
				return newDate;
			})
			.map(getDayHeaderStr)
			.join("\n\n");

		const calendarPath = ROUTES.absolute_paths[ROUTES.filenames.calendar];
		
		//Just push a \n when the file have content
		const fileSize = (await fs.stat(calendarPath)).size;
		if(fileSize > 0)
		{
			await fs.appendFile(calendarPath, "\n", "utf-8");
		}

		await fs.appendFile(calendarPath, datesToAdd, "utf-8");

		return void 0;
	}

	cli()
	{
		const numberOfDays = +Command.rawArgsPostCommand[0];
		if(typeof numberOfDays !== "number" || Number.isNaN(numberOfDays) || process.argv.length > 4)
		{
			return new LifeScriptError("command", "The “add-calendar-days” command can only receive a numeric argument.");
		}
		return this.run(numberOfDays);
	}
}

/**
 * @module ./lib/commands/add-calendar-days
 */
module.exports = AddCalendarDaysCommand;
