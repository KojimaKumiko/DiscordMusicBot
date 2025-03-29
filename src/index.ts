import fs from "fs";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CacheType,
	ChatInputCommandInteraction,
	Collection,
	Events,
	GatewayIntentBits,
	REST,
	Routes,
} from "discord.js";
import { GuildQueueEvent, Player } from "discord-player";
import path from "path";
import { DiscordClient } from "./models/DiscordClient";
import { defaultExport } from "./models/types";
import { Command } from "./models/Commands";
import { YoutubeiExtractor } from "discord-player-youtubei";
import { getCommands } from "./misc";
import { Buttons } from "./models/Buttons";

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
		useClient: "WEB",
		highWaterMark: 1 * 1024 * 1024,
	},
	// overrideBridgeMode: "yt"
	// useServerAbrStream: true,
	generateWithPoToken: true,
});

player.extractors.loadDefault((ext) => !["YouTubeExtractor"].includes(ext));

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.commands = new Collection();
client.buttons = new Collection();

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

const buttonFiles = fs.readdirSync(path.resolve(__dirname, "./buttons")).filter((file) => file.endsWith(".ts"));

buttonFiles.forEach(async (file) => {
	const buttonData: defaultExport<Buttons> = await import(`./buttons/${file}`);
	if (buttonData == null || buttonData.default == null) {
		return;
	}

	client.buttons!.set(buttonData.default.id, buttonData.default);
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
	if (interaction.user.bot) {
		return;
	}

	const client = interaction.client as DiscordClient;

	if (interaction.isChatInputCommand()) {
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
	} else if (interaction.isButton()) {
		const buttonData = client.buttons!.get(interaction.customId);

		if (!buttonData) {
			return;
		}

		console.log(`Executing Button: ${interaction.customId}`);

		try {
			await buttonData.execute(interaction);
		} catch (e) {
			console.error(`Command: ${interaction.customId}\nError: ${e}`);
			const errorMessage =
				"Es gab einen Fehler beim ausführen des Befehls. Bitte versuch den Befehl später erneut auszuführen. Falls das Problem weiterhin bestehen bleiben sollte, melde dich bei Koji";
			if (interaction.deferred) {
				await interaction.editReply({ content: errorMessage });
			} else {
				await interaction.reply({ content: errorMessage, ephemeral: true });
			}
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
		console.log("Successfully registered guild application commands.");
	} catch (e) {
		console.error(e);
	}
});

player.events.on(GuildQueueEvent.PlayerStart, (queue, track) => {
	let metadata: ChatInputCommandInteraction<CacheType> = queue.metadata;
	let channel = metadata.channel;
	if (channel?.isSendable()) {
		const pauseButton = new ButtonBuilder()
			.setCustomId("pauseButton")
			.setLabel("Play/Pause")
			.setEmoji("⏯")
			.setStyle(ButtonStyle.Primary);
		const stopButton = new ButtonBuilder()
			.setCustomId("stopButton")
			.setLabel("Stop")
			.setEmoji("⏹")
			.setStyle(ButtonStyle.Primary);
		const skipButton = new ButtonBuilder()
			.setCustomId("skipButton")
			.setLabel("Skip")
			.setEmoji("⏩")
			.setStyle(ButtonStyle.Primary);

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(pauseButton, stopButton, skipButton);

		channel.send({ content: `▶ Started playing **${track.url}**!`, components: [row] });
	}
});

client.login(process.env.DISCORD_TOKEN);
