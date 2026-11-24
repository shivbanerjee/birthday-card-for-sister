(()=>{
"use strict";
/* Birthday music is embedded below (starts only after a tap; use the ♪ button to mute). */
const MUSIC_SRC = "assets/birthday-music.mp3";

const $ = s => document.querySelector(s);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pages = {1:$("#p1"),2:$("#p2"),3:$("#p3")};
let cur = 1, level = 1, busy = false;

/* ---------- particles ---------- */
const cv = $("#fx"), cx = cv.getContext("2d");
let W=0,H=0,dpr=1; const P=[]; const MAX = reduce ? 0 : (innerWidth<700 ? 55 : 110);
const cols = ["#ffc2d4","#ff9fbd","#ffd9e5","#f7b3c8","#ffffff"];
const rnd=(a,b)=>a+Math.random()*(b-a);
function size(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener("resize",size);size();
function add(t,x,y,o={}){
  if(P.length>=MAX+(o.burst?40:0))return;
  P.push(Object.assign({t,x,y,s:rnd(7,15),r:rnd(0,6.28),vr:rnd(-.03,.03),vx:rnd(-.4,.4),vy:t==="h"?rnd(-1.5,-.7):rnd(.6,1.4),
    a:1,c:cols[(Math.random()*cols.length)|0],ph:rnd(0,6.28),life:t==="s"?rnd(50,100):9999,age:0},o));
}
function draw(p){
  cx.save();cx.translate(p.x,p.y);cx.rotate(p.r);cx.globalAlpha=Math.max(0,p.a);const s=p.s;
  if(p.t==="p"){cx.fillStyle=p.c;cx.beginPath();cx.moveTo(0,-s);cx.bezierCurveTo(s*.8,-s*.5,s*.6,s*.6,0,s);cx.bezierCurveTo(-s*.6,s*.6,-s*.8,-s*.5,0,-s);cx.fill()}
  else if(p.t==="h"){cx.fillStyle="#ff7fa6";cx.beginPath();cx.moveTo(0,s*.35);cx.bezierCurveTo(-s*.9,-s*.2,-s*.4,-s*.8,0,-s*.3);cx.bezierCurveTo(s*.4,-s*.8,s*.9,-s*.2,0,s*.35);cx.fill()}
  else{const k=Math.sin(p.age/p.life*Math.PI);cx.globalAlpha=k;cx.fillStyle="#fff";cx.shadowColor="#ffb3cc";cx.shadowBlur=10;
    cx.beginPath();for(let i=0;i<8;i++){const rr=i%2?s*.18:s*.6;cx.lineTo(Math.cos(i*Math.PI/4)*rr,Math.sin(i*Math.PI/4)*rr)}cx.fill()}
  cx.restore();
}
let last=0;
function tick(ts){
  requestAnimationFrame(tick);
  if(document.hidden||reduce)return;
  if(ts-last<28)return; last=ts; // ~35fps keeps phones cool
  cx.clearRect(0,0,W,H);
  if(Math.random()<.07*level)add("p",rnd(0,W),-20);
  if(Math.random()<.09*level)add("s",rnd(0,W),rnd(0,H),{s:rnd(6,12)});
  if(level>=3&&Math.random()<.12)add("h",rnd(0,W),H+20);
  for(let i=P.length-1;i>=0;i--){const p=P[i];
    p.age++;p.ph+=.03;p.x+=p.vx+(p.t==="s"?0:Math.sin(p.ph)*.5);p.y+=p.vy;p.r+=p.vr;
    if(p.t==="h")p.a=Math.min(1,p.y/(H*.35));
    if(p.y>H+30||p.y<-40||p.age>p.life){P.splice(i,1);continue}
    draw(p)}
}
requestAnimationFrame(tick);
function burst(n,type){if(reduce)return;for(let i=0;i<n;i++)add(type||(Math.random()<.5?"p":"s"),rnd(0,W),rnd(-20,H*.6),{burst:1,vy:rnd(1,2.8),s:rnd(8,16)})}

/* ---------- page switching ---------- */
function go(n){
  const from=pages[cur],to=pages[n];
  from.classList.remove("on");from.inert=true;
  to.inert=false;to.classList.add("on");
  cur=n;document.body.dataset.page=n;
  if(n===3){level=2;setTimeout(()=>{$("#hb").classList.add("in");observe()},700);$("#scroll").scrollTop=0}
}
function flash(){const f=$("#flash");f.classList.add("on");setTimeout(()=>f.classList.remove("on"),260)}

/* ---------- page 1 ---------- */
const noMsgs=["Oops! I think you’re Udita! Try again! 🌸","Hehe, are you sure? I think it’s you, Didi 🌷","Nice try! The surprise is only for Udita… that’s you! 💗"];
let noCount=0;
$("#no").addEventListener("click",e=>{
  const b=e.currentTarget,o=$("#oops");
  o.classList.remove("show");void o.offsetWidth;o.textContent=noMsgs[noCount%noMsgs.length];o.classList.add("show");
  b.classList.remove("wobble");void b.offsetWidth;b.classList.add("wobble");
  noCount++;const y=$("#yes");y.style.transform="scale("+Math.min(1.32,1+noCount*.08)+")";
  burst(6,"h");
});
$("#yes").addEventListener("click",()=>{
  if(busy)return;busy=true;
  startMusic();level=2;burst(40,"p");
  setTimeout(()=>{go(2);busy=false},600);
});
$("#cont").addEventListener("click",()=>{
  if(busy)return;busy=true;
  level=3;burst(30,"s");flash();
  setTimeout(()=>{go(3);busy=false},500);
});

/* ---------- page 3 ---------- */
let io;
function observe(){
  const els=document.querySelectorAll("#scroll .rv");
  if(!("IntersectionObserver" in window)||reduce){els.forEach(e=>e.classList.add("in"));return}
  if(io)io.disconnect();
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{root:$("#scroll"),threshold:.2});
  els.forEach((e,i)=>{e.style.transitionDelay=(i*0.15)+"s";io.observe(e)});
}

/* ---------- music ---------- */
let audio=null;const mb=$("#music");
if(MUSIC_SRC){
  audio=new Audio(MUSIC_SRC);audio.loop=true;audio.volume=.55;audio.preload="none";
  audio.addEventListener("error",()=>{mb.hidden=true;mb.style.display="none"});
  mb.hidden=false;mb.style.display="block";
}
let muted=false,started=false;
function startMusic(){if(!audio||started||muted)return;started=true;audio.play().then(()=>{mb.textContent="♪";mb.setAttribute("aria-pressed","true")}).catch(()=>{started=false})}
mb.addEventListener("click",()=>{
  if(!audio)return;
  if(audio.paused){muted=false;audio.play().then(()=>{started=true;mb.textContent="♪";mb.setAttribute("aria-pressed","true")}).catch(()=>{})}
  else{audio.pause();muted=true;mb.textContent="✕";mb.setAttribute("aria-pressed","false")}
});
})();
