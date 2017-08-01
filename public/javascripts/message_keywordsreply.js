// jQuery
$(document).ready(function() {


  $(document).on('click', '#signout-btn', logout); //登出

  // $(document).on('click', '#search-btn', filterChart);

  $(document).on('click', '#message', subMessage);//Message 導覽標籤 subtags


    $(document).on('click', '.tablinks' , clickMsg);
    $(document).on('click','#csv', noCsv);
    $(document).on('click','#addSubKey', addSubKey);
    $(document).on('click', '#modal-submit', modalSubmit); //新增
    $(document).on('click', '#viewBtn', loadView);
    $(document).on('click', '#editBtn', openEdit); //打開編輯modal
    $(document).on('click', '#deleBtn', deleteRow); //刪除
    $(document).on('click', '#edit-submit', modalEdit);
    $(document).on('click', '#appendMsg', appendMsgCanvas);
    $(document).on('click', '.tablinks_sort' , clickSortingLink);





    if(window.location.pathname === '/message_keywordsreply'){
    setTimeout(loadKeywordsReply, 1000);
  }



});

function arrow(){
    var str = $("#for_arrow"); 
    var res = str.replace("down", "up");
}
  

  function appendMsgCanvas(){
    $('#MsgCanvas').append(
                          '<div id="text" style="height:200px; width:600px;margin:2%">'+
                          '<span style="float:left" onclick="this.parentElement.remove()">x</span>'+
                            '<table>'+
                                '<tr>'+
                                    '<th style="padding:1.5%; margin:2%;">Enter Text:</th>'+
                                '</tr>'+
                                '<tr>'+
                                    '<td>'+
                                        '<form style="padding:1%; margin:2%">'+
                                            '<input class="form-control" type="text" value="" id="textinput" style="width:400px;height:100px" />'+
                                        '</form>'+
                                    '</td>'+
                                '</tr>'+
                                '<tr>'+
                                    '<td style="padding:1.5%; margin:2%;">'+
                                        '<button type="button" class="btn btn-secondary" style="padding:1.5%; margin:2%; class="tablinks" rel="emos">Emoji</button>'+
                                    '</td>'+
                                '</tr>'+
                            '</table>'+
                        '</div>'
);
        console.log('appendMsgCanvas exe');

  }

  function modalSubmit() {
  let d = Date.now()
  let mainKey = $('#modal-mainKey').val();
  let subKey = $('#modal-subKey').val();
  let text = $('#textinput').val();
  let cate = $('#modal-category').val();


  writeUserData(d, auth.currentUser.uid, mainKey, subKey, text, cate, auth.currentUser.email.toString());

  //塞入資料庫並重整
  $('#quickAdd').modal('hide');
  $('#modal-mainKey').val('');
  $('#modal-subKey').val('');
  $('#textinput').val('');
  $('#modal-category').val('');

  alert('Saved!')


  loadKeywordsReply();
}


  function writeUserData( d, userId, mainKey, subKey, text, cate, email ) {
  database.ref('message-keywordsreply/' + userId).push({
    taskMainK: mainKey, 
    taskSubK: subKey,
    taskText: text,
    taskCate: cate,
    owner: auth.currentUser.email,
  });
}


  function addSubKey(){
    $('#subKeyCanvas').append('<div><span style="float:left" onclick="this.parentElement.remove()">x  </span><input style="width:20%; left:1%" class="form-control" type="text" value="" id="modal-subKey" /></div>');
}

  function noCsv(){
       if ($('#nocsv').is(':visible')){
      $('#nocsv').hide();
    }else{
    $('#nocsv').show();
  }
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


        function addMsg(){
        var target = $(this).attr('rel');
      if ($("#"+target).is(':visible')){
      $("#"+target).hide();
    }else{
    $("#"+target).show();
  }

      }




    function loadKeywordsReply(){
        $("#serving").empty();
        $("#waiting").empty();
        let userId = auth.currentUser.uid;
        database.ref('message-keywordsreply/' + userId).on('value', snap => {
        let dataArray = [];
        let testVal = snap.val();
        let myIds = Object.keys(testVal);

        for(var i=0;i < myIds.length;i++){
          dataArray.push(snap.child(myIds[i]).val());
          if (dataArray[i].taskCate == 'Serving'){

            $("#serving").append(
              '<tr class="msgToSend">' +
                '<td id="' + myIds[i] + '" hidden>' + myIds[i] + '</td>' +
                '<td class="msgDetail" id="td">' + dataArray[i].taskMainK + '</td>' +
                '<td class="msgDetail" id="td">' + dataArray[i].taskSubK + '</td>' +
                '<td class="msgDetail" id="td">' + dataArray[i].taskText + '</td>' +
                '<td class="msgDetail" id="td" style="color:red"><b>此功能尚未開通</b></td>'+
                '<td class="msgDetail" id="td" >'+dataArray[i].taskCate+'</td>'+
                '<td class="msgDetail" id="td">'+
            '<a href="#" id="editBtn" data-toggle="modal" data-target="#editModal"><b>Edit  </b></a>' +
            '<a href="#" id="viewBtn" data-toggle="modal" data-target="#viewModal"><b>View  </b></a>' +
            '<a href="#" id="deleBtn"><b>Delete</b></a>' +
                '</td>'+
              '</tr>'
        );
          }else{
            $("#waiting").append(
              '<tr class="msgToSend">' +
                '<td class="msgDetail" id="' + myIds[i] + '" hidden>' + myIds[i] + '</td>' +
                '<td class="msgDetail" id="td">' + dataArray[i].taskMainK + '</td>' +
                '<td class="msgDetail" id="td">' + dataArray[i].taskSubK + '</td>' +
                '<td class="msgDetail" id="td">' + dataArray[i].taskText + '</td>' +
                '<td class="msgDetail" id="td" style="color:red"><b>此功能尚未開通</b></td>'+
                '<td class="msgDetail" id="td">'+dataArray[i].taskCate+'</td>'+
                '<td class="msgDetail" id="td">'+
            '<a href="#" id="editBtn" data-toggle="modal" data-target="#editModal"><b>Edit  </b></a>' +
            '<a href="#" id="viewBtn" data-toggle="modal" data-target="#viewModal"><b>View  </b></a>' +
            '<a href="#" id="deleBtn"><b>Delete</b></a>' +
                '</td>'+
              '</tr>'
        );


          }


      }
    });
}

function loadView() {

  $('#view-mainK').text(''); //主關鍵字
  $('#view-subK').text(''); //副關鍵字
  $('#view-textinput').text(''); //任務內容
  $('#view-stat').text(''); //狀態
  $('#view-owne').text(''); //負責人
  $('#view-subt').empty(); //

  let key = $(this).parent().parent().find('td:first').text();
  let userId = auth.currentUser.uid;

  database.ref('message-keywordsreply/' + userId + '/' + (key)).on('value', snap => {
    let testVal = snap.val();
    // 重複出現值 要抓出來
    $('#view-id').append(key); //編號
    $('#view-mainK').append(testVal.taskMainK); //主關鍵字
    $('#view-subK').append(testVal.taskSubK); //副關鍵字
    $('#view-textinput').append(testVal.taskText); //任務內容
    $('#view-stat').append(testVal.taskCate); //狀態
    $('#view-owne').append(testVal.owner); //負責人


  });

}



function openEdit() {
  $('#edit-mainK').val(''); //任務內容
  $('#edit-subK').val(''); //任務內容
  $('#edit-taskContent').val(''); //任務內容
  $('#edit-status').val(''); //狀態
  $('#edit-owner').val(''); //負責人


  let key = $(this).parent().parent().find('td:first').text();
  let userId = auth.currentUser.uid;

  database.ref('message-keywordsreply/' + userId + '/' + key).on('value', snap => {
    let testVal = snap.val();
    // console.log(testVal);

    $('#edit-id').append(key);
    $('#edit-mainK').val(testVal.taskMainK); //主關鍵字
    $('#edit-subK').val(testVal.taskSubK); //副關鍵字
    $('#edit-taskContent').val(testVal.taskText); //任務內容
    $('#edit-status').val(testVal.taskCate); //狀態
    $('#edit-owner').val(testVal.owner); //負責人
    // console.log(sublist);

  });
}

function modalEdit() {
  let key = $('#edit-id').text();
  let userId = auth.currentUser.uid;
  var mainKey = $('#edit-mainK').val(); //主關鍵字
  var subKey = $('#edit-subK').val(); //副關鍵字
  var text = $('#edit-taskContent').val(); //任務內容
  var cate = $('#edit-status').val(); //狀態
  var owne = $('#edit-owner').val(); //負責人
  //日期
  let d = Date.now();
  let date = new Date(d);

  // console.log(key, userId, text, cate, cate, prio, owne, desc, subt, inir, inid, auth.currentUser.email, date);

  saveUserData(key, userId, mainKey, subKey, text, cate, owne, auth.currentUser.email, date.toString());

  $('#edit-id').text(''); //
  $('#edit-mainK').val(''); //主關鍵字
  $('#edit-subK').val(''); //副關鍵字
  $('#edit-taskContent').val(''); //任務內容
  $('#edit-status').val(''); //狀態
  $('#edit-owner').val(''); //負責人


  loadKeywordsReply();
  $('#editModal').modal('hide');
}


function saveUserData(key, userId, mainKey, subKey, text, cate, owne) {
  database.ref('message-keywordsreply/' + userId + '/' + key).set({
    taskMainK: mainKey,
    taskSubK: subKey,
    taskText: text,
    taskCate: cate,
    owner: owne
  });
}



function deleteRow() {
  let key = $(this).parent().parent().find('td:first').text();
  let userId = auth.currentUser.uid;
  // console.log(userId, key);

  database.ref('message-keywordsreply/' + userId + '/' + key).remove();

  loadKeywordsReply();
}

// SORTING ADDED BY COLMAN


var sortWays = ["Main Keyword", "Sub Keyword", "Content", "Reply Amount/ Reply User Amount", "Status", "Edit"];
var sortBool = [true, true, true, true, true, true ];

function clickSortingLink() {
  
  // var str = $(".fa fa-angle-down"); 
  // var res = str.replace("down", "up");
  // $(".fa fa-angle-down") = res;


  console.log('click function exe');
  let wayId = sortWays.indexOf( $(this).text() ); //get which way to sort (line 322)

  let wayBool = sortBool[wayId];
  for( let i in sortBool ) sortBool[i] = true;  //reset other sort ways up_down
  sortBool[wayId] = !wayBool;   //if this time sort up, next time sort down

  let panel_to_push;    //check which tabcontent to sort
  if( $('#table').css("display") ==  "block" ) panel_to_push = '#serving';
  else if( $('#tableData').css("display") ==  "block" ) panel_to_push = '#waiting';

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






function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login");
  })
}
