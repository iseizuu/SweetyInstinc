import { CommandoClient } from 'discord.js-commando';
import config from '../../config.json';
import { join } from 'path';
import LavaManager from './manager/Lavalink';

export default class instincClient extends CommandoClient {
    config: {
      prefix: string;
      color: string;
      emojis: {
          no: string;
      }
    };
    client: CommandoClient;
    lava: LavaManager;
    constructor() {
        super({
            owner: ['271576733168173057'],
            disableMentions: 'everyone',
            commandPrefix: config.prefix,
            presence: {
                activity: {
                    type: 'LISTENING',
                    name: 'Kyaaa >//<',
                },
            },
        });
        this.config = config;
        this.lava = new LavaManager(this);
    };

    public _init(): void {
        this.registry
            .registerDefaultTypes()
            .registerGroups([
                ['music', 'Music'],
                ['util', 'Utilities'],
            ])
            .registerDefaultGroups()
            .registerDefaultCommands({
                eval: true,
                help: false,
                ping: false,
                prefix: false,
                unknownCommand: false,
            })
            .registerCommandsIn(join(__dirname, '..', 'commands'));

        // Lavaclient Events \\

        this.lava.manager.once('socketReady', () => console.log('info', `${this.user.tag} Connected to Lavalink`));
        this.lava.manager.once('socketDisconnect', async (msg) => console.log('Client disconnected'));
        this.lava.manager.once('socketError', ({ id }, error) => console.error(`${id} ran into an error`, error.message));
        this.ws.on('VOICE_STATE_UPDATE', (upd) => this.lava.manager.stateUpdate(upd));
        this.ws.on('VOICE_SERVER_UPDATE', (upd) => this.lava.manager.serverUpdate(upd));

        // Discord.js Events \\

        this.on('ready', async () => {
            await this.lava.manager.init(this.user?.id);
            console.log(`[INFO]:${this.user?.tag} Is Ready`);
        });

        this.login(process.env.TOKEN2);
    };
};
