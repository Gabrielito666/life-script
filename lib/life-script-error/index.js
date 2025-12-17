const LifeScriptError = class
{
	/**
	 * @param {"calendar.md"|"recurring.md"} filename
	 * @param {number} lineNumber
	 * @param {string} description
	 */
	constructor(filename, lineNumber, description)
	{
		/**@readonly @const*/
		this.filename = filename;
		/**@readonly @const*/
		this.lineNumber = lineNumber;
		/**@readonly @const*/
		this.description = description;
	}
}

module.exports = LifeScriptError;
