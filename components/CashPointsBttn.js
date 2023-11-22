import { TouchableOpacity, View } from "react-native"
import React, { useEffect, useState } from "react"
import { PlusIcon } from "react-native-heroicons/outline"
import {
	RewardedAd,
	RewardedAdEventType,
	TestIds,
} from "react-native-google-mobile-ads"
import firestore from "@react-native-firebase/firestore"
import { firebase as firebaseAuth } from "@react-native-firebase/auth"

const adUnitId = TestIds.REWARDED

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
			<View className=' justify-center bg-orange-400 p-3 rounded-xl'>
				<PlusIcon size={20} color='white' />
			</View>
		</TouchableOpacity>
	)
}

export default CashPointsBttn
