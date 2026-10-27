// Stationary invader target practice
(()=>{
  const c=document.getElementById('game'),ctx=c.getContext('2d'),status=document.getElementById('game-status'),hull=document.getElementById('hull'),restart=document.getElementById('restart'),portfolio=document.getElementById('portfolio');
  let W=900,H=420,keys={},bullets=[],enemyShots=[],particles=[],frame=0,dead=false,won=false,lives=3,pointerX=null;
  const player={x:W/2,y:H-45,r:15,speed:6},boss={x:W/2,y:78,r:28,vx:2.5,hp:3,max:3};
  function resize(){const rect=c.getBoundingClientRect(),dpr=devicePixelRatio||1;c.width=W*dpr;c.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
  new ResizeObserver(resize).observe(c);resize();
  function reset(){bullets=[];enemyShots=[];particles=[];frame=0;dead=false;won=false;lives=3;player.x=W/2;boss.x=W/2;boss.vx=2.5;boss.hp=boss.max;status.textContent='ACTIVE';hull.textContent='3 / 3';restart.classList.add('hidden');portfolio.classList.remove('open');portfolio.inert=true;portfolio.setAttribute('aria-hidden','true')}
  restart.onclick=reset;
  function burst(x,y,color,n=32,bright=false){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=Math.random()*(bright?8:4)+(bright?2:1);particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:(bright?55:40)+Math.random()*25,color:i%2?'#67e8f9':color,r:Math.random()*(bright?5:3)+1})}}
  function hit(a,b,r){return Math.hypot(a.x-b.x,a.y-b.y)<r}
  function drawShip(x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle='#67e8f9';ctx.shadowColor='#22d3ee';ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(14,14);ctx.lineTo(0,8);ctx.lineTo(-14,14);ctx.closePath();ctx.fill();ctx.restore()}
  function drawBoss(){ctx.save();ctx.translate(boss.x,boss.y);ctx.shadowColor='#c084fc';ctx.shadowBlur=24;ctx.fillStyle='#a855f7';ctx.strokeStyle='#e9d5ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-36,-9);ctx.lineTo(-22,-22);ctx.lineTo(-11,-15);ctx.lineTo(0,-25);ctx.lineTo(11,-15);ctx.lineTo(22,-22);ctx.lineTo(36,-9);ctx.lineTo(30,12);ctx.lineTo(14,20);ctx.lineTo(0,15);ctx.lineTo(-14,20);ctx.lineTo(-30,12);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#020617';ctx.fillRect(-18,-4,9,6);ctx.fillRect(9,-4,9,6);ctx.fillStyle='#f0abfc';ctx.fillRect(-boss.r,-37,boss.r*2,4);ctx.fillStyle='#67e8f9';ctx.fillRect(-boss.r,-37,boss.r*2*(boss.hp/boss.max),4);ctx.restore()}
  function drawVictory(){
    const x=115,y=H/2-66,w=W-230,h=132,hover=frame%120<60;
    ctx.save();ctx.fillStyle='rgba(2,6,23,.82)';ctx.strokeStyle='rgba(103,232,249,.9)';ctx.lineWidth=2;ctx.shadowColor='#22d3ee';ctx.shadowBlur=28;
    ctx.beginPath();ctx.roundRect(x,y,w,h,14);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    ctx.textAlign='center';ctx.fillStyle='#e9d5ff';ctx.font='bold 23px Orbitron, sans-serif';ctx.fillText('GateKeeper Defeated!',W/2,y+39);
    ctx.fillStyle='#67e8f9';ctx.font='600 14px Orbitron, sans-serif';ctx.fillText('Experience Unlocked',W/2,y+66);
    ctx.fillStyle='#a5f3fc';ctx.font='bold 21px sans-serif';ctx.fillText('↓',W/2,y+91+(hover?5:0));
    ctx.font='12px Orbitron, sans-serif';ctx.fillText('Scroll Down to View Mission Logs',W/2,y+115);ctx.restore();
  }
  function loop(){
    requestAnimationFrame(loop);frame++;ctx.clearRect(0,0,W,H);ctx.fillStyle='#020617';ctx.fillRect(0,0,W,H);
    for(let i=0;i<65;i++){const sx=(i*137+frame*(i%3*.15+.08))%W,sy=(i*79)%H;ctx.fillStyle='#c4b5fd66';ctx.fillRect(sx,sy,1.5,1.5)}
    if(!dead&&!won){if(keys.ArrowLeft||keys.a||keys.A)player.x-=player.speed;if(keys.ArrowRight||keys.d||keys.D)player.x+=player.speed;if(pointerX!==null)player.x+=(pointerX-player.x)*.2;player.x=Math.max(20,Math.min(W-20,player.x));
      if(frame%13===0&&(keys[' ']||keys.Space))bullets.push({x:player.x,y:player.y-15,v:8});for(const b of bullets)b.y-=b.v;bullets=bullets.filter(b=>b.y>-10);enemyShots=enemyShots.filter(e=>e.y<H+10);
      for(let i=bullets.length-1;i>=0;i--)if(hit(bullets[i],boss,30)){bullets.splice(i,1);boss.hp--;burst(boss.x,boss.y,'#e879f9',4);if(boss.hp<=0){won=true;bullets=[];enemyShots=[];status.textContent='CLEARED';burst(boss.x,boss.y,'#c084fc',150,true);portfolio.inert=false;portfolio.setAttribute('aria-hidden','false');portfolio.classList.add('open')}}
      for(let i=enemyShots.length-1;i>=0;i--)if(hit(enemyShots[i],player,17)){enemyShots.splice(i,1);lives--;hull.textContent='♥ '.repeat(lives)||'—';burst(player.x,player.y,'#fb7185',18);if(lives<=0){dead=true;status.textContent='HULL BREACH';restart.classList.remove('hidden')}}
    }
    if(!won&&!dead)drawBoss();drawShip(player.x,player.y);
    if(!won){ctx.fillStyle='#67e8f9';for(const b of bullets){ctx.shadowColor='#22d3ee';ctx.shadowBlur=14;ctx.fillRect(b.x-2,b.y-8,4,12)}}ctx.shadowBlur=0;
    for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vx*=.98;p.vy*=.98;p.life--;ctx.globalAlpha=Math.max(0,p.life/60);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=12;ctx.fillRect(p.x,p.y,p.r,p.r)}ctx.globalAlpha=1;ctx.shadowBlur=0;particles=particles.filter(p=>p.life>0);
    if(won)drawVictory();else if(dead){ctx.fillStyle='#020617aa';ctx.fillRect(0,H/2-28,W,56);ctx.fillStyle='#fda4af';ctx.font='bold 19px Orbitron';ctx.textAlign='center';ctx.fillText('SHIP DISABLED - RETRY',W/2,H/2+7)}
  }loop();
  c.addEventListener('click',e=>{if(!won)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H;if(x>115&&x<W-115&&y>H/2-66&&y<H/2+66)document.getElementById('skills').scrollIntoView({ behavior: 'smooth' })});
  addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys[e.key]=true});addEventListener('keyup',e=>keys[e.key]=false);
  function movePointer(e){const r=c.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width*W}c.addEventListener('pointermove',movePointer);c.addEventListener('pointerleave',()=>pointerX=null);c.addEventListener('pointerdown',e=>{movePointer(e);keys[' ']=true});c.addEventListener('pointerup',()=>keys[' ']=false);
  function hold(id,key){const b=document.getElementById(id);b.addEventListener('pointerdown',e=>{e.preventDefault();keys[key]=true});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>keys[key]=false))}hold('leftTouch','ArrowLeft');hold('rightTouch','ArrowRight');hold('fireTouch',' ');
})();
