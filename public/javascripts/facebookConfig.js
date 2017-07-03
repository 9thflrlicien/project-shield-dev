//facebook auth
window.fbAsyncInit = function() {
  FB.init({
    appId      : '1861095000883874',
    xfbml      : true,
    version    : 'v2.9'
  });
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
};

(function(d, s, id){
 var js, fjs = d.getElementsByTagName(s)[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement(s); js.id = id;
 js.src = "//connect.facebook.net/en_US/sdk.js";
 fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));



function statusChangeCallback(response){
 if(response.status === 'connected'){
   console.log('Logged in with Facebook');
   setElements(true);
 } else {
   console.log('Login failed');
   setElements(false);
 }
}

function checkLoginState() {
 FB.getLoginStatus(function(response) {
   statusChangeCallback(response);
 });
}

function setElements(isLoggedIn){
 if(isLoggedIn) {
   window.location.assign("/");
   document.getElementById('signout-btn').style.display = 'none';
   document.getElementById('fb-signout-btn').style.display = 'block';
 } else {
   console.log('not logged in');
   window.location.assign("/login");
 }
}

function fbLogout() {
  FB.logout(function(response) {
    setElements(false);
  });
}
