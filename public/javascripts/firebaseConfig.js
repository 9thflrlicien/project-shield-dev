// Initialize Firebase
var config = {
  apiKey: "AIzaSyAqzIra9YkeE0HZZBSwXrjh4GemO7yVdmI",
  authDomain: "shield-88fd0.firebaseapp.com",
  databaseURL: "https://shield-88fd0.firebaseio.com",
  projectId: "shield-88fd0",
  storageBucket: "shield-88fd0.appspot.com",
  messagingSenderId: "376341346069"
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

//connect firebase with line login
// app.post('/verifyToken', (req, res) => {
//   if (!req.body.token) {
//     return res.status(400).send('Access Token not found');
//   }
//   const reqToken = req.body.token;

//   // Send request to LINE server for access token verification
//   const options = {
//     url: 'https://api.line.me/v1/oauth/verify',
//     headers: {
//       'Authorization': `Bearer ${reqToken}`
//     }
//   };
//   request(options, (error, response, body) => {
//     if (!error && response.statusCode === 200) {
//       const lineObj = JSON.parse(body);
//        // Don't forget to verify the token's channelId to prevent spoof attack
//       if ((typeof lineObj.mid !== 'undefined') 
//                && (lineObj.channelId === myLINEChannelId)) {
//         // Access Token Validation succeed with LINE server
//         // Generate Firebase token and return to device
//         const firebaseToken = generateFirebaseToken(lineObj.mid);

//         // Update Firebase user profile with LINE profile
//         updateUserProfile(reqToken, firebaseToken, lineObj.mid, () => {
//           const ret = {
//             firebase_token: firebaseToken
//           };
//           return res.status(200).send(ret);
//         });
//       }
//     }

//     const ret = {
//       error_message: 'Authentication error: Cannot verify access token.'
//     };
//     return res.status(403).send(ret);
     
//     });

//   });


// //---- reuse line tocken
// function generateFirebaseToken(lineMid) {
//   var firebaseUid = 'line:' + lineMid;
//   var additionalClaims = {
//     provider: 'LINE'
//   };
//   return firebase.auth().createCustomToken(firebaseUid);
// }