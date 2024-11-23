import { useQueue } from "discord-player";
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder()
	.setName("stop")
	.setDescription("Deletes the queue and stops the bot from playing anymore music");

export default {
	data: command,
	execute: (interaction: ChatInputCommandInteraction<CacheType>) => stop(interaction),
	production: true,
	global: false,
};

async function stop(interaction: ChatInputCommandInteraction<CacheType>) {
	if (interaction.inCachedGuild()) {
		const queue = useQueue(interaction.guildId);
		queue?.delete();
		interaction.reply("Deleted the queue and stopped playing.");
	}
}
