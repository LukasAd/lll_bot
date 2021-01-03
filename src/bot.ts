import { config } from "process";
import { Chat, Commands } from "twitch-js";
import { Poll } from './poll';

const twitchConfig = require("./config.json");

// Provide your username and token secret keys from Server Control Panel (left).
// To generate tokens, use https://twitchtokengenerator.com.
const username = twitchConfig.username;
const token = twitchConfig.auth;
const channel = twitchConfig.channel;

const run = async () => {
    const chat = new Chat({
        username,
        token
    });
    const poll = new Poll(chat, channel);

    await chat.connect();
    await chat.join(channel);

    chat.on(Commands.PRIVATE_MESSAGE, (message) => {
        poll.updatePoll(message);

    });
};

run();
