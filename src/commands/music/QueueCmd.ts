import { stripIndent } from 'common-tags';
import { Message, MessageEmbed, MessageReaction, User } from 'discord.js';
import { Command, CommandoClient, CommandoMessage } from 'discord.js-commando';

export default class QueueCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'queue',
            aliases: ['q', 'musiclist'],
            group: 'music',
            memberName: 'queuecmd',
            description: 'Show all queue tracks list',
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5,
            },
        });
    }
    public async run(msg: CommandoMessage): Promise<Message | Message[]> {
        const player = await this.client.lava.songs.get(msg.guild.id);
        if (!player) return msg.say('**There is no song playing right now!**');
        const queue = player.queue.tracks
            .map((x: { info: { title: string; uri: string; }; }, y: number) => stripIndent`
            **${y + 1} - [${x.info.title}](${x.info.uri})**`);
        if (!queue.length) {
            return msg.embed({
                title: `${this.client.config.emojis.no} There is no queue`,
                color: this.client.config.color,
                description: `**Current Track [${player.queue.current.info.title}](${player.queue.current.info.uri}) [${player.queue.current.duration}]**`,
            });
        }
        const list = this.arr(queue, 10);
        const emoji = ['◀', '▶'];
        let index = 0;
        const embed = new MessageEmbed()
            .setTitle(`🎵 Queue - ${queue.length} Songs`)
            .setColor(this.client.config.color)
            .setDescription(list[index].join('\n'))
            .setFooter(`Page: ${index + 1}/${list.length}`);
        const msgg = await msg.channel.send(embed);
        if (queue.length < 10) return;
        for (const r of emoji) {
            await msgg.react(r);
        }
        const filter = (reaction: MessageReaction, user: User) => {
            return reaction.emoji.name === emoji[0] || reaction.emoji.name === emoji[1] && user.id === msg.author.id;
        };
        const react = await msgg.createReactionCollector(filter, {
            time: 3e4,
        });

        react.on('collect', (e: MessageReaction) => {
            const collect = e.emoji.name;
            if (collect === emoji[0]) {
                index--;
                msgg.reactions.resolve(emoji[0]).users.remove(msg.author);
            }
            if (collect === emoji[1]) {
                index++;
                msgg.reactions.resolve(emoji[1]).users.remove(msg.author);
            }
            index = ((index % list.length) + list.length) % list.length;
            msgg.edit({
                embed: {
                    title: `🎵 Queue - ${queue.length} Songs`,
                    color: this.client.config.color,
                    description: list[index].join('\n'),
                    footer: {
                        text: `Page: ${index + 1}/${list.length}`,
                    },
                },
            });
        });

        react.on('end', () => {
            return msgg.reactions.removeAll();
        });
    }

    public arr(array: Array<string>, amount: number) {
        const arr = [];
        for (let i = 0; i < array.length; i += amount) {
            arr.push(array.slice(i, i + amount));
        }
        return arr;
    }
}
