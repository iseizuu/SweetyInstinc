import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

export default class HelpCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'help',
            aliases: ['h', 'commands'],
            group: 'util',
            memberName: 'helpcmd',
            description: 'Show all commands list',
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
    public async run(msg: CommandoMessage, { command }: any): Promise<Message| Message[]> {
        if (!command) {
            const embed = new MessageEmbed()
                .setAuthor(this.client.user.username, this.client.user.avatarURL())
                .setColor(this.client.config.color);
            let cmdCount = 0;
            for (const group of this.client.registry.groups.values()) {
                const owner = this.client.isOwner(msg.author);
                const commands = group.commands.filter((cmd) => {
                    if (owner) return true;
                    if (cmd.ownerOnly || cmd.hidden) return false;
                    return true;
                });
                if (!commands.size) continue;
                cmdCount += commands.size;
                embed.addField(`》 ${group.name}`, commands.map((cmd) => `\`${cmd.name}\``).join(', '));
            }
            if (cmdCount === this.client.registry.commands.size) {
                embed.setFooter(`${this.client.registry.commands.size} Commands`);
            }
            else {
                embed.setFooter(`© VeguiIzumi | ${msg.author.tag} ${cmdCount} Commands for you`);
            }
            return msg.say(embed);
        }
        const embad = new MessageEmbed()
            .setTitle(`Command **${command.name}** ${command.guildOnly ? '  (Usable only in servers)' : ''}`)
            .setColor(this.client.config.color)
            .setFooter('© VeguiIzumi | ' + msg.author.tag, msg.author.displayAvatarURL())
            .setDescription(stripIndents`
                》**Description:** ${command.description}${command.details ? `${command.details}` : ''}
                》**Aliases:** ${command.aliases.join(', ') || 'None'}
                》**Format:** ${msg.anyUsage(`${command.name} ${command.format || ''}`)}
                》**Example:** ${command.examples ? command.examples : 'None'}
                》**Group:** ${command.group.name} (\`${command.groupID}:${command.memberName}\`)
                》**NSFW:** ${command.nsfw ? 'Yes' : 'No'}`)
            .setTimestamp();
        return msg.say(embad);
    }
}
