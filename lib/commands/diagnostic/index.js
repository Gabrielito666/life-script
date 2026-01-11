const parseCalendar = require("../../parse-calendar");
const parseRecurring = require("../../parse-recurring");
const LifeScriptError = require("../../life-script-error");
const Command = require("../../command");
const fs = require("fs");

/**@typedef {import("../../life-script-error")} LifeScriptError*/

/**
 * @class
 */
const DiagnosticCommand = class extends Command
{
	constructor()
	{
		super(
			"diagnostic",
			"It diagnoses the syntax of the main life-script files.",
			"life-script diagnostic",
			true
		);
	}
	/**
	 * @returns {LifeScriptError|void}
	 */
	run()
	{
		if(!fs.existsSync(process.env.LIFE_DIR))
		{
			return new LifeScriptError("command", "~/life dir not exists, create it with mkdir");
		}

		const err1 = parseCalendar();
		if(err1 instanceof LifeScriptError) return err1;
		const err2 = parseRecurring();
		if(err2 instanceof LifeScriptError) return err2;

		return void 0;
	}
	cli()
	{

		if(Command.rawArgsPostCommand.length > 0) return new LifeScriptError("command", "This command does not require any arguments.");
		return this.run();
	}
}

/**
 * @module .lib/commands/diagnostic
 */
module.exports = DiagnosticCommand;
