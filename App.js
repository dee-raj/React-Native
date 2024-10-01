import { StyleSheet } from "react-native";
import Basics from "./components/Basics";
import ToDos from "./components/ToDos";
import SandBox from "./topics/sandBox";

export default function App() {
  return (
    // <Basics />
    <ToDos />
    // <SandBox/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red'
  }
});
