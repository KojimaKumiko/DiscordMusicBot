import fs from "fs";
import { CacheType, ChatInputCommandInteraction, Collection, Events, GatewayIntentBits, REST, Routes } from "discord.js";
import { GuildQueueEvent, Player } from "discord-player";
import path from "path";
import { DiscordClient } from "./models/DiscordClient";
import { defaultExport } from "./models/types";
import { Command } from "./models/Commands";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { getCommands } from "./misc";

const client = new DiscordClient({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages],
});

const player = new Player(client, {
	skipFFmpeg: false,
});

player.on("debug", console.log);
player.events.on("debug", (queue, message) => console.log(`[DEBUG] ${queue.guild.id} ${message}`));

player.extractors.register(YoutubeiExtractor, {
	// authentication: process.env.YOUTUBE_AUTH_STRING,
	streamOptions: {
		// useClient: "WEB",
		highWaterMark: 1 * 1024 * 1024,
	},
	// overrideBridgeMode: "yt"
});

player.extractors.loadDefault((ext) => !["YouTubeExtractor"].includes(ext));

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();

const commandFiles = fs.readdirSync(path.resolve(__dirname, "./commands")).filter((file) => file.endsWith(".ts"));

commandFiles.forEach(async (file) => {
	const command: defaultExport<Command> = await import(`./commands/${file}`);
	if (command == null || command.default == null) {
		return;
	}

	if (!command.default.production && process.env.NODE_ENV === "production") {
		return;
	}

	client.commands!.set(command.default.data.name, command.default);
});

// const eventFiles = fs.readdirSync("./events").filter((file) => file.endsWith(".ts"));
// eventFiles.forEach(async (file) => {
// 	const event: defaultExport<DiscordEvent> = await import(`./events/${file}`);
// 	if (event.default.once) {
// 		client.once(event.default.name, event.default.execute);
// 	} else {
// 		client.on(event.default.name, event.default.execute);
// 	}
// });

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand() || interaction.user.bot) {
		return;
	}

	const client = interaction.client as DiscordClient;
	const command = client.commands!.get(interaction.commandName);

	if (!command) {
		return;
	}

	console.log(`Executing Command: ${interaction.commandName}`);

	try {
		await command.execute(interaction);
	} catch (e) {
		console.error(`Command: ${interaction.commandName}\nError: ${e}`);
		// if (e.errors) {
		// 	console.error(e.errors);
		// }
		const errorMessage =
			"Es gab einen Fehler beim ausführen des Befehls. Bitte versuch den Befehl später erneut auszuführen. Falls das Problem weiterhin bestehen bleiben sollte, melde dich bei Koji";
		if (interaction.deferred) {
			await interaction.editReply({ content: errorMessage });
		} else {
			await interaction.reply({ content: errorMessage, ephemeral: true });
		}
	}
});

client.on(Events.GuildCreate, async (guild) => {
	console.log(`GuildCreate event fired of for: ${guild.name}; with id: ${guild.id}`);
	const commands = await getCommands();

	const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

	const clientId = process.env.CLIENT_ID!;

	const applicationCommands = Routes.applicationGuildCommands(clientId, guild.id);

	try {
		console.log("Trying to register guild application commands");
		await rest.put(applicationCommands, { body: commands });
		console.log("Successfully registered guild application commands.")
	} catch (e) {
		console.error(e);
	}
});

player.events.on(GuildQueueEvent.PlayerStart, (queue, track) => {
	let metadata: ChatInputCommandInteraction<CacheType> = queue.metadata;
	let channel = metadata.channel;
	if (channel?.isSendable()) {
		channel.send(`Started playing **${track.url}**!`);
	}
});

client.login(process.env.DISCORD_TOKEN);
