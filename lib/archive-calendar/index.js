const parseCalendar = require("../parse-calendar");
const LifeScriptError = require("../life-script-error");
const fs = require("fs").promises;
const fsSync = require("fs");
const ROUTES = require("../routes");
const daysToString = require("../days-to-string");

const archivePath = ROUTES.absolute_paths[ROUTES.filenames.archive];
const calendarPath = ROUTES.absolute_paths[ROUTES.filenames.calendar];
/**
 * @returns {Promise<import("../parse-blocks").LifeScriptError|void>}
 */
const archiveCalendar = async() =>
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
	
	const promise1 = fs.appendFile(archivePath, "\n\n"+oldExtraStr, "utf-8");
	const promise2 = fs.writeFile(calendarPath, newCalendarContent, "utf-8");

	await Promise.all([promise1, promise2]);

	return void 0;
}

module.exports = archiveCalendar;
