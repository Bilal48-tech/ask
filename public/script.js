(function(){
var $=function(i){return document.getElementById(i)};
var K='askanything.pro.v1',LIMIT=4000;
var S={chats:[],cur:null,mode:'general',theme:'',fs:16,vl:'en-US'};
var dl=null,ctl=null,busy=false,raf=null,trashed=null,editing=-1,tt=null,tin=false;
var BASE='You are a friendly, knowledgeable assistant. Answer any question clearly and accurately, in the same language the person writes in (including Urdu). Use short paragraphs, lists and fenced code blocks where helpful. If unsure, say so. For medical, legal or financial questions give general information and suggest a professional.';
var MODES={general:['General',''],simple:['Simple','Explain in very simple words with a short everyday example.'],dev:['Developer','You are also an expert web developer: give modern, working code in fenced blocks with brief explanations.'],brief:['Brief','Answer in one to three sentences unless asked for more.']};
var IDEAS=[['Science','How do black holes form?'],['Coding','Build a responsive navbar with HTML and CSS'],['Daily life','Give me a 3-day Lahore travel plan'],['Learn','Explain how the stock market works']];
var HASH=['py','python','sh','bash','shell','zsh','rb','ruby','yaml','yml','toml','r','pl','perl','ini','makefile','dockerfile'];

try{var raw=localStorage.getItem(K);if(raw)S=Object.assign(S,JSON.parse(raw));}catch(e){}
if(!Array.isArray(S.chats))S.chats=[];
S.chats.forEach(function(c){
 c.msgs=Array.isArray(c.msgs)?c.msgs.filter(function(m){return m&&typeof m.content==='string'&&typeof m.role==='string';}).filter(function(m){return m.role!=='assistant'||m.content.trim();}):[];
 c.ts=+c.ts||+c.id||Date.now();c.pin=!!c.pin;c.title=String(c.title||'Untitled');
});
S.chats=S.chats.filter(function(c){return c.msgs.length;});
sort();

function sort(){S.chats.sort(function(a,b){return (b.pin?1:0)-(a.pin?1:0)||b.ts-a.ts});}
function save(){
 try{localStorage.setItem(K,JSON.stringify(S));return true;}
 catch(e){toast('Storage is full, so the latest chat was not saved.');return false;}
}
function cur(){var c=S.chats.filter(function(x){return x.id===S.cur})[0];if(!c){c=mk();}return c;}
function mk(){var c={id:String(Date.now()),title:'New chat',msgs:[],ts:Date.now(),pin:false};S.chats.unshift(c);S.cur=c.id;return c;}
function touch(c){c.ts=Date.now();sort();}
function byId(id){return S.chats.filter(function(c){return c.id===id})[0];}
function announce(t){$('status').textContent=t;}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

var KEY=/\b(?:const|let|var|function|return|if|else|for|while|do|await|async|class|new|import|from|export|default|try|catch|finally|throw|typeof|instanceof|null|undefined|true|false|this|super|def|elif|self|None|True|False|print|in|of|switch|case|break|continue|extends|implements|interface|enum|type|string|number|boolean|void|public|private|protected|static|readonly|struct|func|package|end|then|fi|done)\b/g;
function hl(code,lang){
 var h=HASH.indexOf(String(lang||'').toLowerCase())>-1;
 var pat=new RegExp('(\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*'+(h?'|#[^\\n]*':'')+')|("(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)|(\\b\\d+(?:\\.\\d+)?\\b)|('+KEY.source+')','g');
 return code.replace(pat,function(m,c,s,n,k){
  return c?'<span class="t-c">'+c+'</span>':s?'<span class="t-s">'+s+'</span>':n?'<span class="t-n">'+n+'</span>':'<span class="t-k">'+k+'</span>';
 });
}
function md(t){
 var codes=[];
 function stash(html){codes.push(html);return '\u0000'+(codes.length-1)+'\u0000';}
 t=esc(t).replace(/```(\w*)\n?([\s\S]*?)(```|$)/g,function(_,l,c){
  var body=c.replace(/\n$/,'');
  return stash('<div class="code"><div class="ch"><span>'+esc(l||'code')+'</span><button class="cp" type="button">Copy code</button></div><pre><code>'+hl(body,l)+'</code></pre></div>');
 });
 t=t.replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*\n]*)\*/g,'$1<em>$2</em>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">$1</a>');
 t=t.replace(/(?:^\|.*\|[ \t]*(?:\n|$))+/gm,function(blk){
  var rs=blk.trim().split('\n').filter(function(r){return !/^\|?[\s:|-]+\|?$/.test(r.trim());}).map(function(r){return r.trim().replace(/^\||\|$/g,'').split('|');});
  if(!rs.length)return blk;
  return stash('<div class="tw"><table><thead><tr>'+rs[0].map(function(c){return '<th>'+c.trim()+'</th>'}).join('')+'</tr></thead><tbody>'+rs.slice(1).map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c.trim()+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>')+'\n';
 });
 var out=[],ls=null;
 function end(){if(ls){out.push('</'+ls+'>');ls=null;}}
 t.split('\n').forEach(function(l){
  var m=l.match(/^\s*[-*•]\s+(.*)/),n=l.match(/^\s*\d+[.)]\s+(.*)/),h=l.match(/^#{1,6}\s+(.*)/);
  if(m||n){var k=m?'ul':'ol';if(ls!==k){end();out.push('<'+k+'>');ls=k;}out.push('<li>'+(m||n)[1]+'</li>');return;}
  end();
  if(/^\u0000\d+\u0000$/.test(l.trim()))out.push(l.trim());
  else if(h)out.push((h[0].length<4?'<h4>':'<h5>')+h[1]+'</h'+(h[0].length<4?'4':'5')+'>');
  else if(/^&gt;/.test(l))out.push('<blockquote>'+l.replace(/^&gt;\s?/,'')+'</blockquote>');
  else if(/^\s*([-*_])\1{2,}\s*$/.test(l))out.push('<hr>');
  else if(l.trim()!=='')out.push('<p>'+l+'</p>');
 });
 end();
 return out.join('').replace(/\u0000(\d+)\u0000/g,function(_,i){return codes[i];});
}

function nearBottom(){var e=$('chat');return e.scrollHeight-e.scrollTop-e.clientHeight<140;}
function sc(force){var e=$('chat');if(force||nearBottom())e.scrollTop=e.scrollHeight;$('dn').classList.toggle('show',!nearBottom());}
function paint(){
 if(raf)return;
 var run=function(){
  raf=0;
  var c=cur(),i=c.msgs.length-1,b=$('col').querySelector('.row[data-i="'+i+'"] .body');
  if(b&&c.msgs[i]&&c.msgs[i].role==='assistant')b.innerHTML=md(c.msgs[i].content);
 };
 raf=document.hidden?setTimeout(run,90):requestAnimationFrame(run);
}
function day(t){
 var d=new Date(t),n=new Date();
 function start(x){return new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime();}
 var diff=Math.round((start(n)-start(d))/864e5);
 if(diff<0)return 'Later';
 if(diff===0)return 'Today';
 if(diff===1)return 'Yesterday';
 if(diff<7)return 'Previous 7 days';
 if(diff<30)return 'Previous 30 days';
 return d.toLocaleDateString(undefined,{month:'short',year:'numeric'});
}
function hits(c,fq){
 if(c.title.toLowerCase().indexOf(fq)>-1)return true;
 for(var i=0;i<c.msgs.length;i++)if(c.msgs[i].content.toLowerCase().indexOf(fq)>-1)return true;
 return false;
}
function side(){
 var L=$('list');L.innerHTML='';
 var fq=($('srch').value||'').trim().toLowerCase();
 var list=S.chats.filter(function(c){return !fq||hits(c,fq);});
 if(!list.length){
  var p=document.createElement('p');p.className='empty';p.textContent=fq?'No chats mention “'+fq+'”.':'No chats yet.';L.appendChild(p);return;
 }
 var last='';
 list.forEach(function(c){
  var grp=c.pin?'Pinned':day(c.ts);
  if(grp!==last){last=grp;var h=document.createElement('p');h.className='day';h.textContent=grp;L.appendChild(h);}
  var row=document.createElement('div');row.className='it'+(c.id===S.cur?' on':'');row.setAttribute('role','listitem');
  var tb=document.createElement('button');tb.type='button';tb.className='tb';
  var sp=document.createElement('span');sp.textContent=c.title;sp.dir='auto';sp.title='Click to open, ✎ to rename';
  tb.appendChild(sp);
  tb.onclick=function(){if(busy)return wait();S.cur=c.id;touch(c);save();drawer(false);draw();$('q').focus();};
  row.appendChild(tb);
  row.appendChild(cbtn('📌',c.pin?'Unpin chat: ':'Pin chat: ',c,function(){c.pin=!c.pin;sort();save();draw();}));
  row.appendChild(cbtn('✎','Rename chat: ',c,function(){rename(c,sp);}));
  row.appendChild(cbtn('×','Delete chat: ',c,function(){del(c);}));
  L.appendChild(row);
 });
}
function cbtn(sym,label,c,fn){
 var b=document.createElement('button');b.type='button';b.className='cb';b.textContent=sym;
 b.setAttribute('aria-label',label+c.title);b.title=label+c.title;
 b.onclick=function(e){e.stopPropagation();if(busy)return wait();fn();};
 return b;
}
function rename(c,sp){
 var inp=document.createElement('input');inp.className='rin';inp.value=c.title;inp.maxLength=60;inp.setAttribute('aria-label','Chat name');
 var fin=false;
 function done(ok){
  if(fin)return;fin=true;
  if(inp.parentNode)inp.parentNode.replaceChild(sp,inp);
  if(ok&&inp.value.trim())c.title=inp.value.trim();
  save();draw();
 }
 inp.onblur=function(){done(true);};
 inp.onkeydown=function(e){e.stopPropagation();if(e.key==='Enter')done(true);else if(e.key==='Escape')done(false);};
 sp.parentNode.replaceChild(inp,sp);
 inp.focus();inp.select();
}
function del(c){
 var i=S.chats.indexOf(c);if(i<0)return;
 trashed={chat:c,i:i,cur:S.cur};
 S.chats.splice(i,1);
 if(S.cur===c.id)S.cur=S.chats[0]?S.chats[0].id:null;
 if(!S.chats.length)mk();
 save();draw();
 toast('Chat deleted.','Undo',function(){
  S.chats.splice(Math.min(trashed.i,S.chats.length),0,trashed.chat);
  S.cur=trashed.chat.id;trashed=null;sort();save();draw();
 });
}
function wait(){toast('Finish or stop the current answer first (Esc).');}
function modes(){
 var M=$('modes');M.innerHTML='';
 Object.keys(MODES).forEach(function(k){
  var b=document.createElement('button');b.type='button';b.textContent=MODES[k][0];
  b.setAttribute('aria-pressed',String(k===S.mode));
  if(k===S.mode)b.className='on';
  b.onclick=function(){S.mode=k;save();modes();$('q').focus();};
  M.appendChild(b);
 });
}
function actsFor(m,i,last){
 if(m.err)return '<button data-a="retry" class="pri" type="button">Try again</button>';
 if(m.role==='user')return '<button data-a="copy" data-i="'+i+'" type="button">Copy</button><button data-a="delm" data-i="'+i+'" type="button">Delete</button>';
 return '<button data-a="copy" data-i="'+i+'" type="button">Copy</button>'+(window.speechSynthesis?'<button data-a="say" data-i="'+i+'" type="button">Listen</button>':'')+(last?'<button data-a="regen" type="button">Regenerate</button>':'');
}
function draw(){
 var c=cur(),col=$('col');col.innerHTML='';editing=-1;tin=false;
 $('ttl').textContent=c.title;
 var has=!!c.msgs.length;
 $('exp').hidden=$('pin').hidden=!has;
 $('pin').setAttribute('aria-pressed',String(!!c.pin));
 if(!has){
  var h=document.createElement('div');h.className='hero';
  h.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 96 96" role="img" aria-label="Askwise logo" class="hlogo"><rect width="96" height="96" rx="26" fill="#4338CA"/><rect x="20" y="22" width="56" height="42" rx="14" fill="#fff"/><path d="M30 60 L27 77 L46 63 Z" fill="#fff"/><path d="M48 30 C49 38 53 42 62 43 C53 44 49 48 48 56 C47 48 43 44 34 43 C43 42 47 38 48 30 Z" fill="#4338CA"/></svg><h2>What would you like to know?</h2><p>Ask about any topic — science, code, travel, health basics, homework and more.</p><div class="cards"></div>';
  IDEAS.forEach(function(x){var b=document.createElement('button');b.type='button';b.innerHTML='<small></small>';b.firstChild.textContent=x[0];b.appendChild(document.createTextNode(x[1]));b.onclick=function(){ask(x[1]);};h.lastChild.appendChild(b);});
  col.appendChild(h);
 }
 c.msgs.forEach(function(m,i){
  var bot=m.role==='assistant',d=document.createElement('div');
  d.className='row '+(bot?'bot':'user');d.setAttribute('data-i',i);
  var live=busy&&bot&&i===c.msgs.length-1;
  d.innerHTML=(bot?'<div class="av" aria-hidden="true">AI</div>':'<button class="eb" data-a="edit" data-i="'+i+'" type="button" title="Edit and resend" aria-label="Edit message">✎</button>')
   +'<div class="bub">'
   +(m.err?'<div class="warn">⚠︎ '+esc(m.content.split('.')[0])+'</div>':'')
   +'<div class="body" dir="auto"></div>'
   +(m.stopped?'<p class="stopped">Response stopped</p>':'')
   +(!live&&(m.content||m.err)?'<div class="acts">'+actsFor(m,i,i===c.msgs.length-1)+'</div>':'')
   +'</div>';
  var b=d.querySelector('.body');
  if(bot)b.innerHTML=m.content?md(m.content):'<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>';
  else b.textContent=m.content;
  col.appendChild(d);
 });
 side();sc(true);
}

function copyText(t,btn){
 function ok(){if(btn){var o=btn.textContent;btn.textContent='Copied';setTimeout(function(){btn.textContent=o;},1200);}}
 try{navigator.clipboard.writeText(t).then(ok,fb);}catch(e){fb();}
 function fb(){try{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();ok();}catch(e){toast('Copy blocked by the browser.');}}
}
function say(t,btn){
 if(!window.speechSynthesis)return;
 if(speechSynthesis.speaking){speechSynthesis.cancel();if(btn)btn.textContent='Listen';return;}
 var u=new SpeechSynthesisUtterance(t.replace(/```[\s\S]*?```/g,' ').replace(/[*#`>|_-]/g,''));
 u.lang=/[\u0600-\u06FF]/.test(t)?'ur-PK':'en-US';
 if(btn){btn.textContent='Stop';u.onend=u.oncancel=function(){if(btn)btn.textContent='Listen';};}
 speechSynthesis.speak(u);
}
function startEdit(i,btn){
 var c=cur();if(i<0||!c.msgs[i]||c.msgs[i].role!=='user')return;
 editing=i;
 var b=(btn||$('col').querySelector('.row[data-i="'+i+'"] .body'));
 b.textContent='';
 var ta=document.createElement('textarea');ta.className='ed';ta.dir='auto';ta.rows=3;ta.maxLength=LIMIT;ta.value=c.msgs[i].content;ta.setAttribute('aria-label','Edit message');
 var bar=document.createElement('div');bar.className='edb';
 var ok=document.createElement('button');ok.type='button';ok.textContent='Save & send';
 var no=document.createElement('button');no.type='button';no.textContent='Cancel';
 bar.appendChild(ok);bar.appendChild(no);b.appendChild(ta);b.appendChild(bar);
 ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);
 ta.onkeydown=function(e){e.stopPropagation();if(e.key==='Escape'){draw();}else if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();ok.click();}};
 no.onclick=function(){draw();};
 ok.onclick=function(){
  var v=ta.value.trim();if(!v){toast('Message cannot be empty.');return;}
  c.msgs=c.msgs.slice(0,i);
  if(!i)c.title=v.slice(0,42);
  touch(c);draw();ask(v);
 };
}
function toast(msg,label,fn){
 var el=$('toast');$('tm').textContent=msg;
 var b=$('ta');
 if(label){b.textContent=label;b.hidden=false;b.onclick=function(){hide();if(fn)fn();};}
 else{b.hidden=true;b.onclick=null;}
 el.hidden=false;void el.offsetWidth;el.classList.add('on');
 clearTimeout(tt);tt=setTimeout(hide,label?7000:2800);
 function hide(){clearTimeout(tt);el.classList.remove('on');el.hidden=true;}
}
function setBusy(v){
 busy=v;
 $('go').textContent=v?'■':'➤';
 $('go').setAttribute('aria-label',v?'Stop':'Send');
 $('go').title=v?'Stop':'Send';
 $('mic').disabled=v;
}

$('col').addEventListener('click',function(e){
 var t=e.target;
 if(t.classList.contains('cp')){copyText(t.closest('.code').querySelector('code').textContent,t);return;}
 var a=t.getAttribute('data-a');if(!a)return;
 var c=cur(),i=+t.getAttribute('data-i');
 if(a==='copy'){copyText(c.msgs[i].content,t);return;}
 if(a==='say'){say(c.msgs[i].content,t);return;}
 if(busy){wait();return;}
 if(a==='edit'){startEdit(i,t.closest('.row').querySelector('.body'));return;}
 if(a==='delm'){c.msgs.splice(i,c.msgs[i].role==='user'?2:1);save();draw();return;}
 if(a==='retry'){c.msgs.pop();ask(null);return;}
 if(a==='regen'){
  var j=c.msgs.length-1;
  while(j>=0&&c.msgs[j].role!=='user')j--;
  if(j<0)return;
  c.msgs=c.msgs.slice(0,j+1);ask(null);
 }
});

async function sample(msgs,o){
 var r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:msgs}),signal:o.signal});
 if(!r.ok){
  var e=new Error('http '+r.status);e.code=r.status===429?'rate_limited':(r.status>=500?'server':'error');e.status=r.status;throw e;
 }
 var ct=r.headers.get('content-type')||'';
 if(ct.indexOf('application/json')>-1||!r.body){var j=await r.json();return {text:j.text||j.answer||(j.message&&j.message.content)||''};}
 var rd=r.body.getReader(),dc=new TextDecoder(),acc='',buf='';
 for(;;){
  var x=await rd.read();if(x.done)break;
  buf+=dc.decode(x.value,{stream:true});
  var parts=buf.split('\n\n');buf=parts.pop();
  for(var k=0;k<parts.length;k++){
   var line=parts[k];if(line.indexOf('data:')!==0)continue;
   var d=line.slice(5).replace(/^ /,'');
   if(d==='[DONE]')continue;
   var piece=d;
   try{var o2=JSON.parse(d);piece=o2.t!=null?o2.t:o2.delta!=null?o2.delta:o2.text!=null?o2.text:'';if(o2.error)throw new Error('stream');}
   catch(err){if(err.message==='stream')throw err;}
   if(piece){acc+=piece;if(o.onText)o.onText({text:acc});}
  }
 }
 return {text:acc};
}
function why(e){
 if(e&&e.code==='rate_limited')return 'Too many requests right now. Please wait a moment and try again.';
 if(e&&e.code==='server')return 'The AI server had a problem. Please try again in a moment.';
 if(e&&/failed to fetch|network/i.test(String(e.message||e)))return 'Could not connect to the AI server. Make sure Askwise is running, then try again.';
 return 'Something went wrong. Please try again.';
}
async function ask(text){
 if(busy)return;
 var c=cur();
 if(text!==null){
  c.msgs.push({role:'user',content:text});
  if(c.title==='New chat')c.title=text.slice(0,42);
 }
 var m={role:'assistant',content:''};c.msgs.push(m);
 touch(c);setBusy(true);ctl=new AbortController();
 try{
  draw();
  var hist=c.msgs.slice(0,-1).slice(-20);
  while(hist.length&&hist[0].role!=='user')hist.shift();
  var sys=BASE+(MODES[S.mode][1]?' '+MODES[S.mode][1]:'');
  var msgs=hist.map(function(x,i){return i===0?{role:x.role,content:sys+'\n\n'+x.content}:{role:x.role,content:x.content};});
  var r=await sample(msgs,{signal:ctl.signal,onText:function(t){m.content=t.text;paint();sc();}});
  m.content=r.text||m.content;
  if(!String(m.content).trim())throw {code:'error',message:'empty'};
  announce('Answer ready');
 }catch(e){
  if(ctl.signal.aborted||(e&&e.name==='AbortError')){
   if(String(m.content).trim()){m.stopped=true;announce('Response stopped');}
   else c.msgs.pop();
  }else{
   m.content=why(e);m.err=true;announce('The answer could not be loaded');
  }
 }finally{
  setBusy(false);save();draw();
 }
}

$('f').addEventListener('submit',function(e){
 e.preventDefault();
 if(busy){if(ctl)ctl.abort();return;}
 var t=$('q').value.trim();if(!t)return;
 $('q').value='';$('q').style.height='auto';counter();ask(t);
});
$('q').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('f').requestSubmit();}});
$('q').addEventListener('input',function(){
 var q=$('q');q.style.height='auto';q.style.height=Math.min(q.scrollHeight,150)+'px';counter();
});
function counter(){
 var n=$('q').value.length,c=$('cnt');
 c.hidden=n<LIMIT-900;
 c.textContent=n+' / '+LIMIT;
 c.classList.toggle('max',n>=LIMIT-50);
}
$('new').onclick=function(){
 if(busy){wait();return;}
 var c=S.chats[0];
 if(!(c&&!c.msgs.length))mk();
 save();drawer(false);draw();$('q').focus();
};
function drawer(open){
 document.body.classList.toggle('open',open);
 $('menu').setAttribute('aria-expanded',String(open));
 try{$('main').inert=open;$('ov').setAttribute('aria-hidden',String(!open));}catch(e){}
 if(open){var f=$('drawer').querySelector('button,input');if(f)f.focus();}else $('menu').focus();
}
$('menu').onclick=function(){drawer(!document.body.classList.contains('open'));};
$('ov').onclick=function(){drawer(false);};
$('dn').onclick=function(){var e=$('chat');try{e.scrollTo({top:e.scrollHeight,behavior:'smooth'});}catch(x){e.scrollTop=e.scrollHeight;}sc(true);};
$('chat').addEventListener('scroll',function(){$('dn').classList.toggle('show',!nearBottom());},{passive:true});
var st;
$('srch').addEventListener('input',function(){clearTimeout(st);st=setTimeout(side,140);});
$('pin').onclick=function(){var c=cur();c.pin=!c.pin;sort();save();draw();toast(c.pin?'Chat pinned.':'Chat unpinned.');};
$('ttl').ondblclick=function(){
 if(tin||busy)return;
 var c=cur(),h=$('ttl');tin=true;
 var inp=document.createElement('input');inp.className='tin';inp.value=c.title;inp.maxLength=60;inp.setAttribute('aria-label','Chat name');
 h.textContent='';h.appendChild(inp);inp.focus();inp.select();
 var fin=false;
 function done(ok){
  if(fin)return;fin=true;tin=false;
  if(ok&&inp.value.trim())c.title=inp.value.trim();
  save();draw();$('q').focus();
 }
 inp.onblur=function(){done(true);};
 inp.onkeydown=function(e){e.stopPropagation();if(e.key==='Enter')done(true);else if(e.key==='Escape')done(false);};
};
function theme(){
 var t=S.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
 document.documentElement.setAttribute('data-theme',t);
 $('tc').setAttribute('content',{light:'#6d5efc',dark:'#12111f',black:'#000000'}[t]);
 $('thm').setAttribute('title','Theme: '+t);
 $('thm').setAttribute('aria-label','Change theme, current '+t);
}
$('thm').onclick=function(){
 var cu=S.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'),o=['light','dark','black'];
 S.theme=o[(o.indexOf(cu)+1)%3];theme();save();toast({
  light: '☀︎  Welcome to Light theme',
  dark: '🌙 Welcome to Dark theme',
  black: '🖤 Welcome to Black theme'
}[S.theme]);
};
function fsz(){document.body.style.fontSize=(S.fs||16)+'px';$('fs').setAttribute('title','Text size: '+(S.fs||16)+'px');}
$('fs').onclick=function(){var z=[15,16,18,20];S.fs=z[(z.indexOf(S.fs||16)+1)%4];fsz();save();toast('Text size '+(S.fs)+'px');};

function chatMd(c){
 return '# '+c.title+'\n\n'+c.msgs.filter(function(m){return !m.err;}).map(function(m){
  return '**'+(m.role==='user'?'You':'Askwise')+':**\n\n'+m.content;
 }).join('\n\n---\n\n')+'\n';
}
function download(name,mime,text){
 var a=document.createElement('a'),u=URL.createObjectURL(new Blob([text],{type:mime}));
 a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(function(){URL.revokeObjectURL(u);},1500);
}
function slug(t){return String(t).replace(/[^\w -]+/g,'').trim().replace(/\s+/g,'-').slice(0,50)||'chat';}
$('exp').onclick=function(){
 var c=cur();
 try{if(dl)dl.save({filename:slug(c.title)+'.md',data:chatMd(c)});else throw 0;}
 catch(e){download(slug(c.title)+'.md','text/markdown',chatMd(c));}
 toast('Chat exported as Markdown.');
};
$('clr').onclick=function(){
 if(busy){wait();return;}
 if(!S.chats.length){toast('Nothing to clear.');return;}
 var copy=S.chats.slice(),wasCur=S.cur;
 S.chats=[];mk();save();drawer(false);draw();
 toast('All chats cleared.','Undo',function(){
  S.chats=copy;S.cur=byId(wasCur)?wasCur:(S.chats[0]&&S.chats[0].id);sort();save();draw();
 });
};

document.addEventListener('keydown',function(e){
 if(e.key==='Escape'){
  if(document.body.classList.contains('open')){drawer(false);}
  else if(editing>=0||tin){draw();}
  else if(busy&&ctl){ctl.abort();}
  return;
 }
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('new').click();}
 else if(e.key==='/'&&!/^(TEXTAREA|INPUT)$/.test((document.activeElement||{}).tagName||'')){e.preventDefault();$('q').focus();}
});

theme();fsz();modes();counter();
try{if(window.claude&&window.claude.use)window.claude.use('downloads').then(function(d){dl=d;}).catch(function(){});}catch(e){}
draw();

var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){
 $('mic').hidden=false;$('vl').hidden=false;
 function vl(){$('vl').textContent=S.vl==='ur-PK'?'اردو':'EN';$('vl').setAttribute('aria-label','Voice language: '+$('vl').textContent);}
 vl();
 $('vl').onclick=function(){S.vl=S.vl==='ur-PK'?'en-US':'ur-PK';vl();save();};
 var rec=null,heard='';
 $('mic').onclick=function(){
  if(busy){wait();return;}
  if(rec){rec.stop();return;}
  rec=new SR();rec.lang=S.vl||'en-US';rec.interimResults=true;rec.continuous=false;heard='';
  rec.onresult=function(e){
   var s='';for(var i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;
   var q=$('q'),v=q.value;
   if(heard&&v.slice(-heard.length)===heard)q.value=v.slice(0,v.length-heard.length)+s;
   else q.value=(v?v+' ':'')+s;
   heard=s;q.dispatchEvent(new Event('input'));
  };
  rec.onstart=function(){$('mic').classList.add('rec');$('mic').setAttribute('aria-label','Stop voice input');};
  rec.onend=function(){rec=null;heard='';$('mic').classList.remove('rec');$('mic').setAttribute('aria-label','Voice input');};
  rec.onerror=function(e){rec=null;heard='';$('mic').classList.remove('rec');toast('Microphone: '+(e&&e.error||'not available'));};
  rec.start();
 };
}
})();
