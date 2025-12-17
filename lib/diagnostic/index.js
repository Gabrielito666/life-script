const parseCalendar = require("../parse-calendar");
const parseRecurring = require("../parse-recurring");
const LifeScriptError = require("../life-script-error");

/**
 * @returns {import("../parse-blocks").LifeScriptError|void}
 */
const diagnostic = () =>
{
	const err1 = parseCalendar();
	if(err1 instanceof LifeScriptError) return err1;
	const err2 = parseRecurring();
	if(err2 instanceof LifeScriptError) return err2;

	return void 0;
}

const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";

const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const DIM    = "\x1b[2m";
const GREEN = "\x1b[32m";

const header   = `${BOLD}${RED}LifeScript error:${RESET}`;
/**
 * @param {import("../parse-blocks").LifeScriptError} err
 * @returns {void}
 */
diagnostic.printError = (err) =>
{
	if(err instanceof LifeScriptError)
	{
		const location = `${CYAN}${err.filename}${RESET}:${YELLOW}${err.lineNumber}${RESET}`;

		console.error(`${header} ${location}`);
		console.error(`  ${err.description}`);
		console.error(`${DIM}  (check the line indicated in your file)${RESET}`);
		return void 0;
	}
};

diagnostic.printCongratulations = () =>
{
	console.log(`${GREEN}No errors were found in your life-script file system.${RESET}`);
	return void 0;
}

/**
 * @param {string} msg
 * @returns {void}
 */
diagnostic.logCommandError = (msg) =>
{
	console.log(header);
	console.error(`  ${msg}${RESET}`);
	return void 0;
};

/**
 * @param {any} errOrAny
 * @returns {void}
 */
diagnostic.printErrorIfIsError = errOrAny =>
{
	if(errOrAny instanceof LifeScriptError) diagnostic.printError(errOrAny);
	return void 0;
}

/**
 * @param errOrAny
 * @returns {void}
 */
diagnostic.printErrorOrCongratulations = errOrAny =>
{
	if(errOrAny instanceof LifeScriptError) diagnostic.printError(errOrAny);
	else diagnostic.printCongratulations();
	return void 0;
}

module.exports = diagnostic;
