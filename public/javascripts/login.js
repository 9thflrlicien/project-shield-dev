var google_provider = new firebase.auth.GoogleAuthProvider();
var facebook_provider = new firebase.auth.FacebookAuthProvider();

$(document).ready(function() {
  $(document).on('click', '#login-btn', login); //登入
  $(document).on('click', '#google-log', googleLog); //Google登入
});

function login(){
  var email = document.getElementById('login-email').value;
  var password = document.getElementById('login-password').value;
  auth.signInWithEmailAndPassword(email, password)
  .then(response => {
    
  })
  .catch(error => {
    showError(error.message);
  });
};

function googleLog() {
  auth.signInWithPopup(google_provider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
    // The signed-in user info.
    var user = result.user;
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
  });
}

function showError(msg) {
  $('#reg-error').hide();
  $('#reg-error').text('');
  $('#reg-error').append(msg);
  $('#reg-error').show();
}
