import { useQueue } from "discord-player";
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder()
	.setName("skip")
	.setDescription("Skips the current track and plays the next one in queue if there is one.");

export default {
	data: command,
	execute: (interaction: ChatInputCommandInteraction<CacheType>) => skip(interaction),
	production: true,
	global: false,
};

async function skip(interaction: ChatInputCommandInteraction<CacheType>) {
	if (interaction.inCachedGuild()) {
		const queue = useQueue(interaction.guildId);
		queue?.node.skip();
		interaction.reply("Skipped the track.");
	}
}
