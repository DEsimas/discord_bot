import { Client, MessageEmbed } from "discord.js";
import { Config, config } from "../config";
import { DAO } from "../database/DAO";
import { Log } from "../Log";
import { schedule, ScheduledTask } from 'node-cron'

export class NotificationsSender {

    private readonly DAO: DAO;
    private readonly client: Client;
    private readonly config: Config;

    constructor(client: Client, DAO: DAO)  {
        this.DAO = DAO;
        this.client = client;
        this.config = config;
    }

    public getTask(time: string): ScheduledTask {
        return schedule(time, () => this.sendNotifications());
    }

    private async sendNotifications(): Promise<void> {
        const Notifications = await this.DAO.Notifications.getAll();
        
        Notifications.forEach(async user => {
            const diff = this.getDifference(user.birth, new Date());

            const localization = this.config.localization[(await this.DAO.Users.findByUserId(user.userID))?.language || this.config.database.defaults.language].notifications;
            
            const channel = await this.client.users.fetch(user.userID);
            const embed = new MessageEmbed()
                .setColor(this.config.embed_colors.discord)
                .addField(localization.header, `${diff.years} ${localization.units.y} ${diff.months} ${localization.units.m} ${diff.days} ${localization.units.d}`)
                .addField(`${localization.units.d}:`, diff.d.toString(), true)
                .addField(`${localization.units.h}:`, diff.h.toString(), true)
                .addField(`${localization.units.min}:`, diff.m.toString(), true);

            channel.send({ embeds: [embed] });
        });

        Log.info(`Notifications sended to ${Notifications.length} users`);
    }

    private getDifference(begin: Date, end: Date): {s: number, m: number, h: number, d: number, years: number, months: number, days: number} {
        const future = new Date(begin);

        let res = {
            s: 0,
            m: 0,
            h: 0,
            d: 0,
            years: 0,
            months: 0,
            days: 0
        }

        while ((future.getFullYear() !== end.getFullYear()) || (future.getMonth() !== end.getMonth()) || (future.getDate() !== end.getDate())) {
            future.setDate(future.getDate() + 1);
            res.days++;
            res.d++;

            if (future.getDate() === begin.getDate()) {
                res.months++;
                res.days = 0;
            }
            if (future.getMonth() === begin.getMonth() && res.days === 0) {
                res.years++;
                res.months = 0;
            }
        }

        const diff = Math.abs(begin.getTime() - end.getTime())
        res.d = Math.floor( diff / (1000 * 60 * 60 * 24));
        res.h = Math.floor( diff / (1000 * 60 * 60));
        res.m = Math.floor( diff / (1000 * 60));
        res.s = Math.floor( diff / 1000 );

        return res;
    }
};