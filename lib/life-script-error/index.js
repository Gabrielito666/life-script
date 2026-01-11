const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";

const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const DIM    = "\x1b[2m";
const GREEN = "\x1b[32m";

const header   = `${BOLD}${RED}LifeScript error:${RESET}`;


/**
 * @class LifeScriptError
 */
const LifeScriptError = class
{
	/**
	 * @template {"command"|"calendar"|"recurring"}F
	 * @param {F} from
	 * @param {string} description
	 * @param {F extends "command" ? undefined : number} lineNumber
	 */
	constructor(from, description, lineNumber)
	{
		/**@readonly @const*/
		this.from = from;
		/**@readonly @const*/
		this.lineNumber = lineNumber;
		/**@readonly @const*/
		this.description = description;
	}
	print()
	{
		if(this.from === "command")
		{
			console.log(header);
			console.error(`  ${this.description}${RESET}`);
			return void 0;

		}
		const location = `${CYAN}${this.from}${RESET}:${YELLOW}${this.lineNumber}${RESET}`;

		console.error(`${header} ${location}`);
		console.error(`  ${this.description}`);
		console.error(`${DIM}  (check the line indicated in your file)${RESET}`);
		return void 0;
	}
	/**
	 * @returns {void}
	 */
	static printCongratulations()
	{
		console.log(`${GREEN}No errors were found in your life-script file system.${RESET}`);
		return void 0;

	}
}

/**
 * @module ./lib/life-script-error
 */
module.exports = LifeScriptError;
