import {
	View,
	Text,
	ScrollView,
	Image,
	TouchableOpacity,
	Modal,
	Pressable,
	ActivityIndicator,
} from "react-native"
import React, { useEffect, useState } from "react"
import { firebase } from "../Firebase/firebaseConfig"
import firestore from "@react-native-firebase/firestore"
import { firebase as firebaseAuth } from "@react-native-firebase/auth"
import CartItem from "../components/CartItem"
import OrderModal from "../components/OrderModal"
import Confetti from "../components/Confetti"
import RazorpayCheckout from "react-native-razorpay"
import { ArrowPathIcon, ArrowRightIcon } from "react-native-heroicons/solid"
import Toast from "react-native-root-toast"
import {
	BanknotesIcon,
	InformationCircleIcon,
} from "react-native-heroicons/outline"

const CartScreen = ({ navigation }) => {
	const [isDisabled, setisDisabled] = useState(false)
	const [modalVisible, setModalVisible] = useState(false)
	const [status, setstatus] = useState(false)
	const [isLoading, setisLoading] = useState(true)
	const [cartData, setcartData] = useState(null)
	const [cartDisplayData, setcartDisplayData] = useState(null)
	const [buyOption, setbuyOption] = useState("ta")
	const [total, settotal] = useState(0)
	const user = firebaseAuth.auth().currentUser
	const cartDocRef = firestore().collection("CartDetails").doc(user.uid)
	const orderDocRef = firestore().collection("OrderDetails").doc(user.uid)
	const cpRef = firestore().collection("CashPointDetails").doc(user.uid)
	const createOrder = () => {
		const orderId = user.uid + new Date().getTime().toString()
		orderDocRef.get().then((doc) => {
			if (doc?.exists) {
				orderDocRef.update({
					orders: firestore.FieldValue.arrayUnion({
						uid: user.uid,
						email: user.email,
						displayName: user.displayName,
						itemTotal: total,
						total:
							buyOption === "del"
								? (total * 1.17).toFixed(2)
								: (total * 1.1).toFixed(2),
						orderDate: new Date().toDateString(),
						orderTime: new Date().toLocaleTimeString(),
						time: new Date().toISOString(),
						status: "Ongoing",
						mode: buyOption,
						id: orderId,
						items: cartData,
					}),
				})
			} else {
				orderDocRef.set({
					orders: [
						{
							uid: user.uid,
							itemTotal: total,
							displayName: user.displayName,
							total:
								buyOption === "del"
									? (total * 1.17).toFixed(2)
									: (total * 1.1).toFixed(2),
							email: user.email,
							orderDate: new Date().toDateString(),
							orderTime: new Date().toLocaleTimeString(),
							time: new Date().toISOString(),
							status: "Ongoing",
							mode: buyOption,
							id: orderId,
							items: cartData,
						},
					],
				})
			}
		})
		total >= 100
			? cpRef.get().then((doc) => {
					if (doc?.exists) {
						cpRef.update({
							cashPoints:
								parseInt(doc?.data()?.cashPoints) +
								parseInt((0.01 * total).toFixed(0)),
							history: firestore.FieldValue.arrayUnion({
								action: "add",
								date: new Date().toISOString(),
								amount: parseInt((0.01 * total).toFixed(0)),
								title: "Cashpoints Added",
								id: orderId,
								type: "Order",
							}),
						})
					}
			  })
			: null
	}

	const onPressSuccess = () => {
		navigation.navigate("User")
		setModalVisible(false)
	}

	const pay = async (e) => {
		setisDisabled(true)
		let id = null
		await fetch("https://canteen-app-backend.onrender.com/payment", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				amount: total * 100,
			}),
		})
			.then((res) => res.json())
			.then((data) => (id = data.id))
			.catch((e) => {
				setstatus(false)
				setModalVisible(true)
				return
			})
		var options = {
			description: "Pay For Order",
			currency: "INR",
			key: "rzp_test_GXwGCmJSauvS0K",
			amount:
				buyOption === "del"
					? parseInt((total * 1.17).toFixed(2) * 100)
					: parseInt((total * 1.1).toFixed(2) * 100),
			name: "SVNIT Canteen",
			order_id: id,
		}
		RazorpayCheckout.open(options)
			.then((data) => {
				createOrder()
				cartDocRef.delete()
				setModalVisible(true)
				setstatus(true)
				setisDisabled(false)
			})
			.catch((error) => {
				setstatus(false)
				setModalVisible(true)
				setisDisabled(false)
			})
	}

	useEffect(() => {
		const cart = cartDocRef.onSnapshot((doc) => {
			if (doc?.exists && doc?.data()?.cartItems.length > 0) {
				setcartData(doc?.data()?.cart)
				let price = 0
				doc.data().cart.forEach((item) => {
					price += item.food.foodPrice * item.qty
				})
				settotal(price)
			} else {
				setcartData(null)
			}
			setisLoading(false)
		})
	}, [])

	useEffect(() => {
		total <= 100 && buyOption === "del" ? setbuyOption("ta") : null
	}, [total])

	useEffect(() => {
		const sortCart = cartData?.sort((a, b) => {
			return a.timeAdded - b.timeAdded
		})
		setcartDisplayData(sortCart)
	}, [cartData])

	const errorToast = () => {
		Toast.show(`⚠️ Delivery only for Orders above ₹100`, {
			position: 100,
			backgroundColor: "black",
			textColor: "white",
			opacity: 1,
			duration: 1000,
		})
	}

	const paramsCartData = {
		total: (total * 1.17).toFixed(2),
		cp: (0.07 * total).toFixed(0),
		order: cartData,
	}

	return (
		<View className='flex-1 relative pb-80'>
			{isLoading && (
				<View className='self-center w-full mt-20'>
					<ActivityIndicator size={30} color='grey' />
				</View>
			)}
			{!isLoading && (
				<ScrollView
					contentContainerStyle={{
						paddingHorizontal: 15,
						paddingTop: 15,
						paddingBottom: 85,
					}}
				>
					{cartDisplayData?.map((item) => (
						<CartItem
							disabled={isDisabled}
							key={item.food.id}
							navigation={navigation}
							item={item.food}
							qty={item.qty}
						/>
					))}
				</ScrollView>
			)}
			{cartData && (
				<View className='px-5 w-full absolute bottom-0 pb-20 bg-orange-50 rounded-t-3xl'>
					<View className='py-5 px-5 '>
						<View className='flex-row items-center rounded-xl overflow-hidden bg-orange-100  justify-between'>
							<TouchableOpacity
								disabled={isDisabled}
								onPress={() => {
									total >= 100
										? setbuyOption("del")
										: errorToast()
								}}
								className={`flex-1 p-2 border-r-[0.5px] ${
									buyOption === "del" ? "bg-orange-300" : ""
								} ${
									total < 100 ? "bg-gray-200" : ""
								} border-gray-500`}
							>
								<Text className='text-center'>Delivery</Text>
							</TouchableOpacity>

							<TouchableOpacity
								disabled={isDisabled}
								onPress={() => {
									setbuyOption("ta")
								}}
								className={`flex-1 p-2 border-l-[0.5px] ${
									buyOption === "ta" ? "bg-orange-300" : ""
								} border-gray-500`}
							>
								<Text className='text-center'>Takeaway</Text>
							</TouchableOpacity>
						</View>
					</View>
					{isLoading && <ActivityIndicator size={20} color='grey' />}
					{!isLoading && (
						<View>
							<View className='border-b-[0.5px] py-2 border-gray-300'>
								<View className='flex-row px-5  justify-between'>
									<Text className='text-gray-500'>
										Sub-Total :
									</Text>
									<Text className='text-gray-500 font-bold'>
										₹{total}
									</Text>
								</View>
								<View className='flex-row px-5 justify-between'>
									<Text className='text-gray-500'>
										Convenience Fee :
									</Text>
									<Text className='text-gray-500 font-bold'>
										₹{(0.1 * total).toFixed(2)}
									</Text>
								</View>
								{total >= 100 && buyOption === "del" && (
									<View className='flex-row px-5 justify-between'>
										<Text className='text-gray-500'>
											Delivery Fee :
										</Text>
										<Text className='text-gray-500 font-bold'>
											₹{(0.07 * total).toFixed(0)}
										</Text>
									</View>
								)}
								{total >= 50 && (
									<View className='flex-row px-5 items-center justify-between'>
										<Text className='text-gray-500'>
											Cash Points :
										</Text>
										<View className='flex-row justify-center gap-1 items-center'>
											<Text className='text-gray-500 text-lg font-bold'>
												+{(0.01 * total).toFixed(0)}
											</Text>
											<BanknotesIcon
												size={18}
												color='green'
											/>
										</View>
									</View>
								)}
								{total < 50 && (
									<View className='flex-row px-4 py-1 items-center'>
										<View className='flex-row bg-gray-700 gap-x-1 py-1 pl-1 pr-2 rounded-full justify-center items-center'>
											<InformationCircleIcon
												size={15}
												color='white'
											/>
											<Text className='text-white text-xs font-bold'>
												Order Above ₹50 to earn
												CashPoints
											</Text>
											<BanknotesIcon
												size={15}
												color='white'
											/>
										</View>
									</View>
								)}
							</View>
							<View className='flex-row p-5 justify-between'>
								<Text className='text-xl font-bold'>
									Total :
								</Text>
								<Text className='text-xl font-extrabold'>
									{buyOption === "del"
										? `₹${(1.1 * total).toFixed(2)}`
										: `₹${(1.1 * total).toFixed(2)}`}
								</Text>
							</View>
						</View>
					)}
					<TouchableOpacity
						disabled={isDisabled}
						style={{
							shadowColor: "#ffa500",
							shadowOffset: {
								width: 0,
								height: 11,
							},
							shadowOpacity: 0.23,
							shadowRadius: 11.78,
							elevation: 15,
						}}
						onPress={(e) => {
							buyOption === "del"
								? navigation.navigate("Delivery", {
										screen: "DeliveryDetails",
										initial: false,
										params: { cartData: paramsCartData },
								  })
								: pay(e)
						}}
						className='py-5 my-5 justify-center items-center px-10 rounded-2xl bg-orange-400'
					>
						{isDisabled && (
							<ActivityIndicator size={19} color='grey' />
						)}
						{!isDisabled && (
							<Text className='text-white font-extrabold'>
								{buyOption === "del"
									? "Find Delivery Partners"
									: "Proceed To Pay"}
							</Text>
						)}
					</TouchableOpacity>
				</View>
			)}
			{!isLoading && !cartData && (
				<View className='justify-center w-full items-center'>
					<Image
						source={require("../assets/empty_cart.png")}
						className='w-80 h-80'
					/>
					<Text className='text-gray-400'>No Items in Cart...</Text>
				</View>
			)}
			{modalVisible && (
				<>
					<Modal
						animationType='slide'
						transparent={true}
						visible={modalVisible}
						onRequestClose={() => {
							setModalVisible(!modalVisible)
						}}
						className='relative'
					>
						<View
							style={{
								shadowColor: "#000000",
								shadowOffset: {
									width: 0,
									height: 5,
								},
								shadowOpacity: 0.2,
								shadowRadius: 5.62,
								elevation: 7,
							}}
							className='justify-center items-center flex-1'
						>
							<View
								style={{
									opacity: 0.8,
								}}
								className='absolute top-0 bg-black w-full h-full'
							/>
							<View
								className={`items-center justify-center py-5 px-11 ${
									status ? "bg-green-500" : "bg-red-500"
								} rounded-3xl`}
							>
								<OrderModal
									navigation={navigation}
									status={status}
								/>
								<Pressable
									onPress={() => {
										status === true
											? onPressSuccess()
											: setModalVisible(false)
									}}
									className='flex-row justify-center items-center gap-x-1 px-4 py-3 bg-black rounded-2xl'
								>
									{status === true ? null : (
										<ArrowPathIcon
											size={15}
											color='white'
										/>
									)}

									<Text className='text-center text-white font-bold'>
										{status === true
											? "Orders "
											: "Try Again "}
									</Text>

									{status === true ? (
										<ArrowRightIcon
											size={15}
											color='white'
										/>
									) : null}
								</Pressable>
							</View>
							<Confetti
								active={status}
								className='bottom-0 absolute'
							/>
						</View>
					</Modal>
				</>
			)}
		</View>
	)
}

export default CartScreen
