const fs = require("fs");
const LifeScriptError = require("../life-script-error");
const ROUTES = require("../routes");

/**
 * @typedef {{ lineNumber: number; content: string }} BlockLine
 * @typedef {{ header: BlockLine; body: BlockLine[] }} Block
 * @typedef {import("../life-script-error")} LifeScriptError
 */

const BlocksParser = class
{
	/**
	 * @param {string} str
	 * @param {"calendar.txt"|"recurring.txt"} filename used just to retunr util errors
	 * @returns {Block[]|LifeScriptError}
	 */
	fromString(str, filename)
	{
		/**@type {BlockLine[]}*/
		const lines = str
			.split("\n")
			.map((lineStr, i) => ({ lineNumber: i+1, content: lineStr.trim() }))
			.filter(line => line.content !== "");

		/**@type {Block[]}*/
		const blocks = [];

		const iterationStates = {
			/**@type {null|Block}*/
			currentBlock: null,
		};

		for(const line of lines)
		{
			if(line.content[0] !== "+")
			{
				/**@type {Block}*/
				const newBlock = {
					header: line,
					body: []
				}
				blocks.push(newBlock);
				iterationStates.currentBlock = newBlock;
				continue;
			}
			else
			{
				if(!iterationStates.currentBlock)
				{
					return new LifeScriptError(filename, "Blocks can't start with +", line.lineNumber);
				}
				iterationStates.currentBlock.body.push(line);
				continue;
			}
		}
		return blocks;
	}
	/**
	 * @param {"recurring.txt"|"calendar.txt"} filename used to find the file
	 * @returns {Block[]|LifeScriptError}
	 */
	fromFilename(filename)
	{
		const filepath = ROUTES.absolute_paths[filename];
		if(!fs.existsSync(filepath))
		{
			return new LifeScriptError(filename, `~/life/${filename} not exists, create it with touch`, 0);
		};
		const str = fs.readFileSync(filepath, "utf-8");
		return this.fromString(str, filename);
	}
}

module.exports = new BlocksParser();
