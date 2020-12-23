/* eslint-disable camelcase */
import { Message, MessageEmbed } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import req from "node-superfetch";
import cheer from "cheerio";
import { LyricsResponse } from "../../typings";

export default class LyricCommand extends Command {
    public constructor(client: CommandoClient) {
        super(client, {
            name: "lyric",
            aliases: ["lr", "ly"],
            group: "music",
            memberName: "lyriccmd",
            description: "Get lyrics of any song or the lyrics of the currently",
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5
            },
            args: [
                {
                    key: "query",
                    prompt: "What the song title do you want to search the lyrics",
                    type: "string",
                    default: ""
                }
            ]
        });
    }

    public async run(msg: CommandoMessage, args: { query: string }): Promise<Message|Message[]> {
        const player = await this.client.lava.songs.get(msg.guild.id);
        if (!args.query && !player) return msg.say("**There is no song playing right now!**");
        if (!args.query && player.playing) {
            args.query = player.queue.current.info.title
                .replace(/(\(.+\)|lyrics|lirik|nightcore|official|music|video|\+|\[.+\])/gi, "");
        }

        const { body } = await req.get(`https://genius.com/api/search?q=${encodeURI(args.query)}`);
        const res = (body as LyricsResponse).response.hits;
        if (!res.length) return msg.say(`${this.client.config.emojis.confuse} **Sorry, No results found :(**`);

        const songUrl = res[0].result.url;
        let lyrics = await this.getLyrics(songUrl);
        lyrics = lyrics.replace(/(\[.+\])/g, "");

        if (!lyrics.length) lyrics = await this.getLyrics(songUrl);

        if (lyrics.length < 2048) {
            const embed = new MessageEmbed()
                .setURL(songUrl)
                .setTitle(res[0].result.full_title)
                .setColor(this.client.config.color)
                .setDescription(lyrics.trim())
                .setThumbnail(res[0].result.song_art_image_url);
            return msg.say(embed);
        }
        return msg.say(`${this.client.config.emojis.no} **Lyrics to loong**`);
    }

    public async getLyrics(url: string): Promise<string> {
        const { text } = await req.get(url);
        const $ = cheer.load(text);
        return $(".lyrics").text().trim();
    }
}
