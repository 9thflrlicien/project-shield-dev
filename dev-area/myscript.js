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


auth.onAuthStateChanged(user => {
  if(user){
    console.log('user has signed in');
  } else {
    console.log('need to sign in');
    window.location = '/login';
  }
});


// jQuery
$(document).ready(function() {

  $(document).on('click', '#login-btn', login); //登入
  $(document).on('click', '#register-btn', register); //註冊
  $(document).on('click', '#signout-btn', logout); //登出

  $(document).on('click', '#search-btn', filterChart);

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


//搜尋篩選要檢視的chart
function filterChart(){
  let getInputVal = $('#search-input').val().toLowerCase();
  console.log(getInputVal);
  if(getInputVal !== ''){
    $('.panel-default').css("display","none");

    if($('.name').is('#' + getInputVal)){
      $('#' + getInputVal).parent().parent().css("display","block");
    }

    // $('.name').each(() => {
    //   var text = $(this).text().toLowerCase();
    //   console.log(text);
    //   if(text.indexOf(getInputVal) != -1){
    //     $(this).parent().parent().show();
    //   }
    // });
  } else {
    $('.panel-default').css("display","block");
  }

};
