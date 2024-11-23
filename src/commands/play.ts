import { QueryType, useMainPlayer, useQueue } from "discord-player";
import { CacheType, ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder()
	.setName("play")
	.setDescription("Plays a song.")
	.addStringOption((option) => option.setName("query").setDescription("query...").setRequired(true));

export default {
	data: command,
	execute: (interaction: ChatInputCommandInteraction<CacheType>) => play(interaction),
	production: false,
	global: false,
};

async function play(interaction: ChatInputCommandInteraction<CacheType>) {
	if (interaction.inCachedGuild()) {
		const player = useMainPlayer();
		const channel = interaction.member.voice.channel;
		if (!channel) {
			return interaction.reply("You are not connected to a voice channel!");
		}

		const query = interaction.options.getString("query", true);
		await interaction.deferReply();

		try {
			const results = await player.search(query, { searchEngine: QueryType.AUTO });
			console.log(results.hasTracks());
			const { track } = await player.play(channel, results, {
				nodeOptions: {
					metadata: interaction,
					volume: 50,
					bufferingTimeout: 15000,
					leaveOnStop: true,
					leaveOnStopCooldown: 0,
					leaveOnEnd: true,
					leaveOnEndCooldown: 15000,
					leaveOnEmpty: true,
					leaveOnEmptyCooldown: 300000,
				},
			});

			return interaction.followUp(`**${track.title}** enqueued!`);
		} catch (e) {
			return interaction.followUp(`Something went wrong: ${e}`);
		}
	}
}