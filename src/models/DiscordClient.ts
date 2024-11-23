import { Client, Collection } from "discord.js";
import { Command } from "./Commands";

export class DiscordClient extends Client {
	commands: Collection<string, Command> | undefined;
}