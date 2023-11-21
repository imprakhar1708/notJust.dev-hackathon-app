import { useFonts } from "expo-font"
import { Text } from "react-native"

export default (props) => {
	const { fontsLoaded } = useFonts({
		Poppins: require("./fonts/Poppins-Medium.ttf"),
	})
	return (
		<Text {...props} style={[{ fontFamily: "Poppins" }, props.style]}>
			{props.children}
		</Text>
	)
}
