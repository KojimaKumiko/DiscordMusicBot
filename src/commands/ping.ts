import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("Replies with Pong!");

export default {
	data: command,
	execute: (interaction: ChatInputCommandInteraction<CacheType>): Promise<void> => pong(interaction),
	production: false,
	global: false
};

async function pong(interaction: ChatInputCommandInteraction<CacheType>) {
	await interaction.reply("Pong!");
}