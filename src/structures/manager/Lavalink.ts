import { CommandoClient, CommandoMessage } from "discord.js-commando";
import { Manager, Player } from "lavaclient";
import { nodes, emojis, color } from "../../../config.json";
import rest from "./Rest";
import Queue from "./Queue";
import { SongStructure } from "../../typings/song";
import { Message } from "discord.js";

export default class LavaManager {
    public client: CommandoClient;
    public manager: Manager;
    public songs: Player|any;
    public constructor(client: CommandoClient) {
        this.client = client;
        this.manager = new Manager(nodes, {
            shards: client.shard ? client.shard?.count : 1,
            send: (id, packet): void => {
                const guild = client.guilds.cache.get(id);
                if (guild) return guild.shard.send(packet);
                return;
            }
        });
        this.songs = this.manager.players;
    }

    public async _play(msg: CommandoMessage, song: string): Promise<Message|Message[]> {
        const voiceChannel = msg.member.voice.channel;
        try {
            const player = this.songs.get(msg.guild?.id) || this.manager.create(msg.guild?.id);
            if (player.playing && voiceChannel.id !== player.channel) {
                return msg.say(`${emojis.confuse} **Im already joined in** \`${msg.guild.me?.voice.channel.name}\``);
            }
            const connection = this.manager.sockets.get("main");
            if (!connection.connected) return msg.say("Lavalink is disconnected");

            const { tracks, loadType, playlistInfo } = await rest.search(
                song.includes("https") ? encodeURI(song) : `ytsearch:${encodeURIComponent(song)}`
            );
            if (!tracks.length) {
                return msg.embed({
                    color: "RED",
                    description: `${emojis.no} **Request denied, because I can't find anything with your query :(**`
                });
            }

            if (!player.queue) player.queue = new Queue(player);
            switch (loadType) {
                case "TRACK_LOADED":
                case "SEARCH_RESULT":
                    player.queue.add(tracks[0].track, tracks[0].info, msg.author);
                    if (!player.connected) {
                        await player.connect(voiceChannel, { selfDeaf: true });
                    }
                    if (!player.playing && !player.paused) {
                        await player.queue.start(msg);
                    }
                    if (!player.queue.tracks.length) return;
                    return msg.embed({
                        color: color,
                        description: `${emojis.yes} **Added To Queue: __[${tracks[0].info.title}](${tracks[0].info.uri})__ Uploaded by: __${tracks[0].info.author}__**`
                    });
                case "PLAYLIST_LOADED":
                    tracks.map((x: { track: string; info: SongStructure }): void => {
                        void player.queue.add(x.track, x.info, msg.author);
                    });
                    if (!player.connected) {
                        await player.connect(voiceChannel, { selfDeaf: true });
                    }
                    if (!player.playing && !player.paused) {
                        await player.queue.start(msg);
                    }
                    return msg.embed({
                        color: color,
                        description: `${emojis.yes} Loaded Playlist: **__[${playlistInfo.name}]__ - __${tracks.length}__ Songs**`
                    });
            }
        } catch (e) {
            this.client.logger.error(e);
            return msg.say(`${emojis.no} **Oh no, my devs is bad** \`${e}\``);
        }
    }
}
