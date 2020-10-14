import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import Client from '../../structures/Client';

export default class ResumeCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'resume',
            aliases: ['resume-song', 'continue', 'resumesong'],
            group: 'music',
            memberName: 'resumecmd',
            description: 'Resume the current paused song',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5,
            },
        });
    }
    public async run(msg: CommandoMessage): Promise<Message | Message[]> {
        const voiceChannel = msg.member!.voice.channel;
        if (!voiceChannel) {
            return msg.say(`${(this.client as Client).config.emojis.no}** Request denied, You must join the voice channel first**`);
        }
        const player = await (this.client as Client).lava.songs.get(msg.guild.id);
        if (!player) return msg.say('**There is no song playing right now!**');
        if (player.playing && voiceChannel.id !== player.channel) {
            return msg.say(`${(this.client as Client).config.emojis.no}** Request denied, You must join the same voice channel as me, on ${msg.guild.me.voice.channel.name}**`);
        }
        await player.resume();
        return msg.say(`▶ Resumed song: **[${player.queue.current.info.title}]**`);
    }
}
