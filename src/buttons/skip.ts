import { useQueue } from "discord-player";
import { ButtonInteraction, CacheType } from "discord.js";

export default {
	id: "skipButton",
	execute: (interaction: ButtonInteraction<CacheType>) => skip(interaction),
};

async function skip(interaction: ButtonInteraction<CacheType>) {
	if (interaction.inCachedGuild()) {
		const queue = useQueue(interaction.guildId);
		queue?.node.skip();
		await interaction.update({ content: interaction.message.content, components: [] });
		await interaction.followUp("Skipped the track.");
	}
}
