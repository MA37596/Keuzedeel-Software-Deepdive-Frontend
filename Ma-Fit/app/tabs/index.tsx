import { View, Text, StyleSheet } from "react-native";

export default function TabsIndex() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tabs Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  text: {
    fontSize: 18,
    color: "#000000",
  },
});
