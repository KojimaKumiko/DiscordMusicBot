import { useQueue } from "discord-player";
import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder()
	.setName("pause")
	.setDescription("Pauses/Unpauses the current track that is playing.");

export default {
	data: command,
	execute: (interaction: ChatInputCommandInteraction<CacheType>) => pause(interaction),
	production: true,
	global: false,
};

async function pause(interaction: ChatInputCommandInteraction<CacheType>) {
	if (interaction.inCachedGuild()) {
		const queue = useQueue(interaction.guildId);
		const isPaused = queue?.node.isPaused();
		queue?.node.setPaused(!isPaused);
		const reply = isPaused ? "Unpaused the player." : "Paused the player.";
		interaction.reply(reply);
	}
}
