import { CommandoClient } from "discord.js-commando";
import config from "../../config.json";
import { join } from "path";
import LavaManager from "./manager/Lavalink";
import winston from "winston";
import Utilities from "./Utilities";

export default class InstincClient extends CommandoClient {
    public readonly config: typeof config = config;
    public readonly lava: LavaManager = new LavaManager(this);
    public logger: winston.Logger = winston.createLogger({
        transports: [new winston.transports.Console()],
        format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            winston.format.printf((log) => `[${log.timestamp}] [${log.level.toUpperCase()}]: ${log.message}`)
        )
    });

    public util: Utilities;
    public constructor() {
        super({
            owner: ["271576733168173057"],
            disableMentions: "everyone",
            commandPrefix: config.prefix
        });
    }

    public init(): void {
        this.registry
            .registerDefaultTypes()
            .registerGroups([
                ["music", "Music"],
                ["util", "Utilities"]
            ])
            .registerDefaultGroups()
            .registerDefaultCommands({
                eval: true,
                help: false,
                ping: false,
                prefix: false,
                unknownCommand: false
            })
            .registerCommandsIn(join(__dirname, "..", "commands"));

        // Process \\

        process.on("unhandledRejection", (reason: {stack : string}, promise) => {
            this.logger.warn(`Unhandled rejection: ${reason && reason.stack}`, { promise: promise });
        });

        // Lavaclient Events \\

        this.lava.manager.once("socketReady", () => this.logger.log("info", `${this.user.tag} Connected to Lavalink`));
        this.lava.manager.once("socketDisconnect", () => this.logger.error("Client disconnected"));
        this.lava.manager.once("socketError", ({ id }) => this.logger.error(`${id} ran into an error`));
        this.ws.on("VOICE_STATE_UPDATE", (upd) => void this.lava.manager.stateUpdate(upd));
        this.ws.on("VOICE_SERVER_UPDATE", (upd) => void this.lava.manager.serverUpdate(upd));

        // Discord.js Events \\

        this.on("ready", () => {
            this.lava.manager.init(this.user?.id);
            this.logger.log("info", `${this.user?.tag} Is Ready`);
        });

        void this.login(process.env.TOKEN ? process.env.TOKEN : this.config.token);
    }
}
