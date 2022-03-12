const express = require('express');
var sqlinjection = require('sql-injection');
const cors = require('cors');

const app = express();
app.use(sqlinjection);

var corsOptions = {
  origin: 'http://api.dithereum.io',
  optionsSuccessStatus: 200
}


//http://localhost:9981/api/stakings/getstaker/0x19E6277F5Cf6099BD1c54e97644EE0Dfb8bFF96c
app.get('/api/stakings/getstaker/:wallet', cors(corsOptions), function(req,res){
	var walletid = req.params.wallet;

	getdata(walletid).then((datarows)=>{
		res.send(JSON.stringify(datarows));
	});
});


async function getdata(walletid){
	try{
		const mysql = require('mysql2/promise');
		const connection = await mysql.createConnection({host:'localhost', user: 'root', password: 'Admin@1234', database: 'myvalidators'});

		var query1 = "SELECT `stakerAddress`, `validatorAddress`, `stakeAmount`, `timeStamp`, `status`, `transHash`, `id` FROM `stakings` AS `staking` WHERE `staking`.`stakerAddress` = '"+walletid+"'";
		var query2 = "SELECT count(DISTINCT(`stakerAddress`)) AS `count` FROM `stakings` AS `staking`";
		var query3 = "SELECT `validatorWalletAddress`, `validatorDeligatorStaked`, `validatorSelfStaked` AS `Voting_Power`, `validatorCommission` AS `Commission_Rate`, `validatorAPR` AS `APR`, `status` AS `Status`, `validatorSelfStaked` AS `Self_Staked`, `joiningTimestamp` AS `Since_Time`, `validatorFeeAddress` AS `Fee_Address` FROM `validators` AS `validator` WHERE `validator`.`validatorWalletAddress` = '"+walletid+"'";
		var query4 = "SELECT `validatorWalletAddress`, `validatorDeligatorStaked` AS `Amount` FROM `validators` AS `validator` WHERE `validator`.`validatorWalletAddress` = '"+walletid+"'";
		const [rows1, fields1] = await connection.execute(query1);
		const [rows2, fields2] = await connection.execute(query2);
		const [rows3, fields3] = await connection.execute(query3);
                const [rows4, fields4] = await connection.execute(query4);

		var rows = {};
		rows.staking_tab = rows1; 
		rows.delegator_tab = rows4;
		var total_delegators = (rows2[0].count) ? rows2[0].count : 0;
		rows.left_panel = [];
		rows.left_panel.push(rows3);
		rows.left_panel.push({"total_delegators": total_delegators}); 
		return rows;
	}catch(e){
		console.log(">>>>EEEEEEE>>>>",e);
		var rows = {};
		rows = {"Error": e};
		return rows;
	}
}

app.listen(4010);
