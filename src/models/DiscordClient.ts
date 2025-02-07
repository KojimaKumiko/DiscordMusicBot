import { Client, Collection } from "discord.js";
import { Command } from "./Commands";
import { Buttons } from "./Buttons";

export class DiscordClient extends Client {
	commands: Collection<string, Command> | undefined;
	buttons: Collection<string, Buttons> | undefined;
}