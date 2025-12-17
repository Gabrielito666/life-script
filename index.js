const diagnostic = require("./lib/diagnostic");
const addCalendarDays = require("./lib/add-calendar-days");
const archiveCalendar = require("./lib/archive-calendar");
const pushRecurring = require("./lib/push-recurring");
const fs = require("fs");

const main = async() =>
{
	if(!fs.existsSync(process.env.LIFE_DIR))
	{
		return diagnostic.logCommandError("~/life dir not exists, create it with mkdir");
	}
	if(process.argv[2] === "diagnostic")
	{
		
		if(process.argv.length !== 3) return diagnostic.logCommandError("This command does not require any arguments.");
		return diagnostic.printErrorOrCongratulations(diagnostic());
	}
	if(process.argv[2] === "add-calendar-days")
	{
		const numberOfDays = +process.argv[3];
		if(typeof numberOfDays !== "number" || Number.isNaN(numberOfDays) || process.argv.length > 4)
		{
			return diagnostic.logCommandError("The “add-calendar-days” command can only receive a numeric argument.");
		}
		return diagnostic.printErrorIfIsError(await addCalendarDays(numberOfDays));
	}
	if(process.argv[2] === "archive-calendar")
	{
		if(process.argv.length !== 3) return diagnostic.logCommandError("This command does not require any arguments.");
		return diagnostic.printErrorIfIsError(await archiveCalendar());
	}
	if(process.argv[2] === "push-recurring")
	{
		
		if(process.argv.length !== 3) return diagnostic.logCommandError("This command does not require any arguments.");
		return diagnostic.printErrorIfIsError(await pushRecurring());
	}
};

main();
