// jQuery
$(document).ready(function() {


  $(document).on('click', '#signout-btn', logout); //登出

  // $(document).on('click', '#search-btn', filterChart);

  $(document).on('click', '#message', subMessage);//Message 導覽標籤 subtags


    $(document).on('click', '.tablinks' , clickMsg);
    $(document).on('click', '#modal-submit', modalSubmit); //新增
    $(document).on('click', '#save', modalSubmit );
    $(document).on('click', '#addbtn', addMsgCanvas);
    $(document).on('mouseover', '#nav_message', subMessage);//Message 導覽標籤 subtags



    if(window.location.pathname === '/message_addfriendreply'){
    setTimeout(loadFriendsReply, 1000);
  }



});
  function subMessage(){
    if ($('.subTag').is(':visible')){
      $('.subTag').fadeOut(1000, "swing");
    }else{
    $('.subTag').fadeIn(1000, "swing");
  }
  }

  function addMsgCanvas(){
    $('#MsgCanvas').append('<!--TEXT AREA -->'+
                        '<tr style="margin-top:2%">'+
                        '<div id="text" style="display:block; height:100px; width:100%; padding:1.5%;margin:2%">'+
                        '<span style="float:right" onclick="this.parentElement.remove()">X</span>'+
                            '<table>'+
                                '<tr>'+
                                    '<th style="padding:1%; margin:2% 1% 2% 1%; background-color: #ddd">Enter Text:</th>'+
                                '</tr>'+
                                '<tr>'+
                                    '<td style="background-color: #ddd">'+
                                        '<form style="padding:1%; margin:1%">'+
                                            '<input id="textinput" style="width:100%;height:100px" />'+
                                        '</form>'+
                                    '</td>'+
                                '</tr>'+
                                '<tr>'+
                                    '<th style="padding:1%; margin:1%; background-color: #ddd">'+
                                        '<button style="padding:1%; margin:1%; class="tablinks" rel="emos">Emoji</button>'+
                                    '</th>'+
                                '</tr>'+
                            '</table>'+
                        '</div>'+
                        '</tr>');
        console.log('addMsgCanvas exe');

  }



  function modalSubmit() {
    console.log('modal-submit exe');
  let d = Date.now();
  let inp = $('#inputText').val();
  writeUserData(d, auth.currentUser.uid, inp, auth.currentUser.email.toString());
  //塞入資料庫並重整
  $('#inputText').val('');

  alert('Saved!')


  loadFriendsReply();
}


  function writeUserData(d, userId, inp, email) {
  database.ref('message-addfriendsreply/' + userId).push({
    taskText: inp,
    owner: auth.currentUser.email,
  });

}


    function loadFriendsReply(){

  let key = $(this).parent().parent().find('td:first').text();
  let userId = auth.currentUser.uid;
  $("#inputText").empty();


  database.ref('message-addfriendsreply/' + userId + '/' + key).on('value', snap => {
        let dataArray = [];
        let testVal = snap.val();
        let myIds = Object.keys(testVal);

        for(var i=0;i < myIds.length;i++){
          dataArray.push(snap.child(myIds[i]).val());
          if (i==(myIds.length-1)){
     $('#inputText').val(dataArray[i].taskText); //狀態
}
}
});
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
