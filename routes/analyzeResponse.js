var express = require('express');
var router = express.Router();
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

router.get('/', function(req, res, next) {
  res.render('analyzeResponse', {
    title: 'Analyze Response'
  });
});
router.post('/', function(req, res, next) {
  let updated = false;

  //更新WORKER的評價資料
  con.query('SELECT * FROM shield.update_info ORDER BY ID DESC LIMIT 1', function(err, result, fields) {
    let update_to = result[0].update_to;      //取得上次更新VOTE資料庫到哪
    con.query('SELECT * FROM shield.vote WHERE shield.vote.ID > ? ORDER BY worker_id', update_to,  function(err, result, fields) {
      //取得上次更新VOTE資料庫之後，產生的新資料
      if( result.length==0 ) {
        //no need to update
        console.log("no need update");  //若產生的新資料，長度=0，則不需更新
        updated = true;
      }
      else {
        console.log("need update");     //若有產生新資料，則須更新
        let vote_data = [];             //將同樣WORKER_ID的VOTE_SCORE包一起，減少存取DB的動作

        //在SELECT DB時，已經將DATA以WORKER_ID排序了
        while( result.length>0 ) {      //只要還有待處理的VOTE資料
          let worker_id = result[0].worker_id;  //取得現在要包的WORKER_ID
          let scores = [];
          while( result.length>0 ) {
            if( result[0].worker_id == worker_id ) {    //只要這一筆資料還在同一個WORKER_ID
              scores.push( result[0].vote_score );      //就把這個VOTE的分數PUSH進SCORES陣列
              result.splice(0,1);                       //並把此VOTE移出待處理的陣列
            }
            else break;                     //如果不在同個WORKER_ID，就先跳出迴圈
          }
          vote_data.push({                  //PUSH一個物件，物件包含WORKER_ID及他獲得的評價分數們的陣列
            worker_id: worker_id,
            scores: scores
          });
        }
        console.log(vote_data);

        vote_data.map( function(data) {
          con.query('SELECT * FROM shield.worker WHERE shield.worker.ID = ? ', data.worker_id, function(err, result, fields) {
            let worker = result[0];   //獲得此WORKER之前在DB的資料
            for( let i in data.scores ) {   //將前面獲得的VOTE_DATA裡面的每個SCORE，加進去此WORKER的資料
              let n = data.scores[i];
              worker["score_"+n+"_count"]++;
              worker["vote_count"]++;
            }
            let sum = 0;
            for( let i = 1; i<=5; i++ ) {   //加完SCORE後，計算出總共得分
              sum += i * worker["score_"+i+"_count"];
            }
            worker.score = sum/worker.vote_count; //計算出平均得分
            // console.log(worker);      //CONSOLE此WORKER更新後的資料
            con.query('UPDATE shield.worker SET vote_count = ? '
            + ', score_5_count = ?, score_4_count = ?, score_3_count = ?, score_2_count = ?, score_1_count = ?'
            + ', score = ?'
            + ' WHERE ID = ?'
            , [worker.vote_count, worker.score_5_count, worker.score_4_count, worker.score_3_count, worker.score_2_count, worker.score_1_count, worker.score, data.worker_id]
            , function(err, rows) {   //UPDATE進資料庫
              if(err) throw err;
            });
          });
        });

        //紀錄這次更新到哪
        con.query('SELECT ID FROM shield.vote ORDER BY ID DESC LIMIT 1', function(err, result, fields) {
          //取得VOTE的最後一筆資料的ID
          let new_update_to = result[0].ID;
          console.log("update_to = "+new_update_to);
          con.query('INSERT INTO shield.update_info SET ?', {update_to: new_update_to}, function(err, rows) {
            if(err) throw err;  //將此資訊寫進DB，下次就知道要從這筆資料後更新
          });
          updated = true;
        }); //end con.query
      } //end else
    }); //end con.query vote
  }); //end con.query update_info

  let timer = setInterval( function() {
    //js異步處理特性，須用此方法，確認在DB更新完後，再載入資料
    if( updated ) clearInterval(timer);
    else {
      console.log("update not done yet");
      return;
    }

    console.log("get post! chart = "+req.body.chart);
    let chart = req.body.chart;
    let sql = req.body.sql;
    if( chart=="某團各客戶對各工人評價" ) {
      let group_id = req.body.option;
      let count = 0;
      let group_with_workers = [];
      let users_votes = [];


      let sql = "SELECT shield.group_worker.worker_id, shield.worker.worker_name FROM shield.group_worker, shield.worker"
        + " WHERE shield.group_worker.group_id = ? and shield.group_worker.worker_id = shield.worker.ID"
        + " ORDER BY shield.group_worker.worker_id";
      con.query(sql, group_id, function(err, result, fields) {
        group_with_workers = result;
        console.log(group_with_workers);
        count++;
      });
      con.query("SELECT * FROM shield.vote WHERE group_id = ? ORDER BY vote_voter, worker_id", group_id, function(err, result, fields) {
        users_votes = package(result, "vote_voter", "worker_id", "vote_score");
        for( let i in users_votes ) console.log(users_votes[i]);
        count++;
      });


      // con.query("SELECT * FROM shield.vote WHERE group_id = ? ORDER BY worker_id, vote_voter", group_id, function(err, result, fields) {
      //
      // });


      let timer = setInterval(function() {
        if( count==2 ) clearInterval(timer);
        else return;
        res.send({
          group_with_workers: group_with_workers,
          users_votes: users_votes
        });
      });

    }

    else if( chart=="所有旅行團對該職業工人評價" ) {
      let category_id = req.body.option;
      con.query('SELECT worker_name, score FROM shield.worker WHERE category_id = ?', category_id, function(err, result, fields) {
        console.log(result);
        let worker_name = result.map( function(ele) {
          return ele.worker_name;
        });
        let score = result.map( function(ele) {
          return ele.score;
        });
        res.send({
          worker_name: worker_name,
          score: score
        });
        console.log("sent");
      });

    }

    else if( chart=="旅行團對各項目評價" ) {


    }

    else if( chart=="詳細資料" ) {
      sql = "SELECT shield.vote.*, shield.category.category_name, shield.worker.worker_name, shield.group.group_name "
       + " FROM shield.category, shield.worker, shield.group, shield.vote "
       + " WHERE shield.vote.category_id = shield.category.ID "
       + " and shield.vote.worker_id = shield.worker.ID "
       + " and shield.vote.group_id = shield.group.ID";

      con.query(sql, function(err, result, fields) {
        if( err ) {
          console.log("ERROR when SELECT * FROM shield.vote");
          console.log(err);
        }
        else {
          for( let i in result ) {
            delete result[i].category_id;
            delete result[i].worker_id;
            delete result[i].group_id;
          }
          res.send(result);
        }
      });
    }
    else if( chart=="設定" ) {
      let data = {};
      let count = 0;
      con.query("SELECT * FROM shield.category", function(err, result, fields) {
        if( err ) console.log(err);
        else {
          data.category = result;
          count++;
        }
      });
      con.query("SELECT * FROM shield.worker", function(err, result, fields) {
        if( err ) console.log(err);
        else {
          data.worker = result;
          count++;
        }
      });
      con.query("SELECT * FROM shield.group", function(err, result, fields) {
        if( err ) console.log(err);
        else {
          data.group = result;
          count++;
        }
      });
      con.query("SELECT * FROM shield.group_worker", function(err, result, fields) {
        if( err ) console.log(err);
        else {
          data.group_worker = result;
          count++;
        }
      });
      con.query("SELECT * FROM shield.vote", function(err, result, fields) {
        if( err ) console.log(err);
        else {
          data.vote = result;
          count++;
        }
      });
      let timer = setInterval( function() {
        if( count==5 ) clearInterval(timer);
        else return;
        res.send(data);
      }, 10 );
    }
    else {
      console.log("chart = "+chart+", not found!");
    }

  }, 2 ); //end updated timer
});

function package(arr, prop) {
  console.log("prop = "+prop);
  let return_data = [];
  while( arr.length>0 ) {
    let now_prop = arr[0][prop];
    let data = [];
    while( arr.length>0 ) {
      if( arr[0][prop] == now_prop ) {
        if( arguments.length==2 ) data.push( arr[0] );
        else {
          let obj = {};
          for( let i=2; i<arguments.length; i++ ) {
            let to_get = arguments[i];
            obj[to_get] = arr[0][to_get];
          }
          data.push( obj );
        }
        arr.splice(0,1);                       //並把此VOTE移出待處理的陣列
      }
      else break;                     //如果不在同個WORKER_ID，就先跳出迴圈
    }
    let obj = {};
    obj[prop] = now_prop;
    obj["data"] = data;
    return_data.push(obj);
  }
  // console.log(return_data);
  return return_data;
}

module.exports = router;
