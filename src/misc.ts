import fs from "fs";
import path from "path";
import { RESTPostAPIApplicationCommandsJSONBody } from "discord.js";
import { Command } from "./models/Commands";
import { defaultExport } from "./models/types";

export async function getCommands(): Promise<RESTPostAPIApplicationCommandsJSONBody[]> {
	console.log("getting commands");
	const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
	const commandFiles = fs.readdirSync(path.resolve(__dirname, "./commands")).filter((file) => file.endsWith(".ts"));

	for (const file of commandFiles) {
		const command: defaultExport<Command> = await import(`./commands/${file}`);
		
		// check if the command and it's default export are set
		if (command == null || command.default == null) {
			continue;
		}

		// don't want dev-only commands for the production aka actual bot.
		if (!command.default.production && process.env.NODE_ENV === "production") {
			continue;
		}

		// don't want global commands as guild commands.
		if (command.default.global) {
			continue;
		}

		commands.push(command.default.data.toJSON());
	}

	return commands;
}