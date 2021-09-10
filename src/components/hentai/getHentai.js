import nhentai from "nhentai";

import Command from "./../command.js";

export default class getHentai extends Command{
    constructor(context) {
        super(context);
        this.getHentai();
    };

    async getHentai() {
        const ID = this.args[1]

        //validate id
        if (this.validate(ID)) return;

        //if id random send random
        if (ID.toLowerCase() === this.config.random_id) {
            this.getRandom();
            return;
        }
        
        //fetch doujin using nhentai library
        const api = new nhentai.API();
        api.fetchDoujin(ID).then(doujin => {
            this.doujin = doujin;
            this.handleDoujin();
        });
    };

    //validate id
    validate(ID) {
        //is channel nsfw
        if (!this.message.channel.nsfw) {
            super.sendError(this.localization.msg_getHentai_nsfw_warn);
            return true;
        };

        //check if id is random
        if(ID == this.config.random_id) return false;

        //check if id in ids range
        if (ID == "" || ID > 999999 || ID < 1 || isNaN(ID)) {
            super.sendError(this.localization.msg_getHentai_id_warn);
            return true;
        };

        return false;
    };

    //check if has prohibited tags
    isProhibited() {
        let isProhibited = false;
        this.config.black_tags_list.forEach(el => {
            if (doujin.tags.all.find(tag => (tag.name == el))) isProhibited = true;
        });

        return isProhibited;
    };

    handleDoujin() {
        //if didnt get doujin
        if(!this.doujin){
            super.sendError(this.localization.msg_getHentai_fetch_error);
            return;
        };

        //if has prohimited tags
        if(this.isProhibited()) {
            super.sendError(this.localization.msg_getHentai_black_list_error);
            return;
        };

        //send doujin
        this.sendInfo(doujin);
        this.sendDoujin(doujin);
    };

    //send info about doujin
    sendInfo(doujin) {
        //parce tags to string
        let tags = doujin.tags.all.map(tag => tag.name).join(', ');

        //create and send embed
        const embed = new this.Discord.MessageEmbed()
            .setAuthor(this.localization.msg_getHentai_nhentai)
            .addField(this.localization.msg_getHentai_intro, "**" + doujin.titles.pretty + "**")
            .addField(this.localization.msg_getHentai_tags, tags)
            .setThumbnail(doujin.thumbnail.url)
            .setColor(this.embed_color);
        this.message.channel.send({ embeds: [embed] });
    };

    //send doujin pages several per message for optimization
    sendDoujin(doujin) {
        //iterate through all doujin pages
        let embeds = [];
        doujin.pages.forEach((el, index) => {
            const embed = new this.Discord.MessageEmbed()
                .setImage(el.url)
                .setColor(this.config.embed_color);

            embeds.push(embed);

            //if in array [links_per_message] lincks send them
            if ((index + 1) % this.links_per_message == 0) {
                this.message.channel.send({ embeds: embeds });
                embeds = [];
            }
        });

        //if urls remained in array send them
        if (embeds.length) this.message.channel.send({ embeds: embeds });

        //link to the first message for comfortable fallback
        this.message.channel.send(this.message.url);
    };

    //generate random id in ids range
    getRandomID() {
        return Math.floor(Math.random() * 1000000);
    };

    //send random doujin
    async getRandom() {
        const api = new this.nhentai.API();
        let acknowlaged = false;

        //request doujins till get normal one
        while (!acknowlaged) {
            const ID = this.getRandomID();
            if(!this.validate(ID)) {
                this.doujin = await api.fetchDoujin(ID);
                
                if(doujin !== null) {    
                    if(!this.isProhibited()) {
                        this.sendInfo(doujin);
                        this.sendDoujin(doujin);
                        acknowlaged = true;
                    };
                };
            };
        };
    };
};