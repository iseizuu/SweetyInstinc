import { stripIndent } from "common-tags";
import { Message, User } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import rest from "../../structures/manager/Rest";
import util from "../../structures/Utilities";
import { SongStructure } from "../../typings/song";

export default class PlayCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: "search",
            aliases: ["findsong"],
            group: "music",
            memberName: "search",
            description: "Search tracks",
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5
            },
            args: [
                {
                    key: "query",
                    prompt: "What the title of the songs?",
                    type: "string"
                }
            ]
        });
    }

    public async run(msg: CommandoMessage, args: { query: string}): Promise<Message | Message[]> {
        const channel = msg.member.voice.channel;
        if (!channel) {
            return msg.say(`${this.client.config.emojis.no}** Request denied, You must join the voice channel first**`);
        }
        // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
        if (args.query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
            return msg.say(`${this.client.config.emojis.no} **Invalid query was provided, if you using an url, use \`play\` instead**`);
        }
        
        const { tracks } = await rest.search(`ytsearch:${encodeURIComponent(args.query)}`);
        if (!tracks.length) {
            return msg.say(`${this.client.config.emojis.no} **Can't find any results.**`);
        }

        const res = tracks.splice(0, 10);
        const embed = await msg.channel.send({
            embed: {
                title: "Please Choose between 1 - 10",
                color: this.client.config.color,
                description: stripIndent`
                ${res.map((a: SongStructure, b: number) => `**${b + 1} - [${a.info.title}](${a.info.uri}) [${util.parseDuration(a.info.length)}]**`).join("\n")}
                `,
                footer: {
                    text: "To cancel type `cancel` time 15 seconds",
                    iconURL: msg.author.avatarURL()
                }
            }
        });
        const filter = (a: { author: User; content: string | number }): boolean => a.author.id === msg.author.id && a.content > 0 && a.content < 11 || a.content === "cancel";
        const msgg = await msg.channel.awaitMessages(filter, {
            time: 15e3,
            max: 1
        });
        if (!msgg.size) {
            void embed.delete();
            return msg.reply("**Time is up, sorry**");
        }
        if (msgg.first().content === "cancel") {
            void embed.delete();
            return msg.reply(`${this.client.config.emojis.yes} **Cancelled the request**`);
        } else if (msgg.first().content) {
            void embed.delete();
            void this.client.lava._play(msg, res[parseInt(msgg.first().content) - 1].info.uri);
        }
    }
}
