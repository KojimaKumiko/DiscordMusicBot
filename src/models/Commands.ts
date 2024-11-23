import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from "discord.js";

export interface Command {
	data: SlashCommandBuilder,
	execute: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>,
	production: boolean,
	global: boolean,
}