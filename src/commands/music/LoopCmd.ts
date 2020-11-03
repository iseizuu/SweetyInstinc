import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

const options = ['track', 'queue', 'off'];

export default class LoopCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'loop',
            aliases: ['repeat'],
            group: 'music',
            memberName: 'loopcmd',
            description: 'Loop the current track or queue',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5,
            },
            args: [
                {
                    key: 'type',
                    prompt: 'Choose the type `track, queue, off`',
                    type: 'string',
                    oneOf: options,
                },
            ],
        });
    }
    public async run(msg: CommandoMessage, args: {type: string}): Promise<Message | Message[]> {
        const voiceChannel = msg.member!.voice.channel;
        if (!voiceChannel) {
            return msg.say(`${this.client.config.emojis.no}** Request denied, You must join the voice channel first**`);
        }
        const player = await this.client.lava.songs.get(msg.guild.id);
        if (!player) return msg.say('**There is no song playing right now!**');
        if (player.playing && voiceChannel.id !== player.channel) {
            return msg.say(`${this.client.config.emojis.no}** Request denied, You must join the same voice channel as me, on ${msg.guild.me.voice.channel.name}**`);
        }
        if (!player.queue.tracks.length && args.type === options[1]) {
            return msg.say(`${this.client.config.emojis.no}** Request denied, Not enough queue, please add more songs**`);
        }
        if (args.type === options[0]) {
            player.queue.loop.track = true; player.queue.loop.queue = false;
            return msg.say(this.client.config.emojis.yes + ' **Track is looping now**');
        }
        else if (args.type === options[1]) {
            player.queue.loop.queue = true; player.queue.loop.track = false;
            return msg.say(this.client.config.emojis.yes + ' **Looping the songs queue**');
        }
        player.queue.loop.queue = false; player.queue.loop.track = false;
        return msg.say(`${this.client.config.emojis.yes} **Looping is disabled**`);
    }
}
