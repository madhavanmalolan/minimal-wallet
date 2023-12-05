//ethers and dependencies
import "react-native-get-random-values"
import "@ethersproject/shims"
import { ethers } from "ethers";

import { Modal, TextInput, TouchableOpacity } from "react-native";
import { View, H1, VerticalSpace1, Text, OutlineButton, OutlineTextbox, HorizontalRule } from "../../components/Themed";
import { useState } from "react";

export default function ImportKeyModal({isVisible, onClose, children, onKeyEntered}) {
    const [privateKey, setPrivateKey] = useState("");
    return (
        <Modal animationType="slide" transparent={true} visible={isVisible} style={{ padding: 16}}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
                <View style={{ width: '100%', height: '33%', position: 'absolute', bottom: 0, padding: 16}}>
                    <HorizontalRule />
                    <VerticalSpace1 />
                <H1>Import an address</H1>
                <VerticalSpace1 />
                <Text>Enter your private key below to import an address.</Text>
                <VerticalSpace1 />
                <OutlineTextbox 
                    onChangeText={(e) => {
                        try {

                            const wallet = new ethers.Wallet(e);
                            if(e.length == 64) {
                                onKeyEntered(e);
                            }
                            
                            
                        }
                        catch (e){
                        }
                        
                    }}
                />
                <VerticalSpace1 />
                </View>
            </View>
        </Modal>
    )
}