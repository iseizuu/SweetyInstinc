import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import util from '../../structures/Utilities';

export default class SeekCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'seek',
            group: 'music',
            memberName: 'seekcmd',
            description: 'Seek curruent song duration',
            format: '02:00',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5,
            },
            args: [
                {
                    key: 'number',
                    prompt: 'What the title of the song do you want to play?',
                    type: 'string',
                    default: '',
                },
            ],
        });
    }
    public async run(msg: CommandoMessage, args: { number: string}): Promise<Message | Message[]> {
        if (!args.number) {
            return msg.embed({
                title: 'Example Usage',
                color: this.client.config.color,
                fields: [
                    {
                        name: 'Example',
                        value: '`seek 00 00` or `seek 02 00`',
                        inline: true,
                    },
                ],
            });
        }
        const dur = args.number.toString().split(' ');
        const channel = msg.member!.voice.channel;
        if (!channel) {
            return msg.say(`${this.client.config.emojis.no}** Request denied, You must join the voice channel first**`);
        }
        const player = await this.client.lava.songs.get(msg.guild.id);
        if (!player) return msg.say('**There is no song playing right now!**');
        if (player.playing && msg.author.id !== player.queue.current.user.id) {
            return msg.say(`${this.client.config.emojis.no}** Request denied, Only song requester \`(${player.queue.current.user.tag})\` can seek this current song**`);
        }
        const parse = (parseInt(dur[0], 10) * 60000) + ((parseInt(dur[1], 10) % 60000) * 1000);
        if (util.parseDuration(parse).replace(/:/g, '') > util.parseDuration(player.queue.current.info.length).replace(/:/g, '')) {
            return msg.say(`${this.client.config.emojis.no} **Duration is too big, or maybe you put an invalid args**`);
        }
        player.seek(parse);
        return msg.say(`${this.client.config.emojis.yes} **Seek to [\`${util.parseDuration(parse)}\`]**`);
    }
}

