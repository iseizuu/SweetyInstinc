import { Message } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export default class SkipCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: "skip",
            aliases: ["stop", "stp"],
            group: "music",
            memberName: "skipcmd",
            description: "Skip the current song",
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5
            }
        });
    }

    public async run(msg: CommandoMessage): Promise<Message|Message[]> {
        const voiceChannel = msg.member.voice.channel;
        if (!voiceChannel) {
            return msg.say(`${this.client.config.emojis.no}** Request denied, You must join the voice channel first**`);
        }
        const player = await this.client.lava.songs.get(msg.guild.id);
        if (!player) return msg.say("**There is no song playing right now!**");
        if (player.playing && voiceChannel.id !== player.channel) {
            return msg.say(`${this.client.config.emojis.no}** Request denied, You must join the same voice channel as me, on ${msg.guild.me.voice.channel.name}**`);
        }
        await player.stop();
        return msg.say(`⏹ Skipped the current song: **[${player.queue.current.info.title}]**`);
    }
}
