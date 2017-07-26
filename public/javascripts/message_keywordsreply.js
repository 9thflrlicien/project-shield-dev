// jQuery
$(document).ready(function() {


  $(document).on('click', '#signout-btn', logout); //登出

  // $(document).on('click', '#search-btn', filterChart);

  $(document).on('click', '#message', subMessage);//Message 導覽標籤 subtags


    $(document).on('click', '.tablinks' , addMsg);
    $(document).on('click','#csv', noCsv);
    $(document).on('click','#addSubKey', addSubKey);
    $(document).on('click', '#modal-submit', modalSubmit); //新增


    if(window.location.pathname === '/message_keywordsreply'){
    setTimeout(loadKeywordsReply, 1000);
  }



});
  


  function modalSubmit() {
  let d = Date.now()
  let mainKey = $('#modal-mainKey').val();
  let subKey = $('#modal-subKey').val();
  let text = $('#textinput').val();
  let cate = $('#modal-category').val();

  writeUserData(userId, mainKey,subKey, text, cate, auth.currentUser.email.toString());

  //塞入資料庫並重整
  $('#quickAdd').modal('hide');
  $('#modal-mainKey').val('');
  $('#modal-subKey').val('');
  $('#textinput').val('');
  $('#modal-category').val('');

  alert('Saved!')


  loadKeywordsReply();
}


  function writeUserData( mainKey,subKey,text,cate ) {
  database.ref('message-keywordsreply/' + userId).push({
    taskMainK: mainKey, 
    taskSubK: subKey,
    // datetime: datetime,
    taskText: text,
    taskCate: cate,
    owner: auth.currentUser.email,
  });
}


  function addSubKey(){
    $('#subKeyCanvas').append('<div><input style="width:20%" type="text" value="" id="modal-subKey">  <span onclick="this.parentElement.remove()">x</span> </div>')

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
          console.log('data in looping for append')
          if (dataArray[i].taskCate == 'serving'){

            $("#serving").append(
              '<tr>' +
                '<td id="td">' + dataArray[i].taskMainK + '</td>' +
                '<td id="td">' + dataArray[i].taskSubK + '</td>' +
                '<td id="td">' + dataArray[i].taskText + '</td>' +
                '<td id="td" style="color:red">此功能尚未開通</td>'+
                '<td id="td" style="color:red">'+dataArray[i].taskCate+'</td>'+
              '</tr>'
        );
          }else{
            $("#waiting").append(
              '<tr>' +
                '<td id="td">' + dataArray[i].taskMainK + '</td>' +
                '<td id="td">' + dataArray[i].taskSubK + '</td>' +
                '<td id="td">' + dataArray[i].taskText + '</td>' +
                '<td id="td" style="color:red">此功能尚未開通</td>'+
                '<td id="td" style="color:red">'+dataArray[i].taskCate+'</td>'+
              '</tr>'
        );


          }


      }
    });
}





function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login");
  })
}
