import { TouchableOpacity } from "react-native"
import React, { useEffect, useState } from "react"
import { PlusIcon } from "react-native-heroicons/outline"
import {
	RewardedAd,
	RewardedAdEventType,
	TestIds,
} from "react-native-google-mobile-ads"
import firestore from "@react-native-firebase/firestore"
import { firebase as firebaseAuth } from "@react-native-firebase/auth"
import { LinearGradient } from "expo-linear-gradient"

const adUnitId = __DEV__
	? TestIds.REWARDED
	: "ca-app-pub-7209361652520357/6276108350"

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
	requestNonPersonalizedAdsOnly: true,
})

const CashPointsBttn = () => {
	const cpRef = firestore()
		.collection("CashPointDetails")
		.doc(firebaseAuth.auth().currentUser.uid)
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		const unsubscribeLoaded = rewarded.addAdEventListener(
			RewardedAdEventType.LOADED,
			() => {
				setLoaded(true)
			}
		)
		const unsubscribeEarned = rewarded.addAdEventListener(
			RewardedAdEventType.EARNED_REWARD,
			(reward) => {
				cpRef.get().then((doc) => {
					if (doc?.exists) {
						cpRef.update({
							cashPoints: parseInt(doc?.data()?.cashPoints) + 1,
							history: firestore.FieldValue.arrayUnion({
								action: "add",
								date: new Date().toISOString(),
								amount: 1,
								title: "Cashpoints Added",
								type: "Ads",
							}),
						})
					}
				})
			}
		)
		rewarded.load()
		return () => {
			unsubscribeLoaded()
			unsubscribeEarned()
		}
	}, [])

	if (!loaded) {
		rewarded.load()
		return null
	}

	return (
		<TouchableOpacity
			onPress={() => {
				rewarded.show()
				setLoaded(false)
			}}
			className=' justify-center'
		>
			<LinearGradient
				className=' justify-center p-3 rounded-xl'
				colors={["#7F8C8D", "#000000"]}
				start={{ x: 0, y: 0.5 }}
				end={{ x: 1, y: 0.5 }}
			>
				<PlusIcon size={20} color='white' />
			</LinearGradient>
		</TouchableOpacity>
	)
}

export default CashPointsBttn
