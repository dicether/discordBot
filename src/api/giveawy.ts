import axios from "axios";
import {User} from "./types";

type BeTheHouseEntry = {
    user: User;
    profit: number;
};

type BeTheHouse = BeTheHouseEntry[];

export async function beTheHouse(): Promise<BeTheHouse> {
    const response = await axios.get<BeTheHouse>("/giveaway/beTheHouse");
    return response.data;
}
