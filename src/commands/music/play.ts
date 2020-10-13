import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

export default class PlayCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'play',
            aliases: ['p'],
            group: 'music',
            memberName: 'play',
            description: 'Playing any songs',
            guarded: true,
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
            return msg.say('you must join in voice channel first');
        }
        (this.client as any).lava._play(msg, args.query);
    }
}
