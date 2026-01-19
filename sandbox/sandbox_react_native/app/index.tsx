import { Text, View } from "react-native";
import WebView from "react-native-webview";

export default function Index() {
  const sandboxURL = "http://10.0.2.2:4200";
  console.log(123, sandboxURL);

  // fetch(url).then((res) => console.log(res));

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <WebView source={{ uri: sandboxURL }} style={{ flex: 1 }} />;
      {/* <Text>Edit app/index.tsx to edit this screen.</Text> */}
    </View>
  );
}
