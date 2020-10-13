import { nodes } from '../../../config.json';
const fetch = require('node-superfetch');

export default class Rest {
    public static async search(track: string) {
        const { host, port, password } = nodes[0];
        const { body } = await (
            await fetch.get(`http://${host}:${port}/loadtracks?identifier=${track}`)
                .set('Authorization', password)
        );
        return body;
    }
    public static async decode(track: string) {
        const { host, port, password } = nodes[0];
        const { body } = await (
            await fetch.get(`http://${host}:${port}/decodetrack?track=${track}`)
                .set('Authorization', password)
        );
        return body;
    }
};
