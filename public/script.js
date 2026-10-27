(function(){
var $=function(i){return document.getElementById(i)};
var K='askanything.pro.v1',S={chats:[],cur:null,mode:'general',theme:'',fs:16,vl:'en-US'},sample=null,dl=null,ctl=null,busy=false;
var BASE='You are a friendly, knowledgeable assistant. Answer any question clearly and accurately, in the same language the person writes in (including Urdu). Use short paragraphs, lists and fenced code blocks where helpful. If unsure, say so. For medical, legal or financial questions give general information and suggest a professional.';
var MODES={general:['General',''],simple:['Simple','Explain in very simple words with a short everyday example.'],dev:['Developer','You are also an expert web developer: give modern, working code in fenced blocks with brief explanations.'],brief:['Brief','Answer in one to three sentences unless asked for more.']};
var IDEAS=[['Science','How do black holes form?'],['Coding','Build a responsive navbar with HTML and CSS'],['Daily life','Give me a 3-day Lahore travel plan'],['Learn','Explain how the stock market works']];
try{var r=localStorage.getItem(K);if(r)S=Object.assign(S,JSON.parse(r));}catch(e){}
function save(){try{localStorage.setItem(K,JSON.stringify(S));}catch(e){}}
function cur(){var c=S.chats.filter(function(x){return x.id===S.cur})[0];if(!c){c=mk();}return c;}
function mk(){var c={id:String(Date.now()),title:'New chat',msgs:[]};S.chats.unshift(c);S.cur=c.id;return c;}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function md(t){
 var codes=[];
 t=esc(t).replace(/```(\w*)\n?([\s\S]*?)(```|$)/g,function(_,l,c){codes.push('<div class="code"><div class="ch"><span>'+(l||'code')+'</span><button class="cp" type="button">Copy code</button></div><pre><code>'+c.replace(/\n$/,'')+'</code></pre></div>');return '\u0000'+(codes.length-1)+'\u0000';});
 t=t.replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*\n]*)\*/g,'$1<em>$2</em>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
 t=t.replace(/(?:^\|.*\|[ \t]*(?:\n|$))+/gm,function(blk){var rs=blk.trim().split('\n').filter(function(r){return !/^\|?[\s:|-]+\|?$/.test(r.trim());}).map(function(r){return r.trim().replace(/^\||\|$/g,'').split('|');});if(!rs.length)return blk;codes.push('<div class="tw"><table><thead><tr>'+rs[0].map(function(c){return '<th>'+c.trim()+'</th>';}).join('')+'</tr></thead><tbody>'+rs.slice(1).map(function(r){return '<tr>'+r.map(function(c){return '<td>'+c.trim()+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>');return '\u0000'+(codes.length-1)+'\u0000\n';});
 var out=[],ls=null;
 function end(){if(ls){out.push('</'+ls+'>');ls=null;}}
 t.split('\n').forEach(function(l){
  var m=l.match(/^\s*[-*•]\s+(.*)/),n=l.match(/^\s*\d+[.)]\s+(.*)/),h=l.match(/^#{1,4}\s+(.*)/);
  if(m||n){var k=m?'ul':'ol';if(ls!==k){end();out.push('<'+k+'>');ls=k;}out.push('<li>'+(m||n)[1]+'</li>');return;}
  end();
  if(/^\u0000\d+\u0000$/.test(l.trim()))out.push(l.trim());
  else if(h)out.push('<h4>'+h[1]+'</h4>');
  else if(/^&gt;/.test(l))out.push('<blockquote>'+l.replace(/^&gt;\s?/,'')+'</blockquote>');
  else if(/^\s*([-*_])\1{2,}\s*$/.test(l))out.push('<hr>');
  else if(l.trim()!=='')out.push('<p>'+l+'</p>');
 });
 end();
 return out.join('').replace(/\u0000(\d+)\u0000/g,function(_,i){return codes[i];});
}
function sc(){var c=$('chat');c.scrollTop=c.scrollHeight;}
function side(){
 var L=$('list');L.innerHTML='';var fq=($('srch').value||'').toLowerCase();
 S.chats.filter(function(c){return !fq||c.title.toLowerCase().indexOf(fq)>-1;}).forEach(function(c){
  var b=document.createElement('button');b.type='button';b.className='it'+(c.id===S.cur?' on':'');
  var s=document.createElement('span');s.textContent=c.title;s.dir='auto';
  var x=document.createElement('b');x.textContent='×';x.title='Delete';
  x.onclick=function(e){e.stopPropagation();if(busy)return;S.chats=S.chats.filter(function(z){return z!==c});if(S.cur===c.id)S.cur=S.chats[0]?S.chats[0].id:null;save();draw();};
  b.onclick=function(){if(busy)return;S.cur=c.id;save();document.body.classList.remove('open');draw();};
  var e=document.createElement('b');e.textContent='✎';e.title='Rename';e.onclick=function(ev){ev.stopPropagation();var nn=prompt('Rename chat',c.title);if(nn&&nn.trim()){c.title=nn.trim().slice(0,60);save();draw();}};b.appendChild(s);b.appendChild(e);b.appendChild(x);L.appendChild(b);
 });
}
function modes(){
 var M=$('modes');M.innerHTML='';
 Object.keys(MODES).forEach(function(k){var b=document.createElement('button');b.type='button';b.textContent=MODES[k][0];if(k===S.mode)b.className='on';b.onclick=function(){S.mode=k;save();modes();};M.appendChild(b);});
}
function draw(){
 var c=cur(),col=$('col');col.innerHTML='';$('ttl').textContent=c.title;$('exp').hidden=!(dl&&c.msgs.length);
 if(!c.msgs.length){
  var h=document.createElement('div');h.className='hero';
  h.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 96 96" role="img" aria-label="Askwise logo" style="display:block;margin:0 auto 14px;border-radius:18px;box-shadow:var(--shadow)"><rect width="96" height="96" rx="26" fill="#4338CA"/><rect x="20" y="22" width="56" height="42" rx="14" fill="#fff"/><path d="M30 60 L27 77 L46 63 Z" fill="#fff"/><path d="M48 30 C49 38 53 42 62 43 C53 44 49 48 48 56 C47 48 43 44 34 43 C43 42 47 38 48 30 Z" fill="#4338CA"/></svg><h2>What would you like to know?</h2><p>Ask about any topic — science, code, travel, health basics, homework and more.</p><div class="cards"></div>';
  IDEAS.forEach(function(i){var b=document.createElement('button');b.type='button';b.innerHTML='<small></small>';b.firstChild.textContent=i[0];b.appendChild(document.createTextNode(i[1]));b.onclick=function(){ask(i[1]);};h.lastChild.appendChild(b);});
  col.appendChild(h);
 }
 c.msgs.forEach(function(m,i){
  var bot=m.role==='assistant',d=document.createElement('div');d.className='row '+(bot?'bot':'user');
  d.innerHTML=(bot?'<div class="av">AI</div>':'<button class="eb" data-a="edit" data-i="'+i+'" type="button" title="Edit" aria-label="Edit message">✎</button>')+'<div class="bub"><div class="body" dir="auto"></div>'+(bot&&m.content&&!(busy&&i===c.msgs.length-1)?'<div class="acts"><button data-a="copy" data-i="'+i+'" type="button">Copy</button>'+(window.speechSynthesis?'<button data-a="say" data-i="'+i+'" type="button">Listen</button>':'')+(i===c.msgs.length-1?'<button data-a="regen" type="button">Regenerate</button>':'')+'</div>':'')+'</div>';
  var b=d.querySelector('.body');if(bot)b.innerHTML=m.content?md(m.content):'<span class="dots"><i></i><i></i><i></i></span>';else b.textContent=m.content;
  col.appendChild(d);
 });
 side();sc();
}
function copy(t,btn){
 function ok(){if(btn){var o=btn.textContent;btn.textContent='Copied';setTimeout(function(){btn.textContent=o;},1200);}}
 try{navigator.clipboard.writeText(t).then(ok,fb);}catch(e){fb();}
 function fb(){try{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();ok();}catch(e){}}
}
$('col').addEventListener('click',function(e){
 var t=e.target;
 if(t.classList.contains('cp')){copy(t.closest('.code').querySelector('code').textContent,t);return;}
 var a=t.getAttribute('data-a');if(!a)return;
 var c=cur();
 if(a==='copy')copy(c.msgs[+t.dataset.i].content,t);
 if(a==='say')say(c.msgs[+t.dataset.i].content);
 if(a==='edit'&&!busy)edit(c,+t.dataset.i,t);
 if(a==='regen'&&!busy){c.msgs.pop();ask(null);}
});
function say(t){if(!window.speechSynthesis)return;if(speechSynthesis.speaking){speechSynthesis.cancel();return;}var u=new SpeechSynthesisUtterance(t.replace(/```[\s\S]*?```/g,' ').replace(/[*#`>_|]/g,''));u.lang=/[\u0600-\u06FF]/.test(t)?'ur-PK':'en-US';speechSynthesis.speak(u);}
function edit(c,i,btn){var b=btn.closest('.row').querySelector('.body');b.textContent='';var ta=document.createElement('textarea');ta.className='ed';ta.dir='auto';ta.rows=3;ta.value=c.msgs[i].content;var bar=document.createElement('div');bar.className='edb';var ok=document.createElement('button');ok.type='button';ok.textContent='Save & send';ok.onclick=function(){var v=ta.value.trim();if(!v)return;c.msgs=c.msgs.slice(0,i);ask(v);};var no=document.createElement('button');no.type='button';no.textContent='Cancel';no.onclick=function(){draw();};bar.appendChild(ok);bar.appendChild(no);b.appendChild(ta);b.appendChild(bar);btn.hidden=true;ta.focus();}
function setBusy(v){busy=v;$('go').textContent=v?'■':'➤';$('go').setAttribute('aria-label',v?'Stop':'Send');}
async function ask(text){
 if(busy)return;
 var c=cur();
 if(text!==null){c.msgs.push({role:'user',content:text});if(c.title==='New chat')c.title=text.slice(0,42);}
 var m={role:'assistant',content:''};c.msgs.push(m);
 document.body.classList.remove('open');setBusy(true);draw();
 var body=$('col').lastChild.querySelector('.body');
 if(!sample){m.content='The AI isn’t available here. Open this page inside Claude and allow access.';}
 else{
  var hist=c.msgs.slice(0,-1).slice(-20);while(hist.length&&hist[0].role!=='user')hist.shift();
  var sys=BASE+(MODES[S.mode][1]?' '+MODES[S.mode][1]:'');
  var msgs=hist.map(function(x,i){return i===0?{role:x.role,content:sys+'\n\n'+x.content}:{role:x.role,content:x.content};});
  ctl=new AbortController();
  try{
   var r=await sample(msgs,{cache:false,signal:ctl.signal,onText:function(t){m.content=t.text;body.innerHTML=md(t.text);sc();}});
   m.content=r.text;
  }catch(e){
   if(e&&e.text)m.content=e.text;
   if(!m.content){
    if(e&&e.name==='AbortError'||ctl.signal.aborted){c.msgs.pop();}
    else m.content=(e&&e.code==='rate_limited')?'Too many requests right now. Please wait a moment and try again.':(e&&e.code==='not_granted')?'Access to the AI wasn’t granted, so I can’t answer.':'Something went wrong. Please try again.';
   }
  }
 }
 setBusy(false);save();draw();
}
$('f').addEventListener('submit',function(e){
 e.preventDefault();
 if(busy){if(ctl)ctl.abort();return;}
 var t=$('q').value.trim();if(!t)return;
 $('q').value='';$('q').style.height='auto';ask(t);
});
$('q').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('f').requestSubmit();}});
$('q').addEventListener('input',function(){var q=$('q');q.style.height='auto';q.style.height=Math.min(q.scrollHeight,150)+'px';});
$('new').onclick=function(){if(busy)return;var c=S.chats[0];if(!(c&&!c.msgs.length))mk();save();document.body.classList.remove('open');draw();$('q').focus();};
$('menu').onclick=function(){document.body.classList.toggle('open');};
$('ov').onclick=function(){document.body.classList.remove('open');};
function theme(){if(S.theme)document.documentElement.setAttribute('data-theme',S.theme);}
$('exp').onclick=async function(){
 var c=cur(),t='# '+c.title+'\n\n'+c.msgs.map(function(m){return '**'+(m.role==='user'?'You':'AI')+':**\n\n'+m.content;}).join('\n\n---\n\n');
 try{await dl.save({filename:'chat.md',data:t});}catch(e){}
};
theme();modes();draw();
sample=async function(msgs,o){
 var r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:msgs}),signal:o.signal});
 if(!r.ok){var er=new Error('http');er.code=r.status===429?'rate_limited':'error';throw er;}
 var rd=r.body.getReader(),dc=new TextDecoder(),acc='',buf='';
 for(;;){
  var x=await rd.read();if(x.done)break;
  buf+=dc.decode(x.value,{stream:true});
  var parts=buf.split('\n\n');buf=parts.pop();
  for(var k=0;k<parts.length;k++){
   var p=parts[k];if(p.indexOf('data: ')!==0)continue;
   var d=p.slice(6);if(d==='[DONE]')continue;
   var j;try{j=JSON.parse(d);}catch(e){continue;}
   if(j.error){var e2=new Error('stream');e2.code='error';throw e2;}
   if(j.t){acc+=j.t;o.onText({text:acc});}
  }
 }
 return {text:acc};
};
dl={save:function(o){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([o.data],{type:'text/markdown'}));a.download=o.filename;document.body.appendChild(a);a.click();a.remove();return Promise.resolve();}};
draw();
var tt;
function toast(msg){var t=$('toast');t.textContent=msg;t.classList.remove('show');void t.offsetWidth;t.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('show');},2200);}
$('thm').onclick=function(){var cu=S.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'),o=['light','dark','black'];S.theme=o[(o.indexOf(cu)+1)%3];theme();save();$('thm').title='Theme: '+S.theme;
 toast({light:'☀️ Welcome to Light theme',dark:'🌙 Welcome to Dark theme',black:'🖤 Welcome to Black theme'}[S.theme]);};
function fsz(){document.body.style.fontSize=(S.fs||16)+'px';}fsz();
$('fs').onclick=function(){var z=[15,16,18,20];S.fs=z[(z.indexOf(S.fs)+1)%4];fsz();save();};
$('srch').addEventListener('input',side);
var chatEl=$('chat');
chatEl.addEventListener('scroll',function(){$('dn').classList.toggle('show',chatEl.scrollHeight-chatEl.scrollTop-chatEl.clientHeight>240);},{passive:true});
$('dn').onclick=sc;
document.addEventListener('keydown',function(e){
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('new').click();}
 else if(e.key==='Escape'&&busy&&ctl)ctl.abort();
 else if(e.key==='/'&&!/^(TEXTAREA|INPUT)$/.test(document.activeElement.tagName)){e.preventDefault();$('q').focus();}
});
var SR=window.SpeechRecognition||window.webkitSpeechRecognition,rec=null,hear=false;
if(SR){
 $('mic').hidden=false;$('vl').hidden=false;
 function vl(){$('vl').textContent=S.vl==='ur-PK'?'اردو':'EN';}vl();
 $('vl').onclick=function(){S.vl=S.vl==='ur-PK'?'en-US':'ur-PK';vl();save();};
 $('mic').onclick=function(){
  if(hear){rec.stop();return;}
  rec=new SR();rec.lang=S.vl||'en-US';rec.interimResults=true;var base=$('q').value;
  rec.onresult=function(e){var s='';for(var i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;$('q').value=(base?base+' ':'')+s;$('q').dispatchEvent(new Event('input'));};
  rec.onstart=function(){hear=true;$('mic').classList.add('rec');};
  rec.onend=function(){hear=false;$('mic').classList.remove('rec');};
  rec.onerror=function(){};
  rec.start();
 };
}
})();