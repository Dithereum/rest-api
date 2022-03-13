const express = require('express');
var sqlinjection = require('sql-injection');
const cors = require('cors');

const app = express();
app.use(sqlinjection);

var corsOptions = {
  origin: 'http://api.dithereum.io',
  optionsSuccessStatus: 200
}


//http://localhost:9982/api/stakings/getallstakers/0x19E6277F5Cf6099BD1c54e97644EE0Dfb8bFF96c
app.get('/api/stakings/getallstakers/:wallet', cors(corsOptions), function(req,res){
	var walletid = req.params.wallet;

	getdata(walletid).then((datarows)=>{
		res.send(JSON.stringify(datarows));
	});
});


async function getdata(walletid){
	try{
		const mysql = require('mysql2/promise');
		const connection = await mysql.createConnection({host:'localhost', user: 'root', password: 'Admin@1234', database: 'myvalidators'});

		var query1 = "SELECT `stakerAddress`, `validatorAddress`, `stakeAmount`, `timeStamp`, `status`, `transHash` FROM `stakings` AS `staking` WHERE `staking`.`stakerAddress` ='"+walletid+"'";
                const [rows1, fields1] = await connection.execute(query1);

		var rows = {"staking": rows1}
		return rows;
	}catch(e){
		console.log(">>>>EEEEEEE>>>>",e);
		var rows = {};
		rows = {"Error": e};
		return rows;
	}
}

app.listen(9982);
