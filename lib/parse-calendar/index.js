const parseBlocks = require("../parse-blocks");
const LifeScriptError = require("../life-script-error");
const ROUTES = require("../routes");
const weekdayNames = require("../weekday-names");
/**
 * @typedef {import("../life-script-error")} LifeScriptError
 * @typedef {parseBlocks.Block & { date: Date }} CalendarDay
 */

/**
 * @param {parseBlocks.BlockLine} line
 * @returns {Date|LifeScriptError}
 */
const parseDayHeader = line =>
{
	const firstDivision = line.content.split(" ");
	if(firstDivision.length !== 2)
	{
		return new LifeScriptError(
			ROUTES.filenames.calendar,
			line.lineNumber,
			"a day calendar header must habe format: dd-mm-yy dayname"
		);
	}

	const [dateStr, dayname] = firstDivision;

	const secondDivision = dateStr.split("-").map(num => +num);
	if(secondDivision.length !== 3 || secondDivision.some(Number.isNaN))
	{
		return new LifeScriptError(
			ROUTES.filenames.calendar,
			line.lineNumber,
			"a day calendar header must habe format: dd-mm-yy dayname"
		);
	}

	const [dd, mm, yy] = secondDivision;

	if(dd < 1 || dd > 31 || mm < 1 || mm > 12 || !weekdayNames.includes(dayname.toLowerCase().trim()))
	{
		return new LifeScriptError(
			ROUTES.filenames.calendar,
			line.lineNumber,
			"a day calendar header must habe format: dd-mm-yy dayname"
		);
	}

	const date = new Date(yy, mm - 1, dd);

	const realDayName = weekdayNames[date.getDay()];
	if(dayname !== realDayName)
	{
		return new LifeScriptError(
			ROUTES.filenames.calendar,
			line.lineNumber,
			"a day calendar header must habe format: dd-mm-yy dayname"
		);
	}

	return date;
}

/**@returns {CalendarDay[]|LifeScriptError}*/
const parseCalendar = () =>
{
	const calendarBlocks = parseBlocks(ROUTES.filenames.calendar);

	if(calendarBlocks instanceof LifeScriptError) return calendarBlocks;

	/**@type {CalendarDay[]}*/
	const calendarDays = [];
	for(const block of calendarBlocks)
	{
		const headerDate = parseDayHeader(block.header);
		if(headerDate instanceof LifeScriptError) return headerDate;

		const lastDay = calendarDays[calendarDays.length - 1];
		
		if(lastDay && lastDay.date >= headerDate)
		{
			return new LifeScriptError(
				ROUTES.filenames.calendar,
				block.header.lineNumber,
				"The days are out of order or duplicated."
			);
		}

		calendarDays.push({ ...block, date: headerDate });
	};

	return calendarDays;
}

module.exports = parseCalendar;
