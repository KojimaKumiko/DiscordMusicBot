import { REST, Routes } from "discord.js";
import { getCommands } from "./misc";

(async (): Promise<void> => {
	const commands = await getCommands();

	const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

	const clientId = process.env.CLIENT_ID!;
	const guildId = process.env.GUILD_ID!;

	const applicationCommands = Routes.applicationGuildCommands(clientId, guildId);

	try {
		console.log("Deleting all prior guild application commands.");
		await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
		console.log("Successfully deleted all guild commands.");

		console.log("Trying to register guild application commands");
		await rest.put(applicationCommands, { body: commands });
		console.log("Successfully registered guild application commands.");
	} catch (e) {
		console.error(e);
	}
})();
