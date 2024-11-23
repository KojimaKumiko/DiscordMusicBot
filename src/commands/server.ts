import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder()
	.setName("server")
	.setDescription("Replies with server info!");

export default {
	data: command,
	execute: (interaction: ChatInputCommandInteraction<CacheType>): Promise<void> => server(interaction),
	production: false,
	global: false,
};

async function server(interaction: ChatInputCommandInteraction<CacheType>) {
	if (interaction.inCachedGuild()) {
		await interaction.reply(
			`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`
		);
	}
}
