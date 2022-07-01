const express = require('express');
const cors = require('cors');

const app = express();

var corsOptions = {
	origin: 'http://api.dithereum.io',
	optionsSuccessStatus: 200
}

app.get('/api/validators/getallvalidators', cors(corsOptions), function(req,res){
	getdata().then((datarows)=>{
		res.send(JSON.stringify(datarows));
	});
});


async function getdata(){
	try{
		const mysql = require('mysql2/promise');
		const connection = await mysql.createConnection({host:'localhost', user: 'root', password: 'Admin@1234', database: 'myvalidators'});
	
		var query1 = "SELECT `validatorName`, count(*) AS `count` FROM `validators` AS `validator` WHERE `validator`.`status` = 'Active' GROUP BY `validatorName`";
		var query2 = "SELECT SUM(COALESCE(`validatorSelfStaked`, 0)) AS `sum_selfstake`, SUM(COALESCE(`validatorDeligatorStaked`, 0)) AS `sum_deligatorstake` FROM `validators` AS `validator`";
		var query3 = "SELECT `validatorName`, `validatorWalletAddress`, `validatorCommission`, `validatorAPR`, `status`, `validatorSelfStaked`, `validatorDeligatorStaked` FROM `validators` AS `validator`";

		const [rows1, fields1] = await connection.execute(query1);
		const [rows2, fields2] = await connection.execute(query2);
		const [rows3, fields3] = await connection.execute(query3);

		var i=0;
		rows3.forEach((x)=>{
			var vpower = parseInt(x.validatorSelfStaked) + parseInt(x.validatorDeligatorStaked);
			var vperc = vpower/100;
			rows3[i].votingpower =  vpower.toString() +" / "+vperc.toString() +"%";
			rows3[i].validatorCommission = rows3[i].validatorCommission + " %";
			//APR logic is not ready yet
			//rows3[i].validatorAPR = rows3[i].validatorAPR  +" %";
			i++;
		});

        	var rows = {};
		rows["activeValidators"] = rows1.length;
		rows["bonded_tokens"] =  parseInt(rows2[0].sum_selfstake) + parseInt(rows2[0].sum_deligatorstake);
		rows["validators_list"] = rows3;
		return rows;
	}catch(e){
		console.log(">>>>EEEEEEE>>>>",e);
		var rows = {};
		rows = {"Error": e};
		return rows;
	}
}

app.listen(9980);
