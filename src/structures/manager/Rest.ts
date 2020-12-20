import { nodes } from "../../../config.json";
import fetch from "node-superfetch";
import { RestStructure } from "../../typings";

export default class Rest {
    public static async search(track: string): Promise<RestStructure> {
        const { host, port, password } = nodes[0];
        const { body } = await fetch.get(`http://${host}:${port}/loadtracks?identifier=${track}`)
            .set("Authorization", password);
        return (body as RestStructure);
    }

    public static async decode(track: string): Promise<RestStructure> {
        const { host, port, password } = nodes[0];
        const { body } = await fetch.get(`http://${host}:${port}/decodetrack?track=${track}`)
            .set("Authorization", password);
        return (body as RestStructure);
    }
}
