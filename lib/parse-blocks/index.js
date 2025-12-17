const fs = require("fs");
const path = require("path");
const LifeScriptError = require("../life-script-error");
const ROUTES = require("../routes");

/**
 * @typedef {{ lineNumber: number; content: string }} BlockLine
 * @typedef {{ header: BlockLine; body: BlockLine[] }} Block
 * @typedef {import("../life-script-error")} LifeScriptError
 */

/**
 * Convert a recurring.md or calendar.md string in a Block array
 * @param {string} str the block string
 * @returns {Block[]|LifeScriptError}
 */
const parseBlocks = filename =>
{
	const filepath = ROUTES.absolute_paths[filename];
	if(!fs.existsSync(filepath))
	{
		return new LifeScriptError(filename, 0, `~/life/${filename} not exists, create it with touch`);
	};
	const str = fs.readFileSync(filepath, "utf-8");

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
				return new LifeScriptError(filename, line.lineNumber, "Blocks can't start with +");
			}
			iterationStates.currentBlock.body.push(line);
			continue;
		}
	}
	return blocks;
}

module.exports = parseBlocks;
