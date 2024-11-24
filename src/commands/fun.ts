import { useQueue } from "discord-player";
import { CacheType, ChatInputCommandInteraction, REST, Routes, SlashCommandBuilder } from "discord.js";
import { getCommands } from "../misc";

const command = new SlashCommandBuilder()
	.setName("fun")
	.setDescription("Some fun commands")
	.addSubcommand((sub) =>
		sub
			.setName("refresh")
			.setDescription("Refresh the commands")
			.addStringOption((option) =>
				option.setName("guildid").setDescription("The guild id to refresh the commands for").setRequired(true)
			)
	)
	.addSubcommand((sub) =>
		sub
			.setName("status")
			.setDescription("Set the status of the bot")
			.addStringOption((option) => option.setName("text").setDescription("The status text"))
	);

export default {
	data: command,
	execute: (interaction: ChatInputCommandInteraction<CacheType>) => fun(interaction),
	production: true,
	global: false,
};

async function fun(interaction: ChatInputCommandInteraction<CacheType>) {
	if (interaction.inCachedGuild()) {
		const subCommand = interaction.options.getSubcommand();

		switch (subCommand) {
			case "refresh":
				await refrehCommands(interaction);
				break;
			case "status":
				await setStatus(interaction);
				break;
		}
	}
}

async function refrehCommands(interaction: ChatInputCommandInteraction<CacheType>) {
	const guildId = interaction.options.getString("guildId", true);
	const commands = await getCommands();

	const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

	const clientId = process.env.CLIENT_ID!;

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
}

async function setStatus(interaction: ChatInputCommandInteraction<CacheType>) {
	const statusText = interaction.options.getString("text", true);
	interaction.client.user.setPresence({ activities: [{ name: statusText }] });
	await interaction.reply("Updated the status of the bot!");
}
