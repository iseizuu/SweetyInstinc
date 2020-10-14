import { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { Manager } from 'lavaclient';
import { nodes, emojis, color } from '../../../config.json';
import rest from './Rest';
import Queue from './Queue';

export default class LavaManager {
    client: CommandoClient;
    manager: Manager;
    songs: any;
    constructor(client: CommandoClient) {
        this.client = client;
        this.manager = new Manager(nodes, {
            shards: client.shard ? client.shard?.count : 1,
            send: (id, packet) => {
                const guild = client.guilds.cache.get(id);
                if (guild) return guild.shard.send(packet);
                return;
            },
        });
        this.songs = this.manager.players;
    }

    public async _play(msg: CommandoMessage, song: string): Promise<any> {
        const voiceChannel = msg.member!.voice.channel;
        try {
            const player = this.songs.get(msg.guild?.id) || (await this.manager.create(msg.guild?.id));
            if (player.playing && voiceChannel.id !== player.channel) {
                return msg.say(`${emojis.confuse} Im already joined in **${msg.guild.me?.voice.channel.name}**`);
            }
            const connection = this.manager.sockets.get('main');
            if (!connection.connected) {
                connection.remainingTries = 1;
                connection.reconnect();
            }
            const { tracks, loadType, playlistInfo } = await rest.search(
                song.includes('https') ? encodeURI(song) : `ytsearch:${encodeURIComponent(song)}`,
            );
            if (!tracks.length) {
                return msg.embed({
                    color: 'RED',
                    description: `${emojis.no} **Request denied, because I can't find anything with your query :(**`,
                });
            }

            if (!player.queue) player.queue = new Queue(player);
            switch (loadType) {
            case 'TRACK_LOADED':
            case 'SEARCH_RESULT':
                player.queue.add(tracks[0].track, tracks[0].info, msg.author);
                if (!player.connected) {
                    await player.connect(voiceChannel, { selfDeaf: true });
                }
                if (!player.playing && !player.paused) {
                    await player.queue.start(msg);
                }
                if (player.queue.tracks.length === 0) return;
                return msg.embed({
                    color: color,
                    description: `${emojis.yes} **Added To Queue: __[${tracks[0].info.title}](${tracks[0].info.uri})__ Uploaded by: __${tracks[0].info.author}__**`,
                });
            case 'PLAYLIST_LOADED':
                tracks.map((x: {track: string, info: object}) => player.queue.add(x.track, x.info, msg.author));
                if (!player.connected) {
                    await player.connect(voiceChannel, { selfDeaf: true });
                }
                if (!player.playing && !player.paused) {
                    await player.queue.start(msg);
                }
                return msg.embed({
                    color: color,
                    description: `${emojis.yes} Loaded Playlist: **__[${playlistInfo.name}]__ - __${tracks.length}__ Songs**`,
                });
            }
        }
        catch (e) {
            console.log(e);
            return msg.say(`${emojis.no} **Oh no, my devs is bad** \`${e}\``);
        }
    }
}
