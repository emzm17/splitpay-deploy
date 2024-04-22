const db=require('../database');
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
            const delete_expense = await db.query('delete from expenses where group_id=$1',[id]);
            // console.log(expenses);
            // console.log(group);
            if(expenses.rows.length==0){
                return {message:"all settlement is complete"}
            }
    
            // var maps = new Map();
            const size = group.rows[0].users_id.length;
            var maxi_size=0;
            for(var i=0;i<size;i++){
                    maxi_size=Math.max(maxi_size,parseInt(group.rows[0].users_id[i]));
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
                // console.log(actualAmount);
                for (let idx = 0; idx < group.rows[0].users_id.length; idx++) {
                    let group_item = group.rows[0].users_id[idx];
                    if (group_item == expense.payer_id) {
                              continue;
                    } else {
                         settlement_graph.addEdge(group_item,expense.payer_id,actualAmount);
                         
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


           
            for(let i=0;i<logEntries.length;i++){
                  const payer=logEntries[i].payer
                  const payee=logEntries[i].payee
                  const updateAmount = await db.query(
                    `select total_owe from users where user_id=$1`,[payer]
                  );
                  // console.log(updateAmount);
                  // console.log((updateAmount[0][0].totalOwe));
                  const updateAmounttotalOwe=parseInt(updateAmount.rows[0].total_owe)-logEntries[i].amount;
               
                //   console.log(updateAmounttotalOwe)
                  const updatedAmounttotOwed = await db.query(
                        `update users set total_owe=$1 where user_id=$2`,[updateAmounttotalOwe,payer]
                  );
                  const updatetotalAmount = await db.query(
                    `select total_owed from users where user_id=$1`,[payee]
                  );
                  let updatetotalAmountRecord=parseFloat(updatetotalAmount.rows[0].total_owed)-logEntries[i].amount;
                  if(updatetotalAmountRecord<0){
                    updatetotalAmountRecord=0;
                  }
                  const updatedtotalAmount=await db.query(
                        `update users set total_owed=$1 where user_id=$2`,[updatetotalAmountRecord,payee]
                  );
               
                // console.log(updatetotalAmountRecord)
            }
            

            const res=logEntries
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
    
    
    
    
    
    
    
    