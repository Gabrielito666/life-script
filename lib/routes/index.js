const path = require("path");
/**@constant*/
const ROUTES = {
	filenames:
	{
		/**@constant @readonly*/
		calendar: "calendar.txt",
		/**@constant @readonly*/
		recurring: "recurring.txt",
		/**@constant @readonly*/
		archive: ".calendar-archive.txt"
	},
	absolute_paths:
	{	
		/**@constant @readonly*/
		"calendar.txt": path.resolve(process.env.LIFE_DIR, "calendar.txt"),
		/**@constant @readonly*/
		"recurring.txt": path.resolve(process.env.LIFE_DIR, "recurring.txt"),
		/**@constant @readonly*/
		".calendar-archive.txt": path.resolve(process.env.LIFE_DIR, ".calendar-archive.txt")
		/**@constant @readonly*/
	}
};

module.exports = ROUTES;
