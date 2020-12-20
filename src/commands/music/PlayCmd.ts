import { Message } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export default class PlayCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: "play",
            aliases: ["p", "music"],
            group: "music",
            memberName: "playcmd",
            description: "Play any song or playlist from youtube or soundcloud",
            guildOnly: true,
            clientPermissions: ["CONNECT", "VIEW_CHANNEL", "SPEAK"],
            throttling: {
                usages: 1,
                duration: 5
            },
            args: [
                {
                    key: "query",
                    prompt: "What the title of the song do you want to play?",
                    type: "string"
                }
            ]
        });
    }

    public async run(msg: CommandoMessage, args: { query: string}): Promise<Message|Message[]> {
        const channel = msg.member.voice.channel;
        if (!channel) {
            return msg.say(`${this.client.config.emojis.no}** Request denied, You must join the voice channel first**`);
        }
        return this.client.lava._play(msg, args.query);
    }
}
