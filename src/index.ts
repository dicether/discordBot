import axios from "axios";
import * as Discord from "discord.js";
import {stats, StatsEntry, userStats} from "./api/stats";
import {userFromName} from "./api/user";

import * as config from "../config.json";

enum CMDS {
    HELP = "help",
    TOP_PROFIT = "topProfit",
    TOP_WAGERED = "topWagered",
    USER = "user",
}

const INVALID_CMD = "Invalid, use:";

const BASE_URL = "https://dicether.com";

const API_URL = "https://api.dicether.com/api";
axios.defaults.baseURL = API_URL;

const client = new Discord.Client();

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

function generateStatsMessage(stats: StatsEntry[]) {
    return stats.slice(0, 10).reduce((a, s, i) => `${a}\n${i + 1}. **${s.user.username}** - ${s.value / 1e9} Eth`, "");
}

const HELP_TEXT =
    `This is a list of all commands you can use:\n\n` +
    `**${config.prefix}${CMDS.HELP}**\n` +
    `Shows this help text.\n\n` +
    `**${config.prefix}${CMDS.TOP_WAGERED}** [timeSpan], <timeSpan>: week | month | all\n` +
    `Shows users with most wagered for the selected time span.\n\n` +
    `**${config.prefix}${CMDS.TOP_PROFIT}** [timeSpan], <timeSpan>: week | month | all\n` +
    `Shows users with the top profit for the selected time span.\n\n` +
    `**${config.prefix}${CMDS.USER} <username>**\n` +
    `Shows stats of the given user.`;

async function userStatsCmd(msg: string) {
    const cmd = msg.split(" ");
    const help = `${INVALID_CMD} **${config.prefix}${CMDS.USER}** <userName>`;

    if (cmd.length !== 2) {
        return help;
    }

    let user;
    try {
        user = await userFromName(cmd[1]);
    } catch (ex) {
        return `Non-existing user **${cmd[1]}**!`;
    }

    const stats = await userStats(user.address);

    return (
        `***${user.username}***\n` +
        `**Wagered:** ${stats.wagered / 1e9} Eth  **Profit:** ${stats.profit / 1e9} Eth  **#Bets:** ${stats.numBets}`
    );
}

async function topProfitCmd(msg: string) {
    const cmd = msg.split(" ");
    const help = `${INVALID_CMD} **${config.prefix}${CMDS.TOP_PROFIT}** [timeSpan], timeSpan: <week | month | all>`;

    if (cmd.length !== 2 && cmd.length !== 1) {
        return help;
    }

    if (cmd.length === 1 || cmd[1] === "week") {
        const dayStats = await stats("week");
        const resMsg = generateStatsMessage(dayStats.mostProfit);
        return `**Top profit weekly**\n${resMsg}\n\nFor details visit: <${BASE_URL}/hallOfFame/weekly>`;
    } else if (cmd[1] === "month") {
        const dayStats = await stats("month");
        const resMsg = generateStatsMessage(dayStats.mostProfit);
        return `**Top profit monthly**\n${resMsg}\n\nFor details visit: <${BASE_URL}/hallOfFame/monthly>`;
    } else if (cmd[1] === "all") {
        const dayStats = await stats("all");
        const resMsg = generateStatsMessage(dayStats.mostProfit);
        return `**Top all time profit**\n${resMsg}\n\nFor details visit: <${BASE_URL}/hallOfFame/all>`;
    }

    return help;
}

async function topWageredCmd(msg: string) {
    const cmd = msg.split(" ");
    const help = `${INVALID_CMD} **${config.prefix}${CMDS.TOP_WAGERED}** [timeSpan], timeSpan: <week | month | all>`;

    if (cmd.length !== 2 && cmd.length !== 1) {
        return help;
    }

    if (cmd.length === 1 || cmd[1] === "week") {
        const dayStats = await stats("week");
        const resMsg = generateStatsMessage(dayStats.mostWagered);
        return `**Top wagered weekly**\n${resMsg}\n\nFor details visit: <${BASE_URL}/hallOfFame/weekly>`;
    } else if (cmd[1] === "month") {
        const dayStats = await stats("month");
        const resMsg = generateStatsMessage(dayStats.mostWagered);
        return `**Top wagered monthly**\n${resMsg}\n\nFor details visit: <${BASE_URL}/hallOfFame/monthly>`;
    } else if (cmd[1] === "all") {
        const dayStats = await stats("all");
        const resMsg = generateStatsMessage(dayStats.mostWagered);
        return `**Top all time wagered**\n${resMsg}\n\nFor details visit: <${BASE_URL}/hallOfFame/all>`;
    }

    return help;
}

client.on("message", async msg => {
    try {
        if (!msg.guild || msg.author.bot || msg.content.indexOf(config.prefix) !== 0) {
            return;
        }

        const msgStr = msg.content.slice(config.prefix.length);
        if (msgStr.startsWith(CMDS.TOP_WAGERED)) {
            await msg.channel.send(await topWageredCmd(msgStr));
        } else if (msgStr.startsWith(CMDS.TOP_PROFIT)) {
            await msg.channel.send(await topProfitCmd(msgStr));
        } else if (msgStr.startsWith(CMDS.USER)) {
            await msg.channel.send(await userStatsCmd(msgStr));
        } else if (msgStr === CMDS.HELP) {
            await msg.channel.send(HELP_TEXT);
        }
    } catch (ex) {
        console.log(`Exception: ${ex.message}`);
    }
});

client.login(config.token);
