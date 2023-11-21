import firebase from "firebase/compat/app"
import "firebase/compat/firestore"
import "firebase/compat/auth"
const firebaseConfig = {
	apiKey: "AIzaSyCqh_IEfmdQr8qa939O639CNCLGGc7gKvg",
	authDomain: "svnit-canteen.firebaseapp.com",
	projectId: "svnit-canteen",
	storageBucket: "svnit-canteen.appspot.com",
	messagingSenderId: "376798649364",
	appId: "1:376798649364:web:f7289fbe14e99689485b01",
	measurementId: "G-CTZY0SG099",
}
if (!firebase.apps.length) {
	firebase.initializeApp(firebaseConfig)
	firebase.firestore()
	// .settings({ experimentalForceLongPolling: true, merge: true })
}
export { firebase }
