import { useQueue } from "discord-player";
import { ButtonInteraction, CacheType } from "discord.js";

export default {
	id: "stopButton",
	execute: (interaction: ButtonInteraction<CacheType>) => stop(interaction),
};

async function stop(interaction: ButtonInteraction<CacheType>) {
	if (interaction.inCachedGuild()) {
		const queue = useQueue(interaction.guildId);
		queue?.delete();
		await interaction.update({ content: interaction.message.content, components: [] });
		await interaction.followUp("Deleted the queue and stopped playing.");
	}
}
