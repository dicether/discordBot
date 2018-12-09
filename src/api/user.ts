import axios from "axios";
import {User} from "./types";

export async function userFromName(name: string): Promise<User> {
    const response = await axios.get<User>(`/user/name/${name}`);
    return response.data;
}

export async function userFromAddress(address: string): Promise<User> {
    const response = await axios.get<User>(`/user/address/${address}`);
    return response.data;
}
