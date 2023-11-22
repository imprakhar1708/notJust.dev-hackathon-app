import RazorpayCheckout from "react-native-razorpay"
export default pay = async (
	setisDisabled,
	amount,
	fnErrorMiddle,
	fnSuccess,
	fnError
) => {
	setisDisabled(true)
	let id = null
	await fetch("https://canteen-app-backend.onrender.com/payment", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			amount,
		}),
	})
		.then((res) => res.json())
		.then((data) => (id = data.id))
		.catch((e) => {
			fnErrorMiddle()
			return
		})
	var options = {
		description: "Pay For Order",
		currency: "INR",
		key: "rzp_test_GXwGCmJSauvS0K",
		amount,
		name: "SVNIT Canteen",
		order_id: id,
	}
	RazorpayCheckout.open(options)
		.then((data) => {
			fnSuccess()
		})
		.catch((error) => {
			fnError()
		})
}
