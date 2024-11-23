import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const command = new SlashCommandBuilder().setName("user").setDescription("Provides information about the user.");

export default {
	data: command,
	execute: (interaction: ChatInputCommandInteraction<CacheType>): Promise<void> => user(interaction),
	production: false,
	global: false
};

async function user(interaction: ChatInputCommandInteraction<CacheType>) {
	// const member = await interaction.guild.members.fetch(interaction.user);
	// await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}\nYour nickname: ${member.nickname}`);
	if (interaction.inCachedGuild()) {
		await interaction.reply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
	}
}