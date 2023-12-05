import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { DangerButton, DangerText, H1, H2, HorizontalRule, OutlineButton, Text, VerticalSpace1, View } from "../../components/Themed";

// wc
import '@walletconnect/react-native-compat'
import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet'
import { buildApprovedNamespaces, getSdkError } from '@walletconnect/utils'
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import ListItem from "../../components/ListItem";
import utf8 from "../../utils/utf8";
import * as qs from "query-string";
import axios from "axios";
import * as Clipboard from 'expo-clipboard';


export default function Dapp({ }) {
    const router = useRouter();
    const params = useLocalSearchParams();
    const account = JSON.parse(params.account);

    const [w3wallet, setW3wallet] = useState(null);
    const [requests, setRequests] = useState([]);

    const [sourceUrl, setSourceUrl] = useState("Loading ...")
    const [dappDescription, setDappDescription] = useState("")
    const [topic, setTopic] = useState("")
    const navigation = useNavigation();
    const [errorMsg, setErrorMsg] = useState("");
    const [copied, setCopied] = useState(false);

    const [chainsInfo, setChainsInfo] = useState({});
    useEffect(() => {
        axios.get("https://chainid.network/chains.json").then((response) => {
            for (let index in response.data) {
                chainsInfo[response.data[index].chainId] = response.data[index];
            }
            setChainsInfo(chainsInfo);
        });
    }, []);

    const getW3Wallet = () => {
        return w3wallet;
    }


    useEffect(() => {
        if (w3wallet && topic) {
            navigation.addListener('beforeRemove', (e) => {
                try {
                    w3wallet.core.pairing.disconnect({ topic: topic, reason: getSdkError("USER_DISCONNECTED") }).then(() => {
                    }).catch((error) => {
                    });
                }
                catch (error) {
                }
            })
        }
    }, [w3wallet, topic]);
    const updateRequests = () => {
        if (!w3wallet) return
        setRequests(getW3Wallet().getPendingSessionRequests().filter((req) => {
            return true;
        }));
    }

    useEffect(() => {
        const core = new Core({
            projectId: process.env.WC_PROJECTID, //wallet connect project id from cloud.walletconnect.org
        })


        Web3Wallet.init({
            core, // <- pass the shared `core` instance
            metadata: {
                name: 'Demo React Native Wallet',
                description: 'Demo RN Wallet to interface with Dapps',
                url: 'www.walletconnect.com',
                icons: []
            }
        }).then(async (web3wallet) => {
            setW3wallet(web3wallet);
            const allPairings = await web3wallet.core.pairing.getPairings();
            for (const pairing of allPairings) {
                try {
                    await web3wallet.core.pairing.disconnect({ topic: pairing.topic, reason: getSdkError("USER_DISCONNECTED") });
                }
                catch (e3) {
                }
            }
            const pairing = await web3wallet.core.pairing.pair({ wcuri: params.url, uri: params.url });
            setTopic(pairing.topic);
            const onSessionProposal = (proposal) => {
                try {
                    // ------- namespaces builder util ------------ //
                    const requestedChain = proposal.params.requiredNamespaces.eip155.chains[0].split(":")[1];
                    if (!chainsInfo[requestedChain]) {
                        Alert.alert("Invalid chain", `This DApp is requesting access to chain ID ${requestedChain} but it is not supported by this wallet. `);
                        router.replace({ pathname: '/' })
                    }
                    else if (requestedChain != account.chainId) {
                        Alert.alert("Invalid chain", `This DApp is requesting access to ${chainsInfo[requestedChain].name} but you are on ${chainsInfo[account.chainId].name}. Please scan again and choose an account with on ${chainsInfo[requestedChain].name} to connect to this DApp.`);
                        router.replace({ pathname: '/' })
                    }
                    const approvedNamespaces = buildApprovedNamespaces({
                        proposal: proposal.params,
                        supportedNamespaces: {
                            eip155: {
                                chains: [`eip155:${account.chainId}`],
                                methods: ['eth_sendTransaction', 'personal_sign'],
                                events: ['accountsChanged', 'chainChanged'],
                                accounts: [
                                    `eip155:${account.chainId}:${account.address}`,
                                ]
                            }
                        }
                    })
                    // ------- end namespaces builder util ------------ //

                    const session = web3wallet.approveSession({
                        id: proposal.id,
                        namespaces: approvedNamespaces
                    }).then((session) => {
                        setSourceUrl(session.peer.metadata.url);
                        setDappDescription(session.peer.metadata.description);
                    })
                } catch (error) {
                    setErrorMsg(error.message);
                    router.replace({ pathname: '/' })
                    web3wallet.rejectSession({
                        id: proposal.id,
                        reason: getSdkError("USER_REJECTED")
                    })
                }
            }

            web3wallet.on('session_proposal', onSessionProposal);
            web3wallet.on('session_request', event => {
                console.log("session_request", event);
                updateRequests();
                console.log(requests)
            })

        })
    }, []);


    return <ScrollView>
        <H1>{sourceUrl.replace("https://", "")}</H1>
        <VerticalSpace1 />
        <Text>{dappDescription} : {topic}</Text>
        <VerticalSpace1 />
        <TouchableOpacity onPress={() => {
            Clipboard.setStringAsync(account.address);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 3000);
        }}>
            <Text>Balance : {account.balance} {account.currency} on {account.chainName}</Text>
            <Text>Address : {copied ? "Copied!" : account.address}</Text>
        </TouchableOpacity>

        <VerticalSpace1 />
        <OutlineButton onPress={() => {
            updateRequests();
        }}>
            <Text>Refresh</Text>
        </OutlineButton>
        <VerticalSpace1 />
        <DangerButton onPress={() => {
            w3wallet.core.pairing.disconnect({ topic: topic, reason: getSdkError("USER_DISCONNECTED") })
            router.replace({ pathname: '/' })
        }}>

            <DangerText>Disconnect</DangerText>
        </DangerButton>
        <VerticalSpace1 />
        <HorizontalRule />
        <VerticalSpace1 />

        <H2>{requests.length > 0 ? "Pending transactions on this DApp" : "No pending transactions"}</H2>
        <VerticalSpace1 />
        <HorizontalRule />
        <VerticalSpace1 />

        {
            sourceUrl && requests.map((req) => {
                let title = req.params.request.method === "personal_sign" ? "Sign a message" : "Send a transaction";
                let information = [];
                let cta = "";
                if (req.params.request.method === "personal_sign") {
                    information.push({ "key": "Message", "value": utf8.hexToUtf8(req.params.request.params[0].substring(2)).replace("x19Ethereum Signed Message:\n", "") });
                    cta = "Sign Message"

                }
                else if (req.params.request.method === "eth_sendTransaction") {
                    title += req.params.request.params[0].to;
                    for (const key in req.params.request.params[0]) {
                        if (key == "data")
                            information.push({ "key": key, "value": utf8.hexToUtf8(req.params.request.params[0][key].substring(2)) });
                        else
                            information.push({ "key": key, "value": req.params.request.params[0][key] });
                    }
                    cta = "Send Transaction"
                }
                return <View key={req.id.toString()} id={req.id.toString()}>
                    <VerticalSpace1 />
                    <Text style={{ fontWeight: "bold", fontSize: 16 }}>{title}</Text>
                    <VerticalSpace1 />
                    {
                        information.map((info) => {
                            return <View style={{ flex: 1, flexDirection: 'row' }}><Text style={{ fontWeight: 'bold' }}>{info.key}: </Text><Text> "{info.value}"</Text></View>
                        })
                    }
                    <VerticalSpace1 />
                    <OutlineButton async onPress={async () => {
                        const { params, topic } = req;
                        const { request } = params
                        const message = request.params[0]
                        const wallet = new ethers.Wallet(account.privateKey);
                        let response = { id: req.id, result: null, jsonrpc: '2.0', error: { message: "Something went wrong " } };
                        if (request.method === "personal_sign") {

                            const signedMessage = await wallet.signMessage(message)

                            response = { id: req.id, result: signedMessage, jsonrpc: '2.0' }
                            await w3wallet.respondSessionRequest({ topic, response })
                        }
                        else if (request.method === "eth_sendTransaction") {
                            const tx = request.params[0];
                            const signedTx = await wallet.signTransaction(tx);
                            response = { id: req.id, result: signedTx, jsonrpc: '2.0' }

                            await w3wallet.respondSessionRequest({ topic, response })

                        }
                        w3wallet.respondSessionRequest({ topic: topic, response })
                        setRequests(w3wallet.getPendingSessionRequests());

                    }}>
                        <Text>{cta}</Text>
                    </OutlineButton>
                    <VerticalSpace1 />
                    <DangerButton async onPress={async () => {
                        const response = {
                            id: req.id,
                            jsonrpc: '2.0',
                            error: {
                                code: 5000,
                                message: 'User rejected.'
                            }
                        }
                        w3wallet.respondSessionRequest({ topic: req.topic, response })
                        setRequests(w3wallet.getPendingSessionRequests());

                    }}>
                        <DangerText>Reject</DangerText>
                    </DangerButton>
                    <VerticalSpace1 />
                    <HorizontalRule />


                </View>
            })
        }
    </ScrollView>
}