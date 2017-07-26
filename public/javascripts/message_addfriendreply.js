// jQuery
$(document).ready(function() {


  $(document).on('click', '#signout-btn', logout); //登出

  // $(document).on('click', '#search-btn', filterChart);

  $(document).on('click', '#message', subMessage);//Message 導覽標籤 subtags


    $(document).on('click', '.tablinks' , clickMsg);
    $(document).on('click', '#modal-submit', modalSubmit); //新增
    $(document).on('click', '#save', modalSubmit )


    if(window.location.pathname === '/message_addfriendreply'){
    setTimeout(loadFriendReply, 1000);
  }



});
  


  function modalSubmit() {
    console.log('modal-submit exe');
  let d = Date.now()
  let text = $('#textInput').val();

  writeUserData(text, auth.currentUser.email.toString());

  //塞入資料庫並重整
  $('#textInput').val('');

  alert('Saved!')


  loadFriendReply();
}


  function writeUserData(userId,text) {
  database.ref('message-addfriendreply/' + userId).push({
   // datetime: datetime,
    taskText: text,
    owner: auth.currentUser.email,
  });
}


    function loadFriendReply(){
        $("#textInput").empty();
        let userId = auth.currentUser.uid;
        database.ref('message-addfriendreply/' + userId).on('value', snap => {
        let dataArray = [];
        let testVal = snap.val();
        let myIds = Object.keys(testVal);

        for(var i=0;i < myIds.length;i++){
          dataArray.push(snap.child(myIds[i]).val());
          console.log('data in looping for append')

            $("#textInput").val('1');

          }//for

    });
}

  function subMessage(){
    if ($('.subTag').is(':visible')){
      $('.subTag').hide();
    }else{
    $('.subTag').show();
  }
  }

      function clickMsg(){
        var target = $(this).attr('rel');
        $("#"+target).show().siblings().hide();
        console.log('clickMsg executed')
    }






function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login");
  })
}
