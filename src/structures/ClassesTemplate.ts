import { Message } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export default class RCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: "",
            aliases: [""],
            group: "",
            memberName: "",
            description: "",
            guarded: true,
            throttling: {
                usages: 1,
                duration: 5
            },
            args: [
                {
                    key: "command",
                    prompt: "",
                    type: "command",
                    default: ""
                }
            ]
        });
    }

    public run(msg: CommandoMessage): Promise<Message|Message[]> {
        return msg.say("a");
    }
}
