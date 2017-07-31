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
  $(document).on('click', '#deleBtn', deleteRow); //刪除
  $(document).on('click', '.tablinks_sort' , clickSortingLink);





    if(window.location.pathname === '/message_autoreply'){
    setTimeout(loadAutoReply, 1000);
  }


});

  function modalSubmit() {
  let d = Date.now()
  let name = $('#modal-task-name').val();
  let textInput = $('#enter-text').val();
  console.log(textInput);

  writeUserData(auth.currentUser.uid, name, textInput, auth.currentUser.email.toString());

  //塞入資料庫並重整
  $('#quickAdd').modal('hide');
  $('#modal-task-name').val('');
  $('#enter-text').val('');
  alert('Saved!')


  loadAutoReply();
}


  function writeUserData(userId, name, textInput) {
  database.ref('message-autoreply/' + userId).push({
    taskName: name,
    taskText: textInput,
    owner: auth.currentUser.email,
 

  });
    console.log('this is textInput: ')
    console.log(textInput);

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
              '<tr class="msgToSend">' +
                '<td id="' + myIds[i] + '" hidden>' + myIds[i] + '</td>' +
                '<td class="msgDetail">' + 'Open' + '</td>' +
                '<td class="msgDetail">' + 'No Setup' + '</td>' +
                '<td class="msgDetail"><a href="#" id="viewBtn" data-toggle="modal" data-target="#viewModal"><b>' + dataArray[i].taskName + '</b></a></td>' +
                '<td class="msgDetail">' + 'Not Assigned' + '</td>' +
                '<td class="msgDetail">' + dataArray[i].taskText + '</td>' +
                '<td class="msgDetail">' +
                '<a href="#" id="editBtn" data-toggle="modal" data-target="#editModal"><b>Edit</b></a>' +
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
    $('#view-textinput').append(testVal.taskText); //任務內容
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
    $('#edit-taskContent').val(testVal.taskText); //任務內容
    $('#edit-owner').val(testVal.owner); //負責人
    // console.log(sublist);

  });
}//end open edit

function modalEdit() {
  let key = $('#edit-id').text();
  let userId = auth.currentUser.uid;
  var name = $('#edit-taskTitle').val(); //狀態
  var textInput = $('#edit-taskContent').val(); //任務內容
  var owne = $('#edit-owner').val(); //負責人
  //日期
  let d = Date.now();
  let date = new Date(d);

  // console.log(key, userId, name, cate, stat, prio, owne, desc, subt, inir, inid, auth.currentUser.email, date);

  saveUserData(key, userId, textInput, name, owne, auth.currentUser.email, date.toString());

  $('#edit-id').text(''); //
  $('#edit-taskContent').val(''); //任務內容
  $('#edit-taskTitle').val(''); //狀態
  $('#edit-owner').val(''); //負責人


  loadAutoReply();
  $('#editModal').modal('hide');
}//end modal edit


function saveUserData(key, userId, textInput, name, owne) {
  database.ref('message-autoreply/' + userId + '/' + key).set({
    taskText: textInput,
    taskName: name,
    owner: owne
  });
}

function deleteRow() {
  let key = $(this).parent().parent().find('td:first').text();
  let userId = auth.currentUser.uid;
  // console.log(userId, key);

  database.ref('message-autoreply/' + userId + '/' + key).remove();

  loadAutoReply();
}

// SORTING ADDED BY COLMAN


var sortWays = ["Status", "Appointment", "Message Title", "Valid Period", "Content", "Delete"];
var sortBool = [true, true, true, true, true, true ];

function clickSortingLink() {
  console.log('click function exe');
  let wayId = sortWays.indexOf( $(this).text() ); //get which way to sort (line 322)

  let wayBool = sortBool[wayId];
  for( let i in sortBool ) sortBool[i] = true;  //reset other sort ways up_down
  sortBool[wayId] = !wayBool;   //if this time sort up, next time sort down

  let autoreply_list = '#autoreply-list';    //check which tabcontent to sort

  let msgsArr = $( autoreply_list + ' .msgToSend' ); //get all msg in tabcontent
  for( let i=0; i<msgsArr.length-1; i++ ) {   //bubble sort
    for( let j=i+1; j<msgsArr.length; j++ ) {
      let a = msgsArr.eq(i).children(".msgDetail").eq(wayId).text();
      let b = msgsArr.eq(j).children(".msgDetail").eq(wayId).text();
      console.log("a, b = " + a + ", " + b);
      if( wayBool == (a<b)  ) {             //sort up or down && need sort?
        console.log("swap!");
        let tmp = msgsArr[i];   msgsArr[i] = msgsArr[j];    msgsArr[j] = tmp;
      }
    }
  }
  $(autoreply_list).append(msgsArr); //push to tabcontent

}


function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login");
  })
}
