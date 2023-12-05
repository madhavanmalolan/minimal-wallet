import { Image, TouchableOpacity } from "react-native";
import { HorizontalRule, Text, VerticalSpace1, View } from "../Themed";

export default function ListItem(props) {
    return (
        <TouchableOpacity onPress={props.onPress} style={{ flex: 1, flexDirection: 'row', padding: 8 }}>
            <Image
                defaultSource={{ uri: 'https://via.placeholder.com/48' }}
                source={{ uri: props.image }} style={{ width: 48, height: 48, borderRadius: 4 }} />
            <View style={{ flex: 1, paddingLeft: 8, heigh: '100%' }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{props.title}</Text>
                <Text style={{ fontSize: 12 }}>{props.subtitle}</Text>
                <VerticalSpace1 />
                <HorizontalRule />
            </View>
        </TouchableOpacity>
    )
}