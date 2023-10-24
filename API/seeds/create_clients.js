/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
	
	 //To get total records count
  const rowCount = await knex('clients').count('* as count').first();
  
  if(parseInt(rowCount.count)===0){
	  var data={};
	  data.id=1;
	  data.name='sap-world';
	  data.redirect_uri='https://sapworld.io';
	  data.client_id='TO8ZDYTJU3';
	  data.client_secret='X2PY60EvMyCM8AO42wAjPa4bAaWmDF';
	  data.trusted=true;
	  
	  //Deletes ALL existing entries
	  await knex('clients').del();
	  
	  //To insert client record
	  await knex('clients').insert([data]);
  }
};
