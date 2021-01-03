import { Chat, PrivateMessages } from "twitch-js";

export class Poll {
    votes: number[];
    voters: string[];
    active: boolean;
    AUTHORIZED_USERS: string[] = ['mcknife_'];
    WAITTIME: number = 30;
    STARTING_THRESHOLD: number = 3;
    TIME_TO_END_POLL: number = 45;
    chat: Chat;
    channel: string;


    constructor(chat: Chat, channel: string) {
        this.votes = [];
        this.voters = [];
        this.active = false;
        this.chat = chat;
        this.channel = channel;
    }


    updatePoll(message: PrivateMessages) {
        // message is a number
        if (!isNaN(+message.message)) {
            // user has not voted
            if (this.voters.indexOf(message.username) == -1) {
                // vote is 1 or 2
                if (parseInt(message.message) === 1 || parseInt(message.message) === 2) {
                    this.votes.push(parseInt(message.message));
                    this.voters.push(message.username);
                    if (!this.active) {
                        this.updateThreshold();
                    } else if (this.active) {
                        this.waitForPollToEnd();
                    }
                }
            }

            // start poll
        } else if (message.message === "start poll" && !this.active && (this.AUTHORIZED_USERS.indexOf(message.username) > -1)) {
            this.votes = [];
            this.voters = [];
            this.startPoll();

            // end poll and return result
        } else if (message.message === "end poll" && this.active && (this.AUTHORIZED_USERS.indexOf(message.username) > -1)) {
            this.stopPoll();
        }
    }

    startPoll() {
        this.active = true;
        this.say('/me Umfrage gestartet. Vote \'1\' or \'2\'');
        this.intermediateResults(this.WAITTIME);
    }

    stopPoll() {
        this.active = false;
        this.say(`/me Umfrage gestoppt. Endergebnis: ${this.getResultString()}`);
        this.votes = [];
        this.voters = [];
    }

    async waitForPollToEnd() {
        const currentLength = this.votes.length;
        await this.sleep(15);
        if (this.active && (this.votes.length === currentLength)) {
            this.stopPoll();
        }
    }

    async updateThreshold() {
        console.log(this.votes);
        if (!this.active && (this.votes.length >= this.STARTING_THRESHOLD)) {
            this.startPoll();
            this.waitForPollToEnd();
        }
        await this.sleep(45);
        console.log("1");
        if (!this.active && this.votes.length > 0) {
            this.votes.splice(0, 1);
            this.voters.splice(0, 1);
        }
    }

    countNumber(number: number) {
        let count: number = 0;
        for (let vote of this.votes) {
            if (vote === number) {
                count++;
            }
        }
        return count;
    }

    async intermediateResults(waittime: number) {
        await this.sleep(waittime);
        while (this.active) {
            this.say(`/me Zwischenergebnis: ${this.getResultString()}`);
            await this.sleep(waittime);
        }
    }

    getResultString() {
        let ones = this.countNumber(1);
        let twos = this.countNumber(2);
        let total = ones + twos;
        let percOne = ((ones / total) * 100).toFixed(1);
        let percTwo = ((twos / total) * 100).toFixed(1);
        return `1: ${percOne}% (${ones} votes), 2: ${percTwo}% (${twos} votes) - total votes: ${ones + twos}`;
    }

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms * 1000));
    }

    say(msg: string) {
        this.chat.say(this.channel, msg);
    }
}