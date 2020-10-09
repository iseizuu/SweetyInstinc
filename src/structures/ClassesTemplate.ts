import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

export default class RCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: '',
            aliases: [''],
            group: '',
            memberName: '',
            description: '',
            guarded: true,
            throttling: {
                usages: 1,
                duration: 5,
            },
            args: [
                {
                    key: 'command',
                    prompt: 'Which command would you like to view the help for?',
                    type: 'command',
                    default: '',
                },
            ],
        });
    }
    public async run(msg: CommandoMessage): Promise<any> {
        msg.say('a');
    }
}
