import { User } from "discord.js";

interface SongStructure {
    song: string;
    user: User;
    duration: string;
    thumbnail: string;
    identifier: string;
    length: number;
    info: {
        identifier: string;
        author: string;
        title: string;
        uri: string;
        length: number;
    };
}

