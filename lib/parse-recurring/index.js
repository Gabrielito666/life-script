const LifeScriptError = require("../life-script-error");
const parseBlocks = require("../parse-blocks");
const ROUTES = require("../routes");
const weekdayNames = require("../weekday-names");
/**
 * @typedef {import("../life-script-error")} LifeScriptError
 * @typedef {import("../parse-blocks").BlockLine} BlockLine
 * @typedef {import("../parse-blocks").Block} Block
 * @typedef {import("../parse-calendar").CalendarDay} CalendarDay
 * @typedef {(day:CalendarDay) => boolean} RuleCheckerFn
 * @typedef {{tag: string; parse(args:string[], blockLine:BlockLine):RuleCheckerFn}} IRecurringTimeRule
 */

// TODO: unique, yearly e interval comparten mucha lógica en sus validaciones... hay que compartirla en algun metodo estatico


/**
 * @class RecurringTimeRule
 * @abstract
 * @implements {IRecurringTimeRule}
 */
const RecurringTimeRule = class
{
	/**
	 * @param {string} tag
	 */
	constructor(tag)
	{
		/**@constant @readonly @type {string}*/
		this.tag = tag;
	}
	/**
	 * @param {string[]} args
	 * @param {BlockLine} blockLine
	 * @returns {RuleCheckerFn|LifeScriptError}
	 */
	parse(args, blockLine)
	{
		throw new Error("RecurringTimeRule.match(date:Date) method must be implementated");
	}
}

/**
 * @class DailyTimeRule
 * @extends {RecurringTimeRule}
 * @implements {IRecurringTimeRule}
 */
const DailyTimeRule = class extends RecurringTimeRule
{
	constructor()
	{
		super("@daily");

	}
	parse(args, blockLine)
	{
		if(args.length !== 0)
		{
			return new LifeScriptError(
				ROUTES.filenames.recurring,
				"@daily tags do not take arguments",
				blockLine.lineNumber,
			);
		}
		return (day) => true;
	}
}

const WeeklyTimeRule = class extends RecurringTimeRule
{
	/**
	 * @param {string[]} args
	 * @param {BlockLine} blockLine
	 */
	constructor()
	{
		super("@weekly");
	}
	parse(args, blockLine)
	{
		/**@type {weekdayNames.DayName}*/
		const dayname = args[0] || "monday";
		if(!weekdayNames.includes(dayname))
		{
			return new LifeScriptError(
				ROUTES.filenames.recurring,
				"The @weekly tags only accept days of the week as arguments. If no parameter is provided, Monday is assumed.",
				blockLine.lineNumber,
			);
		}

		return (day) => (weekdayNames[day.date.getDay()] === dayname);
	}
}

const MonthlyTimeRule = class extends RecurringTimeRule
{
	constructor()
	{
		super("@monthly");
	}
	parse(args, blockLine)
	{
		const daynumber = args[0] ? +args[0] : 1;
		if(Number.isNaN(daynumber) || daynumber < 0 || daynumber > 31)
		{
			return new LifeScriptError(
				ROUTES.filenames.recurring,
				"The @monthly tags only receive the number of the day of the month as an argument, or, failing that, no argument is assumed to be the 1st day.",
				blockLine.lineNumber,
			);
		}
		return (day) => (day.date.getDate() === daynumber);
	}
}

const YearlyTimeRule = class extends RecurringTimeRule
{
	constructor()
	{
		super("@yearly");
	}
	parse(args, blockLine)
	{
		const division = args[0] ? args[0].split("-") : ["1", "1"];
		if(division.length !== 2)
		{
			return new LifeScriptError(
				ROUTES.filenames.recurring,
				"The @yearly tags only accept one argument in dd-mm format; otherwise, 1-1 is assumed.",
				blockLine.lineNumber,
			);
		}
		const [dd, mm] = division.map(str => +str);

		if([dd, mm].some(Number.isNaN) || dd < 1 || dd > 31 || mm < 1 || mm > 12)
		{
			return new LifeScriptError(
				ROUTES.filenames.recurring,
				"The @yearly tags only accept one argument in dd-mm format; otherwise, 1-1 is assumed.",
				blockLine.lineNumber,
			);
		}
		
		return (day) => (day.date.getMonth() === mm-1 && day.date.getDate() === dd);
	}
}

const UniqueTimeRule = class extends RecurringTimeRule
{
	constructor()
	{
		super("@unique");
	}
	/**
	 * @param {string[]} args
	 * @param {BlockLine} blockLine
	 * @returns {RuleCheckerFn|LifeScriptError}
	 */
	parse(args, blockLine)
	{
		if(args.length !== 1)
		{
			return new LifeScriptError(
				ROUTES.filenames.recurring,
				"The @unique tags need one argument with dd-mm-yyyy format."
			);
		}
		const division = args[0].split("-");

		if(division.length !== 3)
		{
			return new LifeScriptError(
				ROUTES.filenames.recurring,
				"The @unique tags only accept one argument in dd-mm-yyyy format.",
				blockLine.lineNumber,
			);
		}
		const [dd, mm, yyyy] = division.map(str => +str);

		if([dd, mm, yyyy].some(Number.isNaN) || dd < 1 || dd > 31 || mm < 1 || mm > 12)
		{
			return new LifeScriptError(
				ROUTES.filenames.recurring,
				"The @unique tags only accept one argument in dd-mm-yyyy format.",
				blockLine.lineNumber,
			);
		}

		return (day) => (
			day.date.getFullYear() === yyyy &&
			day.date.getMonth() === mm-1 &&
			day.date.getDate() === dd
		);
	}
}
const IntervalTimeRule = class extends RecurringTimeRule
{
	constructor()
	{
		super("@interval");
	}	
	/**
	 * @param {string[]} args
	 * @param {BlockLine} blockLine
	 * @returns {RuleCheckerFn|LifeScriptError}
	 */
	parse(args, blockLine)
	{
		if(args.length !== 2)
		{
			return new LifeScriptError(
				ROUTES.filenames.recurring,
				"The @interval tags need two arguments: 'dd-mm-yyyy [interval]. ex: 01-01-2025 2'",
				blockLine.lineNumber
			)
		}
		const division = args[0].split("-");

		if(division.length !== 3)
		{
			return new LifeScriptError(
				ROUTES.filenames.recurring,
				"The @interval tags only accept in the first argument: dd-mm-yyyy format.",
				blockLine.lineNumber,
			);
		}
		const [dd, mm, yyyy] = division.map(str => +str);

		if([dd, mm, yyyy].some(Number.isNaN) || dd < 1 || dd > 31 || mm < 1 || mm > 12)
		{
			return new LifeScriptError(
				ROUTES.filenames.recurring,
				"The @interval tags only accept in the first argument: dd-mm-yyyy format.",
				blockLine.lineNumber,
			);
		}
		const interval = +args[1];
		if(Number.isNaN(interval))
		{
			return new LifeScriptError(
				ROUTES.filenames.recurring,
				"The @interval tags should have a second arg with the number of days ferquency",
				blockLine.lineNumber
			)
		}
		const startDayDate = new Date();
		startDayDate.setFullYear(yyyy);
		startDayDate.setMonth(mm-1);
		startDayDate.setDate(dd);
		
		const MS_PER_DAY = 1000 * 60 * 60 * 24;

		return (day) => 
		{
			const diffMilliseconds = (day.date - startDayDate);
			if(diffMilliseconds < 0) return false;

			const diffDays = diffMilliseconds / MS_PER_DAY;
			return Math.floor(diffDays) % interval === 0;
		};
	}
}
const CommentTimeRule = class extends RecurringTimeRule
{
	constructor()
	{
		super("@comment");
	}	
	/**
	 * @param {string[]} args
	 * @param {BlockLine} blockLine
	 * @returns {RuleCheckerFn|LifeScriptError}
	 */
	parse(args, blockLine)
	{
		return () => false;
	}
}

const RecurringHeaderParser = class 
{
	/**
	 * @param {...RecurringTimeRule} rules
	 */
	constructor(...rules)
	{
		/**@constant @readonly @type {RecurringTimeRule[]}*/
		this.rules = rules;
	}
	/**
	 * @param {BlockLine} blockLine
	 * @returns {LifeScriptError|RecurringTimeRule}
	 */
	parse(blockLine)
	{
		const division = blockLine.content.split(" ");
	
		for(const r of this.rules)
		{
			if(r.tag === division[0])
			{
				const checkerFn = r.parse(division.slice(1), blockLine);
				return checkerFn;
			}
		}
		const validTags = this.rules.map(r => r.tag).join(", ");
		return new LifeScriptError("recurring", `The valid tags are: "${validTags}"`, blockLine.lineNumber);
	}
}

const recurringHeaderParser = new RecurringHeaderParser(
	new DailyTimeRule(),
	new WeeklyTimeRule(),
	new MonthlyTimeRule(),
	new YearlyTimeRule(),
	new UniqueTimeRule(),
	new IntervalTimeRule(),
	new CommentTimeRule()
);


/**
 * @returns {LifeScriptError|(Block & { checker: RuleCheckerFn})[]}
 */
const parseRecurring = () =>
{
	const recurringBlocks = parseBlocks.fromFilename(ROUTES.filenames.recurring);

	if(recurringBlocks instanceof LifeScriptError) return recurringBlocks;

	const recurringCheckers = [];

	for(const block of recurringBlocks)
	{
		const checker = recurringHeaderParser.parse(block.header);
		if(checker instanceof LifeScriptError) return checker;

		recurringCheckers.push({ ...block, checker });
	}
	return recurringCheckers;
}

module.exports = parseRecurring;
