import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginnSignUp from "../screens/Login&SignUp"
import OnboardingScreen from "../screens/OnboardingScreen"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Tabs from "./Tabs"

const MasterNav = () => {
	const [isAppFirstLaunched, setIsAppFirstLaunched] = React.useState(null)

	React.useEffect(async () => {
		const appData = await AsyncStorage.getItem("isAppFirstLaunched")
		if (appData == null) {
			setIsAppFirstLaunched(true)
			AsyncStorage.setItem("isAppFirstLaunched", "false")
		} else {
			setIsAppFirstLaunched(false)
		}
	}, [])
	const Stack = createNativeStackNavigator()
	return (
		isAppFirstLaunched != null && (
			<Stack.Navigator>
				{isAppFirstLaunched && (
					<Stack.Screen
						options={{
							headerShown: false,
						}}
						name='Onboarding'
						component={OnboardingScreen}
					/>
				)}
				<Stack.Screen
					options={{
						headerShown: false,
					}}
					name='Login&SignUp'
					component={LoginnSignUp}
				/>
				<Stack.Screen
					options={{
						headerShown: false,
					}}
					name='Main'
					component={Tabs}
				/>
			</Stack.Navigator>
		)
	)
}

export default MasterNav
