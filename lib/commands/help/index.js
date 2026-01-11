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
		console.log("\n╔════════════════════════════════════════════════════════════════════╗");
		console.log("║                    📚 LIFE-SCRIPT COMMANDS                         ║");
		console.log("╚════════════════════════════════════════════════════════════════════╝\n");
		
		this.commands.forEach(cmd =>
		{
			console.log("  ┌─ ", cmd.commandName);
			console.log("  │  ", cmd.description);
			console.log("  └─ ", "Example:", cmd.example);
			console.log();
		});
		
		console.log("╔════════════════════════════════════════════════════════════════════╗");
		console.log("║  For more info visit: https://github.com/Gabrielito666/life-script ║");
		console.log("╚════════════════════════════════════════════════════════════════════╝\n");
		
		return void 0;
	}
	cli()
	{
		if(Command.rawArgsPostCommand.length > 0) return new LifeScriptError("command", "This command does not require arguments");
		return this.run();
	}
}
/**
 * @module ./lib/commands/help
 */
module.exports = HelpCommand;
