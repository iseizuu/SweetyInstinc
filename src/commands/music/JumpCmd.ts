import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import Client from '../../structures/Client';

export default class JumpCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'jump',
            aliases: ['skipto'],
            group: 'music',
            memberName: 'jumpcmd',
            description: 'Skip to a specific song in the queue, provide the song number as an argument',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5,
            },
            args: [
                {
                    key: 'number',
                    prompt: 'What the number of the song do you want to jump',
                    type: 'integer',
                },
            ],
        });
    }
    public async run(msg: CommandoMessage, args: { number: number}): Promise<Message | Message[]> {
        const voiceChannel = msg.member!.voice.channel;
        if (!voiceChannel) {
            return msg.say(`${(this.client as Client).config.emojis.no}** Request denied, You must join the voice channel first**`);
        }
        const player = await (this.client as Client).lava.songs.get(msg.guild.id);
        if (!player) return msg.say('**There is no song playing right now!**');
        if (player.playing && voiceChannel.id !== player.channel) {
            return msg.say(`${(this.client as Client).config.emojis.no}** Request denied, You must join the same voice channel as me, on ${msg.guild.me.voice.channel.name}**`);
        }
        if (args.number >= player.queue.tracks.length + 1) {
            return msg.say(`${(this.client as Client).config.emojis.no}** Request denied, Please enter a valid song number**`);
        }
        player.queue.tracks.splice(0, args.number - 1);
        player.stop();
    }
}
