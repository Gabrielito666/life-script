const parseCalendar = require("../../parse-calendar");
const LifeScriptError = require("../../life-script-error");
const fs = require("fs").promises;
const fsSync = require("fs");
const ROUTES = require("../../routes");
const daysToString = require("../../days-to-string");
const Command = require("../../command");

const archivePath = ROUTES.absolute_paths[ROUTES.filenames.archive];
const calendarPath = ROUTES.absolute_paths[ROUTES.filenames.calendar];

/**
 * @typedef {import("../../life-script-error")} LifeScriptError
 */

/**
 * @class
 */
const ArchiveCalendarCommand = class extends Command
{
	constructor()
	{
		super(
			"archive-calendar",
			"Archive past days in .calendar-archive.txt and delete them from the calendar.",
			"life-script archive-calendar"
		);
	}
	/**
	 * @returns {Promise<LifeScriptError|void>}
 	*/
	async run()
	{
		if(!fsSync.existsSync(archivePath))
		{
			fsSync.writeFileSync(archivePath, "", "utf-8");
		}
		const days = parseCalendar();

		if(days instanceof LifeScriptError)
		{
			return LifeScriptError;
		}

		/**@type {parseCalendar.CalendarDay[]}*/
		const oldDays = [];
		/**@type {parseCalendar.CalendarDay[]}*/
		const futureDays = [];

		for(const day of days)
		{
			const today = new Date();
			const yesterday = new Date(today);
			yesterday.setDate(today.getDate() - 1);

			if(day.date < yesterday) oldDays.push(day);
			else futureDays.push(day);
		}
		const oldExtraStr = daysToString(oldDays);
		const newCalendarContent = daysToString(futureDays);
		
		//Just add a \n to archive if this have prev content
		const archiveSize = (await fs.stat(archivePath)).size;
		if(archiveSize > 0) await fs.appendFile(archivePath, "\n", "utf-8");

		const promise1 = fs.appendFile(archivePath, oldExtraStr, "utf-8");
		const promise2 = fs.writeFile(calendarPath, newCalendarContent.trim(), "utf-8");

		await Promise.all([promise1, promise2]);

		return void 0;
	}
	cli()
	{
		if(Command.rawArgsPostCommand.length > 0) return new LifeScriptError("command", "This command does not require any arguments.");
		return this.run();
	}
}

/**
 * @module ./lib/commands/archive-calendar
 */
module.exports = ArchiveCalendarCommand;
