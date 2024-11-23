export interface DiscordEvent {
	name: string,
	once: boolean,
	execute: (interaction?: unknown) => Promise<void>,
}