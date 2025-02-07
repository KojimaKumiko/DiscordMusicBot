import { ButtonInteraction, CacheType } from "discord.js";

export interface Buttons {
	id: string,
	execute: (interaction: ButtonInteraction<CacheType>) => Promise<void>,
}