import { useQueue } from "discord-player";
import { ButtonInteraction, CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
	id: "pauseButton",
	execute: (interaction: ButtonInteraction<CacheType>) => pause(interaction),
};

async function pause(interaction: ButtonInteraction<CacheType>) {
	if (interaction.inCachedGuild()) {
		const queue = useQueue(interaction.guildId);
		const isPaused = queue?.node.isPaused();
		queue?.node.setPaused(!isPaused);

		let content = interaction.message.content;

		if (!isPaused) {
			content = content.replace("▶", "⏸");
		} else {
			content = content.replace("⏸", "▶");
		}

		await interaction.update(content);
	}
}
