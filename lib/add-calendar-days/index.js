const fs = require("fs").promises;
const ROUTES = require("../routes");
const parseCalendar = require("../parse-calendar");
const LifeScriptError = require("../life-script-error");
const weekdayNames = require("../weekday-names");
/**
 * @typedef {import("../life-script-error")} LifeScriptError
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
 * @param {number} num
 * @returns {Promise<void|LifeScriptError>}
 */
const addCalendarDays = async(num) =>
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
	await fs.appendFile(calendarPath, "\n\n", "utf-8");
	await fs.appendFile(calendarPath, datesToAdd, "utf-8");

	return void 0;
}

module.exports = addCalendarDays;
