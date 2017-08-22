var mysql = require('mysql');

var con = mysql.createConnection({
  host: "192.168.0.135",
  path: "%",
  user: "newuser",
  password: "shield123"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Shield in MySQL Connected!");
});

select_1();
function select_1() {
  con.query("SELECT * FROM shield.category", function (err, result, fields) {
    //獲取category那個table的資料
    //*表示抓取所有欄位
    //若要只抓特定欄位，需寫成"SELECT ID, name, birthday, email FROM shield.userInfo"
    //抓到的東西會存在result裡，array形式
    if (err) {
      console.log("select error");
      throw err;
    }
    console.log("all select result = ");
    console.log(result);
  });
}

//insert();
function insert() {
  let obj = {
    category_name : "餐廳"
  };
  con.query("INSERT INTO shield.category SET ?", obj, function(err, rows) {
    //放入新的category資料，其中ID欄位MYSQL會自己指定
    //有點像是C語言，有幾個"?"，後面就要多幾個參數，參數就是"?"代表的東西
    //但還是有點不同，若有很多個?，後面的參數要包成array，下面會再解釋

    console.log("INSERT OBJ = ");
    console.log(obj);
    if(err) {
      console.log("ERROR when INSERT INTO shield.category");
      throw err;
    }
    else console.log("SUCCESS when INSERT INTO shield.category");
  });
}

// select_2();
function select_2() {
  con.query("SELECT * FROM shield.category WHERE category_name = ?","餐廳", function (err, result, fields) {
    //獲取資料進階版
    //只抓取類別名稱為廚師的類別
    //使用 "WHERE 欄位 = '值' "
    if (err) {
      console.log("select error");
      throw err;
    }
    console.log("select 餐廳 result:");
    console.log(result);
  });
}

// select_3();
function select_3() {
  con.query("SELECT * FROM shield.category WHERE category_name = ? and ID > ?", ["餐廳", 3], function (err, result, fields) {
    //獲取資料進階進階版
    //只抓取類別名稱為廚師，且ID>3的類別
    //使用 "WHERE 欄位 = '值' and 欄位 = '值'"
    //出現很多個問號時，須把後面參數包成一個Array
    if (err) {
      console.log("select error");
      throw err;
    }
    console.log("select 餐廳 and ID < 7 result:");
    console.log(result);
  });
}


// vote();
function vote() {
  let voter= "U123";
  let time= new Date(Date.now());
  let categoryName= "飯店";
  let workerName= "王子大飯店";
  let groupName = "台南EAT";
  let score = 4;

  console.log(time);
  let categoryId;
  let workerId;
  let groupId;

  con.query( "SELECT * FROM shield.category WHERE category_name = ?", categoryName, function( err, result, fields) {
    console.log("result:");
    console.log(result);
    console.log("result[0]:");    //理論上result只會有單一資料，但還是會是ARRAY形式，所以需使用result[0]獲得那筆資料
    console.log(result[0]);
    console.log("use 'result[0].ID' to get category ID");
    console.log(result[0].ID);
    categoryId = result[0].ID;
  });
  con.query( "SELECT * FROM shield.worker WHERE worker_name = ?", workerName, function( err, result, fields) {
    workerId = result[0].ID;
  });
  con.query( "SELECT * FROM shield.group WHERE group_name = ?", groupName, function( err, result, fields) {
    groupId = result[0].ID;
  });

  let timer = setInterval( insert_vote, 10 );
  //因前面幾個資料庫操作是異步操作 可能會發生還沒抓完資料就繼續執行的情況
  //所以用setInterval包起來，確認值都有收到後，再寫進資料庫並停止setInterval
  function insert_vote() {
    if( !categoryId || !workerId || !groupId ) return;
    clearInterval(timer);
    let obj = {
      vote_voter: voter,
      vote_time: time,
      category_id: categoryId,
      worker_id: workerId,
      group_id: groupId,
      vote_score: score
    };
    console.log("to insert obj = ");
    console.log(obj);

    con.query( "INSERT INTO shield.vote SET ? ", obj, function(err, rows) {
      if( err ) {
        console.log("ERROR INSERT VOTE");
        throw err;
      }
      else {
        console.log("SUCCESS INSERT VOTE! obj =");
        console.log(obj);
      } //end else
    }); //end con.query
  } //end insert_vote

}
