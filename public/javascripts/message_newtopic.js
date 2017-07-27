// jQuery
$(document).ready(function() {


  $(document).on('click', '#signout-btn', logout); //登出

  // $(document).on('click', '#search-btn', filterChart);

  $(document).on('click', '#message', subMessage);//Message 導覽標籤 subtags


    $(document).on('click', '.tablinks' , clickMsg);
    $(document).on('click', '#emojis' , clickEmo);
    $(document).on('click', '#setlimit', clickMsg);
    $(document).on('click', '#btn-text', btnText);

    // $(document).on('click', '.tablinks' , showEmo);



});
  var count=0;
  console.log('count is: '+count);

  function clickEmo(){
      $('#textinput').val(rel);
  }

  function subMessage(){
    if ($('.subTag').is(':visible')){
      $('.subTag').hide();
    }else{
    $('.subTag').show();
  }
  }

function btnText(){

  $('#text').append(
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
      '<button class="tablinks" rel="emos">Emoji</button></th></tr></div>');

}


      function clickMsg(){
        var target = $(this).attr('rel');
      if ($("#"+target).is(':visible')){
      $("#"+target).hide();
    }else{
    $("#"+target).show();
  }

      }
    




function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login");
  })
}
