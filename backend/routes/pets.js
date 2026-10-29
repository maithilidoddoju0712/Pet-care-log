const express = require('express');
const router = express.Router();
const db = require('../supabase');
const {text,date,positiveId,weight,handleValidation}=require('../utils/validation');
const species=['Dog','Cat','Bird','Rabbit','Fish','Other'];
const validatePet=handleValidation(req=>{
 const b=req.body||{};
 return {
  name:text(b.name,'Pet name',80,true),
  species:require('../utils/validation').enumValue(b.species,'Species',species),
  breed:text(b.breed,'Breed',80),
  birth_date:date(b.birth_date,'Date of birth'),
  weight_kg:weight(b.weight_kg),
  notes:text(b.notes,'Notes',1000)
 };
});
router.get('/',async(req,res,next)=>{try{const {data,error}=await db.from('pets').select('*').order('created_at',{ascending:false});if(error)throw error;res.json({data});}catch(e){next(e);}});
router.post('/',validatePet,async(req,res,next)=>{try{const {data,error}=await db.from('pets').insert(req.validated).select('*').single();if(error)throw error;res.status(201).json({data});}catch(e){next(e);}});
router.put('/:id',handleValidation(req=>({id:positiveId(req.params.id),...(()=>{const b=req.body||{};return {name:text(b.name,'Pet name',80,true),species:require('../utils/validation').enumValue(b.species,'Species',species),breed:text(b.breed,'Breed',80),birth_date:date(b.birth_date,'Date of birth'),weight_kg:weight(b.weight_kg),notes:text(b.notes,'Notes',1000)}})()})),async(req,res,next)=>{try{const {id,...values}=req.validated;const {data,error}=await db.from('pets').update(values).eq('id',id).select('*').maybeSingle();if(error)throw error;if(!data)return res.status(404).json({error:'Pet not found.'});res.json({data});}catch(e){next(e);}});
router.delete('/:id',handleValidation(req=>({id:positiveId(req.params.id)})),async(req,res,next)=>{try{const {error,count}=await db.from('pets').delete({count:'exact'}).eq('id',req.validated.id);if(error)throw error;if(count===0)return res.status(404).json({error:'Pet not found.'});res.status(204).end();}catch(e){next(e);}});
module.exports=router;
