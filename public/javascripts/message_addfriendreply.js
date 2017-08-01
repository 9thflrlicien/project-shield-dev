// jQuery
$(document).ready(function() {


  $(document).on('click', '#signout-btn', logout); //登出

  // $(document).on('click', '#search-btn', filterChart);

  $(document).on('click', '#message', subMessage);//Message 導覽標籤 subtags


    $(document).on('click', '.tablinks' , clickMsg);
    $(document).on('click', '#modal-submit', modalSubmit); //新增
    $(document).on('click', '#save', modalSubmit );
    // $(document).on('click', '#addbtn', addMsgCanvas)
    $(document).on('click', '#appendMsg', appendMsgCanvas);
    $(document).on('click', '#viewBtn', loadView);
    $(document).on('click', '#editBtn', openEdit); //打開編輯modal
    $(document).on('click', '#deleBtn', deleteRow); //刪除
    $(document).on('click', '#edit-submit', modalEdit);


    if(window.location.pathname === '/message_addfriendreply'){
    setTimeout(loadFriendsReply, 1000);
  }



});


  function appendMsgCanvas(){
    $('#MsgCanvas').append(
                    '<div class="form-group">'+
                        '<span style="float:left" onclick="this.parentElement.remove()">X</span>'+
                        '<label for="modal-mainKey" class="col-2 col-form-label">Enter text: </label>'+
                        '<div class="col-4">'+
                            '<form style="padding:1%">'+
                              '<input class="form-control" id="inputText" type="text" style="width:100%;height:100px">'+
                            '</form>'+
                        '</div>'+
                    '</div>'
);
        console.log('appendMsgCanvas exe');

  }


  // function addMsgCanvas(){
  //   $('#MsgCanvas').append('<!--TEXT AREA -->'+
  //                       '<tr class="form-control"><span style="float:right" onclick="this.parentElement.remove()">X</span>'+
  //                       '<div style="margin:2%" id="text">'+
  //                           '<table>'+
  //                               '<tr>'+
  //                                   '<th style="padding:1%; margin:2% 1% 2% 1%;">Enter Text:</th>'+
  //                               '</tr>'+
  //                               '<tr>'+
  //                                   '<td>'+
  //                                       '<form style="padding:1%; margin:1%">'+
  //                                           '<input class="form-control" id="inputText" type="text" style="width:100%;height:100px" />'+
  //                                       '</form>'+
  //                                   '</td>'+
  //                               '</tr>'+
  //                               '<tr>'+
  //                                   '<td>'+
  //                                       '<button style="padding:1%; margin:1%; class="tablinks" rel="emos">Emoji</button>'+
  //                                   '</td>'+
  //                               '</tr>'+
  //                           '</table>'+
  //                       '</div>'+
  //                       '</tr>');
  //       console.log('addMsgCanvas exe');

  // }



  function modalSubmit() {
  console.log('modal-submit exe');
  $('#quickAdd').modal('hide');
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
        $("#greetings").empty();
        let userId = auth.currentUser.uid;
        database.ref('message-addfriendsreply/' + userId).on('value', snap => {
        let dataArray = [];
        let testVal = snap.val();
        let myIds = Object.keys(testVal);
        if (myIds.length > 5){
          $('#head').append('<p style="color:red"><b>加好友訊息上限為五則</b></p>');

        }

        for(var i=0;i < 5;i++){
          dataArray.push(snap.child(myIds[i]).val());

            $("#greetings").append(
              '<tr>' +
                '<td id="' + myIds[i] + '" hidden>' + myIds[i] + '</td>' +
                '<td class="msgDetail" id="td">' + dataArray[i].taskText + '</td>' +
                '<td id="td">'+
            '<a href="#" id="editBtn" data-toggle="modal" data-target="#editModal"><b>Edit  </b></a>' +
            '<a href="#" id="viewBtn" data-toggle="modal" data-target="#viewModal"><b>View  </b></a>' +
            '<a href="#" id="deleBtn"><b>Delete</b></a>' +
                '</td>'+
              '</tr>'
        );

          }//for
        });//snap
        }//loadFriendsReply





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

function loadView() {

  $('#view-textinput').text(''); //任務內容
  $('#view-owne').text(''); //負責人
  $('#view-subt').empty(); //

  let key = $(this).parent().parent().find('td:first').text();
  let userId = auth.currentUser.uid;

  database.ref('message-addfriendsreply/' + userId + '/' + (key)).on('value', snap => {
    let testVal = snap.val();
    // 重複出現值 要抓出來
    $('#view-id').append(key); //編號
    $('#view-textinput').append(testVal.taskText); //任務內容
    $('#view-owne').append(testVal.owner); //負責人


  });

}



function openEdit() {
  $('#edit-taskContent').val(''); //任務內容
  $('#edit-owner').val(''); //負責人


  let key = $(this).parent().parent().find('td:first').text();
  let userId = auth.currentUser.uid;

  database.ref('message-addfriendsreply/' + userId + '/' + key).on('value', snap => {
    let testVal = snap.val();
    // console.log(testVal);

    $('#edit-id').append(key);
    $('#edit-taskContent').val(testVal.taskText); //任務內容
    $('#edit-owner').val(testVal.owner); //負責人
    // console.log(sublist);

  });
}

function modalEdit() {
  let key = $('#edit-id').text();
  let userId = auth.currentUser.uid;
  var text = $('#edit-taskContent').val(); //任務內容
  var owne = $('#edit-owner').val(); //負責人
  //日期
  let d = Date.now();
  let date = new Date(d);

  // console.log(key, userId, text, cate, cate, prio, owne, desc, subt, inir, inid, auth.currentUser.email, date);

  saveUserData(key, userId, text, owne, auth.currentUser.email, date.toString());

  $('#edit-id').text(''); //
  $('#edit-taskContent').val(''); //任務內容
  $('#edit-owner').val(''); //負責人


  loadFriendsReply();
  $('#editModal').modal('hide');
}


function saveUserData(key, userId, text, owne, email) {
  database.ref('message-addfriendsreply/' + userId + '/' + key).set({
    taskText: text,
    owner: owne
  });
}



function deleteRow() {
  let key = $(this).parent().parent().find('td:first').text();
  let userId = auth.currentUser.uid;
  // console.log(userId, key);

  database.ref('message-addfriendsreply/' + userId + '/' + key).remove();

  loadFriendsReply();
}




function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login");
  })
}
