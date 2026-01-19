import { Text, View } from "react-native";
import { WebView } from "react-native-webview";

export default function Index() {
  const sandboxURL = "http://10.0.2.2:4200";
  console.log(1231, sandboxURL);

  fetch(sandboxURL).then((res) => console.log(44, res));

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* <Text>hello world</Text> */}
      <WebView source={{ uri: "http://10.0.0.2:4200" }} style={{ flex: 1 }} />;
    </View>
  );
}
