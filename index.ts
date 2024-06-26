import { join } from "path";
import { readdirSync } from "fs";
import { DisTube } from "distube";
import { FilePlugin } from "@distube/file";
import { YouTubePlugin } from "@distube/youtube";
import { SpotifyPlugin } from "@distube/spotify";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { Awaitable, DisTubeEvents } from "distube";
import type {
  ChatInputCommandInteraction,
  ClientEvents,
  ClientOptions,
  ContextMenuCommandBuilder,
  EmbedBuilder,
  GuildTextBasedChannel,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import SoundCloudPlugin from "@distube/soundcloud";
import DeezerPlugin from "@distube/deezer";
import { DirectLinkPlugin } from "@distube/direct-link";

export const followUp = async (
  interaction: ChatInputCommandInteraction,
  embed: EmbedBuilder,
  textChannel: GuildTextBasedChannel,
) => {
  // Follow up interaction if created time is less than 15 minutes
  if (Date.now() - interaction.createdTimestamp < 15 * 60 * 1000) {
    await interaction.followUp({ embeds: [embed] });
  } else {
    await textChannel.send({ embeds: [embed] });
  }
};

class DisTubeClient extends Client<true> {
  distube = new DisTube(this, {
    plugins: [
      new YouTubePlugin(),
      new SoundCloudPlugin(),
      new SpotifyPlugin(),
      new DeezerPlugin(),
      new DirectLinkPlugin(),
      new FilePlugin(),
    ],
    emitAddListWhenCreatingQueue: true,
    emitAddSongWhenCreatingQueue: true,
  });
  commands = new Collection<string, Command>();

  constructor(options: ClientOptions) {
    super(options);

    readdirSync(join(__dirname, "events", "client")).forEach(this.loadEvent.bind(this));
    readdirSync(join(__dirname, "events", "distube")).forEach(this.loadDisTubeEvent.bind(this));
    readdirSync(join(__dirname, "commands")).forEach(this.loadCommand.bind(this));
  }
  async loadCommand(name: string) {
    try {
      const CMD = await import(`./commands/${name}`);
      const cmd: Command = new CMD.default(this);
      this.commands.set(cmd.name, cmd);
      console.log(`Loaded command: ${cmd.name}.`);
      return false;
    } catch (err: any) {
      const e = `Unable to load command ${name}: ${err.stack || err}`;
      console.error(e);
      return e;
    }
  }
  async loadEvent(name: string) {
    try {
      const E = await import(`./events/client/${name}`);
      const event = new E.default(this);
      const fn = event.run.bind(event);
      this.on(event.name, fn);
      console.log(`Listened client event: ${event.name}.`);
      return false;
    } catch (err: any) {
      const e = `Unable to listen "${name}" event: ${err.stack || err}`;
      console.error(e);
      return e;
    }
  }

  async loadDisTubeEvent(name: string) {
    try {
      const E = await import(`./events/distube/${name}`);
      const event = new E.default(this);
      const fn = event.run.bind(event);
      this.distube.on(event.name, fn);
      console.log(`Listened DisTube event: ${event.name}.`);
      return false;
    } catch (err: any) {
      const e = `Unable to listen "${name}" event: ${err.stack || err}`;
      console.error(e);
      return e;
    }
  }
}

const client = new DisTubeClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
});

client.login("TOKEN");

export interface Metadata {
  interaction: ChatInputCommandInteraction<"cached">;
  // Example for strict typing
}

export abstract class Command {
  abstract readonly name: string;
  abstract readonly slashBuilder:
    | SlashCommandBuilder
    | ContextMenuCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | SlashCommandOptionsOnlyBuilder;
  readonly client: DisTubeClient;
  readonly inVoiceChannel: boolean = false;
  readonly playing: boolean = false;
  constructor(client: DisTubeClient) {
    this.client = client;
  }
  get distube() {
    return this.client.distube;
  }
  abstract onChatInput(interaction: ChatInputCommandInteraction<"cached">): Awaitable<any>;
}

export abstract class ClientEvent<T extends keyof ClientEvents> {
  client: DisTubeClient;
  abstract readonly name: T;
  constructor(client: DisTubeClient) {
    this.client = client;
  }

  get distube() {
    return this.client.distube;
  }

  abstract run(...args: ClientEvents[T]): Awaitable<any>;

  async execute(...args: ClientEvents[T]) {
    try {
      await this.run(...args);
    } catch (err) {
      console.error(err);
    }
  }
}

export abstract class DisTubeEvent<T extends keyof DisTubeEvents> {
  client: DisTubeClient;
  abstract readonly name: T;
  constructor(client: DisTubeClient) {
    this.client = client;
  }

  get distube() {
    return this.client.distube;
  }

  abstract run(...args: DisTubeEvents[T]): Awaitable<any>;

  async execute(...args: DisTubeEvents[T]) {
    try {
      await this.run(...args);
    } catch (err) {
      console.error(err);
    }
  }
}
