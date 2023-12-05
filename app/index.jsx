import { Camera, CameraType } from "expo-camera";
import { useState } from "react";
import { Button, Text } from "react-native";
import { View } from "../components/Themed";
import { BarCodeScanner } from "expo-barcode-scanner";
import { router } from 'expo-router';

export default function Index() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  if (!permission || !permission.granted) {
    return (
      <View style={{ flex: 1, paddingTop: 100 }}>
        <Text>Camera permission is required to use this feature.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    )
  }
  return (
    <>
      <Camera style={{ flex: 1 }}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
        }}
        onBarCodeScanned={(scanningResult) => {
          if (scanningResult.data.substring(0, 3) == "wc:") {
            console.log(scanningResult.data);
            router.replace({ pathname: 'connect', params: { url: scanningResult.data } })
          }
        }}
      >
      </Camera>
    </>
  )
}