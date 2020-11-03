import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';
import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';

export default class PingCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'ping',
            aliases: ['pang', 'pong', 'peng'],
            group: 'util',
            memberName: 'pingcmd',
            description: 'Show bots latency',
            guarded: true,
            throttling: {
                usages: 1,
                duration: 5,
            },
        });
    }
    public async run(msg: CommandoMessage): Promise<Message | Message[]> {
        const pingMsg = await msg.channel.send('pinging.....');
        const embed = new MessageEmbed()
            .setColor(this.client.config.color)
            .setDescription(stripIndents`
        🏓 **Pong!** \`${(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)}ms.\`
        💖 **Heartbeat:** \`${this.client.ws.ping}ms\``);
        return pingMsg.edit(' ', embed);
    }
}
