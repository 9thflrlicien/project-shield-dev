var socket = io.connect();
var dataArray = [];
var msgArray
$(document).ready(function(){
  $(document).on('click', '#signout-btn', logout); //登出
  $(document).on('click', '#save', modalSubmit );
  $(document).on('click', '#addbtn', addMsgCanvas);
  $(document).on('click', '#delete', delMsgCanvas);
  setTimeout(loadFriendsReply, 1000);
});
function loadFriendsReply(){
  let userId = auth.currentUser.uid;
  dataArray = []; // empty the array first
  msgArray = []; // get a new array to emit
  database.ref('message-addfriendsreply/' + userId).on('value', snap => {
    let testVal = snap.val();
    if(testVal !== null){
      let myIds = Object.keys(testVal);
      for (var i = 0; i < myIds.length; i++){
        dataArray.push(snap.child(myIds[i]).val());
        let loadMsg = '<!--TEXT AREA -->' +
            '<tr id="'+myIds[i]+'">' +
              '<th style="padding:1%; margin:2% 1% 2% 1%; background-color: #ddd">請輸入文字:</th>' +
            '</tr>' +
            '<tr id="'+myIds[i]+'">' +
              '<td style="background-color: #ddd">' +
                '<span style="float:right" id="delete">X</span>' +
                '<form style="padding:1%; margin:1%">' +
                  '<input id="'+myIds[i]+'" style="width:100%;height:100px" value="'+dataArray[i].taskText+'" />' +
                '</form>' +
              '</td>' +
            '</tr>';
        $('#MsgCanvas').append(loadMsg);
        msgArray.push(dataArray[i].taskText);
      }
      emitToServer(msgArray);
    }
  });
} // end of loadFriendsReply
function addMsgCanvas(){
  let MsgCanvas = '<!--TEXT AREA -->' +
      '<tr>' +
        '<th style="padding:1%; margin:2% 1% 2% 1%; background-color: #ddd">請輸入文字:</th>' +
      '</tr>' +
      '<tr>' +
        '<td style="background-color: #ddd">' +
          '<span style="float:right" id="delete">X</span>' +
          '<form style="padding:1%; margin:1%">' +
            '<input id="textinput" style="width:100%;height:100px" />' +
          '</form>' +
        '</td>' +
      '</tr>';
  $('#MsgCanvas').append(MsgCanvas);
} // end of addMsgCanvas
function delMsgCanvas(){ // 如果只是新增一個空的tr再刪除會止移除第二個tr
  if($(this).parent().parent().attr('id') === undefined){
    location.reload();
  }else{
    let id = $(this).parent().parent().attr('id');
    let uid = auth.currentUser.uid;
    database.ref('message-addfriendsreply/'+uid+'/'+id).remove();
    $(this).parent().parent().siblings('#'+id).remove();
    $(this).parent().parent().remove();
    $('#MsgCanvas').empty();
    loadFriendsReply();
  }
} // end of delMsgCanvas
function modalSubmit(){ // 送出新增
  let newMsg = $('#textinput').val();
  if(newMsg.trim() !== ''){
    dataArray.push(newMsg);
    let MsgInfo = {
      currentDateTime:Date.now(),
      inp:newMsg,
      currentUserEmail:auth.currentUser.email.toString()
    }
    writeUserData(MsgInfo);
    //塞入資料庫並重整
    alert('Saved!');
    $('#MsgCanvas').empty();
    loadFriendsReply();
  }else{
    alert('Please fill in the space');
  }
} // end of modalSubmit
function writeUserData(obj){ // 寫進資料庫
  let userId = auth.currentUser.uid;
  database.ref('message-addfriendsreply/' + userId).push({
    taskText: obj.inp,
    owner: obj.currentUserEmail,
    modifiedDate: obj.currentDateTime
  });
} // end of writeUserData
function emitToServer(data){ // 推到server端處理
  socket.emit('update add friend message', data);
} // end of emitToServer
