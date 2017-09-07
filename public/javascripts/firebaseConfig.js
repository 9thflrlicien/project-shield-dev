// Initialize Firebase
var config = {
  apiKey: "AIzaSyCKIPCKJpN1PCqK1EUygD6erNpo2lGmrpA",
  authDomain: "shield-production.firebaseapp.com",
  databaseURL: "https://shield-production.firebaseio.com",
  projectId: "shield-production",
  storageBucket: "shield-production.appspot.com",
  messagingSenderId: "524065152880"
};
firebase.initializeApp(config);

const auth = firebase.auth();
const database = firebase.database();

// log in status
if(window.location.pathname === '/login' || window.location.pathname === '/signup'){
  auth.onAuthStateChanged(user => {
    if(user){
      window.location = '/';
    } else {
      console.log('need to sign in');
    }
  });
} else {
  auth.onAuthStateChanged(user => {
    if(user){
      // console.log(user.email);
      console.log('firebase signed in');
    } else {
      // console.log('need to sign in');
      window.location.assign("/login");
    }
  });
}

// functions
function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login");
  })
}
