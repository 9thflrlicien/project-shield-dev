$(document).ready(function() {
  // $('#side-menu').hide();

  var name = $('#prof-name').text();
  var id = $('#prof-id').text();
  var dob = $('#prof-dob').text();
  var email = $('#prof-email').text();
  var gender = $('#prof-gender').text();
  var phone = $('#prof-phone').text();
  var chanId_1 = $('#prof-channelId_1').text();
  var chanSecret_1 = $('#prof-channelSecret_1').text();
  var chanAT_1 = $('#prof-channelAccessToken_1').text();
  var chanId_2 = $('#prof-channelId_2').text();
  var chanSecret_2 = $('#prof-channelSecret_2').text();
  var chanAT_2 = $('#prof-channelAccessToken_2').text();

  $('#prof-name').text('');
  $('#prof-dob').text('');
  $('#prof-email').text('');
  $('#prof-gender').text('');
  $('#prof-phone').text('');
  $('#prof-nick').text('');
  $('#prof-channelId_1').text('');
  $('#prof-channelSecret_1').text('');
  $('#prof-channelAccessToken_1').text('');
  $('#prof-channelId_2').text('');
  $('#prof-channelSecret_2').text('');
  $('#prof-channelAccessToken_2').text('');

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
      let profInfo = snap.val();
      let profId = Object.keys(profInfo);
      $('#prof-id').text(profId);
      $('#prof-name').text(profInfo.name);
      $('#prof-dob').text(profInfo.dob);
      $('#prof-email').text(profInfo.email);
      $('#prof-gender').text(profInfo.gender);
      $('#prof-phone').text(profInfo.phone);
      $('#prof-nick').text(profInfo.nickname);
      $('#prof-channelId_1').text(profInfo.chanId_1);
      $('#prof-channelSecret_1').text(profInfo.chanSecret_1);
      $('#prof-channelAccessToken_1').text(profInfo.chanAT_1);
      $('#prof-channelId_2').text(profInfo.chanId_2);
      $('#prof-channelSecret_2').text(profInfo.chanSecret_2);
      $('#prof-channelAccessToken_2').text(profInfo.chanAT_2);
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
  let chanId_1 = $('#prof-channelId_1').text();
  let chanSecret_1 = $('#prof-channelSecret_1').text();
  let chanAT_1 = $('#prof-channelAccessToken_1').text();
  let chanId_2 = $('#prof-channelId_2').text();
  let chanSecret_2 = $('#prof-channelSecret_2').text();
  let chanAT_2 = $('#prof-channelAccessToken_2').text();

  // console.log(id, name, dob, email, gender,phone);

  $('#prof-edit-id').val(id);
  $('#prof-edit-name').val(name);
  $('#prof-edit-dob').val(dob);
  $('#prof-edit-email').val(email);
  $('#prof-edit-gender').val(gender);
  $('#prof-edit-phone').val(phone);
  $('#prof-edit-nick').val(nick);

  $('#prof-edit-channelId_1').val(chanId_1);
  $('#prof-edit-channelSecret_1').val(chanSecret_1);
  $('#prof-edit-channelAccessToken_1').val(chanAT_1);
  $('#prof-edit-channelId_2').val(chanId_2);
  $('#prof-edit-channelSecret_2').val(chanSecret_2);
  $('#prof-edit-channelAccessToken_2').val(chanAT_2);
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

  let chanId_1 = $('#prof-edit-channelId_1').val();
  let chanSecret_1 = $('#prof-edit-channelSecret_1').val();
  let chanAT_1 = $('#prof-edit-channelAccessToken_1').val();
  let chanId_2 = $('#prof-edit-channelId_2').val();
  let chanSecret_2 = $('#prof-edit-channelSecret_2').val();
  let chanAT_2 = $('#prof-edit-channelAccessToken_2').val();
  // console.log(id, name, dob, email, gender,phone);

  // console.log(id);
  // database.ref('users/' + userId).remove();
  database.ref('users/' + userId).set({
    name: name,
    dob: dob,
    email: email,
    gender: gender,
    phone: phone,
    nickname: nick,
    chanId_1: chanId_1,
    chanSecret_1: chanSecret_1,
    chanAT_1: chanAT_1,
    chanId_2: chanId_2,
    chanSecret_2: chanSecret_2,
    chanAT_2: chanAT_2
  });
  io.connect().emit('update bot', [
    {
      channelId: chanId_1,
      channelSecret: chanSecret_1,
      channelAccessToken: chanAT_1
    },
    {
      channelId: chanId_2,
      channelSecret: chanSecret_2,
      channelAccessToken: chanAT_2
    },
  ]);
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
  $('#prof-edit-channelId_1').val('');
  $('#prof-edit-channelSecret_1').val('');
  $('#prof-edit-channelAccessToken_1').val('');
  $('#prof-edit-channelId_2').val('');
  $('#prof-edit-channelSecret_2').val('');
  $('#prof-edit-channelAccessToken_2').val('');
}
