const Command = require("../../command");
const LifeScriptError = require("../../life-script-error");

const HelpCommand = class extends Command
{
	/**
	 * @param {...Command} commands
	 */
	constructor(...commands)
	{
		super("help", "I need somebody: helps you remember the commands", "life-script help");
		this.commands = commands;
		this.commands.unshift(this);
	}
	run()
	{
		this.commands.forEach(cmd =>
		{
			console.log("\t", cmd.commandName,);
			console.log("\t\t", cmd.description);
			console.log("\t\texample:", cmd.example);
		});
		return void 0
	}
	cli()
	{

		if(Command.rawArgsPostCommand.length > 0) return new LifeScriptError("command", "This command does not require any arguments.");
		return this.run();
	}
}

/**
 * @module ./lib/commands/help
 */
module.exports = HelpCommand;
