import { isAddress } from "web3-validator";

export function validateAccount(address: string) : boolean {

    return isAddress(address)
}



