// jQuery
$(document).ready(function() {


  $(document).on('click', '#signout-btn', logout); //登出

  // $(document).on('click', '#search-btn', filterChart);

  $(document).on('click', '#message', subMessage);//Message 導覽標籤 subtags


  $(document).on('click', '.tablinks' , clickMsg);
  $(document).on('click', '.addTopics', addTopics);
  $(document).on('click', '#modal-submit', modalSubmit); //新增
  $(document).on('click', '#viewBtn', loadView);
  $(document).on('click', '#editBtn', openEdit); //打開編輯modal
  $(document).on('click', '#edit-submit', modalEdit);



    if(window.location.pathname === '/message_autoreply'){
    setTimeout(loadAutoReply, 1000);
  }


});

  function modalSubmit() {
  let d = Date.now()
  let name = $('#modal-task-name').val();
  let datetime = $('#datetime').val();
  let textInput = $('#modal-text').val();

  writeUserData(auth.currentUser.uid, name, datetime, textInput, auth.currentUser.email.toString());

  //塞入資料庫並重整
  $('#quickAdd').modal('hide');
  $('#modal-task-name').val('');
  $('#datetime').val('');
  $('#modal-text').val('');
  alert('Saved!')


  loadAutoReply();
}


  function writeUserData(userId, name, textInput) {
  database.ref('message-autoreply/' + userId).push({
    taskName: name,
    // datetime: datetime,
    taskText: textInput,
    owner: auth.currentUser.email,
 

  });
    console.log('this is textInput: '+textInput);

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
    }


    function addTopics(){
        var target = $(this).attr('rel');
        $("#"+target).show()


    }


    function loadAutoReply(){
        console.log('loadAutoReply executed')
        $('#autoreply-list').empty();
        let userId = auth.currentUser.uid;
        database.ref('message-autoreply/' + userId).on('value', snap => {
        let dataArray = [];
        let testVal = snap.val();
        let myIds = Object.keys(testVal);

        for(var i=0;i < myIds.length;i++){
          dataArray.push(snap.child(myIds[i]).val());
            $('#autoreply-list').append(
              '<tr>' +
                '<td id="' + myIds[i] + '" hidden>' + myIds[i] + '</td>' +
                '<td>' + 'Open' + '</td>' +
                '<td>' + 'No Setup' + '</td>' +
                '<td><a href="#"><b>' + dataArray[i].taskName + '</b></a></td>' +
                '<td>' + 'Not Assigned' + '</td>' +
                '<td>' + dataArray[i].taskText + '</td>' +
                '<td>' +
                '<a href="#" id="editBtn" data-toggle="modal" data-target="#editModal"><b>Edit</b></a>' +
                ' ' +
                '<a href="#" id="viewBtn" data-toggle="modal" data-target="#viewModal"><b>View</b></a>' +
                ' ' +
                '<a href="#" id="deleBtn"><b>Delete</b></a>' +
                '</td>' +
              '</tr>'
        );
      }
    });
}

function loadView() {

  $('#view-title').text(''); //標題
  $('#view-textinput').text(''); //任務內容
  $('#view-owne').text(''); //負責人

  let key = $(this).parent().parent().find('td:first').text();
  console.log(key);
  let userId = auth.currentUser.uid;

  database.ref('message-autoreply/' + userId + '/' + (key)).on('value', snap => {
    let testVal = snap.val();
    console.log(testVal);
    // 重複出現值 要抓出來
    $('#view-id').append(key); //編號
    $('#view-title').append(testVal.taskName)
    $('#view-textinput').append(testVal.taskContent); //任務內容
    $('#view-owne').append(testVal.owner); //負責人
  

  });

}

function openEdit() {
  $('#edit-taskTitle').val(''); //狀態
  $('#edit-taskContent').val(''); //任務內容
  $('#edit-owner').val(''); //負責人


  let key = $(this).parent().parent().find('td:first').text();
  let userId = auth.currentUser.uid;

  database.ref('message-autoreply/' + userId + '/' + key).on('value', snap => {
    let testVal = snap.val();
    // console.log(testVal);

    $('#edit-id').append(key);
    $('#edit-taskTitle').val(testVal.taskName); //狀態
    $('#edit-taskContent').val(testVal.taskContent); //任務內容
    $('#edit-owner').val(testVal.owner); //負責人
    // console.log(sublist);

  });
}//end open edit

function modalEdit() {
  let key = $('#edit-id').text();
  let userId = auth.currentUser.uid;
  var title = $('#edit-taskTitle').val(); //狀態
  var name = $('#edit-taskContent').val(); //任務內容
  var owne = $('#edit-owner').val(); //負責人
  //日期
  let d = Date.now();
  let date = new Date(d);

  // console.log(key, userId, name, cate, stat, prio, owne, desc, subt, inir, inid, auth.currentUser.email, date);

  saveUserData(key, userId, name, title, owne, auth.currentUser.email, date.toString());

  $('#edit-id').text(''); //
  $('#edit-taskContent').val(''); //任務內容
  $('#edit-taskTitle').val(''); //狀態
  $('#edit-owner').val(''); //負責人


  loadAutoReply();
  $('#editModal').modal('hide');
}//end modal edit


function saveUserData(key, userId, name, title, owne) {
  database.ref('message-autoreply/' + userId + '/' + key).set({
    taskContent: name,
    taskTitle: title,
    owner: owne
  });
}


function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login");
  })
}
