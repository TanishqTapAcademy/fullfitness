import { useState, useEffect } from "react";
import { Heart, Star, Flame, Zap, Home, User, Eye, Lock, Sun, Moon, Search, Plus, Minus, X, Check, Copy, Download, ChevronUp, ChevronDown, Circle, Clock, Calendar, Image, ArrowUpDown, Activity, Target, Save, Loader2, Dumbbell, Brain } from "lucide-react";
import { fetchQuestions, createQuestion, updateQuestion, deleteQuestion } from "../api/questions";

/* ── Icons ── */
const ICONS = [
  ["activity",Activity,"sport fitness"],["arrow-up-down",ArrowUpDown,"sort reorder"],["brain",Brain,"mental clarity think"],["calendar",Calendar,"date schedule"],["check",Check,"done yes"],["circle",Circle,"shape radio"],["clock",Clock,"time"],["dumbbell",Dumbbell,"gym weight muscle"],["eye",Eye,"view visible"],["flame",Flame,"fire burn calories hot"],["heart",Heart,"love health cardio"],["home",Home,"house"],["image",Image,"photo picture"],["lock",Lock,"security password"],["minus",Minus,"subtract remove"],["moon",Moon,"night sleep dark"],["plus",Plus,"add create"],["search",Search,"find look"],["star",Star,"favorite rating"],["sun",Sun,"day bright light"],["target",Target,"goal aim focus"],["user",User,"person profile"],["x",X,"close cancel"],["zap",Zap,"energy power lightning bolt"]
].map(([k,c,t])=>({key:k,comp:c,tags:t}));

const getIC=k=>ICONS.find(i=>i.key===k)?.comp||null;
const ri=(k,s=18,c="#E8FF6B")=>{
  if(!k)return null;
  if(k.startsWith("http"))return <img src={k} style={{width:s,height:s,borderRadius:4,objectFit:"cover"}}/>;
  const Co=getIC(k);
  return Co?<Co size={s} color={c} strokeWidth={2}/>:<div style={{width:s,height:s,borderRadius:4,background:`${c}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:s*.4,color:c}}>{k[0]}</div>;
};

/* ── Types ── */
const TYPES=[
  {type:"hero",label:"Hero Welcome",ik:"star",desc:"Full-screen intro"},
  {type:"text_input",label:"Text Input",ik:"user",desc:"Free text field"},
  {type:"multi_select",label:"Multi Select",ik:"check",desc:"Pick many"},
  {type:"single_select",label:"Single Select",ik:"circle",desc:"Pick one"},
  {type:"grid_select",label:"Grid Cards",ik:"image",desc:"2×2 cards"},
  {type:"segmented_control",label:"Segmented",ik:"zap",desc:"Binary toggle"},
  {type:"emoji_rating",label:"Icon Rating",ik:"flame",desc:"Icon scale"},
  {type:"checkbox_group",label:"Checkboxes",ik:"check",desc:"Multi chips"},
  {type:"radio_group",label:"Radio Group",ik:"circle",desc:"Single radio"},
  {type:"slider",label:"Slider",ik:"activity",desc:"Draggable range"},
  {type:"number_stepper",label:"Stepper",ik:"plus",desc:"+/− buttons"},
  {type:"date_picker",label:"Date Picker",ik:"calendar",desc:"Month + year"},
  {type:"time_wheel",label:"Time Picker",ik:"clock",desc:"Time list"},
  {type:"image_select",label:"Image Grid",ik:"image",desc:"Visual cards"},
  {type:"ranking",label:"Ranking",ik:"arrow-up-down",desc:"Reorder list"},
  {type:"info_screen",label:"Stats Screen",ik:"target",desc:"Social proof"},
  {type:"wheel",label:"Wheel Picker",ik:"arrow-up-down",desc:"Scroll to pick"},
];

/* ── Colors ── */
let _n=Date.now();const uid=()=>`s${_n++}`;
const A="#E8FF6B",BG="#0D0D0D",S1="#161616",S2="#1E1E1E",BR="#2A2A2A",BR2="#3A3A3A",MU="#777";
const C={bg:"#0e0e12",panel:"#16161c",card:"#1e1e26",border:"#2a2a34",border2:"#363640",accent:A,muted:"#6a6a7a",text:"#ececf0",dim:"#8e8e9e",danger:"#ff5c5c"};

/* ── Backend ↔ Builder conversion ── */
function fromBackend(q) {
  return {
    id: uid(),
    _bid: q.id,
    step_id: q.step_id,
    type: q.type,
    title: q.title || "",
    subtitle: q.subtitle || "",
    is_active: q.is_active,
    options: q.options || undefined,
    ...(q.config || {}),
    ...(q.coach_response ? { coach_response: q.coach_response } : {}),
  };
}

function toBackend(step, index) {
  const { id, _bid, step_id, type, title, subtitle, is_active, options, coach_response, coach_response_map, coach_response_none, coach_response_some, ...config } = step;
  const cr = {};
  if (coach_response) Object.assign(cr, typeof coach_response === 'string' ? { default: coach_response } : coach_response);
  if (coach_response_map) cr.map = coach_response_map;
  if (coach_response_none) cr.none = coach_response_none;
  if (coach_response_some) cr.some = coach_response_some;
  return {
    step_id: step_id || `step_${index + 1}`,
    type,
    title: title || "",
    subtitle: subtitle || null,
    options: options || null,
    config: Object.keys(config).length > 0 ? config : null,
    coach_response: Object.keys(cr).length > 0 ? cr : null,
    order: index + 1,
    is_active: is_active ?? true,
  };
}

/* ── Default templates ── */
const makeDefault=(type)=>{
  const id=uid();
  const b={id,type,step_id:"",title:"",subtitle:"",cta:"Continue",is_active:true};
  const d={
    hero:{title:"Hey.\nI'm your coach.",subtitle:"Let's figure out what you need.",cta:"Let's go"},
    text_input:{title:"What should I call you?",subtitle:"First name is fine",placeholder:"Your name",max_length:20,skippable:true,skip_label:"Skip",coach_response:"Nice to meet you."},
    multi_select:{title:"What are your goals?",subtitle:"Pick as many",min_select:1,show_icon:true,show_description:true,options:[{id:uid(),label:"Lose fat",description:"Burn fat",icon:"flame"},{id:uid(),label:"Build muscle",description:"Strength",icon:"zap"}],coach_response:{single:"Got it.",multiple:"{count} selected."}},
    single_select:{title:"Pick one",subtitle:"Best fit",show_description:true,options:[{id:uid(),label:"Option A",description:"Desc",icon:"star"},{id:uid(),label:"Option B",description:"Desc",icon:"zap"}],coach_response_map:{}},
    grid_select:{title:"Choose one",subtitle:"Tap a card",columns:2,single_select:true,show_icon:true,show_description:true,options:[{id:uid(),label:"Card 1",description:"Desc",icon:"flame"},{id:uid(),label:"Card 2",description:"Desc",icon:"home"},{id:uid(),label:"Card 3",description:"Desc",icon:"user"},{id:uid(),label:"Card 4",description:"Desc",icon:"star"}],coach_response_map:{}},
    segmented_control:{title:"Choose",subtitle:"Optional",skippable:true,skip_label:"Skip",options:[{id:uid(),label:"A"},{id:uid(),label:"B"}]},
    emoji_rating:{title:"How do you feel?",subtitle:"Pick one",options:[{id:"1",icon:"moon",label:"Low"},{id:"2",icon:"eye",label:"Meh"},{id:"3",icon:"sun",label:"OK"},{id:"4",icon:"star",label:"Good"},{id:"5",icon:"flame",label:"Great"}],coach_response_map:{}},
    checkbox_group:{title:"Check all",subtitle:"Or none",allow_none:true,none_label:"None",coach_response_none:"OK.",coach_response_some:"Noted.",options:[{id:uid(),label:"Check 1"},{id:uid(),label:"Check 2"}]},
    radio_group:{title:"Pick one",subtitle:"Select",options:[{id:uid(),label:"Radio 1",description:"Desc"},{id:uid(),label:"Radio 2",description:"Desc"}],coach_response_map:{}},
    slider:{title:"How many?",subtitle:"Drag",min:1,max:10,default:5,step:1,unit:"units"},
    number_stepper:{title:"Set number",subtitle:"Tap +/−",min:0,max:200,default:50,step:1,unit:"kg",skippable:true,skip_label:"Skip"},
    date_picker:{title:"Deadline?",subtitle:"Month+year",skippable:true,skip_label:"No deadline"},
    time_wheel:{title:"Preferred time?",subtitle:"Pick",skippable:true,skip_label:"No set time",options:["6 AM","7 AM","8 AM","9 AM","5 PM","6 PM","7 PM","8 PM"],default:"7 AM"},
    image_select:{title:"Pick a style",subtitle:"Tap",columns:3,single_select:true,options:[{id:uid(),label:"Style 1",color:"#6BE8C1",image_url:""},{id:uid(),label:"Style 2",color:A,image_url:""},{id:uid(),label:"Style 3",color:"#FF8B6B",image_url:""}]},
    ranking:{title:"Rank priorities",subtitle:"Reorder",options:[{id:uid(),label:"First",icon:"star"},{id:uid(),label:"Second",icon:"target"},{id:uid(),label:"Third",icon:"flame"}]},
    info_screen:{title:"You're in good company",stats:[{value:"10K+",label:"users"},{value:"95%",label:"happy"}]},
    wheel:{title:"How tall are you?",subtitle:"Scroll to pick",min:140,max:220,default:175,suffix:"cm"},
  };
  return{...b,...d[type]};
};

/* ── Icon Picker ── */
const IconPicker=({current,onSelect,onClose})=>{
  const [q,setQ]=useState("");
  const list=q?ICONS.filter(i=>i.key.includes(q.toLowerCase())||i.tags.includes(q.toLowerCase())):ICONS;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.8)",backdropFilter:"blur(10px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.panel,borderRadius:18,padding:20,width:440,maxWidth:"92vw",height:"65vh",display:"flex",flexDirection:"column",border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:C.text}}>Pick an Icon</div>
            <div style={{fontSize:10,color:C.muted,marginTop:2}}>{ICONS.length} icons · {list.length} shown</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><X size={18} color={C.muted}/></button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"9px 12px",background:C.card,borderRadius:10,border:`1px solid ${C.border}`}}>
          <Search size={14} color={C.muted}/>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search... heart, fire, star" autoFocus style={{flex:1,fontSize:13,background:"transparent",border:"none",color:C.text,outline:"none"}}/>
          {q && <button onClick={()=>setQ("")} style={{background:"none",border:"none",cursor:"pointer"}}><X size={12} color={C.muted}/></button>}
        </div>
        {current && <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"7px 12px",background:`${A}10`,borderRadius:8,border:`1px solid ${A}25`}}>
          {ri(current,16,A)}<span style={{fontSize:11,color:A,fontWeight:600}}>{current}</span>
        </div>}
        <div style={{flex:1,overflowY:"auto",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(70px,1fr))",gap:4,alignContent:"start"}}>
          {list.map(({key,comp:Comp})=>(
            <button key={key} onClick={()=>{onSelect(key);onClose()}} title={key} style={{padding:"12px 4px",borderRadius:8,border:current===key?`2px solid ${A}`:`1px solid ${C.border}`,background:current===key?`${A}15`:C.card,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <Comp size={22} color={current===key?A:C.text} strokeWidth={1.8}/>
              <span style={{fontSize:8,color:current===key?A:C.muted}}>{key}</span>
            </button>
          ))}
        </div>
        {list.length===0 && <div style={{padding:30,textAlign:"center",color:C.muted,fontSize:12}}>No match for "{q}"</div>}
      </div>
    </div>
  );
};

const IconBtn=({icon,onChange})=>{
  const [open,setOpen]=useState(false);
  return(
    <div style={{display:"inline-flex"}}>
      <button onClick={()=>setOpen(true)} style={{width:34,height:34,borderRadius:7,border:`1px solid ${C.border}`,background:C.card,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
        {icon ? ri(icon,16,A) : <Plus size={12} color={C.muted}/>}
      </button>
      {open && <IconPicker current={icon} onSelect={onChange} onClose={()=>setOpen(false)}/>}
    </div>
  );
};

/* ── Phone Preview ── */
const PF=({children})=>(
  <div style={{width:280,background:"#000",borderRadius:36,padding:"10px 10px 14px",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
    <div style={{borderRadius:28,overflow:"hidden",background:BG,height:540,display:"flex",flexDirection:"column"}}>{children}</div>
  </div>
);
const PBtn=({l})=>l?<div style={{padding:"8px 18px 18px"}}><div style={{padding:11,borderRadius:11,background:A,textAlign:"center",fontSize:12,fontWeight:700,color:BG}}>{l}</div></div>:null;
const PH=({t,s})=>(
  <div>
    <div style={{fontSize:16,fontWeight:800,color:"#fff",margin:"0 0 3px",whiteSpace:"pre-line",lineHeight:1.2}}>{t||"Title"}</div>
    <div style={{fontSize:10,color:MU,margin:"0 0 12px"}}>{s}</div>
  </div>
);

const Preview=({step:st})=>{
  const t=st.type;
  if(t==="hero") return <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",padding:"30px 18px 20px"}}><div style={{width:36,height:36,borderRadius:"50%",background:A,marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center"}}>{ri("flame",18,BG)}</div><div style={{fontSize:22,fontWeight:800,color:"#fff",lineHeight:1.1,marginBottom:6,whiteSpace:"pre-line"}}>{st.title||"Welcome"}</div><div style={{fontSize:12,color:MU,marginBottom:20}}>{st.subtitle}</div><PBtn l={st.cta}/></div>;

  if(t==="text_input") return <div style={{flex:1,padding:"44px 18px 0",display:"flex",flexDirection:"column"}}><PH t={st.title} s={st.subtitle}/><div style={{padding:"10px 12px",background:S1,border:`1px solid ${BR2}`,borderRadius:9,fontSize:12,color:MU}}>{st.placeholder}</div><div style={{flex:1}}/><PBtn l={st.cta}/></div>;

  if(t==="multi_select"||t==="single_select") return <div style={{flex:1,padding:"44px 18px 0",overflowY:"auto"}}><PH t={st.title} s={st.subtitle}/><div style={{display:"flex",flexDirection:"column",gap:5}}>{(st.options||[]).map((o,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:9,border:i===0?`2px solid ${A}`:`1px solid ${BR2}`,background:i===0?`${A}10`:S1}}>{o.icon&&<div style={{width:28,height:28,borderRadius:7,background:i===0?`${A}20`:BR,display:"flex",alignItems:"center",justifyContent:"center"}}>{ri(o.icon,14,i===0?A:MU)}</div>}<div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:i===0?A:"#ddd"}}>{o.label}</div>{o.description&&<div style={{fontSize:9,color:MU}}>{o.description}</div>}</div></div>)}</div><PBtn l={st.cta}/></div>;

  if(t==="grid_select") return <div style={{flex:1,padding:"44px 18px 0"}}><PH t={st.title} s={st.subtitle}/><div style={{display:"grid",gridTemplateColumns:`repeat(${st.columns||2},1fr)`,gap:6}}>{(st.options||[]).map((o,i)=><div key={i} style={{padding:"12px 8px",textAlign:"center",borderRadius:10,border:i===0?`2px solid ${A}`:`1px solid ${BR2}`,background:i===0?`${A}10`:S1}}>{o.icon&&<div style={{marginBottom:4,display:"flex",justifyContent:"center"}}>{ri(o.icon,22,i===0?A:MU)}</div>}<div style={{fontSize:10,fontWeight:600,color:i===0?A:"#ccc"}}>{o.label}</div></div>)}</div><PBtn l={st.cta}/></div>;

  if(t==="segmented_control") return <div style={{flex:1,padding:"44px 18px 0",display:"flex",flexDirection:"column"}}><PH t={st.title} s={st.subtitle}/><div style={{display:"flex",background:S1,borderRadius:9,padding:3,gap:3}}>{(st.options||[]).map((o,i)=><div key={i} style={{flex:1,padding:"10px",borderRadius:7,textAlign:"center",fontSize:12,fontWeight:700,background:i===0?A:"transparent",color:i===0?BG:MU}}>{o.label}</div>)}</div><div style={{flex:1}}/><PBtn l={st.cta}/></div>;

  if(t==="emoji_rating") return <div style={{flex:1,padding:"44px 18px 0",display:"flex",flexDirection:"column"}}><PH t={st.title} s={st.subtitle}/><div style={{display:"flex",gap:4,margin:"8px 0"}}>{(st.options||[]).map((o,i)=><div key={i} style={{flex:1,padding:"9px 2px",borderRadius:9,border:i===4?`2px solid ${A}`:`1px solid ${BR2}`,background:i===4?`${A}10`:S1,textAlign:"center"}}><div style={{display:"flex",justifyContent:"center",marginBottom:3}}>{ri(o.icon,20,i===4?A:MU)}</div><div style={{fontSize:8,color:i===4?A:MU,fontWeight:600}}>{o.label}</div></div>)}</div><div style={{flex:1}}/><PBtn l={st.cta}/></div>;

  if(t==="checkbox_group") return <div style={{flex:1,padding:"44px 18px 0",display:"flex",flexDirection:"column"}}><PH t={st.title} s={st.subtitle}/><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{(st.options||[]).map((o,i)=><div key={i} style={{padding:"6px 12px",borderRadius:7,border:i===0?`2px solid ${A}`:`1px solid ${BR2}`,fontSize:10,color:i===0?A:"#ccc"}}>{o.label}</div>)}</div><div style={{flex:1}}/><PBtn l={st.cta}/></div>;

  if(t==="radio_group") return <div style={{flex:1,padding:"44px 18px 0"}}><PH t={st.title} s={st.subtitle}/><div style={{display:"flex",flexDirection:"column",gap:5}}>{(st.options||[]).map((o,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:9,border:i===0?`2px solid ${A}`:`1px solid ${BR2}`,background:i===0?`${A}10`:S1}}><div style={{width:14,height:14,borderRadius:"50%",background:i===0?A:"transparent",border:i===0?"none":`2px solid ${BR2}`}}/><div><div style={{fontSize:11,fontWeight:600,color:i===0?A:"#ddd"}}>{o.label}</div></div></div>)}</div><PBtn l={st.cta}/></div>;

  if(t==="slider") return <div style={{flex:1,padding:"44px 18px 0",display:"flex",flexDirection:"column"}}><PH t={st.title} s={st.subtitle}/><div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}><div style={{fontSize:40,fontWeight:800,color:A}}>{st.default||5}</div><div style={{fontSize:11,color:MU}}>{st.unit}</div><div style={{width:"100%",height:4,background:BR,borderRadius:2,marginTop:16,position:"relative"}}><div style={{width:"50%",height:4,background:A,borderRadius:2}}/></div></div><PBtn l={st.cta}/></div>;

  if(t==="number_stepper") return <div style={{flex:1,padding:"44px 18px 0",display:"flex",flexDirection:"column"}}><PH t={st.title} s={st.subtitle}/><div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:14}}><div style={{width:40,height:40,borderRadius:"50%",background:S1,border:`1px solid ${BR2}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Minus size={18} color={A}/></div><div style={{textAlign:"center"}}><div style={{fontSize:40,fontWeight:800,color:A}}>{st.default||50}</div><div style={{fontSize:11,color:MU}}>{st.unit}</div></div><div style={{width:40,height:40,borderRadius:"50%",background:`${A}15`,border:`1px solid ${A}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Plus size={18} color={A}/></div></div><PBtn l={st.cta}/></div>;

  if(t==="date_picker") return <div style={{flex:1,padding:"44px 18px 0",display:"flex",flexDirection:"column"}}><PH t={st.title} s={st.subtitle}/><div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>{["Apr","2026"].map((v,i)=><div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}><ChevronUp size={14} color={A}/><div style={{fontSize:20,fontWeight:800,color:A}}>{v}</div><ChevronDown size={14} color={A}/></div>)}</div><PBtn l={st.cta}/></div>;

  if(t==="time_wheel") return <div style={{flex:1,padding:"44px 18px 0",display:"flex",flexDirection:"column"}}><PH t={st.title} s={st.subtitle}/><div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}}>{(st.options||[]).map((tm,i)=><div key={i} style={{padding:"7px 12px",borderRadius:7,border:tm===st.default?`2px solid ${A}`:`1px solid ${BR2}`,background:tm===st.default?`${A}10`:S1,fontSize:tm===st.default?13:10,color:tm===st.default?A:"#ccc",textAlign:"center"}}>{tm}</div>)}</div><PBtn l={st.cta}/></div>;

  if(t==="image_select") return <div style={{flex:1,padding:"44px 18px 0"}}><PH t={st.title} s={st.subtitle}/><div style={{display:"grid",gridTemplateColumns:`repeat(${st.columns||3},1fr)`,gap:5}}>{(st.options||[]).map((o,i)=><div key={i} style={{borderRadius:9,border:i===0?`2px solid ${A}`:`1px solid ${BR2}`,overflow:"hidden"}}>{o.image_url?<img src={o.image_url} style={{width:"100%",aspectRatio:"1",objectFit:"cover"}}/>:<div style={{width:"100%",aspectRatio:"1",background:`linear-gradient(135deg,${o.color||A}40,${o.color||A}15)`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:20,fontWeight:800,color:o.color,opacity:.5}}>{(o.label||"")[0]}</span></div>}<div style={{padding:"4px",textAlign:"center",fontSize:9,fontWeight:600,color:i===0?A:"#ccc"}}>{o.label}</div></div>)}</div><PBtn l={st.cta}/></div>;

  if(t==="ranking") return <div style={{flex:1,padding:"44px 18px 0"}}><PH t={st.title} s={st.subtitle}/><div style={{display:"flex",flexDirection:"column",gap:4}}>{(st.options||[]).map((o,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",background:S1,borderRadius:7,border:`1px solid ${BR2}`}}><span style={{fontSize:14,fontWeight:800,color:A}}>{i+1}</span>{o.icon&&ri(o.icon,14,MU)}<span style={{flex:1,fontSize:11,color:"#ddd"}}>{o.label}</span></div>)}</div><PBtn l={st.cta}/></div>;

  if(t==="info_screen") return <div style={{flex:1,padding:"44px 18px 0",display:"flex",flexDirection:"column",justifyContent:"center"}}><div style={{fontSize:18,fontWeight:800,color:"#fff",textAlign:"center",marginBottom:14}}>{st.title}</div><div style={{display:"flex",flexDirection:"column",gap:8}}>{(st.stats||[]).map((s,i)=><div key={i} style={{textAlign:"center",padding:"12px",background:S1,borderRadius:9,border:`1px solid ${BR}`}}><div style={{fontSize:22,fontWeight:800,color:A}}>{s.value}</div><div style={{fontSize:10,color:MU}}>{s.label}</div></div>)}</div><PBtn l={st.cta}/></div>;

  if(t==="wheel"){const def=st.default||175;const sfx=st.suffix||"cm";const vals=[def-2,def-1,def,def+1,def+2];return <div style={{flex:1,padding:"44px 18px 0",display:"flex",flexDirection:"column"}}><PH t={st.title} s={st.subtitle}/><div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:0}}>{vals.map((v,i)=>{const isSel=i===2;const dist=Math.abs(i-2);const opacity=dist===0?1:dist===1?0.4:0.2;const size=dist===0?32:dist===1?18:14;return <div key={v} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",padding:isSel?"14px 18px":"8px 18px",borderRadius:isSel?14:0,border:isSel?`1.5px solid ${A}40`:"none",background:isSel?`${A}08`:"transparent",margin:"2px 0",transition:"all .2s"}}><span style={{fontSize:size,fontWeight:isSel?800:500,color:isSel?A:"#fff",opacity}}>{v}</span><span style={{fontSize:size*.45,color:isSel?A:MU,marginLeft:4,opacity,fontWeight:500}}>{sfx}</span></div>})}</div><PBtn l={st.cta}/></div>;}

  return <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:MU}}>Preview</div>;
};

/* ══════════════════════════════════════
   MAIN COMPONENT — connected to backend
   ══════════════════════════════════════ */
export default function QuestionsPage(){
  const [steps,setSteps]=useState([]);
  const [si,setSi]=useState(0);
  const [picker,setPicker]=useState(false);
  const [showJson,setShowJson]=useState(false);
  const [di,setDi]=useState(null);
  const [doi,setDoi]=useState(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [saveStatus,setSaveStatus]=useState(null);
  const [dirty,setDirty]=useState(false);
  const [origIds,setOrigIds]=useState(new Set());

  /* ── Load from backend ── */
  useEffect(()=>{ loadFromBackend(); },[]);

  const loadFromBackend=async()=>{
    setLoading(true);
    try{
      const data=await fetchQuestions();
      const qs=(data.questions||[]).sort((a,b)=>a.order-b.order);
      if(qs.length>0){
        setSteps(qs.map(fromBackend));
        setOrigIds(new Set(qs.map(q=>q.id)));
        setSi(0);
      }else{
        setSteps([]);
      }
      setDirty(false);
    }catch(err){
      console.error("Failed to load:",err);
    }
    setLoading(false);
  };

  /* ── Publish to backend ── */
  const publish=async()=>{
    setSaving(true);
    setSaveStatus(null);
    try{
      const currentBids=new Set(steps.filter(s=>s._bid).map(s=>s._bid));
      for(const bid of origIds){
        if(!currentBids.has(bid)) await deleteQuestion(bid);
      }
      for(let i=0;i<steps.length;i++){
        const step=steps[i];
        const payload=toBackend(step,i);
        if(step._bid){
          await updateQuestion(step._bid,payload);
        }else{
          const res=await createQuestion(payload);
          if(res.question) steps[i]={...steps[i],_bid:res.question.id};
        }
      }
      await loadFromBackend();
      setSaveStatus("saved");
      setTimeout(()=>setSaveStatus(null),2000);
    }catch(err){
      console.error("Publish failed:",err);
      setSaveStatus("error");
      setTimeout(()=>setSaveStatus(null),3000);
    }
    setSaving(false);
  };

  /* ── Local helpers ── */
  const sel=steps[si]||steps[0];
  const up=(k,v)=>{setSteps(s=>s.map((x,i)=>i===si?{...x,[k]:v}:x));setDirty(true)};
  const delStep=(idx)=>{if(steps.length<=1)return;setSteps(s=>s.filter((_,j)=>j!==idx));if(si>=idx&&si>0)setSi(si-1);setDirty(true)};
  const dupStep=(idx)=>{const c={...JSON.parse(JSON.stringify(steps[idx])),id:uid(),_bid:undefined,step_id:""};setSteps(s=>{const n=[...s];n.splice(idx+1,0,c);return n});setSi(idx+1);setDirty(true)};
  const addStep=(type)=>{setSteps(s=>[...s,makeDefault(type)]);setSi(steps.length);setPicker(false);setDirty(true)};
  const moveStep=(f,to)=>{if(f===to)return;setSteps(s=>{const n=[...s];const[it]=n.splice(f,1);n.splice(to>f?to-1:to,0,it);return n});setSi(to>f?to-1:to);setDi(null);setDoi(null);setDirty(true)};
  const upOpt=(oi,k,v)=>{const o=[...(sel.options||[])];o[oi]={...o[oi],[k]:v};up("options",o)};
  const addOpt=()=>up("options",[...(sel.options||[]),{id:uid(),label:"New option",description:"Description",icon:"star"}]);
  const delOpt=(oi)=>up("options",(sel.options||[]).filter((_,i)=>i!==oi));
  const exportJson=()=>JSON.stringify({version:"1.0",steps:steps.map((s,i)=>toBackend(s,i))},null,2);
  const ti=TYPES.find(x=>x.type===sel?.type);
  const hasOpts=sel?.options&&!["emoji_rating","time_wheel","image_select","segmented_control","info_screen","hero","text_input","slider","number_stepper","date_picker","wheel"].includes(sel?.type);

  const Lbl=({text})=><div style={{fontSize:10,fontWeight:700,color:C.muted,marginBottom:4}}>{text}</div>;
  const Inp=({value,onChange,ph})=><input value={value||""} onChange={e=>onChange(e.target.value)} placeholder={ph} style={{width:"100%",padding:"8px 10px",fontSize:12,background:C.card,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,outline:"none",marginBottom:12}}/>;

  if(loading){
    return <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,gap:8,fontFamily:"'DM Sans',sans-serif"}}><Loader2 size={18} style={{animation:"spin 1s linear infinite"}}/> Loading questions...</div>;
  }

  if(!sel&&steps.length===0){
    return <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,color:C.muted,fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{fontSize:14}}>No questions yet</div>
      <button onClick={()=>setPicker(true)} style={{padding:"8px 18px",borderRadius:8,border:"none",background:A,color:BG,fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Add first screen</button>
      {picker&&<PickerModal onAdd={addStep} onClose={()=>setPicker(false)}/>}
    </div>;
  }

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",background:C.bg,display:"flex",flexDirection:"column",height:"100%",color:C.text}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#333;border-radius:2px}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* TOP BAR */}
      <div style={{padding:"10px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
        <div style={{width:28,height:28,borderRadius:8,background:A,display:"flex",alignItems:"center",justifyContent:"center"}}>{ri("star",14,BG)}</div>
        <span style={{fontSize:14,fontWeight:800}}>Onboarding Builder</span>
        <div style={{flex:1}}/>
        {dirty&&<span style={{fontSize:10,padding:"4px 10px",background:`${C.danger}15`,borderRadius:6,color:C.danger}}>Unsaved changes</span>}
        <span style={{fontSize:10,color:C.muted,padding:"4px 10px",background:C.card,borderRadius:6}}>{steps.length} screens</span>
        <button onClick={()=>setShowJson(true)} style={{padding:"6px 14px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.text,fontSize:11,cursor:"pointer"}}>Export JSON</button>
        <button onClick={()=>setPicker(true)} style={{padding:"6px 14px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.text,fontSize:11,cursor:"pointer"}}>+ Add</button>
        <button onClick={publish} disabled={saving||!dirty} style={{padding:"6px 16px",borderRadius:7,border:"none",background:saving||!dirty?C.border2:A,color:saving||!dirty?C.muted:BG,fontSize:11,fontWeight:700,cursor:saving||!dirty?"default":"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .2s"}}>
          {saving?<><Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/> Saving...</>:saveStatus==="saved"?<><Check size={12}/> Saved!</>:saveStatus==="error"?<>Error</>:<><Save size={12}/> Publish</>}
        </button>
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* LEFT — STEP LIST */}
        <div style={{width:220,borderRight:`1px solid ${C.border}`,overflowY:"auto",padding:"8px 0",flexShrink:0}}>
          {steps.map((s,i)=>{
            const tp=TYPES.find(x=>x.type===s.type);
            return(
              <div key={s.id} draggable
                onDragStart={()=>setDi(i)}
                onDragOver={e=>{e.preventDefault();setDoi(i)}}
                onDrop={()=>moveStep(di,i)}
                onDragEnd={()=>{setDi(null);setDoi(null)}}
                onClick={()=>setSi(i)}
                style={{padding:"9px 12px",margin:"1px 6px",borderRadius:8,cursor:"pointer",
                  background:si===i?`${A}12`:"transparent",
                  border:si===i?`1px solid ${A}30`:doi===i&&di!==i?`1px solid ${A}`:"1px solid transparent",
                  opacity:di===i?0.4:1,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:9,fontWeight:700,color:C.muted,width:14}}>{i+1}</span>
                {tp?.ik && ri(tp.ik,14,si===i?A:C.muted)}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:600,color:si===i?A:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title||tp?.label}</div>
                  <div style={{fontSize:9,color:C.muted}}>{s.step_id||tp?.label}</div>
                </div>
                {si===i && <div style={{display:"flex",gap:2}}>
                  <button onClick={e=>{e.stopPropagation();dupStep(i)}} style={{width:18,height:18,borderRadius:4,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><Copy size={10} color={C.muted}/></button>
                  <button onClick={e=>{e.stopPropagation();delStep(i)}} style={{width:18,height:18,borderRadius:4,border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={10} color={C.danger}/></button>
                </div>}
              </div>
            );
          })}
          <button onClick={()=>setPicker(true)} style={{width:"calc(100% - 12px)",margin:"6px 6px",padding:"8px",borderRadius:8,border:`1px dashed ${C.border2}`,background:"transparent",color:C.muted,cursor:"pointer",fontSize:10}}>+ Add screen</button>
        </div>

        {/* CENTER — EDITOR */}
        {sel&&<div style={{flex:1,overflowY:"auto",padding:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,padding:"8px 12px",background:`${A}10`,borderRadius:8,border:`1px solid ${A}20`}}>
            {ti?.ik && ri(ti.ik,16,A)}
            <span style={{fontSize:11,fontWeight:700,color:A}}>{ti?.label}</span>
            {sel._bid&&<span style={{fontSize:9,color:C.muted,marginLeft:"auto"}}>ID: {sel._bid.slice(0,8)}...</span>}
          </div>

          {/* Step ID */}
          <Lbl text="Step ID *"/><Inp value={sel.step_id} onChange={v=>up("step_id",v)} ph="e.g. goals, equipment, height"/>

          <Lbl text="Title"/><Inp value={sel.title} onChange={v=>up("title",v)}/>
          <Lbl text="Subtitle"/><Inp value={sel.subtitle} onChange={v=>up("subtitle",v)}/>
          {sel.cta!==undefined && <div><Lbl text="Button"/><Inp value={sel.cta} onChange={v=>up("cta",v)}/></div>}

          {sel.type==="text_input" && <div><Lbl text="Placeholder"/><Inp value={sel.placeholder} onChange={v=>up("placeholder",v)}/></div>}

          {(sel.type==="slider"||sel.type==="number_stepper"||sel.type==="wheel") && <div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <div><Lbl text="Min"/><input type="number" value={sel.min??""} onChange={e=>up("min",+e.target.value)} style={{width:70,padding:8,fontSize:12,background:C.card,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,outline:"none"}}/></div>
              <div><Lbl text="Max"/><input type="number" value={sel.max??""} onChange={e=>up("max",+e.target.value)} style={{width:70,padding:8,fontSize:12,background:C.card,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,outline:"none"}}/></div>
              <div><Lbl text="Default"/><input type="number" value={sel.default??""} onChange={e=>up("default",+e.target.value)} style={{width:70,padding:8,fontSize:12,background:C.card,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,outline:"none"}}/></div>
            </div>
            <Lbl text={sel.type==="wheel"?"Suffix":"Unit"}/><Inp value={sel.type==="wheel"?(sel.suffix||""):(sel.unit||"")} onChange={v=>up(sel.type==="wheel"?"suffix":"unit",v)}/>
          </div>}

          {sel.type==="emoji_rating" && <div>
            <Lbl text="ICON RATING OPTIONS"/>
            {(sel.options||[]).map((o,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
              <IconBtn icon={o.icon} onChange={v=>upOpt(i,"icon",v)}/>
              <input value={o.label} onChange={e=>upOpt(i,"label",e.target.value)} style={{flex:1,padding:"6px 8px",fontSize:11,background:C.card,border:`1px solid ${C.border}`,borderRadius:5,color:C.text,outline:"none"}}/>
            </div>)}
          </div>}

          {sel.type==="image_select" && <div>
            <Lbl text="Columns"/><input type="number" value={sel.columns} onChange={e=>up("columns",+e.target.value)} style={{width:70,padding:8,fontSize:12,background:C.card,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,outline:"none",marginBottom:12}}/>
            <Lbl text="IMAGE OPTIONS"/>
            {(sel.options||[]).map((o,i)=><div key={i} style={{padding:8,background:C.card,borderRadius:6,marginBottom:4,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",gap:4,marginBottom:4}}>
                <input value={o.label} onChange={e=>upOpt(i,"label",e.target.value)} placeholder="Label" style={{flex:1,padding:"5px 8px",fontSize:11,background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,color:C.text,outline:"none"}}/>
                <input value={o.color||""} onChange={e=>upOpt(i,"color",e.target.value)} placeholder="#color" style={{width:70,padding:"5px 8px",fontSize:10,background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,color:o.color||C.dim,outline:"none"}}/>
                <button onClick={()=>delOpt(i)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={12} color={C.danger}/></button>
              </div>
              <input value={o.image_url||""} onChange={e=>upOpt(i,"image_url",e.target.value)} placeholder="Image URL (paste link)" style={{width:"100%",padding:"5px 8px",fontSize:10,background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,color:C.dim,outline:"none"}}/>
            </div>)}
            <button onClick={()=>up("options",[...(sel.options||[]),{id:uid(),label:"New",color:"#888",image_url:""}])} style={{padding:"4px 10px",fontSize:10,borderRadius:5,border:`1px dashed ${C.border2}`,background:"transparent",color:A,cursor:"pointer"}}>+ Image option</button>
          </div>}

          {sel.type==="info_screen" && <div>
            <Lbl text="STATS"/>
            {(sel.stats||[]).map((s,i)=><div key={i} style={{display:"flex",gap:4,marginBottom:4}}>
              <input value={s.value} onChange={e=>{const n=[...sel.stats];n[i]={...n[i],value:e.target.value};up("stats",n)}} placeholder="Value" style={{width:70,padding:"6px 8px",fontSize:11,background:C.card,border:`1px solid ${C.border}`,borderRadius:5,color:C.text,outline:"none"}}/>
              <input value={s.label} onChange={e=>{const n=[...sel.stats];n[i]={...n[i],label:e.target.value};up("stats",n)}} placeholder="Label" style={{flex:1,padding:"6px 8px",fontSize:11,background:C.card,border:`1px solid ${C.border}`,borderRadius:5,color:C.text,outline:"none"}}/>
              <button onClick={()=>up("stats",sel.stats.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer"}}><X size={12} color={C.danger}/></button>
            </div>)}
            <button onClick={()=>up("stats",[...(sel.stats||[]),{value:"0",label:"stat"}])} style={{padding:"4px 10px",fontSize:10,borderRadius:5,border:`1px dashed ${C.border2}`,background:"transparent",color:A,cursor:"pointer"}}>+ Stat</button>
          </div>}

          {sel.type==="segmented_control" && <div>
            <Lbl text="SEGMENTS"/>
            {(sel.options||[]).map((o,i)=><input key={i} value={o.label} onChange={e=>upOpt(i,"label",e.target.value)} style={{width:"100%",padding:"5px 8px",fontSize:11,background:C.card,border:`1px solid ${C.border}`,borderRadius:5,color:C.text,outline:"none",marginBottom:4}}/>)}
          </div>}

          {hasOpts && <div>
            <Lbl text="OPTIONS"/>
            {(sel.options||[]).map((o,i)=><div key={i} style={{padding:8,background:C.card,borderRadius:6,marginBottom:4,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",gap:4,marginBottom:4,alignItems:"center"}}>
                <IconBtn icon={o.icon} onChange={v=>upOpt(i,"icon",v)}/>
                <input value={o.label} onChange={e=>upOpt(i,"label",e.target.value)} placeholder="Label" style={{flex:1,padding:"5px 8px",fontSize:11,background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,color:C.text,outline:"none"}}/>
                <button onClick={()=>delOpt(i)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={12} color={C.danger}/></button>
              </div>
              {o.description!==undefined && <input value={o.description||""} onChange={e=>upOpt(i,"description",e.target.value)} placeholder="Description" style={{width:"100%",padding:"5px 8px",fontSize:10,background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,color:C.dim,outline:"none"}}/>}
              {sel.coach_response_map && <input value={sel.coach_response_map[o.id]||""} onChange={e=>up("coach_response_map",{...sel.coach_response_map,[o.id]:e.target.value})} placeholder="Coach says..." style={{width:"100%",padding:"5px 8px",fontSize:10,background:C.bg,border:`1px solid ${C.border}`,borderRadius:5,color:`${A}99`,outline:"none",marginTop:3}}/>}
            </div>)}
            <button onClick={addOpt} style={{padding:"4px 10px",fontSize:10,borderRadius:5,border:`1px dashed ${C.border2}`,background:"transparent",color:A,cursor:"pointer"}}>+ Option</button>
          </div>}
        </div>}

        {/* RIGHT — PREVIEW */}
        <div style={{width:320,borderLeft:`1px solid ${C.border}`,padding:16,overflowY:"auto",display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
          <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:.8,marginBottom:10}}>LIVE PREVIEW</div>
          {sel&&<PF><Preview step={sel}/></PF>}
          <div style={{marginTop:10,fontSize:9,color:C.muted}}>Screen {si+1} / {steps.length}</div>
        </div>
      </div>

      {/* TYPE PICKER MODAL */}
      {picker && <PickerModal onAdd={addStep} onClose={()=>setPicker(false)}/>}

      {/* JSON EXPORT MODAL */}
      {showJson && <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowJson(false)}>
        <div onClick={e=>e.stopPropagation()} style={{background:C.panel,borderRadius:16,padding:20,width:640,maxWidth:"90vw",maxHeight:"80vh",display:"flex",flexDirection:"column",border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
            <span style={{fontSize:16,fontWeight:800}}>Export JSON</span>
            <button onClick={()=>navigator.clipboard?.writeText(exportJson())} style={{padding:"6px 14px",borderRadius:7,border:"none",background:A,color:BG,fontSize:11,fontWeight:700,cursor:"pointer"}}>Copy</button>
          </div>
          <pre style={{flex:1,overflow:"auto",padding:14,background:"#0a0a0c",borderRadius:8,fontSize:10,color:"#9deba0",lineHeight:1.5,margin:0,fontFamily:"'JetBrains Mono',monospace",border:`1px solid ${C.border}`}}>{exportJson()}</pre>
        </div>
      </div>}
    </div>
  );
}

/* ── Picker Modal ── */
function PickerModal({onAdd,onClose}){
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.panel,borderRadius:16,padding:20,width:560,maxWidth:"90vw",maxHeight:"80vh",overflowY:"auto",border:`1px solid ${C.border}`}}>
      <div style={{fontSize:16,fontWeight:800,marginBottom:14,color:C.text}}>Add a screen</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:6}}>
        {TYPES.map(tp=><button key={tp.type} onClick={()=>onAdd(tp.type)} style={{padding:"14px 10px",borderRadius:10,border:`1px solid ${C.border}`,background:C.card,cursor:"pointer",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.borderColor=A} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
          <div style={{marginBottom:6}}>{ri(tp.ik,22,A)}</div>
          <div style={{fontSize:11,fontWeight:700,color:C.text}}>{tp.label}</div>
          <div style={{fontSize:9,color:C.muted,marginTop:2}}>{tp.desc}</div>
        </button>)}
      </div>
    </div>
  </div>;
}
