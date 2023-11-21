import { View, Text, TouchableOpacity } from "react-native"
import React, { useEffect } from "react"
import {
	ChevronRightIcon,
	HomeModernIcon,
	MapPinIcon,
	PhoneIcon,
	UserIcon,
} from "react-native-heroicons/solid"
import firestore from "@react-native-firebase/firestore"
import Toast from "react-native-root-toast"

const SingleDel = ({ data, cartData, navigation }) => {
	const contractRef = firestore().collection("ContractDetails").doc("active")
	const onPress = () => {
		contractRef.get().then((doc) => {
			if (doc?.exists) {
				contractRef
					.update({
						active: firestore.FieldValue.arrayUnion({
							owner_info: data,
							order_data: cartData,
							timeAdded: new Date().getTime(),
						}),
					})
					.then(() => {
						navigation.setParams({
							cartData: null,
						})
						showDoneToast()
						navigation.navigate("DelScreen", {
							screen: "My Orders",
						})
					})
			} else {
				contractRef
					.set({
						active: [
							{
								owner_info: data,
								order_data: cartData,
								timeAdded: new Date().getTime(),
							},
						],
					})
					.then(() => {
						navigation.setParams({
							cartData: null,
						})
						showDoneToast()
						navigation.navigate("DelScreen", {
							screen: "My Orders",
						})
					})
			}
		})
	}
	const showDoneToast = () => {
		Toast.show(`Your Delivery Contract is Live!`, {
			position: 100,
			backgroundColor: "black",
			textColor: "white",
			opacity: 1,
			duration: 1000,
		})
	}
	return (
		<TouchableOpacity
			onPress={() => {
				cartData ? onPress() : null
			}}
			style={{ width: 175 }}
			className='flex-row py-3 mb-2 mr-2 pl-2 justify-between border-[0.5px] border-gray-300 bg-gray-200 rounded-lg'
		>
			<View className=' flex-row items-center'>
				<View className='gap-2'>
					<View>
						<Text className='font-bold text-gray-700'>
							{data?.name}
						</Text>
					</View>
					<View className='flex-row gap-x-1 items-center'>
						<View className='bg-gray-300 p-1 rounded-full'>
							<HomeModernIcon size={10} color='black' />
						</View>

						<Text className='text-xs font-bold text-gray-500'>
							{data?.room}
						</Text>
					</View>
					<View className='flex-row gap-x-1 items-center'>
						<View className='bg-gray-300 p-1 rounded-full'>
							<MapPinIcon size={10} color='black' />
						</View>

						<Text className='text-xs font-bold text-gray-500'>
							{data?.hostel}
						</Text>
					</View>
					<View className='flex-row gap-x-1 items-center'>
						<View className='bg-gray-300 p-1 rounded-full'>
							<PhoneIcon size={10} color='black' />
						</View>

						<Text className='text-xs font-bold text-gray-500'>
							{data?.phn}
						</Text>
					</View>
				</View>
			</View>
			<View className='justify-center'>
				<ChevronRightIcon size={20} color='black' />
			</View>
		</TouchableOpacity>
	)
}

export default SingleDel
