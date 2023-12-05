import { ScrollView, Touchable, TouchableOpacity } from "react-native";
import { DangerButton, DangerText, H1, OutlineButton, Text, VerticalSpace1, View } from "../components/Themed";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import ListItem from "../components/ListItem";
import db from "../utils/db";
import utf8 from "../utils/utf8";
import axios from "axios";

export default function Dapp() {

    const [accounts, setAccounts] = useState([]);
    const router = useRouter();
    const params = useLocalSearchParams();

    const [balances, setBalances] = useState({});


    useEffect(() => {
        db.getAll('accounts').then(async (accounts) => {
            setAccounts(accounts);


            for (let index in accounts) {
                console.log("fetching balance", accounts[index].rpcUrl, accounts[index].address)
                try {
                    const balance = await axios.post(accounts[index].rpcUrl, {
                        jsonrpc: '2.0',
                        method: 'eth_getBalance',
                        params: [accounts[index].address, 'latest'],
                        id: 1
                    });
                    console.log("Balance", parseInt(balance.data.result, 16));
                    accounts[index].balance = parseInt(balance.data.result.substring(2), 16) / Math.pow(10, accounts[index].decimals);
                    balances[`${accounts[index].address}-${accounts[index].chainId}`] = parseInt(balance.data.result.substring(2), 16) / Math.pow(10, accounts[index].decimals);;
                }
                catch {
                    accounts[index].balance = "Unknown";
                }
            }
            console.log("updating accounts", accounts)
            setAccounts(accounts);
            setBalances(balances);
        })
    }, [])

    return (
        <ScrollView style={{ flex: 1, padding: 16 }}>
            <H1>Connect an account</H1>
            <VerticalSpace1 />
            <OutlineButton onPress={() => {
                router.push({ pathname: 'create' })
            }}>
                <Text>Create a new Account</Text>
            </OutlineButton>
            <VerticalSpace1 />
            {accounts.map((account) => {
                return <ListItem
                    key={`${account.address}-${account.chainId}-${account.rpcUrl}`}
                    title={account.name || `${account.address.substring(0, 6)}...${account.address.substring(account.address.length - 4)} on ${account.chainName}`}
                    subtitle={`Balance : ${balances[`${account.address}-${account.chainId}`]} ${account.currency}`}
                    image={account.iconUrl}
                    onPress={() => {
                        router.replace({ pathname: 'dapp', params: { account: JSON.stringify(account), url: params.url } })
                    }}
                />

            })
            }
            <VerticalSpace1 />
            <DangerButton onPress={() => {
                router.replace({ pathname: '/' })
            }}>
                <DangerText>Disconnect</DangerText>
            </DangerButton>
        </ScrollView>
    )
}