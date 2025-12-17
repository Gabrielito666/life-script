const LifeScriptError = require("../life-script-error");
const parseBlocks = require("../parse-blocks");
const ROUTES = require("../routes");
const weekdayNames = require("../weekday-names");
/**
 * @typedef {import("../life-script-error")} LifeScriptError
 * @typedef {{ tag: "@daily" }} RecurringDailyTimeRule
 * @typedef {{ tag: "@weekly"; dayname: weekdayNames.DayName }} RecurringWeeklyTimeRule
 * @typedef {{ tag: "@monthly"; daynumber: number; }} RecurringMonthlyTimeRule
 * @typedef {{ tag: "@yearly"; daynumber: number; monthnumber: number; }} RecurringYearlyTimeRule
 * @typedef {RecurringDailyTimeRule|RecurringWeeklyTimeRule|RecurringMonthlyTimeRule|RecurringYearlyTimeRule} RecurringTimeRule
 * @typedef { parseBlocks.Block & { timeRule: RecurringTimeRule; } } RecurringRule
 */

/**
 * @param {parseBlocks.BlockLine} blockLine
 * @returns {RecurringTimeRule|LifeScriptError}
 */
const parseRecurringHeader = (blockLine) =>
{
	const firstDivision = blockLine.content.split(" ");
	
	if(firstDivision.length > 2 || firstDivision.length < 1)
	{
		return new LifeScriptError(ROUTES.filenames.recurring, blockLine.lineNumber, "No tag in the “recurring.txt” file accepts more than one argument.");
	}

	if(firstDivision[0] === "@daily")
	{
		if(firstDivision.length !== 1)
		{
			return new LifeScriptError(ROUTES.filenames.recurring, blockLine.lineNumber, "@daily tags do not take arguments");
		}
		return { tag: "@daily" };
	}
	if(firstDivision[0] === "@weekly")
	{
		/**@type {weekdayNames.DayName}*/
		const dayname = firstDivision[1] || "monday";
		if(!weekdayNames.includes(dayname))
		{
			return new LifeScriptError(ROUTES.filenames.recurring, blockLine.lineNumber, "The @weekly tags only accept days of the week as arguments. If no parameter is provided, Monday is assumed.");
		}

		return { tag: "@weekly", dayname };
	}
	if(firstDivision[0] === "@monthly")
	{
		const daynumber = firstDivision[1] ? +firstDivision[1] : 1;
		if(Number.isNaN(daynumber) || daynumber < 0 || daynumber > 31)
		{
			return new LifeScriptError(ROUTES.filenames.recurring, blockLine.lineNumber, "The @monthly tags only receive the number of the day of the month as an argument, or, failing that, no argument is assumed to be the 1st day.");
		}
		return { tag: "@monthly", daynumber };
	}
	if(firstDivision[0] === "@yearly")
	{
		const secondDivision = firstDivision[1] ? firstDivision[1].split("-") : ["1", "1"];
		if(secondDivision.length !== 2)
		{
			return new LifeScriptError(ROUTES.filenames.recurring, blockLine.lineNumber, "The @yearly tags only accept one argument in dd-mm format; otherwise, 1-1 is assumed.");
		}
		const [dd, mm] = secondDivision.map(str => +str);

		if([dd, mm].some(Number.isNaN) || dd < 1 || dd > 31 || mm < 1 || mm > 12)
		{
			return new LifeScriptError(ROUTES.recurring, blockLine.lineNumber, "The @yearly tags only accept one argument in dd-mm format; otherwise, 1-1 is assumed.");
		}
		return { tag: "@yearly", daynumber: dd, monthnumber: mm };
	}

	return new LifeScriptError(ROUTES.filenames.recurring, blockLine.lineNumber, "The only valid tags are @daily, @weekly, @monthly, or @yearly.");
}

/**
 * @returns {LifeScriptError|RecurringRule[]}
 */
const parseRecurring = () =>
{
	const recurringBlocks = parseBlocks(ROUTES.filenames.recurring);

	if(recurringBlocks instanceof LifeScriptError) return recurringBlocks;

	/**@type {RecurringRule[]}*/
	const recurringRules = [];

	for(const block of recurringBlocks)
	{
		const timeRule = parseRecurringHeader(block.header);
		if(timeRule instanceof LifeScriptError) return timeRule;

		recurringRules.push({ ...block, timeRule });
	}
	return recurringRules;
}

module.exports = parseRecurring;
