$(document).ready(function() {
  var socket = io.connect();
  var users = $('#users');
  var nicknameForm = $('#setNick');
  var nicknameError = $('#nickError');
  var nicknameInput = $('#nickname');
  var messageForm = $('#send-message');
  var messageInput = $('#message');
  var messageContent = $('#chat');

  $(document).on('click', '#signout-btn', logout); //登出

  nicknameForm.submit((e) => {
    e.preventDefault();
    socket.emit('new user', nicknameInput.val(), (data) => {
      if(data){
        $('#nickWrap').hide();
        $('#contentWrap').show();
      } else {
        nicknameError.html('username is already taken');
      }
    });
    nicknameInput.val('');
  });

  messageForm.submit((e) => {
    e.preventDefault();
    socket.emit('send message', messageInput.val(), (data) => {
      messageContent.append('<span class="error">' + data + "</span><br/>");
    });
    messageInput.val('');
  });

  socket.on('usernames', (data) => {
    var html = '';
    for(i=0; i < data.length; i++){
      html += data[i] + '<br />';
    }
    users.html(html);
  });

  socket.on('new message', (data) => {
    displayMessage(data)
    // messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
  });

  socket.on('whisper', (data) => {
    messageContent.append('<span class="whisper"><b>' + data.name + ': </b>' + data.msg + "</span><br/>");
  });

  socket.on('load old messages', docs => {
    for(i=0; i < data.length; i++){
      displayMessage(docs[i]);
    }
  });

  function displayMessage(data){
    messageContent.append('<b>' + data.name + ': </b>' + data.msg + "<br/>");
  }
});
