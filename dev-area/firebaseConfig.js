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

//initialize firebase components
const auth = firebase.auth();
const dbProf = firebase.database().ref().child('profile');
const dbTodo = firebase.database().ref().child('todo');


auth.onAuthStateChanged(user => {
  if(user){
    console.log('user has signed in', user.ze);
  } else {
    console.log('need to sign in');
  }
});

dbProf.on('value', profile => {
  console.log('profile', profile);
});

dbTodo.on('value', todo => {
  console.log('todo', todo);
});

// functions
// firebase
function register(){
  var email = document.getElementById('register-email').value;
  var password = document.getElementById('register-password').value;
  console.log(email, password);
  auth.createUserWithEmailAndPassword(email, password)
  .then(() => {
    window.location.assign("/");
  })
  .catch(error => {
    console.log(error);
  });
};

function login(){
  var email = document.getElementById('login-email').value;
  var password = document.getElementById('login-password').value;
  auth.signInWithEmailAndPassword(email, password)
  .then(response => {
    window.location.assign("/");
  })
  .catch(error => {
    console.log(error);
  });
};

function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login");
  })
}
