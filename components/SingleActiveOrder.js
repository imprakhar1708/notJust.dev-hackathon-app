import {
	View,
	Text,
	Image,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native"
import React, { useState } from "react"
import {
	ChevronDownIcon,
	ChevronUpIcon,
	BanknotesIcon,
	MapPinIcon,
} from "react-native-heroicons/outline"
import SingleItem from "./SingleItem"
import {
	ArrowLeftCircleIcon,
	CheckCircleIcon,
	ChevronDoubleLeftIcon,
	XCircleIcon,
} from "react-native-heroicons/solid"

const SingleActiveOrder = ({ data, mine }) => {
	const [open, setopen] = useState(false)
	const [innermodal, setinnermodal] = useState(false)
	return (
		<View className=' p-2 mb-3 rounded-xl border-[.8px] border-gray-300'>
			<TouchableOpacity
				onPress={() => {
					setopen(false)
					setinnermodal(true)
				}}
				className='flex-row pb-2 justify-between'
			>
				<View className='flex-row px-2 items-center'>
					<View>
						<Image
							source={{ uri: data?.owner_info?.photoUrl }}
							className='w-12 h-12 rounded-full'
						/>
					</View>

					<View className='px-1'>
						<Text className='font-black text-xl text-gray-600'>
							{data?.owner_info.name}
						</Text>
						<View className='flex-row'>
							<View className='flex-row items-center'>
								<MapPinIcon size={15} color='orange' />
								<View>
									<Text className='text-xs font-bold text-gray-400'>
										{data?.owner_info.hostel} &#11825;{" "}
									</Text>
								</View>
							</View>
							<View className='flex-row items-center'>
								<BanknotesIcon size={15} color='green' />
								<Text className='text-xs font-bold text-gray-400'>
									{" "}
									{data?.order_data.cp}
								</Text>
							</View>
						</View>
					</View>
				</View>
				<View className='items-end'>
					<View className='py-1 px-2 text-white bg-red-400 rounded-2xl flex-row items-center'>
						{mine ? (
							<ActivityIndicator size={10} color='white' />
						) : (
							<View className='w-2 h-2 rounded-full bg-white' />
						)}
						<Text className='font-black text-xs text-white pl-1'>
							{mine ? "Waiting" : "Live"}
						</Text>
					</View>
					<Text className='text-lg text-end font-bold text-gray-600'>
						₹{data?.order_data.total}
					</Text>
				</View>
			</TouchableOpacity>
			<View className='px-3 py-2 bg-gray-200 border-[.5px] border-gray-300 rounded-xl'>
				<TouchableOpacity
					onPress={() => {
						setopen((prev) => !prev)
					}}
					className={`flex-row w-full  ${
						open ? "justify-end" : "justify-between"
					} items-center`}
				>
					{!open && (
						<Text className='text-xs font-bold text-gray-700'>
							Order Items
						</Text>
					)}
					{!open ? (
						<ChevronDownIcon size={15} color='rgb(55 65 81)' />
					) : (
						<ChevronUpIcon size={15} color='rgb(55 65 81)' />
					)}
				</TouchableOpacity>
				{open && (
					<View className='px-3 py-1'>
						{data?.order_data.order.map((item) => (
							<SingleItem key={item.food.id} data={item} />
						))}
					</View>
				)}
			</View>
			{innermodal && (
				<>
					<View className='absolute rounded-xl overflow-hidden top-0 w-[386px] h-[104px]'>
						<View className='w-full h-full z-10 bg-black opacity-70' />
					</View>
					<View className='absolute top-0 gap-x-2 w-[386px] h-[104px] flex-row justify-center items-center'>
						<TouchableOpacity
							onPress={() => {}}
							className={`${
								mine ? "bg-red-400" : "bg-green-400"
							} rounded-lg overflow-hidden px-7 py-4 items-center flex-row`}
						>
							{mine ? (
								<XCircleIcon size={20} color='black' />
							) : (
								<CheckCircleIcon size={20} color='black' />
							)}
							<Text className='text-sm font-black'>
								{mine ? "Cancel" : "Accept"}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => {
								setinnermodal(false)
							}}
							className='rounded-lg bg-gray-200 overflow-hidden px-8 py-4 items-center flex-row'
						>
							<ArrowLeftCircleIcon size={20} color='black' />
							<Text className='text-sm font-black'>Back</Text>
						</TouchableOpacity>
					</View>
				</>
			)}
		</View>
	)
}

export default SingleActiveOrder
