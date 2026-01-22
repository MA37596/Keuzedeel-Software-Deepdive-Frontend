import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Welcome() {
  const router = useRouter();


  // na 2000ms wordt je door verwezen naar tabs, dit is een soort splashscreen maar niet helemaal een splash screen
  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/(tabs)");
    }, 2000);
    return () => clearTimeout(t);
  }, [router]);



  // splashscreen zonder logo 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welkom bij Ma-Fit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
  },
});
