import { Text, View } from "react-native";
import { WebView } from "react-native-webview";

export default function Index() {
  // const sandboxURL = "http://10.0.2.2:4200";
  const sandboxURL = "https://reactnative.dev";
  console.log(1231, sandboxURL);

  fetch(sandboxURL).then((res) => console.log(44, res));

  return (
    <View
      style={{
        width: "100%",
        height: "100%",
        // flex: 1,
        // justifyContent: "center",
        // alignItems: "center",
        borderColor: "red",
        borderWidth: 1,
      }}
    >
      <Text style={{ textAlign: "center", borderColor: "red", borderWidth: 3 }}>
        hello world
      </Text>
      <WebView
        source={{ uri: "https://reactnative.dev" }}
        style={{ width: "100%", borderWidth: 2, borderColor: "black" }}
      />
    </View>
  );
}
