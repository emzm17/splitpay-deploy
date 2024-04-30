const db=require('../utils/database');
const  graph=require('../utils/graph');




function maximun_amount(amount){
    let ans=0;
    for(let i=1;i<amount.length;i++){
           if(amount[i]>amount[ans]){
            ans=i;
           }
    }
    return ans;
}

function minimun_amount(amount){
    let ans=0
    for(let i=1;i<amount.length;i++){
     if(amount[i]<amount[ans] && amount[i]!=0){
        ans=i;
     }
    }
    return ans;
    }
    // console.log(minimun_amount(amount));
    // console.log(maximun_amount(amount));
    

    let logEntries=[];
    async function min_cash_flow(amount){    
    let maxi_credit=maximun_amount(amount);
    let mini_debit=minimun_amount(amount);
    
    if(amount[maxi_credit] === 0 && amount[mini_debit] === 0){
          return;
    }
    
    let mini=Math.min(amount[maxi_credit],-amount[mini_debit]);
    amount[maxi_credit]-=mini;
    amount[mini_debit]+=mini;
    
    // console.log(mini_debit+" pay "+mini+" to "+maxi_credit);
 
 


    const logEntry = {
        payer: mini_debit,
        payee: maxi_credit,
        amount: mini
    };
    logEntries.push(logEntry);
    min_cash_flow(amount);
    }


    const settlement= async (groupId) => {
       
        try {
            const expenses = await db.query(`select * from expenses where group_id=$1`, [groupId]);
            const group = await db.query(`select * from group_s where id=$1`, [groupId]);


            const delete_expense = await db.query('delete from expenses where group_id=$1',[groupId]);

            // console.log(expenses.rows);

            // console.log(group);
            if(expenses.rows.length==0){
                return {message:"all settlement is complete"}
            }
    
            // var maps = new Map();
            const size = group.rows[0].users.length
            var maxi_size=0;
            for(var i=0;i<size;i++){
                    const user=group.rows[0].users[i]
                    maxi_size=Math.max(maxi_size,parseInt(user.user_id));
            }
            let settlement_graph=new graph(maxi_size+1);
            // for(let i=0;i<group[0][0].users_id.length;i++){
            //       settlement_graph.addVertex(group[0][0].users_id[i]);
            // }
    
            for (let i = 0; i < expenses.rows.length; i++) {
                let expense = expenses.rows[i];
 
                // console.log(expense);
    
                const amount = (expense.amount) / size;
                const actualAmount=amount.toFixed(2);
                for (let idx = 0; idx < group.rows[0].users.length; idx++) {
                    let user_item = group.rows[0].users[idx];
                    if (user_item.user_id == expense.payer[0].user_id) {
                              continue;
                    } else {                
                        const initialAmount=settlement_graph.adjMatrix[user_item.user_id][expense.payer[0].user_id]
                        const finalAmount=parseInt(actualAmount)+initialAmount  
                        settlement_graph.addEdge(user_item.user_id,expense.payer[0].user_id,finalAmount);
                    }
                }
            }
  
      
    
            // row-paye
            // colu-receive

       
               
           
           const N=maxi_size;
           let amount=Array(maxi_size+1).fill(0);
           
            for(let i=1;i<maxi_size+1;i++){
                for(let j=1;j<maxi_size+1;j++){
                   amount[i]+=( parseInt(settlement_graph.adjMatrix[j][i])-parseInt(settlement_graph.adjMatrix[i][j]));
                }
             }      
             
   
             min_cash_flow(amount);

            
      
            let settlement=[]
            for(let i=0;i<logEntries.length;i++){
                  const payer=logEntries[i].payer
                  const payee=logEntries[i].payee
   

                  const updateAmount = await db.query(
                    `select * from users where user_id=$1`,[payer]
                  );
                  // console.log(updateAmount);
                  // console.log((updateAmount[0][0].totalOwe));
                  let updateAmounttotalOwe=parseInt(updateAmount.rows[0].total_owe)-logEntries[i].amount;
                  // console.log(updateAmounttotalOwe)
                  if(updateAmounttotalOwe<0){
                    updateAmounttotalOwe=0
                  }
               
                // //   console.log(updateAmounttotalOwe)
                  const updatedAmounttotOwed = await db.query(
                        `update users set total_owe=$1 where user_id=$2`,[updateAmounttotalOwe,payer]
                  );
                  const updatetotalAmount = await db.query(
                    `select * from users where user_id=$1`,[payee]
                  );
                  let updatetotalAmountRecord=parseFloat(updatetotalAmount.rows[0].total_owed)-logEntries[i].amount;
                  if(updatetotalAmountRecord<0){
                    updatetotalAmountRecord=0;
                  }
                  const updatedtotalAmount=await db.query(
                        `update users set total_owed=$1 where user_id=$2`,[updatetotalAmountRecord,payee]
                  );
                const payer1={
                  user_id:updateAmount.rows[0].user_id,
                  name:updateAmount.rows[0].name,
                  email:updateAmount.rows[0].email
                }
                const payee1={
                   user_id:updatetotalAmount.rows[0].user_id,
                   name:updatetotalAmount.rows[0].name,
                   email:updatetotalAmount.rows[0].email
                }
              
                const set={
                     payer:payer1,
                     payee:payee1,
                     amount:logEntries[i].amount
                }
                settlement.push(set)
            }
            

            const res=settlement
            logEntries=[]
            return { res };        
    
        } catch (error) {
//             console.error(error);
          return  {message: 'Internal Server Error'};
        }
    };


    module.exports={
        settlement
    };
    
    
    
    
    
    
    
    