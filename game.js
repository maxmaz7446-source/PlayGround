import * as THREE from 'three';

const $=s=>document.querySelector(s);
const canvas=$('#game-canvas');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9ca99e);
scene.fog=new THREE.Fog(0x9ca99e,170,690);
const camera=new THREE.PerspectiveCamera(56,innerWidth/innerHeight,.1,1100);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
scene.add(new THREE.HemisphereLight(0xdbe7ed,0x444943,2));
const sun=new THREE.DirectionalLight(0xffe1b4,3.2);
sun.position.set(-120,190,90);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-160;sun.shadow.camera.right=160;sun.shadow.camera.top=160;sun.shadow.camera.bottom=-160;scene.add(sun);
const mat=(color,rough=.8,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const mats={ground:mat(0x657963),road:mat(0x343a3b),side:mat(0xb3a99a),line:mat(0xd4c59d),glass:mat(0x283a40,.28,.4),leaf:mat(0x405e4c),trunk:mat(0x594638),white:mat(0xd3cfc3),gold:mat(0xd4a753,.36,.4)};
function box(parent,w,h,d,material,x,y,z,cast=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o}
function cylinder(parent,r1,r2,h,material,x,y,z,segments=8){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
function seeded(seed){let s=seed|0;return()=>{s=(s*1664525+1013904223)|0;return(s>>>0)/4294967296}}
const world=new THREE.Group();scene.add(world);
const landmarks=[],cars=[],npcs=[];
box(world,1100,.22,1100,mats.ground,0,-.25,0,false);
// Streets, sidewalks and lane markings repeat across one continuous 1km city.
for(let v=-500;v<=500;v+=100){
 box(world,16,.035,1100,mats.road,v,.005,0,false);box(world,3,.04,1100,mats.side,v-9,.01,0,false);box(world,3,.04,1100,mats.side,v+9,.01,0,false);
 box(world,1100,.035,16,mats.road,0,.006,v,false);box(world,1100,.04,3,mats.side,0,.01,v-9,false);box(world,1100,.04,3,mats.side,0,.01,v+9,false);
 if(v%200===0){for(let z=-480;z<500;z+=26)box(world,1.2,.045,10,mats.line,v,.04,z,false);for(let x=-480;x<500;x+=26)box(world,10,.045,1.2,mats.line,x,.04,v,false)}
}
const colors=[0x747b79,0x8c8580,0x727d7b,0x958c7c,0x656e70,0x9a8873,0x777e70,0x777477];
for(let ix=-4;ix<=4;ix++)for(let iz=-4;iz<=4;iz++){
 const bx=ix*100,bz=iz*100,r=seeded((ix+8)*997+(iz+8)*71+43);
 if(Math.abs(bx)<60&&Math.abs(bz)<60)continue;
 const downtown=Math.abs(bx)<160&&Math.abs(bz)<160;
 for(let j=0;j<(downtown?3:2);j++){
  const x=bx+(r()-.5)*53,z=bz+(r()-.5)*53,w=17+r()*20,d=18+r()*18;
  let h=downtown?26+r()*88:12+r()*37;if(ix>2&&iz>2)h*=.55;
  const color=colors[Math.floor(r()*colors.length)],g=new THREE.Group();world.add(g);
  box(g,w,h,d,mat(color),0,h/2,0);
  if(h>45){box(g,w*.7,2,d*.7,mat(color-0x080808),0,h+1,0);box(g,w*.35,5,d*.35,mat(color-0x101010),0,h+4,0)}
  const levels=Math.min(8,Math.floor(h/5));
  for(let k=0;k<levels;k++){const yy=3+k*(h/levels),wm=mat(r()>.12?0x9caaa2:0xb1a778,.4,.1);box(g,w*.77,.65,.11,wm,0,yy,d/2+.065,false);box(g,.11,.65,d*.72,wm,w/2+.065,yy,0,false)}
  g.position.set(x,0,z);
 }
 if((ix+iz)%3===0){const tx=bx+38,tz=bz+34;cylinder(world,.35,.48,5,mats.trunk,tx,2.5,tz,6);const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(3.2,1),mats.leaf);crown.position.set(tx,6,tz);crown.castShadow=true;world.add(crown)}
}
function landmark(x,z,w,d,h,color,label){const group=new THREE.Group();world.add(group);box(group,w,h,d,mat(color),x,h/2,z);box(group,w*.58,1.1,.5,mats.gold,x,h+1,z+d/2+.3);landmarks.push({x,z,label,group});}
landmark(-195,-95,54,38,27,0x596a70,'POLICE');landmark(205,-195,50,45,33,0xe3ded1,'HOSPITAL');landmark(395,-395,96,55,17,0x777d78,'AIRPORT');landmark(-395,295,75,47,14,0xb7a58d,'BEACH CLUB');landmark(195,205,61,44,22,0x887d70,'MALL');landmark(-295,195,54,42,18,0x716c5e,'GARAGE');landmark(295,95,58,50,23,0x797d74,'WORKS');
const sea=new THREE.Mesh(new THREE.PlaneGeometry(420,1100),mat(0x426b76,.3,.1));sea.rotation.x=-Math.PI/2;sea.position.set(-760,-.4,0);scene.add(sea);
for(let i=0;i<15;i++){const peak=new THREE.Mesh(new THREE.ConeGeometry(38+Math.random()*35,55+Math.random()*75,5),mat(i%2?0x5c6e63:0x6a7868));peak.position.set(-470+i*70,-2,-550-Math.random()*70);peak.rotation.y=Math.random()*2;scene.add(peak)}
function makeCar(x,z,color=0x9d4534,type='sedan'){
 const root=new THREE.Group();world.add(root);root.position.set(x,.12,z);const body=mat(color,.42,.3),dark=mat(0x202729,.35,.5),glass=mat(0x334a50,.22,.35);
 const dims=type==='van'?[2.25,1.4,4.7]:type==='sport'?[2.05,.72,4.2]:[2.05,1.05,4];
 box(root,dims[0],dims[1],dims[2],body,0,.78,0);box(root,dims[0]*.78,.65,dims[2]*.43,glass,0,1.48,-.08);
 box(root,dims[0]*.88,.12,.17,mats.white,0,.58,dims[2]/2+.01,false);
 const wheels=[];for(const xx of [-dims[0]/2-.03,dims[0]/2+.03])for(const zz of [-dims[2]*.3,dims[2]*.3]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.37,.37,.22,12),dark);wheel.rotation.z=Math.PI/2;wheel.position.set(xx,.38,zz);wheel.castShadow=true;root.add(wheel);wheels.push(wheel)}
 const car={root,wheels,speed:0,heading:Math.PI, type};cars.push(car);return car
}
const vehicleColors=[0x9e4b38,0x576a78,0xc4a66a,0x34453f,0x7d7772,0xaab5b0];
for(let i=0;i<24;i++){let x,z;if(i<12){x=(i%2?1:-1)*(12+Math.floor(i/2)*15);z=-20+Math.floor(i/2)*48}else{x=-460+Math.random()*920;z=Math.round((-460+Math.random()*920)/100)*100+(Math.random()>.5?12:-12)}const c=makeCar(x,z,vehicleColors[i%vehicleColors.length],i%7===0?'sport':i%9===0?'van':'sedan');c.root.rotation.y=i%2?0:Math.PI;c.heading=i%2?Math.PI:0}
const characters=[
 {name:'Alex Carter',role:'WHEELMAN',color:0xb96542,coat:0x263c3c},
 {name:'Ryan Blake',role:'VETERAN',color:0x9b7854,coat:0x47554d},
 {name:'Daniel Brooks',role:'DEALMAKER',color:0xd5a45f,coat:0x354554}
];
const players=characters.map((c,i)=>{const g=new THREE.Group();world.add(g);g.position.set(i===0?0:4,.04,37+i*2);const skin=mat(c.color),coat=mat(c.coat),pants=mat(i===1?0x303a39:0x252b30);cylinder(g,.34,.45,1.05,coat,0,1.15,0,8);const head=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),skin);head.position.y=1.88;head.castShadow=true;g.add(head);box(g,.58,.18,.28,mat(0x282522),0,2.1,0);const leg1=cylinder(g,.14,.17,.76,pants,-.19,.47,0,7),leg2=cylinder(g,.14,.17,.76,pants,.19,.47,0,7);leg1.rotation.z=-.08;leg2.rotation.z=.08;const arm1=cylinder(g,.12,.16,.78,coat,-.42,1.19,0,7),arm2=cylinder(g,.12,.16,.78,coat,.42,1.19,0,7);arm1.rotation.z=-.1;arm2.rotation.z=.1;g.visible=i===0;return{group:g,meta:c,heading:Math.PI}});

const missionSeeds=[
 ['A FAMILIAR FACE','Meet Mara at the old tram depot. She says she has a way out.','OLD TRAM DEPOT',-32,72],
 ['THE LONG WAY HOME','Get Ryan across the river before the streets lock down.','RIVER LOOKOUT',82,-145],
 ['CLEAN HANDS','Daniel needs a quiet conversation at the market.','NIGHT MARKET',128,82],
 ['A SMALL FAVOR','Pick up a package from the old quarter. No questions.','OLD QUARTER',-118,34],
 ['COLD STORAGE','Find the night manager at the harbor warehouses.','HARBOR',-298,-168],
 ['OPEN TAB','Settle an old debt on the east side.','EASTSIDE',238,-38],
 ['LAST TRAIN','Check the abandoned tram line after midnight.','TRAM YARD',-62,214],
 ['SAFE PASSAGE','Take a friend to the hills without drawing a crowd.','HILLSIDE',338,-315],
 ['THE SWITCH','Meet the crew where the power lines cross.','POWER STATION',296,136],
 ['NARROW WINDOW','A witness will talk if you arrive before sunrise.','MOTEL ROW',-185,218],
 ['NO LOOSE ENDS','Recover a lost ledger from a garage locker.','AUTO ROW',-286,184],
 ['BLUE HOUR','Keep a low profile while crossing downtown.','CITY HALL',24,-118],
 ['GOOD NEIGHBORS','Deliver supplies to the block before the rain.','SOUTH MARKET',116,283],
 ['SECOND CHANCE','Make the call you have been putting off.','LOOKOUT POINT',-338,322],
 ['HARD EVIDENCE','A camera caught more than it should have.','CANAL WALK',206,336],
 ['THE LONG GAME','Mara has a lead on the people behind it all.','OLD TRAM DEPOT',-32,72]
];
const missionList=Array.from({length:54},(_,i)=>{const s=missionSeeds[i%missionSeeds.length],round=Math.floor(i/missionSeeds.length);return{title:round?`${s[0]} ${['II','III','IV'][Math.min(round-1,2)]}`:s[0],desc:round?`${s[1]} The crew needs you back for another pass.`:s[1],place:s[2],x:s[3]+(round%2?34:-12),z:s[4]+round*23,reward:380+((i*173)%920),type:i<16?'STORY':i<38?'CREW JOB':'SIDE JOB'}});
let missionIndex=0,missionActive=false,cash=2450,heat=0,current=0,vehicle=null,night=false,rain=false,quality='Balanced',noticeTimer=0,toastTimer=0,elapsed=0;
const player=players[0].group;
const marker=new THREE.Group();scene.add(marker);const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,.15,8,36),mats.gold);ring.rotation.x=Math.PI/2;ring.position.y=.2;marker.add(ring);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.15,.55,5,12,1,true),new THREE.MeshBasicMaterial({color:0xe9b657,transparent:true,opacity:.2,side:THREE.DoubleSide}));beam.position.y=2.7;marker.add(beam);marker.visible=false;
const ui={};['mission-type','mission-title','mission-desc','mission-count','mission-action','cash','speed','speedometer','district','street','toast','message','modal','loading','clock','weather-icon','weather-text','condition-copy','save-copy','wanted','minimap','quality-select'].forEach(id=>ui[id]=document.getElementById(id));
function notify(text){ui.message.textContent=text;ui.message.classList.add('show');noticeTimer=2.6}
function showToast(title,sub){ui.toast.querySelector('b').textContent=title;ui.toast.querySelector('small').textContent=sub;ui.toast.classList.add('show');toastTimer=3.2}
function refreshMission(){const m=missionList[missionIndex];ui['mission-type'].textContent=`${m.type} · ${characters[current].name.toUpperCase()}`;ui['mission-title'].textContent=m.title;ui['mission-desc'].textContent=m.desc;ui['mission-count'].textContent=String(missionIndex+1).padStart(2,'0');ui['mission-action'].innerHTML=missionActive?'JOB TRACKED <span>✓</span>':'TRACK JOB <span>↗</span>';marker.position.set(m.x,.1,m.z);marker.visible=missionActive;}
function setCharacter(n){if(n<0||n>2||n===current)return;players[current].group.visible=false;current=n;players[current].group.visible=!vehicle;refreshMission();document.querySelectorAll('.char-card').forEach((el,i)=>el.classList.toggle('active',i===current));notify(`${characters[current].name.toUpperCase()} · ${characters[current].role}`)}
function switchCharacter(){if(vehicle){notify('Exit your vehicle before switching');return}setCharacter((current+1)%3)}
function nearCar(){let best=null,dist=5;for(const c of cars){const d=c.root.position.distanceTo(player.position);if(d<dist){best=c;dist=d}}return best}
function interact(){if(vehicle){const exitPos=vehicle.root.localToWorld(new THREE.Vector3(2,.04,0));vehicle.speed=0;vehicle.root.remove(player);world.add(player);player.position.copy(exitPos);vehicle=null;players[current].group.visible=true;notify('You stepped out');return}const c=nearCar();if(c){vehicle=c;players[current].group.visible=false;c.root.add(player);player.position.set(0,0,0);notify(`${c.type.toUpperCase()} · E to leave`);return}const m=missionList[missionIndex],d=Math.hypot(player.position.x-m.x,player.position.z-m.z);if(missionActive&&d<10){missionActive=false;cash+=m.reward;heat=Math.min(5,heat+(missionIndex%3===0?1:0));missionIndex=(missionIndex+1)%missionList.length;ui.cash.textContent=`$ ${cash.toLocaleString()}`;refreshMission();showToast('JOB COMPLETE',`+$${m.reward.toLocaleString()} · New lead added to your map`);return}if(!missionActive){notify('Track the job first, then head to its marker');return}if(d<11){interact();return}notify(d<24?'Get closer to the gold marker':'No interaction nearby · Follow the gold marker')}
function startMission(){missionActive=!missionActive;refreshMission();if(missionActive)showToast('JOB TRACKED',`Head to ${missionList[missionIndex].place}`);else notify('Job tracking paused')}
ui['mission-action'].addEventListener('click',startMission);
document.querySelectorAll('.char-card').forEach(el=>el.addEventListener('click',()=>setCharacter(Number(el.dataset.char))));
const modal=$('#modal');function toggleModal(open=!modal.classList.contains('hidden')){modal.classList.toggle('hidden',!open)}
$('#settings-btn').addEventListener('click',()=>toggleModal(true));$('#close-modal').addEventListener('click',()=>toggleModal(false));modal.addEventListener('click',e=>{if(e.target===modal)toggleModal(false)});
$('#time-toggle').addEventListener('click',()=>{night=!night;scene.background.set(night?0x273440:0x9ca99e);scene.fog.color.set(night?0x273440:0x9ca99e);sun.intensity=night?0.48:3.2;sun.color.set(night?0x9eb8ff:0xffe1b4);ui.clock.textContent=night?'23:16':'18:42';notify(night?'Night falls over San Verona':'Daylight returns to San Verona')});
$('#weather-toggle').addEventListener('click',()=>{rain=!rain;ui['weather-icon'].textContent=rain?'☂':'☀';ui['weather-text'].textContent=rain?'LIGHT RAIN':'CLEAR';$('#condition-copy').textContent=rain?'Light rain':'Clear skies';renderer.toneMappingExposure=rain?.92:1.12;notify(rain?'Light rain moving in':'The skies are clearing')});
ui['quality-select'].addEventListener('change',e=>{quality=e.target.value;const scale=quality==='Low'?.85:quality==='High'?1.5:1.15;renderer.setPixelRatio(Math.min(devicePixelRatio,scale));renderer.shadowMap.enabled=quality!=='Low';renderer.setSize(innerWidth,innerHeight);notify(`${quality} graphics enabled`)});
$('#save-button').addEventListener('click',()=>{const save={x:player.position.x,z:player.position.z,current,missionIndex,missionActive,cash,night,rain};localStorage.setItem('city-of-crime-save',JSON.stringify(save));ui['save-copy'].textContent='Saved just now';notify('Progress saved on this device')});
try{const save=JSON.parse(localStorage.getItem('city-of-crime-save')||'null');if(save){player.position.set(save.x||0,.04,save.z||37);current=Math.max(0,Math.min(2,save.current||0));missionIndex=Math.max(0,Math.min(53,save.missionIndex||0));missionActive=!!save.missionActive;cash=save.cash||2450;night=!!save.night;rain=!!save.rain;players.forEach((p,i)=>p.group.visible=i===current);ui.cash.textContent=`$ ${cash.toLocaleString()}`;if(night){scene.background.set(0x273440);scene.fog.color.set(0x273440);sun.intensity=.48;ui.clock.textContent='23:16'}if(rain){ui['weather-icon'].textContent='☂';ui['weather-text'].textContent='LIGHT RAIN';$('#condition-copy').textContent='Light rain'}document.querySelectorAll('.char-card').forEach((el,i)=>el.classList.toggle('active',i===current));refreshMission()}}catch(e){console.warn('Could not load local save',e)}
const keys=new Set();let moveInput={x:0,y:0},sprinting=false,jumpTime=0,cameraYaw=0,cameraPitch=.12,camDistance=9.6,lookPointer=null,lastLook={x:0,y:0};
window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.repeat)return;if(e.key.toLowerCase()==='e')interact();if(e.key.toLowerCase()==='q')switchCharacter();if(e.key==='Escape')toggleModal(true);if(e.key.toLowerCase()==='m')notify('GPS · Gold marker is tracked on your map');if(e.key===' '&&!vehicle)jumpTime=.34;if(e.key>='1'&&e.key<='3')setCharacter(Number(e.key)-1)});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>{keys.clear();moveInput={x:0,y:0};sprinting=false});
$('#touch-switch').addEventListener('pointerdown',e=>{e.preventDefault();switchCharacter()});$('#touch-interact').addEventListener('pointerdown',e=>{e.preventDefault();interact()});$('#touch-jump').addEventListener('pointerdown',e=>{e.preventDefault();if(!vehicle)jumpTime=.34});const sprintButton=$('#touch-sprint');sprintButton.addEventListener('pointerdown',e=>{e.preventDefault();sprinting=true;sprintButton.classList.add('pressed')});for(const ev of ['pointerup','pointercancel','pointerleave'])sprintButton.addEventListener(ev,()=>{sprinting=false;sprintButton.classList.remove('pressed')});
const stickZone=$('#stick-zone'),stickKnob=$('#stick-knob');let stickPointer=null;stickZone.addEventListener('pointerdown',e=>{stickPointer=e.pointerId;stickZone.setPointerCapture(e.pointerId);updateStick(e)});stickZone.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)updateStick(e)});function updateStick(e){const r=stickZone.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),lim=r.width*.36,len=Math.hypot(dx,dy),k=len>lim?lim/len:1;moveInput={x:dx*k/lim,y:dy*k/lim};stickKnob.style.transform=`translate(${dx*k}px,${dy*k}px)`}function releaseStick(){stickPointer=null;moveInput={x:0,y:0};stickKnob.style.transform='translate(0,0)'}for(const ev of ['pointerup','pointercancel','lostpointercapture'])stickZone.addEventListener(ev,releaseStick);
const lookZone=$('#look-zone');lookZone.addEventListener('pointerdown',e=>{lookPointer=e.pointerId;lookZone.setPointerCapture(e.pointerId);lastLook={x:e.clientX,y:e.clientY}});lookZone.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer)return;cameraYaw-=(e.clientX-lastLook.x)*.006;cameraPitch=THREE.MathUtils.clamp(cameraPitch+(e.clientY-lastLook.y)*.004,-.18,.72);lastLook={x:e.clientX,y:e.clientY}});lookZone.addEventListener('pointerup',()=>lookPointer=null);lookZone.addEventListener('pointercancel',()=>lookPointer=null);
function actorPosition(){return vehicle?vehicle.root.position:player.position}
function drawMap(){const canvas=ui.minimap,ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,scale=.13,px=w/2,py=h/2,pos=actorPosition();ctx.clearRect(0,0,w,h);ctx.fillStyle='rgba(12,21,24,.92)';ctx.fillRect(0,0,w,h);ctx.save();ctx.translate(px-pos.x*scale,py-pos.z*scale);ctx.strokeStyle='rgba(204,199,179,.32)';ctx.lineWidth=1.6;for(let v=-500;v<=500;v+=100){ctx.beginPath();ctx.moveTo(v*scale,-70);ctx.lineTo(v*scale,70);ctx.stroke();ctx.beginPath();ctx.moveTo(-70,v*scale);ctx.lineTo(70,v*scale);ctx.stroke()}ctx.fillStyle='rgba(223,185,112,.56)';for(const l of landmarks){ctx.fillRect(l.x*scale-2,l.z*scale-2,4,4)}if(missionActive){const m=missionList[missionIndex];ctx.fillStyle='#edb85f';ctx.beginPath();ctx.arc(m.x*scale,m.z*scale,4,0,Math.PI*2);ctx.fill()}ctx.restore();ctx.fillStyle='#f0eee7';ctx.beginPath();ctx.moveTo(px,py-6);ctx.lineTo(px-4,py+5);ctx.lineTo(px+4,py+5);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(235,180,95,.65)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(px,py,8,0,Math.PI*2);ctx.stroke()}
function updateDistrict(){const p=actorPosition(),names=['OLD QUARTER','DOWNTOWN','EASTSIDE','HARBOR','HILLSIDE','SOUTH MARKET'];let n;if(p.x<-180)n='HARBOR';else if(p.x>240&&p.z<-200)n='HILLSIDE';else if(p.z>180)n='SOUTH MARKET';else if(Math.abs(p.x)<140&&Math.abs(p.z)<140)n='DOWNTOWN';else if(p.x>150)n='EASTSIDE';else n=names[0];ui.district.textContent=n;const streets=['WEST MERIDIAN AVE','TRAMLINE BOULEVARD','MERCER STREET','DOCKSIDE ROAD'];ui.street.textContent=streets[Math.floor((Math.abs(Math.round(p.x/100))+Math.abs(Math.round(p.z/100)))%streets.length)]}
let lastTime=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.04,(now-lastTime)/1000);lastTime=now;elapsed+=dt;
 if(keys.has('shift'))sprinting=true;else if(!sprintButton.matches(':active'))sprinting=false;
 const forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-moveInput.y;
 const strafe=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+moveInput.x;
 const mag=Math.hypot(forward,strafe),f=mag>1?forward/mag:forward,side=mag>1?strafe/mag:strafe;
 if(vehicle){const c=vehicle,accel=(keys.has('w')||keys.has('arrowup')||moveInput.y<-.15?1:0)-(keys.has('s')||keys.has('arrowdown')||moveInput.y>.15?1:0);c.speed=THREE.MathUtils.damp(c.speed,accel*17,accel?1.7:2.5,dt);const steer=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+moveInput.x;c.heading-=steer*dt*Math.min(1,Math.abs(c.speed)/4)*1.55;c.root.rotation.y=c.heading;c.root.position.x+=Math.sin(c.heading)*c.speed*dt;c.root.position.z+=Math.cos(c.heading)*c.speed*dt;const occupied=new Set(cars.filter(other=>other!==c).map(other=>other.root));for(const other of occupied){if(c.root.position.distanceTo(other.position)<2.7){c.root.position.x-=Math.sin(c.heading)*c.speed*dt*1.5;c.root.position.z-=Math.cos(c.heading)*c.speed*dt*1.5;c.speed*=.3}}c.wheels.forEach(w=>w.rotation.x+=c.speed*dt*1.6);ui.speed.textContent=String(Math.round(Math.abs(c.speed)*5)).padStart(3,'0')}
 else{ui.speed.textContent='000';if(mag>.04){const dx=Math.sin(cameraYaw)*f+Math.cos(cameraYaw)*side,dz=-Math.cos(cameraYaw)*f+Math.sin(cameraYaw)*side,speed=sprinting?9.8:5.2;player.position.x+=dx*speed*dt;player.position.z+=dz*speed*dt;players[current].heading=Math.atan2(dx,dz);player.rotation.y=THREE.MathUtils.damp(player.rotation.y,players[current].heading,12,dt);player.position.y=jumpTime>0?Math.sin((.34-jumpTime)/.34*Math.PI)*.8:.04}else player.position.y=THREE.MathUtils.damp(player.position.y,.04,10,dt);if(jumpTime>0)jumpTime-=dt}
 const target=actorPosition().clone();target.y+=vehicle?1.3:1.4;const distance=camDistance+(vehicle?3:0),desired=new THREE.Vector3(target.x+Math.sin(cameraYaw)*Math.cos(cameraPitch)*distance,target.y+Math.sin(cameraPitch)*distance+2,target.z+Math.cos(cameraYaw)*Math.cos(cameraPitch)*distance);camera.position.lerp(desired,1-Math.exp(-5*dt));camera.lookAt(target);
 if(marker.visible){marker.position.y=.12+Math.sin(elapsed*2.7)*.32;marker.rotation.y=elapsed*.45;ring.material=mats.gold}
 for(const n of npcs){n.userData.phase+=dt*.8;n.position.x+=Math.sin(n.userData.phase)*dt*.12;n.rotation.y=Math.sin(n.userData.phase)*.18}
 const p=actorPosition(),job=missionList[missionIndex];if(missionActive&&Math.hypot(p.x-job.x,p.z-job.z)<11){ui['mission-action'].innerHTML='PRESS E TO FINISH <span>↵</span>';ui['mission-action'].classList.add('near')}else{ui['mission-action'].classList.remove('near');ui['mission-action'].innerHTML=missionActive?'JOB TRACKED <span>✓</span>':'TRACK JOB <span>↗</span>'}
 if(noticeTimer>0&&(noticeTimer-=dt)<=0)ui.message.classList.remove('show');if(toastTimer>0&&(toastTimer-=dt)<=0)ui.toast.classList.remove('show');
 if(Math.floor(elapsed*4)!==Math.floor((elapsed-dt)*4))drawMap();if(Math.floor(elapsed)!==Math.floor(elapsed-dt))updateDistrict();
 if(elapsed>1.3)ui.loading.classList.add('done');renderer.render(scene,camera)}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}window.addEventListener('resize',resize);
refreshMission();drawMap();updateDistrict();requestAnimationFrame(frame);
