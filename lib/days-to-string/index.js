/**
 * @typedef {import("../parse-calendar").CalendarDay} CalendarDay
 */

/**
 * @param {parseCalendar.CalendarDay[]} days
 * @returns {string}
 */
const daysToSrting = days =>
{
	return days.map(day =>
	{
		return [day.header.content, ...day.body.map(line => line.content)].join("\n");
	}).join("\n\n");
}

module.exports = daysToSrting;
