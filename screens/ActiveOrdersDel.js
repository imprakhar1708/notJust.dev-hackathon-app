import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
	Image,
} from "react-native"
import React, { useEffect, useState } from "react"
import { MagnifyingGlassIcon } from "react-native-heroicons/outline"
import SingleActiveOrder from "../components/SingleActiveOrder"
import firestore from "@react-native-firebase/firestore"
import { firebase } from "@react-native-firebase/auth"

const ActiveOrdersDel = () => {
	const [isloading, setloading] = useState(false)
	const [data, setdata] = useState(null)
	const [notMyOrders, setnotMyOrders] = useState(null)
	const contractRef = firestore().collection("ContractDetails").doc("active")
	useEffect(() => {
		contractRef.onSnapshot(async (doc) => {
			setloading(true)
			if (doc?.exists && doc?.data()?.active.length > 0) {
				const allOrders = await doc?.data()?.active
				setdata(allOrders)
			} else {
				setdata(null)
			}
			setloading(false)
		})
	}, [])
	useEffect(() => {
		const sortNotMyOrders = data?.filter(({ owner_info }) => {
			return owner_info?.uid != firebase.auth().currentUser.uid
		})
		sortNotMyOrders?.sort((a, b) => b.timeAdded - a.timeAdded)
		setnotMyOrders(sortNotMyOrders)
	}, [data])
	return (
		<View className='flex-1'>
			{isloading && (
				<View className='justify-center h-96'>
					<ActivityIndicator size={20} color='orange' />
				</View>
			)}
			{!isloading && notMyOrders?.length > 0 && (
				<>
					<View className='my-4 mx-2 p-2 items-center justify-between bg-gray-200 border-[0.5px] border-gray-400 rounded-xl flex-row'>
						<MagnifyingGlassIcon size={25} color='black' />
						<TextInput
							onChangeText={(e) => {}}
							className='flex-1 px-2'
							type='text'
							placeholder='Search here...'
						/>
					</View>
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							paddingHorizontal: 10,
							paddingBottom: 150,
						}}
					>
						{notMyOrders?.map((order, { idx }) => (
							<SingleActiveOrder
								mine={false}
								key={idx}
								data={order}
							/>
						))}
					</ScrollView>
				</>
			)}
			{!isloading && (!notMyOrders || notMyOrders?.length == 0) && (
				<View className='justify-center h-3/5 items-center'>
					<Image
						source={require("../assets/no_active.png")}
						className='w-80 h-80'
					/>
					<Text className='text-gray-400'>
						No Active Order Contracts...
					</Text>
				</View>
			)}
		</View>
	)
}

export default ActiveOrdersDel
