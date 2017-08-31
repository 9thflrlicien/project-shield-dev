$(document).ready(function() {
  // $('#side-menu').hide();

  var name = $('#prof-name').text();
  var id = $('#prof-id').text();
  var dob = $('#prof-dob').text();
  var email = $('#prof-email').text();
  var gender = $('#prof-gender').text();
  var phone = $('#prof-phone').text();
  var chanId = $('#prof-channelId').text();
  var chanSecret = $('#prof-channelSecret').text();
  var chanAT = $('#prof-channelAccessToken').text();

  $('#prof-name').text('');
  $('#prof-dob').text('');
  $('#prof-email').text('');
  $('#prof-gender').text('');
  $('#prof-phone').text('');
  $('#prof-nick').text('');
  $('#prof-channelId').text('');
  $('#prof-channelSecret').text('');
  $('#prof-channelAccessToken').text('');

  setTimeout(loadProf, 1000);

  $(document).on('click', '#prof-edit', profEdit); //打開modal
  $(document).on('click', '#prof-submit', profSubmit); //完成編輯
  $('#profModal').on('hidden.bs.modal', profClear); //viewModal 收起來
  $(document).on('click', '#signout-btn', logout); //登出
});



  // profileForm.submit((e) => {
  //   e.preventDefault();

  //   socket.emit('send profile', {chanId: chanId , chanSecret: chanSecret, chanAT: chanAT}, (data) => {

  // });//socket.emit

  // });//profileForm.submit


function loadProf() {
  let userId = auth.currentUser.uid;

  database.ref('users/' + userId).on('value', snap => {
    let profInfo = snap.val();
    if(profInfo === null) {
      $('#error-message').show();
    }
    else {
      let profInfo = []
      let profData = snap.val();
      let profId = Object.keys(profData);
      profInfo.push(snap.child(profId[0]).val());
      // console.log(profInfo);
      $('#prof-id').text(profId);
      $('#prof-name').text(profInfo[0].name);
      $('#prof-dob').text(profInfo[0].dob);
      $('#prof-email').text(profInfo[0].email);
      $('#prof-gender').text(profInfo[0].gender);
      $('#prof-phone').text(profInfo[0].phone);
      $('#prof-nick').text(profInfo[0].nickname);
      $('#prof-channelId').text(profInfo[0].chanId);
      $('#prof-channelSecret').text(profInfo[0].chanSecret);
      $('#prof-channelAccessToken').text(profInfo[0].chanAT);
    }

  });

  // $('#prof-email').append(email);
}

function profEdit() {
  //移到最上面了
  let id = $('#prof-id').text();
  let name = $('#prof-name').text();
  let nick = $('#prof-nick').text();
  let dob = $('#prof-dob').text();
  let email = $('#prof-email').text();
  let gender = $('#prof-gender').text();
  let phone = $('#prof-phone').text();
  let chanId = $('#prof-channelId').text();
  let chanSecret = $('#prof-channelSecret').text();
  let chanAT = $('#prof-channelAccessToken').text();

  // console.log(id, name, dob, email, gender,phone);

  $('#prof-edit-id').val(id);
  $('#prof-edit-name').val(name);
  $('#prof-edit-dob').val(dob);
  $('#prof-edit-email').val(email);
  $('#prof-edit-gender').val(gender);
  $('#prof-edit-phone').val(phone);
  $('#prof-edit-nick').val(nick);

  $('#prof-edit-channelId').val(chanId);
  $('#prof-edit-channelSecret').val(chanSecret);
  $('#prof-edit-channelAccessToken').val(chanAT);
}

function profSubmit() {
  let userId = auth.currentUser.uid;
  let id = $('#prof-edit-id').val();
  let name = $('#prof-edit-name').val();
  let nick = $('#prof-edit-nick').val();
  let dob = $('#prof-edit-dob').val();
  let email = $('#prof-edit-email').val();
  let gender = $('#prof-edit-gender').val();
  let phone = $('#prof-edit-phone').val();

  let chanId = $('#prof-edit-channelId').val();
  let chanSecret = $('#prof-edit-channelSecret').val();
  let chanAT = $('#prof-edit-channelAccessToken').val();
  // console.log(id, name, dob, email, gender,phone);

  // console.log(id);
  database.ref('users/' + userId).remove();
  database.ref('users/' + userId).push({
    name: name,
    dob: dob,
    email: email,
    gender: gender,
    phone: phone,
    nickname: nick,
    chanId: chanId,
    chanSecret: chanSecret,
    chanAT: chanAT
  });
  io.connect().emit('update bot', {
    channelId: chanId,
    channelSecret: chanSecret,
    channelAccessToken: chanAT
  });
  // if(id === ''){
  //   database.ref('users/' + userId).push({
  //     name: name,
  //     dob: dob,
  //     email: email,
  //     gender: gender,
  //     phone: phone,
  //     chanId: chanId,
  //     chanSecret: chanSecret,
  //     chanAT: chanAT
  //   });
  // } else {
  //   database.ref('users/' + userId + '/' + id).set({
  //     name: name,
  //     dob: dob,
  //     email: email,
  //     gender: gender,
  //     phone: phone
  //   });
  // }

  $('#error-message').hide();
  profClear();
  loadProf();
  $('#profModal').modal('hide');
}

function profClear() {
  $('#prof-edit-id').val('');
  $('#prof-edit-name').val('');
  $('#prof-edit-dob').val('');
  $('#prof-edit-email').val('');
  $('#prof-edit-gender').val('Male');
  $('#prof-edit-phone').val('');
  $('#prof-edit-nick').val('');
  $('#prof-edit-channelId').val('');
  $('#prof-edit-channelSecret').val('');
  $('#prof-edit-channelAccessToken').val('');
}
