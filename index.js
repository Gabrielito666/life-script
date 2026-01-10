const Program = require("./lib/program");
const DiagnosticCommand = require("./lib/commands/diagnostic");
const AddCalendarDaysCommand = require("./lib/commands/add-calendar-days");
const ArchiveCalendarCommand = require("./lib/commands/archive-calendar");
const PushRecurringCommand = require("./lib/commands/push-recurring");

const program = new Program(
	new DiagnosticCommand(),
	new AddCalendarDaysCommand(),
	new ArchiveCalendarCommand(),
	new PushRecurringCommand()
);

program.run();
