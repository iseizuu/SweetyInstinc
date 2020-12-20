import { stripIndent } from "common-tags";
import { Message } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import util from "../../structures/Utilities";

export default class NowplayingCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: "nowplaying",
            aliases: ["np", "current", "currentsong", "currentlyplayig"],
            group: "music",
            memberName: "nowplayingcmd",
            description: "Display the currently playing song",
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5
            }
        });
    }

    public async run(msg: CommandoMessage): Promise<Message|Message[]> {
        const player = await this.client.lava.songs.get(msg.guild.id);
        if (!player) return msg.say("**There is no song playing right now!**");
        const nowPlay = player.queue.current;
        return msg.embed({
            url: nowPlay.info.uri,
            title: nowPlay.info.title,
            description: stripIndent`
            \`${util.parseDuration(player.position)}\` ⏯${"▬".repeat(Math.floor((player.position / Number(nowPlay.info.length)) * 20))
                + "<a:fly:765980766592303134>"
                + "-".repeat(
                    20 - Math.floor((player.position / Number(nowPlay.info.length)) * 20)
                )} \`${nowPlay.duration}\``,
            color: this.client.config.color,
            thumbnail: {
                url: nowPlay.thumbnail
            }
        });
    }
}
