//ethers and dependencies
import "react-native-get-random-values"
import "@ethersproject/shims"
import { ethers } from "ethers";

import { ScrollView } from "react-native";
import { H1, HorizontalRule, OutlineButton, OutlineTextbox, Text, VerticalSpace1 } from "../../components/Themed";
import ListItem from "../../components/ListItem";
import { useEffect, useState } from "react";
import ImportKeyModal from "./importKeyModal";
import axios from "axios";
import db from "../../utils/db";
import { router } from "expo-router";
import { TextInput } from "react-native-gesture-handler";

export default function Create() {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [privateKey, setPrivateKey] = useState("");
    const [privateKeyModalVisible, setPrivateKeyModalVisible] = useState(false);

    const [chainSearchString, setChainSearchString] = useState("");
    const [allChains, setAllChains] = useState([]);
    const [filteredChains, setFilteredChains] = useState([]);

    const [chainId, setChainId] = useState("");
    const [currency, setCurrency] = useState("");
    const [rpcUrl, setRpcUrl] = useState("");
    const [blockExplorerUrl, setBlockExplorerUrl] = useState("");
    const [decimals, setDecimals] = useState(0);
    const [chainName, setChainName] = useState("");
    const [iconUrl, setIconUrl] = useState("");

    const [accounts, setAccounts] = useState([]);
    useEffect(() => {
        db.getAll('accounts').then((accounts) => {
            setAccounts(accounts);
        })
    });

    useEffect(() => {
        axios.get("https://chainid.network/chains.json").then((response) => {
            let allChains = [];
            console.log(response.data);
            for(let index in response.data) {
                for(let rpcIndex in response.data[index].rpc) {
                    console.log(response.data[index]);
                    if(response.data[index].rpc[rpcIndex].includes("infura") || response.data[index].rpc[rpcIndex].includes("alchemyapi")){
                        continue;
                    }
                    let name = response.data[index].name;
                    if(response.data[index].chainId == 10) 
                        name = "Optimism Mainnet";
                    allChains.push({
                        name: response.data[index].name,
                        iconUrl : `https://icons.llamao.fi/icons/chains/rsz_${response.data[index].icon}.jpg`,
                        chainId: response.data[index].chainId,
                        currency: response.data[index].nativeCurrency.name,
                        decimals: response.data[index].nativeCurrency.decimals,
                        symbol: response.data[index].nativeCurrency.symbol,
                        rpcUrl: response.data[index].rpc[rpcIndex],
                        blockExplorerUrl: response.data[index].explorers? response.data[index].explorers[0] : "",
                    });
                }
            }
            setAllChains(allChains);
            
        });
    }, []);

    return (
        <ScrollView style={{ flex: 1, padding: 16}}>
           <H1>Create an Account</H1> 
           <ImportKeyModal isVisible={privateKeyModalVisible} onClose={() => setPrivateKeyModalVisible(false)} 
                onKeyEntered={(privateKey) => {
                    setPrivateKey(privateKey);
                    setAddress(new ethers.Wallet(privateKey).address);
                    setPrivateKeyModalVisible(false);

                }}
            />
           <VerticalSpace1 />
           {address ? <>
                <ListItem
                    title="Address selected"
                    subtitle={address}
                    image={`https://cdn.stamp.fyi/avatar/{address}`}
                    onPress={() => {
                        setAddress("");
                        setPrivateKey("");
                    }}
                />
           </> : <>
                <ListItem 
                    title="Create a new address" 
                    subtitle="Automatically generate an address for you" 
                    image="https://avatars.githubusercontent.com/u/12504344?s=200&v=4" 
                    onPress={async () => {
                        const wallet = ethers.HDNodeWallet.createRandom();
                        setAddress(wallet.address);
                        setPrivateKey(wallet.privateKey);
                    }}
                />
                <ListItem 
                    title="Import Address" 
                    subtitle="Provide private key to import an address" 
                    image="https://avatars.githubusercontent.com/u/12504344?s=200&v=4" 
                    onPress={async () => {
                        setPrivateKeyModalVisible(true);
                    }}
                />
                <Text>Or reuse address from existing account</Text>
                {
                    accounts.map((account) => {
                        return <ListItem
                            title={account.name||`${account.address.substring(0, 6)}...${account.address.substring(account.address.length - 4)} on ${account.chainName}`}
                            subtitle={`On ${account.chainName}`}
                            image={account.iconUrl}
                            onPress={() => {
                                setAddress(account.address);
                                setPrivateKey(account.privateKey);
                            }}
                        />
                    })
                }

           </>}
           <VerticalSpace1 />
           <HorizontalRule />
            <VerticalSpace1 />
           {
            chainId? <>
                <ListItem
                    title={`Chain selected : ${chainName}, ${chainId}`}
                    subtitle={`${rpcUrl}`}
                    image={`${iconUrl}`}
                    onPress={() => {
                        setChainId("");
                        setCurrency("");
                        setRpcUrl("");
                        setBlockExplorerUrl("");
                        setDecimals(0);
                        setChainName("");
                        setIconUrl("");
                    }}
                />
            </> : 
            <>
                <OutlineTextbox placeholder="On which chain?" onChangeText={(chainSearchString) => {
                    if(chainSearchString.length < 3) {
                        setFilteredChains([]);
                    }
                    else {
                        setFilteredChains(allChains.filter((chain) => {
                            return chain.name.toLowerCase().includes(chainSearchString.toLowerCase());
                        }));
                    }
                    }
                 } />
                {
                    filteredChains.map((chain) => {
                        return <ListItem 
                            title={`${chain.name}, ${chain.chainId}`} 
                            subtitle={`RPC : ${chain.rpcUrl}`} 
                            image={`${chain.iconUrl}`} 
                            onPress={() => {
                                setChainId(chain.chainId);
                                setChainName(chain.name);
                                setIconUrl(chain.iconUrl);
                                setCurrency(chain.currency);
                                setRpcUrl(chain.rpcUrl);
                                setBlockExplorerUrl(chain.blockExplorerUrl);
                                setDecimals(chain.decimals);
                            }}
                        />
                    })
                }

            </>
           }

           <VerticalSpace1 />

           <OutlineTextbox placeholder="Account Name (Optional)" onChangeText={(name) => setName(name)} />
           <VerticalSpace1 />

            <OutlineButton 
                onPress={() => {
                    const account = {
                        name,
                        address,
                        privateKey,
                        chainId,
                        chainName,
                        iconUrl,
                        currency,
                        rpcUrl,
                        blockExplorerUrl,
                        decimals,
                    }
                    db.put('accounts', Date.now().toString(), account);
                    router.back();
                }}
            >
                <Text>Create Account</Text>
            </OutlineButton>

           
        </ScrollView>
    )
}