const LifeScriptError = require("../life-script-error");

/**
 * @typedef {import("../command")} Command
 * @typedef {import("../life-script-error")} LifeScriptError
 */

/**
 * Represents the main programs
 * @class
 */
const Program = class
{
	/**
	 * Is the command of cli
	 * @example `bash life-script my-command` returns "my-command"
	 * @static
	 * @type {string}
	 */
	static rawCommandName = process.argv[2];
	/**
	 * @param {...Command} commands
	 */
	constructor(...commands)
	{
		for(const c of commands)
		{
			if(c.commandName === Program.rawCommandName)
			{
				this.command = c;
				break;
			}
		}
	}
	async run()
	{
		if(!this.command)
		{

			return new LifeScriptError("command", "This is not a valid command. Please check out the documentation.");
		}
		const result = await this.command.cli();
		if(result instanceof LifeScriptError) return result.print();
		if(this.command.needCongratulations) return LifeScriptError.printCongratulations();
		return void 0;
	}
}

module.exports = Program;
