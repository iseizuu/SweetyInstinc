import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import Client from '../../structures/Client';

export default class PlayCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'play',
            aliases: ['p', 'music'],
            group: 'music',
            memberName: 'playcmd',
            description: 'Play any song or playlist from youtube or soundcloud',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5,
            },
            args: [
                {
                    key: 'query',
                    prompt: 'what the title of the song do you want to play?',
                    type: 'string',
                },
            ],
        });
    }
    public async run(msg: CommandoMessage, args: { query: string}): Promise<any> {
        const channel = msg.member!.voice.channel;
        if (!channel) {
            return msg.say(`${(this.client as Client).config.emojis.no}** Request denied, You must join the voice channel first**`);
        }
        (this.client as Client).lava._play(msg, args.query);
    }
}
