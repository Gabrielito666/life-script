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
	 * Is the array of args post command in cli
	 * `bash life-script my-command arg1 arg2 --tag arg3` returns ["arg1", "arg2", "--tag", "arg3"]
	 * @static
	 * @type {string[]}
	 */
	static get rawArgsPostCommand(){ return process.argv.slice(3) };
	/**
	 * Constructor from a command. commandName must be the name from cli command
	 * @example `bash life-script my-command` => comand name must be "my-command"
	 * @param {string} commandName
	 * @param {string} description
	 * @param {string} example
	 * @param {true|undefined} [needCongratulations]
	 */
	constructor(commandName, description, example, needCongratulations)
	{
		/**@const @readonly @type {string}*/
		this.commandName = commandName;
		/**@const @readonly @type {string}*/
		this.description = description;
		/**@const @readonly @type {string}*/
		this.example = example;
		/**@const @readonly @type {true|undefined}*/
		this.needCongratulations = needCongratulations;
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
	 * @returns {ReturnType<Command["run"]>}
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
