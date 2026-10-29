require('dotenv').config();
const express=require('express');
const path=require('path');
const helmet=require('helmet');
const db=require('./supabase');
const app=express();
const PORT=Number(process.env.PORT)||3000;
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:false}));
app.use(express.json({limit:'30kb'}));
app.use('/api/pets',require('./routes/pets'));
app.use('/api/care-logs',require('./routes/careLogs'));
app.use('/api/health-records',require('./routes/healthRecords'));
app.get('/api/health',async(req,res)=>{
 if(!db)return res.status(503).json({status:'not_configured',message:'Set Supabase credentials in backend/.env.'});
 try{const {error}=await db.from('pets').select('id',{head:true,count:'exact'});if(error)throw error;res.json({status:'ok',database:'connected'});}
 catch(e){res.status(503).json({status:'database_error',message:'The database connection could not be verified.'});}
});
app.use(express.static(path.join(__dirname,'..','frontend')));
app.use('/api',(req,res)=>res.status(404).json({error:'API endpoint not found.'}));
app.use((err,req,res,next)=>{
 console.error('Request error:',err.code||err.name||'Error');
 if(!db)return res.status(503).json({error:'Database is not configured. Set the Supabase credentials in backend/.env.'});
 const status=err.code==='23503'?400:err.code==='23505'?409:500;
 const message=status===400?'The selected pet does not exist.':status===409?'This record conflicts with an existing database record.':'The server could not complete the request. Check your database setup and server logs.';
 res.status(status).json({error:message});
});
app.listen(PORT,()=>console.log(`Pet Care Log is running at http://localhost:${PORT}`));
