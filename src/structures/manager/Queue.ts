import { CommandoMessage } from "discord.js-commando";
import { Player } from "lavaclient";
import { color, emojis } from "../../../config.json";
import { Message, MessageEmbed, User } from "discord.js";
import Util from "../Utilities";
import { SongStructure } from "../../typings/song";



export default class Queue {
    public tracks: any[] = [];
    public msg: CommandoMessage = undefined;
    public loop: { queue: boolean; track: boolean } = { queue: false, track: false };
    public current: SongStructure = undefined;
    public player: Player;
    public constructor(player: Player) {
        this.player = player;
        player.on("end", async (evt) => {
            if (evt && ["REPLACED"].includes(evt.reason)) return;

            if (this.loop.track) {
                this.tracks.unshift(this.current);
            } else if (this.loop.queue) {
                this.tracks.push(this.current);
            }

            this.next();

            if (!this.msg.guild || !this.msg.guild.me.voice.channel) {
                return this.end("?");
            }

            if (this.msg.guild.me.voice.channel.members.size === 1) {
                return this.end("emptyVC");
            }
            if (!this.current) return this.end("empty");
            await player.play(this.current.song);
        })
            .on("start", async () => {
                try {
                    const embed = new MessageEmbed()
                        .setTitle("<a:yt:765963899248967680> Now Playing")
                        .setDescription(`**[${this.current.info.title}](${this.current.info.uri}) [${this.current.duration}]**`)
                        .setColor(color)
                        .setThumbnail(this.current.thumbnail);
                    if (this.tracks.length) {
                        embed.addField("Next", `**[${this.tracks[0].info.title}](${this.tracks[0].info.uri})**`);
                    }
                    embed.setFooter(`Uploaded: ${this.current.info.author}`);
                    embed.setTimestamp();
                    void this.msg.channel.send(embed);
                } catch (er) {
                    return this.msg.channel.send(`${emojis.no} **Oh nooo,, My devs is bad** \`${er}\``);
                }
            });
    }

    public add(song: string, info: SongStructure, user: User): void {
        void this.tracks.push({
            song, info, user,
            duration: Util.parseDuration(info.length),
            thumbnail: `https://img.youtube.com/vi/${info.identifier}/hqdefault.jpg`
        });
    }

    public next(): void {
        this.current = this.tracks.shift();
    }

    public destroy(): void {
        void this.player.manager.destroy(this.msg.guild.id);
    }

    public async end(reason: string): Promise<Message|void> {
        switch (reason) {
            case "?":
            default:
                return this.destroy();
            case "empty":
                this.destroy();
                return this.msg.channel.send({
                    embed: {
                        color: color,
                        description: `${emojis.chika} **Ran out of the queue, So i will leave now..**`
                    }
                });
            case "emptyVC":
                this.destroy();
                return this.msg.channel.send({
                    embed: {
                        color: color,
                        description: `${emojis.chika} **It looks like there's no one on the voice channel right now.., I'll go out and clear all queues**`
                    }
                });
        }
    }

    public async start(msg: CommandoMessage): Promise<Message|void> {
        this.msg = msg;

        if (!this.current) this.next();
        await this.player.play(this.current.song);
    }
}

