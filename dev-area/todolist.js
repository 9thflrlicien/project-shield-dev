$(document).ready(function() {

  // outer space todo
  $(document).on('click', '#add-btn', addTodo); //新增 todo
  $(document).on('change', '#todobox', completeTodo); //勾選完成
  $(document).on('click', '#tododel', deleteTodo); //刪除 todo
  $(document).on('click', '#todoname', editTodo); //修改前把修改input叫出來
  $(document).on('click', '#edit-btn', submitEditTodo); //修改後把修改input隱藏出來
  $(document).on('click', '#showsub', showsub); //下拉sub
  $(document).on('click', '#todostar', starred); //標星號
  // inner space todo
  $(document).on('change', '#innerbox', completeTodo); //勾選完成
  $(document).on('click', '#inner-add-btn', addSub); //新稱sub
  $(document).on('click', '#innerdel', deleteTodo); //刪除sub
  $(document).on('click', '#subname', editSub); //修改前把修改inner input叫出來
  $(document).on('click', '#inner-edit-btn', submitEditSub); //修改後把修改input隱藏出來
  
});

// Todo List
function addTodo(){
  let inputVal = $('#todoinput').val(); //document.getElementById('todoinput').value;
  $('#todolist').append(
    $('<li>')
    .append('<input type="checkbox" id="todobox" value="">')
    .append('<span id="todoname">' + inputVal + '</span>')
    .append(
      $('<div class="input-group disappear" id="todoedit">')
      .append('<input type="text" class="form-control" id="subinput" value="' + inputVal + '">')
      .append('<div class="input-group-addon" id="edit-btn">Edit</div>')
    )
    .append('<span class="fa fa-star-o" id="todostar"></span>')
    .append('<span class="fa fa-trash trash" id="tododel"></span>')
    .append('<span class="fa fa-angle-double-down" id="showsub"></span>')
    .append(
      $('<div id="innerlist" class="disappear">')
      .append($('<div class="input-group">')
        .append('<input type="text" class="form-control" id="innerinput" placeholder="Add a sub task...">')
        .append('<div class="input-group-addon" id="inner-add-btn">Add</div>')
      )
      .append('<ul>')
    )
  )
  .append('<br/>');
  // document.getElementById('todoinput').value = "";
  $('#todoinput').val('');
}

function addSub(){
  let inputVal = $(this).parent().find('#innerinput').val();
  $('#innerlist ul').append(
    $('<li>')
    .append('<input type="checkbox" id="innerbox" value="">')
    .append('<span id="subname">' + inputVal + '</span>')
    .append(
      $('<div class="input-group disappear" id="inneredit">')
      .append('<input type="text" class="form-control" id="innersubinput" value="' + inputVal + '">')
      .append('<div class="input-group-addon" id="inner-edit-btn">Edit</div>')
    )
    .append('<span class="fa fa-trash trash" id="innerdel"></span>')
  );
  $(this).parent().find('#innerinput').val('');
}

function completeTodo(){
  // let con = confirm('Are you sure the task is finished?');
  // if(con == true){
  //   $(this).parent().toggleClass('completeTodo');
  // } else {
  //
  // }
  $(this).parent().toggleClass('completeTodo');
}

function deleteTodo(){
  $(this).parent().remove();
}

function editTodo(){
  $(this).parent().find('#todoedit').removeClass('disappear');
  $(this).hide();
}

function editSub(){
  $(this).parent().find('#inneredit').removeClass('disappear');
  $(this).hide();
}

function submitEditTodo(){
  let inner = $(this).parent().find('#subinput').val();
  $(this).parent().parent().find('#todoname').text(inner);
  $(this).parent().addClass('disappear');
  $(this).parent().parent().find('#todoname').show();
}

function submitEditSub(){
  let inner = $(this).parent().find('#innersubinput').val();
  $(this).parent().parent().find('#subname').text(inner);
  $(this).parent().addClass('disappear');
  $(this).parent().parent().find('#subname').show();
}

function showsub(){
  if($(this).hasClass('fa-angle-double-down')){
    $(this).removeClass('fa-angle-double-down');
    $(this).addClass('fa-angle-double-up');
    $(this).parent().find('#innerlist').removeClass('disappear');
  } else {
    $(this).addClass('fa-angle-double-down');
    $(this).removeClass('fa-angle-double-up');
    $(this).parent().find('#innerlist').addClass('disappear');
  }
}

function starred() {
  if($(this).hasClass('fa-star-o')){
    $(this).removeClass('fa-star-o');
    $(this).addClass('fa-star');
  } else if($(this).hasClass('fa-star')){
    $(this).removeClass('fa-star');
    $(this).addClass('fa-star-o');
  }
}
