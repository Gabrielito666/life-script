/**
 * @typedef {import("../life-script-error")} LifeScriptError
 */

/*
 * @class Command
 * @abstract
 */
const Command = class
{
	/**
	 * Returns the command of cli
	 * @example `bash life-script my-command` returns "my-command"
	 * @returns {string|undefined}
	 */
	static readRawCommandArg()
	{
		return process.argv[2];
	}
	/**
	 * Returns the array of args post command in cli
	 * `bash life-script my-command arg1 arg2 --tag arg3` returns ["arg1", "arg2", "--tag", "arg3"]
	 * @returns {string[]}
	 */
	static readRawArgsPostCommand()
	{
		return process.argv.slice(3);
	}
	/**
	 * Constructor from a command. commandName must be the name from cli command
	 * @example `bash life-script my-command` => comand name must be "my-command"
	 * @param {string} commandName
	 */
	constructor(commandName)
	{
		this.commandName = commandName
	}
	/**
	 * Run method must be a normal Function with params from the command funcionality
	 * @param {...unknown} args
	 * @returns {void|LifeScriptError|Promise<void|LifeScriptError>}
	 */
	run(args)
	{
		throw(`Must implement Command "${this.commandName}" run method"`);
	}
	/**
	 * Cli method must be a wraper from run method but with validations from params from cli args
	 * @returns {ReturnType<typeof this["cli"]}
	 */
	cli()
	{

		throw(`Must implement Command "${this.commandName}" cli method"`);
	}
};

/**
 * @module ./lib/command
 */
module.exports = Command;
