import { CommandName } from "./Types";

export interface ILocalization {
    notifications: Notifications;
    clear: Clear;
    deleteEmoji: DeleteEmoji;
    doEmojis: DoEmojis;
    help: Help;
    imgToAscII: ImgToAscII;
    setEmoji: SetEmoji;
    setLanguage: SetLanguage;
    setPrefix: SetPrefix;
    subscribe: Subscribe;
    unsubscribe: Unsubscribe;
    poll: Poll;
}

export interface Notifications {
    header: string;
    y: string;
    m: string;
    d: string;
    h: string;
    min: string;
}

export interface Clear {
    error: string;
}

export interface DeleteEmoji {
    success: string;
    db_error: string;
}

export interface DoEmojis {
    on: string;
    off: string;
    args_warn: string;
    access_warn: string;
    db_error: string;
}

export interface Help {
    author: string;
    about: Record<CommandName, string>;
    description: Record<CommandName, string>;
}

export interface ImgToAscII {
    error: string;
    no_files: string;
    wrong_file: string;
    not_link: string;
}

export interface SetEmoji {
    updated: string;
    error: string;
    db_error: string;
    same_emoji: string;
}

export interface SetLanguage {
    success: string;
    warn: string;
    empty: string;
    db_error: string;
}

export interface SetPrefix {
    success: string;
    access_warn: string;
    empty_warn: string;
    db_error: string;
}

export interface Subscribe {
    date_error: string;
    duration_error: string;
    send_success: string;
    send_error: string;
    existing_user: string;
}

export interface Unsubscribe {
    not_subbed: string;
    success: string;
}

export interface Poll {
    default_message: string;
    bad_time_error: string;
}