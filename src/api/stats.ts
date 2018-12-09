import axios from "axios";
import {User} from "./types";

export type StatsEntry = {
    user: User;
    value: number;
};

export type Stats = {
    mostProfit: StatsEntry[];
    mostWagered: StatsEntry[];
};

export type UserStats = {
    wagered: number;
    profit: number;
    numBets: number;
};

export async function stats(timeSpan: "day" | "week" | "month" | "all"): Promise<Stats> {
    const response = await axios.get<Stats>(`/stats/${timeSpan}`);
    return response.data;
}

export async function userStats(address: string): Promise<UserStats> {
    const response = await axios.get<UserStats>(`/stats/user/${address}`);
    return response.data;
}
