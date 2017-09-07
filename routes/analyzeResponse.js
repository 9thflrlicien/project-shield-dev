var express = require('express');
var router = express.Router();

var con = require('./mysql');   //取得mysql config

router.get('/', function(req, res, next) {
  res.render('analyzeResponse', {
    title: 'Analyze Response'
  });
});

router.post('/getChart', function(req, res, next) {
  //前端傳送POST請求，取得問卷分析圖表
  let chart = req.body.chart;
  console.log("get post! chart = "+chart);
  if( chart=="某團對各工人評價" ) {
    let group_id = req.body.option;
    //取得所有該團的worker的ID及NAME
    let sql = "SELECT shield.group_worker.worker_id, shield.worker.worker_name"
      + " FROM shield.group_worker, shield.worker"
      + " WHERE shield.group_worker.group_id = ? and shield.group_worker.worker_id = shield.worker.ID"
      + " ORDER BY shield.group_worker.worker_id";
    con.query(sql, group_id, function(err, result, fields) {
      let length = result.length;
      let names = [];
      let scores = [];
      for( let i in result ) {
        names.push(result[i].worker_name);    //將worker名字push進names
        let sql = "SELECT vote_score FROM shield.vote WHERE group_id = ? and worker_id = ?";
        con.query( sql, [ group_id, result[i].worker_id ], function(err, result, fields) {
          //從DB取得所有該團旅客投給該worker的分數
          let sum = 0;
          for( let i in result ) sum += result[i].vote_score;
          scores.push( sum/result.length );   //平均過後push進scores
        });
      }

      let timer = setInterval( function() {
        //因con.query是異步處理，需等待for迴圈真的跑完，再將respone送回前端
        if( scores.length == length ) clearInterval(timer); //確認for跑完後，停止此timer
        else return;    //若還沒跑完，則先不送資料回前端
        console.log(names);
        console.log(scores);
        res.send({
          names: names,
          scores: scores
        });
      }, 10 );
    });
  }

  else if( chart=="某項目各工人評價" ) {
    let category_id = req.body.option;
    //取得該項目的所有工人
    let sql = 'SELECT worker_name, score FROM shield.worker WHERE category_id = ?';
    con.query( sql, category_id, function(err, result, fields) {
      console.log(result);
      let worker_name = [];
      let score = [];
      for( let i in result ) {
        //將所有工人的name及score，push進兩陣列裡
        worker_name.push( result[i].worker_name );
        score.push( result[i].score );
      }
      res.send({
        worker_name: worker_name,
        score: score
      });
      console.log("sent");
    });

  }
  else if( chart=="某團對各項目評價" ) {
    let group_id = req.body.option;
    //取得所有項目
    con.query( "SELECT * FROM shield.category", function(err, result, fields) {
      let length = result.length;
      let category_names = [];
      let scores = [];
      for( let i in result ) {
        category_names.push( result[i].category_name );
        //取得所有投給該項目的分數
        let sql = "SELECT vote_score FROM shield.vote WHERE group_id = ? and category_id = ?";
        con.query( sql, [ group_id, result[i].ID ], function(err, result, fields) {
          let sum = 0;
          for( let i in result ) sum += result[i].vote_score;
          scores.push( sum/result.length ); //計算完後，push進scores裡
        });
      }

      let timer = setInterval( function() {        //因con.query是異步處理，需等待for迴圈真的跑完，再將respone送回前端
        if( scores.length == length ) clearInterval(timer); //確認for跑完後，停止此timer
        else return;    //若還沒跑完，則先不送資料回前端
        console.log(category_names);
        console.log(scores);
        res.send({
          category_names: category_names,
          scores: scores
        });
      }, 10 );
    });
  }
  else {
    console.log("chart = "+chart+", not found!");
  }
});

router.post('/getData', function(req, res, next) {
  //前端傳送POST request，取得資料庫的DATA
  let type = req.body.type;
  console.log("get data! type = "+type);
  if( type=="details" ) {
    sql = "SELECT shield.vote.*, shield.category.category_name"
      + ", shield.worker.worker_name, shield.group.group_name "
      + " FROM shield.category, shield.worker, shield.group, shield.vote "
      + " WHERE shield.vote.category_id = shield.category.ID "
      + " and shield.vote.worker_id = shield.worker.ID "
      + " and shield.vote.group_id = shield.group.ID";
    //取得所有vote資料，並搜尋其他table以將id轉為string
    con.query(sql, function(err, result, fields) {
      if( err ) {
        console.log("ERROR when SELECT * FROM shield.vote");
        console.log(err);
      }
      else {
        for( let i in result ) {
          //這裡選擇抓到名稱後就不顯示id
          delete result[i].category_id;
          delete result[i].worker_id;
          delete result[i].group_id;
        }
        res.send(result);   //將所有vote資料送至前端
      }
    });
  }
  else if( type=="category" ) {
    con.query("SELECT * FROM shield.category", function(err, result, fields) {
      if( err ) console.log(err);
      else res.send(result);
    });
  }
  else if( type=="group" ) {
    con.query("SELECT worker_name FROM shield.worker", function(err, result, fields ){
      //前端要可幫GROUP加入新工人，因此需取得所有工人的名字
      let data = {
        worker: result.map( function(ele) { return ele.worker_name; } )
      };
      con.query("SELECT * FROM shield.group", function(err, result, fields) {
        //取得所有旅行團的資料
        if( err ) console.log(err);
        data.group = [];
        let length = result.length;
        let count = 0;
        result.map( function(ele) {
          //對每個旅行團，都去group_worker尋找有參加該團的工人
          let sql = "SELECT shield.worker.worker_name FROM shield.worker, shield.group_worker"
            + " where shield.group_worker.group_id = ? and shield.group_worker.worker_id = shield.worker.ID"
            + " ORDER BY shield.group_worker.worker_id";
          con.query(sql, ele.ID, function(err, result, fields) {
            if( err ) console.log(err);
            else {
              data.group.push({
                ID: ele.ID,     //group.ID
                group_name: ele.group_name,   //group.group_name
                workers: result     //group_worker.worker_name
              });
              count++;
            }
          });
        });
        let timer = setInterval( function() {
          //異步問題，需確認每個旅行團的資料都push進去了，才送出資料至前端
          if( count==length ) clearInterval(timer);
          else return;
          res.send(data);
        }, 10 );
      });
    });
  }
  else if( type=="worker" ) {
    let sql = "SELECT shield.worker.ID, shield.worker.worker_name, shield.worker.category_id"
      + ", shield.worker.vote_count, shield.worker.score FROM shield.worker";
    con.query(sql, function(err, result, fields) {
      if( err ) console.log(err);
      else {
        let workerData = result;
        con.query("SELECT * from shield.category", function(err, result, fields) {
          res.send({
            worker: workerData,
            category: result
          });
        });
      }
    });
  }
  else {
    console.log("type = "+type+", not found!");
  }
});

router.post('/setCategory', function(req, res, next) {
  let updateData = JSON.parse(req.body.data); //需先parse成JSON才可使用
  console.log(updateData);
  updateData.map( function(data) {
    let ID = data.ID;
    let category_name = data.category_name;
    console.log(ID+", "+category_name);
    if( ID && category_name ) {
      console.log("UPDATE");
      let sql = "UPDATE shield.category SET category_name = ? WHERE ID = ? ";
      con.query( sql, [ category_name, ID ], function(err, rows) {
        if(err) console.log(err);
      });
    }
    else if( ID && !category_name ) {
      console.log("DELETE");
      let sql = "DELETE FROM shield.category WHERE ID = ? ";
      con.query( sql, ID, function(err, rows) {
        if(err) console.log(err);
      });
    }
    else if( !ID && category_name ) {
      console.log("INSERT");
      let sql = "INSERT INTO shield.category SET ? ";
      con.query( sql, { category_name: category_name }, function(err, rows) {
        if(err) console.log(err);
      });
    }
  });
  res.send("SUCCESS");
});

router.post('/setGroup', function(req, res, next) {
  let updateData = JSON.parse(req.body.data);
  updateData.group.map( function(data) {
    let ID = data.ID;
    let group_name = data.group_name;
    console.log(ID+", "+group_name);
    if( ID && group_name ) {
      console.log("UPDATE");
      let sql = "UPDATE shield.group SET group_name = ? WHERE ID = ? ";
      con.query( sql, [ group_name, ID ], function(err, rows) {
        if(err) console.log(err);
      });
    }
    else if( ID && !group_name ) {
      console.log("DELETE");
      let sql = "DELETE FROM shield.group WHERE ID = ? ";
      con.query( sql, ID, function(err, rows) {
        if(err) console.log(err);
      });
    }
    else if( !ID && group_name ) {
      console.log("INSERT");
      let sql = "INSERT INTO shield.group SET ? ";
      con.query( sql, { group_name: group_name }, function(err, rows) {
        if(err) console.log(err);
      });
    }
  });

  con.query("TRUNCATE shield.group_worker", function(err, rows) {
    if(err) console.log(err);
  });
  updateData.group_worker.map( function(ele) {
    con.query("SELECT ID FROM shield.worker WHERE worker_name = ?", ele.worker_name, function(err, result, fields) {
      let id = result[0].ID;
      let data = {
        group_id: ele.group_id,
        worker_id: id
      };
      con.query("INSERT INTO shield.group_worker SET ? ", data , function(err, rows) {
        if(err) console.log(err);
      });
    });
  });
  res.send("SUCCESS");
});

router.post('/setWorker', function(req, res, next) {
  let updateData = JSON.parse(req.body.data);
  console.log(updateData);
  updateData.map( function(data) {
    console.log("now data: ");
    console.log(data);
    let ID = data.ID;
    let worker_name = data.worker_name;
    let category_id = data.category_id;
    if( ID && worker_name ) {
      console.log("UPDATE");
      let sql = "UPDATE shield.worker SET worker_name = ?, category_id = ? WHERE ID = ? ";
      con.query( sql, [ worker_name, category_id, ID ], function(err, rows) {
        if(err) console.log(err);
      });
    }
    else if( ID && !worker_name ) {
      console.log("DELETE");
      let sql = "DELETE FROM shield.worker WHERE ID = ? ";
      con.query( sql, ID, function(err, rows) {
        if(err) console.log(err);
      });
    }
    else if( !ID && worker_name ) {
      console.log("INSERT");
      let sql = "INSERT INTO shield.worker SET ? ";
      con.query( sql, { worker_name: worker_name, category_id: category_id }, function(err, rows) {
        if(err) console.log(err);
      });
    }
  });
  res.send("SUCCESS");
});

//更新WORKER的評價資料
// setInterval( function() {
//   console.log("check worker update");
//
//   con.query('SELECT * FROM shield.update_info ORDER BY ID DESC LIMIT 1', function(err, result, fields) {
//     let update_to = result[0].update_to;      //取得上次更新VOTE資料庫到哪
//
//     let sql = 'SELECT * FROM shield.vote WHERE shield.vote.ID > ? ORDER BY worker_id';
//     con.query( sql, update_to,  function(err, result, fields) {
//       //取得上次更新VOTE資料庫之後，產生的新資料
//       if( result.length==0 ) {
//         //no need to update
//         console.log("no need update");  //若產生的新資料，長度=0，則不需更新
//       }
//       else {
//         console.log("need update");     //若有產生新資料，則須更新
//         let vote_data = [];             //將同樣WORKER_ID的VOTE_SCORE包一起，減少存取DB的動作
//
//         //在SELECT DB時，已經將DATA以WORKER_ID排序了
//         while( result.length>0 ) {      //只要還有待處理的VOTE資料
//           let worker_id = result[0].worker_id;  //取得現在要包的WORKER_ID
//           let scores = [];
//           while( result.length>0 ) {
//             if( result[0].worker_id == worker_id ) {    //只要這一筆資料還在同一個WORKER_ID
//               scores.push( result[0].vote_score );      //就把這個VOTE的分數PUSH進SCORES陣列
//               result.splice(0,1);                       //並把此VOTE移出待處理的陣列
//             }
//             else break;                     //如果不在同個WORKER_ID，就先跳出迴圈
//           }
//           vote_data.push({                  //PUSH一個物件，物件包含WORKER_ID及他獲得的評價分數們的陣列
//             worker_id: worker_id,
//             scores: scores
//           });
//         }
//         console.log(vote_data);
//
//         vote_data.map( function(data) {
//           con.query('SELECT * FROM shield.worker WHERE shield.worker.ID = ? ', data.worker_id, function(err, result, fields) {
//             let worker = result[0];   //獲得此WORKER之前在DB的資料
//             for( let i in data.scores ) {   //將前面獲得的VOTE_DATA裡面的每個SCORE，加進去此WORKER的資料
//               let n = data.scores[i];
//               worker["score_"+n+"_count"]++;
//               worker["vote_count"]++;
//             }
//             let sum = 0;
//             for( let i = 1; i<=5; i++ ) {   //加完SCORE後，計算出總共得分
//               sum += i * worker["score_"+i+"_count"];
//             }
//             worker.score = sum/worker.vote_count; //計算出平均得分
//             // console.log(worker);      //CONSOLE此WORKER更新後的資料
//             con.query('UPDATE shield.worker SET vote_count = ? '
//             + ', score_5_count = ?, score_4_count = ?, score_3_count = ?, score_2_count = ?, score_1_count = ?'
//             + ', score = ?'
//             + ' WHERE ID = ?'
//             , [worker.vote_count, worker.score_5_count, worker.score_4_count, worker.score_3_count
//               , worker.score_2_count, worker.score_1_count, worker.score, data.worker_id]
//             , function(err, rows) {   //UPDATE進資料庫
//               if(err) throw err;
//             });
//           });
//         });
//
//         //紀錄這次更新到哪
//         con.query('SELECT ID FROM shield.vote ORDER BY ID DESC LIMIT 1', function(err, result, fields) {
//           //取得VOTE的最後一筆資料的ID
//           let new_update_to = result[0].ID;
//           console.log("update_to = "+new_update_to);
//           con.query('INSERT INTO shield.update_info SET ?', {update_to: new_update_to}, function(err, rows) {
//             if(err) throw err;  //將此資訊寫進DB，下次就知道要從這筆資料後更新
//           });
//         }); //end con.query
//       } //end else
//     }); //end con.query vote
//   }); //end con.query update_info
//
// }, 60*1000 );


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
