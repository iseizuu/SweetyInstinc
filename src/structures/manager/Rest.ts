import { nodes } from '../../../config.json';
const fetch = require('node-superfetch');

export default class Rest {
    static async search(track: object) {
        const { host, port, password } = nodes[0];
        const { body } = await (
            await fetch.get(`http://${host}:${port}/loadtracks?identifier=${track}`)
                .set('Authorization', password)
        );
        return body;
    }
    static async decode(track: object) {
        const { host, port, password } = nodes[0];
        const { body } = await (
            await fetch.get(`http://${host}:${port}/decodetrack?track=${track}`)
                .set('Authorization', password)
        );
        return body;
    }
};
