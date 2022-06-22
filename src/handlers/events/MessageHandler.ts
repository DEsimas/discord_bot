import { CommandHandler } from "./../other/CommandHandler";
import { Log } from "./../../components/Log";
import { DAO } from "./../../database/DAO";
import { Handler } from "./../Handler";

import { Client, Message, MessageEmbed } from "discord.js";

export class MessageHandler extends Handler {
    private readonly client: Client;
    private readonly message: Message;

    constructor(client: Client, message: Message) {
        super();
        this.client = client;
        this.message = message;
    }

    public async handle(): Promise<void> {
        if (!this.message.guild?.id) return; // stops handling if message not from a server

        const user = await DAO.Users.fetchByUserId(this.message.author.id);
        const server = await DAO.Servers.fetchByServerId(this.message.guild.id);

        if (server.doEmojis) {
            if (this.message.author.id !== this.client.user?.id && user.emojiID) {
                try {
                    await this.message.react(user.emojiID);
                } catch {
                    Log.warning("MessageHandler.ts", "Failed to react users message", { user: user, server: server });
                }
            } else if (this.message.author.id === this.client.user?.id) {
                const avatar = await DAO.Avatars.getActive();
                if (avatar) {
                    try {
                        await this.message.react(avatar.emojiID);
                    } catch {
                        Log.warning("MessageHandler.ts", "Failed to react bot message", { avatar: avatar, server: server });
                    }
                }
            }
        }

        this.sendPrefixHelp(server.prefix);

        const commandHandler = new CommandHandler(this.client, this.message, user, server);
        commandHandler.handle();
    }

    private sendPrefixHelp(correctPrefix: string): void {
        const msg = this.message.content.toLocaleLowerCase()
        if(msg.search("prefix") != -1) {
            const prefix = msg.split("prefix")[0];
            if(prefix != correctPrefix && prefix.length == 1) {
                this.message.channel.send({embeds: [new MessageEmbed({title: `Prefix for this server is ${correctPrefix}`})]});
            }
        }
    }
};