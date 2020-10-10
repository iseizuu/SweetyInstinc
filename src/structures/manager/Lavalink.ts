import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { LavaClient, Player } from '@anonymousg/lavajs';
import { nodes } from '../../../config.json';
import { TextChannel } from 'discord.js';

export default class LavaManager {
    client: CommandoClient;
    manager: LavaClient;
    constructor(client: CommandoClient) {
        this.client = client;
        client.on('ready', async () => {
            this.manager = new LavaClient(client, nodes);
            this.manager.on('nodeSuccess', async (node: { options: { port: number; }; }) => {
                console.log(`[Lavalink ${node.options.port}: LavaJS] => Connected`);
            });
            this.manager.on('nodeClose', async (node: object, error: string) => {
                await console.log(`[Lavalink ${node}: LavaJS] => Disconnected\n` + error);
            });
        });
    }

    public async _play(msg: CommandoMessage, query: string) {
        const channel = msg.member.voice.channel;
        const player = this.manager.spawnPlayer({
            guild: msg.guild,
            voiceChannel: channel,
            textChannel: (msg.channel as TextChannel),
            deafen: true,
            volume: 100,
        },
        {
            skipOnError: true,
        },
        );
        let search: any = null;
        search = await player.lavaSearch(query, msg.member, {
            source: 'yt',
            add: false,
        });

        if (!search.length) {
            return msg.say('Cant find any results');
        };
        if (Array.isArray(search)) {
            player.queue.add(search[0]);
            msg.say(`Playing: ${search[0].title} By: ${search[0].author}`);
        }
        if (!player.playing) {
            player.play();
        }
        // eslint-disable-next-line no-shadow
        this.manager.once('queueOver', async (player: Player) => {
            await player.destroy();
            return msg.say('Gw keluar gan.');
        });
    }
}
