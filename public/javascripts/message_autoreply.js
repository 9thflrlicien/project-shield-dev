// jQuery
$(document).ready(function() {


  $(document).on('click', '#signout-btn', logout); //登出

  // $(document).on('click', '#search-btn', filterChart);

  $(document).on('click', '#message', subMessage);//Message 導覽標籤 subtags


  $(document).on('click', '.tablinks' , clickMsg);
  $(document).on('click', '.addTopics', addTopics);
  $(document).on('click', '#modal-submit', modalSubmit); //新增


    if(window.location.pathname === '/message_autoreply'){
    setTimeout(loadAutoReply, 1000);
  }


});
  function modalSubmit() {
  let d = Date.now()
  let name = $('#modal-task-name').val();
  let datetime = $('#datetime').val();
  let text = $('#modal-text').val();

  writeUserData(auth.currentUser.uid, name, datetime, text, auth.currentUser.email.toString());

  //塞入資料庫並重整
  $('#quickAdd').modal('hide');
  $('#modal-task-name').val('');
  $('#datetime').val('');
  $('#modal-text').val('');
  alert('Saved!')


  loadAutoReply();
}


  function writeUserData(userId, name, text) {
  database.ref('message-autoreply/' + userId).push({
    taskName: name,
    // datetime: datetime,
    taskText: text,
    owner: auth.currentUser.email,
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
                '<td><a href="#">' + dataArray[i].taskName + '</a></td>' +
                '<td>' + 'Not Assigned' + '</td>' +
                '<td>' + dataArray[i].taskText + '</td>' +
                '<td>' +
                '<a href="#" id="editBtn" data-toggle="modal" data-target="#editModal">Edit</a>' +
                ' ' +
                '<a href="#" id="viewBtn" data-toggle="modal" data-target="#viewModal">View</a>' +
                ' ' +
                '<a href="#" id="deleBtn">Delete</a>' +
                '</td>' +
              '</tr>'
        );
      }
    });
}

function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login");
  })
}
