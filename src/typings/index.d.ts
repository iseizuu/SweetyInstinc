import LavaManager from "../structures/manager/Lavalink";
import config from "../../config.json";
import { Logger } from "winston";

declare module "discord.js-commando" {
    export interface CommandoClient {
        lava: LavaManager;
        config: typeof config;
        logger: Logger;
    }
}

interface RestStructure {
    playlistInfo: {
        name: string;
    };
    loadType: string;
    tracks: any[];
}

interface LyricsResponse {
    response: {
        hits: [
            {
                result: {
                    "full_title": string;
                    url: string;
                    "song_art_image_url": string;
                };
            }
        ];
    };
}
