import { CommandoClient } from 'discord.js-commando';
import config from '../../config.json';
import { join } from 'path';
import LavaManager from './manager/Lavalink';

export default class instincClient extends CommandoClient {
    config: {
      prefix: string;
      color: string;
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
        this.on('ready', async () => {
            console.log(`[INFO]:${this.user?.tag} Is Ready`);
        });
        this.login(process.env.TOKEN2);
    };
};
