// jQuery
$(document).ready(function() {


  $(document).on('click', '#signout-btn', logout); //登出

  // $(document).on('click', '#search-btn', filterChart);

  $(document).on('click', '#message', subMessage);//Message 導覽標籤 subtags


  $(document).on('click', '.tablinks' , clickMsg);
  $(document).on('click', '.tablinks_sort' , clickSortingLink);
  $(document).on('click', '#modal-submit', modalSubmit); //新增
  $(document).on('click', '#setlimit', clickLmtUser);
  $(document).on('click', '#btn-text', btnText);
  $(document).on('click', '#modal-draft', saveDraft);
  $(document).on('click', '#viewBtn', loadView);
  $(document).on('click', '#editBtn', openEdit); //打開編輯modal
  $(document).on('click', '#edit-submit', modalEdit);
  $(document).on('click', '#deleBtn', deleteRow); //刪除





  if(window.location.pathname === '/message_overview'){
    setTimeout(loadOverReply, 1000);
  }


});

function saveDraft(){
  let d = Date.now();
  let text = $('#textinput').val();
  let status = 'draft';


  writeUserData_draft(d, auth.currentUser.uid, text, status, auth.currentUser.email.toString());

  //塞入資料庫並重整
  $('#quickAdd').modal('hide');
  $('#textinput').val('');
  alert('Saved!')


  loadOverReply();
}


function writeUserData_draft(d, userId, text, status) {
  database.ref('message-overview/' + userId).push({
    taskContent: text,
    owner: auth.currentUser.email,
    taskStatus: status
  });
}



function btnText(){

  $('#inputText').append(
    '<div style="margin:2%">'+
    '<span style="float:right" onclick="this.parentElement.remove()">X</span>'+
    '<tr>'+
    '<th style="padding:1.5%; background-color: #ddd">Enter Text:</th>'+
    '</tr>'+
    '<tr>'+
    '<td style="background-color: #ddd">'+
    '<form style="padding:1%">'+
    '<input id="textinput" style="width:100%;height:100px" />'+
    '</form>'+
    '</td>'+
    '</tr>'+
    '<tr><th style="padding:1.5%; background-color: #ddd">'+
    '<button class="tablinks" rel="emos">Emoji</button></th></tr></div>'
  );

}
function modalSubmit() {
  let d = Date.now();
  let text = $('#textinput').val();
  let status = 'reserved';

  writeUserData(d, auth.currentUser.uid, text, status, auth.currentUser.email.toString());

  //塞入資料庫並重整
  $('#quickAdd').modal('hide');
  $('#textinput').val('');
  alert('Saved!')


  loadOverReply();
}


function writeUserData(d, userId, text,status) {
  database.ref('message-overview/' + userId).push({
    taskContent: text,
    owner: auth.currentUser.email,
    taskStatus: status

  });
}






function subMessage(){
  if ($('.subTag').is(':visible')){
    $('.subTag').hide();
  }else{
    $('.subTag').show();
  }
}

function clickLmtUser(){
  console.log('clickLmtUser exe');

  var target = $(this).attr('rel');
  if ($("#"+target).is(':visible')){
    $("#"+target).hide();
  }else{
    $("#"+target).show();
  }

}

function clickMsg(){
  var target = $(this).attr('rel');
  $("#"+target).show().siblings().hide();
  console.log('clickMsg executed')
}

function loadOverReply(){
  console.log('loadOverReply executed')
  $('#data-appointment').empty();
  $('#data-draft').empty();
  let userId = auth.currentUser.uid;
  database.ref('message-overview/' + userId).on('value', snap => {
    let dataArray = [];
    let testVal = snap.val();
    let myIds = [];
    if( testVal!=undefined ) myIds = Object.keys(testVal);

    for(var i=0;i < myIds.length;i++){
      dataArray.push(snap.child(myIds[i]).val());
      console.log('in the for loop');

      if (dataArray[i].taskStatus=='draft'){

        $('#data-draft').append(
          '<tr class = "msgToSend">' +
          '<td id="' + myIds[i] + '" hidden>' + myIds[i] + '</td>' +
          '<td class="msgDetail" style="margin:0;width:5%">' + (i+1) + '</td>' +
          '<td class="msgDetail" style="margin:0;width:20%">' + dataArray[i].taskContent + '</td>' +
          '<td class="msgDetail" style="margin:0;width:10%">' + 'text' + '</td>' +
          '<td class="msgDetail" style="margin:0;width:15%">-</td>' +
          '<td class="msgDetail" style="margin:0;width:10%">'+dataArray[i].taskStatus+'</td>'+
          '<td class="msgDetail" style="color:red; margin:0; width:20%"><b>預約時間功能尚未啟用</b></td>' +
          '<td style="margin:0">' +
          '<a href="#" id="editBtn" data-toggle="modal" data-target="#editModal"><b>Edit  </b></a>' +
          '<a href="#" id="viewBtn" data-toggle="modal" data-target="#viewModal"><b>View  </b></a>' +
          '<a href="#" id="deleBtn"><b>Delete</b></a>' +
          '</td>' +
          '</tr>'
        );
      }
      else{
        $('#data-appointment').append(
            '<tr class = "msgToSend" style="margin:0;">' +
            '<td id="' + myIds[i] + '" hidden>' + myIds[i] + '</td>' +
            '<td class="msgDetail" style="margin:0;width:5%">' + (i+1) + '</td>' +
            '<td class="msgDetail" style="margin:0;width:20%">' + dataArray[i].taskContent + '</td>' +
            '<td class="msgDetail" style="margin:0;width:10%">' + 'text' + '</td>' +
            '<td class="msgDetail" style="margin:0;width:15%">-</td>' +
            '<td class="msgDetail" style="margin:0;width:10%">'+dataArray[i].taskStatus+'</td>'+
            '<td class="msgDetail" style="color:red; margin:0; width:20%"><b>預約時間功能尚未啟用</b></td>' +
            '<td style="margin:0">' +
            '<a href="#" id="editBtn" data-toggle="modal" data-target="#editModal"><b>Edit  </b></a>' +
            '<a href="#" id="viewBtn" data-toggle="modal" data-target="#viewModal"><b>View  </b></a>' +
            '<a href="#" id="deleBtn"><b>Delete</b></a>' +
            '</td>' +
            '</tr>'
        );
      }
    }
  });
}

function loadView() {

  $('#view-textinput').text(''); //任務內容
  $('#view-stat').text(''); //狀態
  $('#view-owne').text(''); //負責人
  $('#view-desc').text(''); //說明
  $('#view-inir').text(''); //建立人
  $('#view-inid').text(''); //建立日期
  $('#view-modr').text(''); //修改人
  $('#view-modd').text(''); //修改日期
  $('#view-subt').empty(); //

  let key = $(this).parent().parent().find('td:first').text();
  console.log(key);
  let userId = auth.currentUser.uid;

  database.ref('message-overview/' + userId + '/' + (key)).on('value', snap => {
    let testVal = snap.val();
    console.log(testVal);
    // 重複出現值 要抓出來
    $('#view-id').append(key); //編號
    $('#view-textinput').append(testVal.taskContent); //任務內容
    $('#view-stat').append(testVal.taskStatus); //狀態
    $('#view-owne').append(testVal.owner); //負責人
    $('#view-desc').append(testVal.description); //說明
    $('#view-inir').append(testVal.initiator); //建立人
    $('#view-inid').append(testVal.initDate); //建立日期
    $('#view-modr').append(testVal.modifier); //修改人
    $('#view-modd').append(testVal.modiDate); //修改日期

  });

}

function openEdit() {
  $('#edit-taskContent').val(''); //任務內容
  $('#edit-status').val(''); //狀態
  $('#edit-owner').val(''); //負責人


  let key = $(this).parent().parent().find('td:first').text();
  let userId = auth.currentUser.uid;

  database.ref('message-overview/' + userId + '/' + key).on('value', snap => {
    let testVal = snap.val();
    // console.log(testVal);

    $('#edit-id').append(key);
    $('#edit-taskContent').val(testVal.taskContent); //任務內容
    $('#edit-status').val(testVal.taskStatus); //狀態
    $('#edit-owner').val(testVal.owner); //負責人
    // console.log(sublist);

  });
}

function modalEdit() {
  let key = $('#edit-id').text();
  let userId = auth.currentUser.uid;
  var name = $('#edit-taskContent').val(); //任務內容
  var stat = $('#edit-status').val(); //狀態
  var owne = $('#edit-owner').val(); //負責人
  //日期
  let d = Date.now();
  let date = new Date(d);

  // console.log(key, userId, name, cate, stat, prio, owne, desc, subt, inir, inid, auth.currentUser.email, date);

  saveUserData(key, userId, name, stat, owne, auth.currentUser.email, date.toString());

  $('#edit-id').text(''); //
  $('#edit-taskContent').val(''); //任務內容
  $('#edit-status').val(''); //狀態
  $('#edit-owner').val(''); //負責人


  loadOverReply();
  $('#editModal').modal('hide');
}


function saveUserData(key, userId, name, stat, owne) {
  database.ref('message-overview/' + userId + '/' + key).set({
    taskContent: name,
    taskStatus: stat,
    owner: owne
  });
}


function deleteRow() {
  let key = $(this).parent().parent().find('td:first').text();
  let userId = auth.currentUser.uid;
  // console.log(userId, key);

  database.ref('message-overview/' + userId + '/' + key).remove();

  loadOverReply();
}

//=========[SEARCH by TEXT]=========
$("#exampleInputAmount").keyup(function() {
  var dataAppoinment = $('#data-appointment tr');
  var dataDraft = $('#data-draft tr');
  var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

  dataAppoinment.show().filter(function() {
    var text1 = $(this).text().replace(/\s+/g, ' ').toLowerCase();
    return !~text1.indexOf(val);
  }).hide();

  dataDraft.show().filter(function() {
    var text2 = $(this).text().replace(/\s+/g, ' ').toLowerCase();
    return !~text2.indexOf(val);
  }).hide();
});




function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login");
  })
}

var sortWays = ["No.", "Content", "Category", "Tags(optional)", "Status", "Appointment"];
var sortBool = [true, true, true, true, true, true ];

function clickSortingLink() {
  let wayId = sortWays.indexOf( $(this).text() ); //get which way to sort (line 322)

  let wayBool = sortBool[wayId];
  for( let i in sortBool ) sortBool[i] = true;  //reset other sort ways up_down
  sortBool[wayId] = !wayBool;   //if this time sort up, next time sort down

  let panel_to_push;    //check which tabcontent to sort
  if( $('#Appointment').css("display") ==  "block" ) panel_to_push = '#data-appointment';
  else if( $('#Draft').css("display") ==  "block" ) panel_to_push = '#data-draft';
  else if( $('#History').css("display") ==  "block" ) panel_to_push = '#open-ticket-list';

  let msgsArr = $( panel_to_push + ' .msgToSend' ); //get all msg in tabcontent
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
  $(panel_to_push).append(msgsArr); //push to tabcontent

}
