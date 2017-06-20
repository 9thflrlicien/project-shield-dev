// jQuery
$(document).ready(function() {

  $(document).on('click', '#signout-btn', logout); //登出

  // search function
  // $(document).on('click', '#search-btn', filterChart);
  $("#a").hide(); //隱藏選單
  $("#search-input").click(function() { $("#a").show()}); //選單

  $(document).on('click', '#search-input', getH); //總覽
  $(document).on('click', '#get_h', getH); //總覽
  $(document).on('click', '#get_a', getA); //瀏覽人數
  $(document).on('click', '#get_b', getB); //收入分析
  $(document).on('click', '#get_c', getC); //回饋
  $(document).on('click', '#get_d', getD); //通知
  $(document).on('click', '#get_e', getE); //收入比例
  $(document).on('click', '#get_g', getG); //聊天室

  $("#a").click(function() { $(this).hide();}); //隱藏選單

  // end of search

});

//搜尋篩選要檢視的chart
function filterChart(){
  let getInputVal = $('#search-input').val().toLowerCase();
  console.log(getInputVal);
  if(getInputVal !== ''){
    $('.panel-default').css("display","none");

    if($('.name').is('#' + getInputVal)){
      $('#' + getInputVal).parent().parent().css("display","block");
    }

    // $('.name').each(() => {
    //   var text = $(this).text().toLowerCase();
    //   console.log(text);
    //   if(text.indexOf(getInputVal) != -1){
    //     $(this).parent().parent().show();
    //   }
    // });
  } else {
    $('.panel-default').css("display","block");
  }

};

function logout(){
  auth.signOut()
  .then(response => {
    window.location.assign("/login");
  })
}

//search function
//自動填入篩選
function getH() {
$('#search-input').val('總覽');
};

function getA() {
$('#search-input').val('瀏覽人數');
};

function getB() {
$('#search-input').val('收入分析');
};

function getC() {
$('#search-input').val('回饋');
};

function getD() {
$('#search-input').val('通知');
};

function getE() {
$('#search-input').val('收入比例');
};

function getG() {
$('#search-input').val('聊天室');
};
