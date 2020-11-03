import { Message } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

export default class VolumeCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'volume',
            aliases: ['vol'],
            group: 'music',
            memberName: 'volumecmd',
            description: 'Set volume of the current track',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5,
            },
            args: [
                {
                    key: 'volumeNum',
                    prompt: 'What volume would you like to set? from 1 to 200',
                    type: 'integer',
                },
            ],
        });
    }
    public async run(msg: CommandoMessage, args: {volumeNum: number}): Promise<Message | Message[]> {
        const voiceChannel = msg.member!.voice.channel;
        if (!voiceChannel) {
            return msg.say(`${this.client.config.emojis.no}** Request denied, You must join the voice channel first**`);
        }
        const player = await this.client.lava.songs.get(msg.guild.id);
        if (!player) return msg.say('**There is no song playing right now!**');
        if (player.playing && voiceChannel.id !== player.channel) {
            return msg.say(`${this.client.config.emojis.no}** Request denied, You must join the same voice channel as me, on ${msg.guild.me.voice.channel.name}**`);
        }
        else if (args.volumeNum < 1 || args.volumeNum > 200) {
            return msg.say('**You put invalid number.\nVolume number must be** \`1 - 200\`');
        }
        await player.setVolume(args.volumeNum);
        return msg.say(`${this.client.config.emojis.yes} **Set volume to** \`${args.volumeNum}\``);
    }
}
