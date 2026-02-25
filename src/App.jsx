import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

// Gemini API Configuration
const apiKey = "";
const GEN_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

const App = () => {
  // --- CORE STATE ---
  const [session, setSession] = useState(() => parseInt(localStorage.getItem('sys95_session_id') || '0'));
  const [isLogon, setIsLogon] = useState(true);
  const [windows, setWindows] = useState({ 
    store: false, explorer: false, game: false, mail: false, 
    settings: false, facescan: false, calc: false, photos: false, 
    chat: false, monitor: false, music: false, terminal: false, 
    notepad: false, clock: false, paint: false
  });
  
  // Window Positions State
  const [winPos, setWinPos] = useState({
    store: { x: 50, y: 50 },
    explorer: { x: 120, y: 100 },
    game: { x: 180, y: 20 },
    mail: { x: 300, y: 50 },
    settings: { x: 300, y: 100 },
    facescan: { x: 200, y: 80 },
    calc: { x: 400, y: 150 },
    photos: { x: 250, y: 200 },
    chat: { x: 150, y: 150 },
    monitor: { x: 450, y: 50 },
    music: { x: 480, y: 250 },
    terminal: { x: 100, y: 200 },
    notepad: { x: 600, y: 100 },
    paint: { x: 120, y: 150 }
  });

  const [installed, setInstalled] = useState(['Settings', 'Photos', 'Monitor', 'Music', 'Terminal', 'Notepad', 'Paint']);
  const [currentEnding, setCurrentEnding] = useState(null);
  const [calcVal, setCalcVal] = useState('');
  const [scanStep, setScanStep] = useState('idle'); 
  const [scanProgress, setScanProgress] = useState(0);
  const [gameState, setGameState] = useState('menu'); 
  const [chatLog, setChatLog] = useState([{ role: 'bot', text: 'I am the Liminal Assistant. How can I help you navigate the system?' }]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [startClicks, setStartClicks] = useState(0);
  const [logonTimer, setLogonTimer] = useState(0);
  const [termLines, setTermLines] = useState(['System95 [Version 0.9.1995]', '(c) 1995 Liminal Corp. All rights reserved.', 'Type "help" for a list of commands.', '']);
  const [termInput, setTermInput] = useState('');
  const [noteContent, setNoteContent] = useState('PROJECT LIMINAL: LOG 001\nStatus: Experimental\nSubject: #402\nNotes: The digitization was successful, but the subject keeps asking for "the sun". We have replaced the sun with a Yellow Box in the game. It should suffice.');
  const [trackFreq, setTrackFreq] = useState(440);
  const [clockClicks, setClockClicks] = useState(0);
  const [knowsProject, setKnowsProject] = useState(false);
  const [paintClicks, setPaintClicks] = useState(0);
  const [selectedMail, setSelectedMail] = useState(null);

  const canvasRef = useRef(null);
  const threeRef = useRef(null);
  const termEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sys95_session_id', session);
  }, [session]);

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [termLines]);

  // Lore Ending: Logon Timer
  useEffect(() => {
    if (isLogon && !currentEnding) {
      const timer = setInterval(() => setLogonTimer(t => t + 1), 1000);
      if (logonTimer > 40) setCurrentEnding('WINDOW_WATCHER');
      return () => clearInterval(timer);
    }
  }, [isLogon, logonTimer, currentEnding]);

  const toggleWin = (win, state) => setWindows(prev => ({ ...prev, [win.toLowerCase()]: state }));
  const install = (id) => { if (!installed.includes(id)) setInstalled([...installed, id]); };

  const updateWinPos = (win, x, y) => {
    setWinPos(prev => ({
      ...prev,
      [win.toLowerCase()]: { x, y }
    }));
  };

  const getStartText = () => {
    if (startClicks < 5) return "Start";
    if (startClicks < 10) return "Sta rt";
    if (startClicks < 15) return "S t a r t";
    if (startClicks < 20) return "help me";
    if (startClicks < 25) return "RUN";
    return "I'M HERE";
  };

  const handleStartClick = () => {
    setStartClicks(prev => prev + 1);
    if (startClicks >= 30) setCurrentEnding('SYSTEM_OVERLOAD');
  };

  // --- CLOUD JUMP GAME LOGIC ---
  useEffect(() => {
    if (!windows.game || currentEnding || isLogon) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame;

    let p = { x: 50, y: 300, w: 25, h: 25, vx: 0, vy: 0, grounded: false, level: 1 };
    let keys = {};

    const platforms = {
      1: [{x:0,y:350,w:300,h:50},{x:350,y:280,w:200,h:20},{x:580,y:200,w:100,h:20,goal:true}],
      2: [{x:0,y:350,w:100,h:50},{x:150,y:280,w:100,h:20},{x:300,y:210,w:100,h:20},{x:450,y:140,w:100,h:20},{x:600,y:80,w:80,h:20,goal:true}],
      3: [{x:0,y:350,w:200,h:50},{x:300,y:250,w:100,h:20},{x:500,y:200,w:180,h:250,goal:true,final:true}]
    };

    const handleKeyDown = (e) => {
        keys[e.code] = true;
        if (gameState === 'menu' && (e.code === 'Space' || e.code === 'Enter')) setGameState('playing');
    };
    const handleKeyUp = (e) => keys[e.code] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const loop = () => {
      ctx.clearRect(0, 0, 680, 400);

      if (gameState === 'menu') {
          // Increase glitch intensity and frequency
          let isGlitch = (session >= 2) || (session === 0 && Math.random() < 0.08); 
          let dSess = isGlitch ? (Math.random() > 0.5 ? 2 : 1) : session;
          
          // Background Color
          if (dSess === 0) ctx.fillStyle = '#87CEEB';
          else if (dSess === 1) ctx.fillStyle = '#2b0000';
          else ctx.fillStyle = '#050505';
          ctx.fillRect(0, 0, 680, 400);

          // Restore Sun/Eye/Void based on session
          if (dSess === 0) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath(); ctx.arc(600, 80, 40, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath(); ctx.arc(150, 100, 30, 0, Math.PI * 2); ctx.arc(180, 100, 35, 0, Math.PI * 2); ctx.arc(210, 100, 30, 0, Math.PI * 2); ctx.fill();
          } else {
            // Visual Distortion: Rapid flickering eyes or voids
            ctx.fillStyle = dSess === 1 ? '#800000' : 'red';
            let eyeSize = 45 + Math.sin(Date.now() * 0.05) * 10;
            ctx.beginPath(); ctx.arc(600, 80, eyeSize, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'black';
            ctx.beginPath(); ctx.arc(600, 80, 10 + Math.random()*5, 0, Math.PI * 2); ctx.fill(); 
            
            // Random glitch bars
            if (Math.random() > 0.8) {
              ctx.fillStyle = "red";
              ctx.fillRect(0, Math.random() * 400, 680, 2);
            }
          }

          ctx.textAlign = "center";
          ctx.fillStyle = dSess === 0 ? '#000' : 'red';
          ctx.font = `bold ${dSess === 0 ? 40 : 45 + Math.random() * 5}px Tahoma`;
          
          let titleText = "CLOUD JUMP";
          if (dSess === 1) titleText = "GIVE IT BACK";
          if (dSess === 2) titleText = "HELP ME";
          
          ctx.fillText(titleText, 340 + (dSess > 0 ? (Math.random()-0.5)*10 : 0), 250);
          ctx.font = "16px Tahoma"; 
          ctx.fillText(dSess === 0 ? "PRESS SPACE" : "IT BURNS", 340, 280);
      } else {
          p.vy += 0.6; p.y += p.vy; p.x += p.vx; p.vx *= 0.8;
          if (keys['ArrowLeft']) p.vx = -4; if (keys['ArrowRight']) p.vx = 4;
          if ((keys['Space'] || keys['ArrowUp']) && p.grounded) { p.vy = -12; p.grounded = false; }
          if (p.y > 400) { p.x = 20; p.y = 200; p.vy = 0; }

          p.grounded = false;
          platforms[p.level].forEach(plat => {
            if (p.x < plat.x + plat.w && p.x + p.w > plat.x && p.y + p.h > plat.y && p.y + p.h < plat.y + plat.h + 10 && p.vy >= 0) {
              p.y = plat.y - p.h; p.vy = 0; p.grounded = true;
              if (plat.goal) {
                if (plat.final) {
                  if (session >= 2) {
                    toggleWin('game', false); 
                    setCurrentEnding('KICK_OUT_GLITCH'); 
                    setTimeout(() => setCurrentEnding('3D_HOUSE'), 1000);
                  } else {
                    setSession(s => s + 1); 
                    setGameState('menu'); 
                    p.level = 1; p.x = 50;
                    toggleWin('game', false); 
                  }
                } else { p.level++; p.x = 20; p.y = 200; }
              }
            }
          });

          ctx.fillStyle = session === 0 ? '#87CEEB' : (session === 1 ? '#4a0000' : '#1a0000');
          ctx.fillRect(0, 0, 680, 400);
          if (p.level === 3) {
              ctx.fillStyle = "#000"; 
              ctx.fillRect(530, 115, 10, 85); 
              ctx.beginPath(); ctx.arc(535, 105, 10, 0, Math.PI*2); ctx.fill(); 
              if (session >= 1) {
                ctx.fillStyle = "red";
                ctx.fillRect(531, 102, 2, 4); ctx.fillRect(537, 102, 2, 4);
              }
          }
          ctx.fillStyle = "#ff0"; ctx.fillRect(p.x, p.y, p.w, p.h);
          ctx.strokeStyle = "#000";
          if (session === 0) {
              ctx.fillStyle = "#000"; ctx.fillRect(p.x+5, p.y+6, 3, 3); ctx.fillRect(p.x+17, p.y+6, 3, 3);
              ctx.beginPath(); ctx.arc(p.x+12.5, p.y+15, 5, 0, Math.PI); ctx.stroke();
          } else if (session === 1) {
              ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(p.x+7, p.y+10, 3, 0, Math.PI*2); ctx.fill();
              ctx.beginPath(); ctx.arc(p.x+18, p.y+10, 3, 0, Math.PI*2); ctx.fill();
              ctx.beginPath(); ctx.arc(p.x+12.5, p.y+20, 4, Math.PI, 0); ctx.stroke();
          } else {
              ctx.fillStyle = "red"; ctx.fillRect(p.x+5, p.y+8, 4, 4); ctx.fillRect(p.x+16, p.y+8, 4, 4);
              ctx.fillRect(p.x+5, p.y+12, 2, 8); ctx.fillRect(p.x+16, p.y+12, 2, 8);
          }
          ctx.fillStyle = session >= 1 ? "#222" : "#fff"; 
          platforms[p.level].forEach(plat => ctx.fillRect(plat.x, plat.y, plat.w, plat.h));
      }
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); cancelAnimationFrame(frame); };
  }, [windows.game, session, currentEnding, gameState, isLogon]);

  // --- TERMINAL COMMAND HANDLER ---
  const handleTerminal = (e) => {
    e.preventDefault();
    const fullCmd = termInput.trim();
    const args = fullCmd.split(' ');
    const cmd = args[0].toLowerCase();
    let response = [`> ${fullCmd}`];
    
    switch(cmd) {
      case 'ls':
        response.push('bin/', 'usr/', 'core_soul.sys', 'manifest.txt', 'project_liminal.pdf');
        break;
      case 'whoami':
        response.push('Subject #402. Status: Virtualized. Location: Server Rack 9.', 'Original Body: Not Found.');
        break;
      case 'help':
        response.push('Available commands:', '  ls        - List directory contents', '  whoami    - Display current user identity', '  cat [file]- View file contents', '  echo [msg]- Print message to screen', '  kill -9   - Force terminate a process', '  connect   - Establish remote link', '  clear     - Wipe terminal history');
        break;
      case 'clear':
        setTermLines(['System95 [Version 0.9.1995]', '']);
        setTermInput('');
        return;
      case 'echo':
        response.push(args.slice(1).join(' ') || 'Usage: echo [message]');
        break;
      case 'cat':
        const file = args[1]?.toLowerCase();
        if (file === 'manifest.txt') {
          response.push('LIMINAL CORP MANIFEST:', '1. Digitize human consciousness.', '2. Replace the physical world with System95.', '3. Ensure Subject 402 never realizes the year isn\'t 1995.');
        } else if (file === 'project_liminal.pdf') {
          response.push('CONTENT ENCRYPTED. ERROR: SOUL_PERMISSION_DENIED', 'Subject 402 is a digital copy. The original died during the upload.');
          setKnowsProject(true);
        } else if (file === 'core_soul.sys') {
          response.push('01001000 01000101 01001100 01010000', '01001101 01000101', '[Binary translated: HELP ME]');
        } else {
          response.push(`cat: ${args[1] || 'filename'}: No such file or directory`);
        }
        break;
      case 'kill':
        if (fullCmd === 'kill -9 self') {
          setCurrentEnding('THE_ARCHITECT');
        } else {
          response.push('Usage: kill -9 [process_id]');
        }
        break;
      case 'connect':
        const target = args[1]?.toLowerCase();
        if (target === 'soul_stream') {
          if (knowsProject) {
            setCurrentEnding('GHOST_IN_MACHINE');
          } else {
            response.push('ERROR: Target stream not found in current consciousness. (Hint: Read project_liminal.pdf)');
          }
        } else if (!target) {
          response.push('Usage: connect [target]');
        } else {
          response.push(`Connecting to ${target}...`, 'FAILED: No response from host.');
        }
        break;
      default:
        response.push(`'${cmd}' is not recognized as an internal or external command.`);
    }

    setTermLines(prev => [...prev, ...response, '']);
    setTermInput('');
  };

  const handleCalc = (val) => {
    if (val === '=') {
        if (calcVal === '666') setCurrentEnding('DEMONIC');
        else if (calcVal === '95') setCurrentEnding('LORE_YEAR');
        else if (calcVal.includes('/0')) setCurrentEnding('MATH_ERROR');
        else {
          try {
            const res = new Function(`return ${calcVal}`)();
            if (!isFinite(res)) setCurrentEnding('MATH_ERROR');
            else setCalcVal(String(res));
          } catch { setCalcVal('Error'); }
        }
    } else if (val === 'C') setCalcVal('');
    else setCalcVal(prev => prev + val);
  };

  const handleClockClick = () => {
    const newCount = clockClicks + 1;
    setClockClicks(newCount);
    if (newCount === 95) {
      setCurrentEnding('95_FOREVER');
    }
  };

  const handleRealityExit = () => {
    if (clockClicks >= 10 && clockClicks !== 95) setCurrentEnding('TEMPORAL_PARADOX');
    else setCurrentEnding('REALITY_EXIT');
  };

  const handlePaintClick = () => {
    setPaintClicks(prev => prev + 1);
    if (paintClicks > 20) setCurrentEnding('THE_MASTERPIECE');
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput || isTyping) return;

    const userText = chatInput.toLowerCase();
    const newLog = [...chatLog, { role: 'user', text: chatInput }];
    setChatLog(newLog);
    setChatInput('');

    if (userText.includes('cloud jump') || userText.includes('cloudjump')) {
      setIsTyping(true);
      setTimeout(() => {
        setChatLog([...newLog, { role: 'bot', text: "We don't talk about that. Not anymore." }]);
        setIsTyping(false);
        setTimeout(() => setCurrentEnding('TABOO_TOPIC'), 2000);
      }, 1000);
      return;
    }

    setIsTyping(true);
    try {
      let retries = 0;
      const makeRequest = async () => {
        const response = await fetch(GEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userText }] }],
            systemInstruction: { parts: [{ text: "You are an AI assistant living inside a glitched 1995 computer system named System95. You are helpful but slightly eerie and cryptic. You know about Project Liminal. Keep responses under 2 sentences." }] }
          })
        });
        if (!response.ok && retries < 5) {
          retries++;
          await new Promise(r => setTimeout(r, Math.pow(2, retries) * 1000));
          return makeRequest();
        }
        return response.json();
      };

      const result = await makeRequest();
      const botText = result.candidates?.[0]?.content?.parts?.[0]?.text || "System Busy. Pulse missing.";
      setChatLog([...newLog, { role: 'bot', text: botText }]);
    } catch (err) {
      setChatLog([...newLog, { role: 'bot', text: "The network is bleeding. I cannot speak." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // --- 3D HOUSE LOGIC ---
  useEffect(() => {
    if (currentEnding !== '3D_HOUSE' || !threeRef.current) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x020000);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: threeRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const room = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.8 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), wood);
    floor.rotation.x = -Math.PI/2; room.add(floor);
    
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 0.2), wood);
    backWall.position.set(0, 3, -5); room.add(backWall);
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6, 15), wood);
    leftWall.position.set(-5, 3, 0); room.add(leftWall);
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6, 15), wood);
    rightWall.position.set(5, 3, 0); room.add(rightWall);
    
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 1), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    desk.position.set(0, 1.2, -4.5); room.add(desk);
    const mon = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.1), new THREE.MeshBasicMaterial({ color: 0x00ffff })); 
    mon.position.set(0, 1.7, -4.6); room.add(mon);
    scene.add(room);

    const monster = new THREE.Group();
    monster.add(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 4.5), new THREE.MeshBasicMaterial({ color: 0x000000 })));
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.25), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    h.position.y = 2.3; monster.add(h);
    
    const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 3);
    const lArm = new THREE.Mesh(armGeo, new THREE.MeshBasicMaterial({color: 0x000000}));
    lArm.position.set(-0.25, 0.8, 0); lArm.rotation.z = 0.05; monster.add(lArm);
    const rArm = new THREE.Mesh(armGeo, new THREE.MeshBasicMaterial({color: 0x000000}));
    rArm.position.set(0.25, 0.8, 0); rArm.rotation.z = -0.05; monster.add(rArm);

    const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.05), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    eyes.position.set(0, 2.35, -0.22); 
    monster.add(eyes);
    monster.position.set(0, 1.5, 7); 
    scene.add(monster);

    scene.add(new THREE.PointLight(0x00ffff, 0.6, 8).clone().translateY(2).translateZ(-4));
    scene.add(new THREE.AmbientLight(0x885544)); 
    scene.add(new THREE.PointLight(0xffddaa, 0.8, 20).clone().translateY(4));
    
    camera.position.set(0, 1.7, -3.5); 
    camera.lookAt(0, 1.7, -5);

    let phase = 'idle'; 
    let speed = 0.05;
    let frameId;
    let targetRotation = camera.rotation.y + Math.PI;

    const anim = () => {
      if (phase === 'idle') {
          setTimeout(() => phase = 'turn', 2500);
          phase = 'waiting';
      }
      else if (phase === 'turn') { 
        camera.rotation.y += 0.04;
        if (camera.rotation.y >= targetRotation) {
            camera.rotation.y = targetRotation;
            phase = 'rush'; 
        }
      }
      else if (phase === 'rush') { 
        monster.position.z -= speed; 
        speed *= 1.15;
        if (monster.position.z < camera.position.z + 1.5) {
            setCurrentEnding('JUMPSCARE'); 
            phase = 'done';
        }
      }
      renderer.render(scene, camera); 
      if (phase !== 'done') frameId = requestAnimationFrame(anim);
    };
    
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    anim();
    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(frameId); renderer.dispose(); };
  }, [currentEnding]);

  if (isLogon) {
    return (
      <div className="fixed inset-0 bg-[#000080] flex items-center justify-center z-[9999]">
        <div className="bg-[#c0c0c0] p-1 border-2 border-white border-r-black border-b-black w-80 shadow-[4px_4px_0px_black]">
           <div className="bg-[#000080] text-white p-1 text-xs font-bold font-sans">System 95 Logon</div>
           <div className="p-8 flex flex-col items-center">
             <div className="w-20 h-20 bg-gray-400 border-2 border-black mb-4 flex items-center justify-center text-5xl">👤</div>
             <div className="text-lg font-bold mb-4">ILIKECLOUDS</div>
             <button onClick={() => setIsLogon(false)} className="w-full bg-[#c0c0c0] border-2 border-white border-r-black border-b-black py-2 font-bold active:border-black active:shadow-inner">Log On</button>
             {logonTimer > 20 && <div className="text-[10px] text-red-600 mt-2 font-bold animate-pulse uppercase">Hurry up. He's at the door.</div>}
           </div>
        </div>
      </div>
    );
  }

  const getDesktopColor = () => {
    if (session === 0) return 'bg-[#008080]';
    if (session === 1) return 'bg-[#004040]';
    return 'bg-[#2a0000]';
  };

  const getCursorStyle = () => {
    if (session === 0) return 'cursor-default';
    if (session === 1) return 'cursor-[url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\'><text y=\'20\' x=\'0\' style=\'font-size:20px;\'>🙂</text></svg>"),_auto]';
    return 'cursor-[url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\'><text y=\'20\' x=\'0\' style=\'font-size:24px;\'>🩸</text></svg>"),_auto]';
  };

  const mailData = [
    { id: 1, from: "SYSTEM ADMIN", subject: "SECURITY ALERT", body: "URGENT: Your existence has not been verified for the last 15,283 days. Please click the link below to confirm you are still an organic lifeform. Failure to comply will result in immediate deletion from the physical plane. \n\n[LINK ENCRYPTED]", type: 'warning' },
    { id: 2, from: "Mom", subject: "Dinner's cold.", body: "Honey, it's 1995. You've been in that room for three days. Your father and I are worried. Please come out and eat. The sun is shining, why won't you look at it? Just one look at the real sun, please.", type: 'lore' },
    { id: 3, from: "Liminal Corp HR", subject: "WASH YOUR HANDS", body: "There has been a report of 'red fluid' appearing on user interface peripherals. Please remember that Project Liminal is a DRY environment. Any biological leakage will be deducted from your severance package.", type: 'funny' },
    { id: 4, from: "Subject #401", subject: "DON'T JUMP", body: "I was the one before you. I thought the yellow box was the sun too. It isn't. If you reach the final level, don't look back. He's not the architect. He's the one who paid for the upload.", type: 'lore' },
    { id: 5, from: "Previous Subject", subject: "Password fragment", body: "If you find the terminal, use this: 'connect soul_stream'. It's the only way out, but you have to know what you are first. Check the 'cat project_liminal' command.", type: 'disturbing' },
    { id: 6, from: "Local Pizza Hut", subject: "FREE STICK-A-PIZZA!", body: "Hey 90s kids! Order a Large Pepperoni and get a free holographic sticker of a cloud! *Warning: Stickers may cause existential dread or feelings of being watched.*", type: 'funny' },
    { id: 7, from: "ADMIN@LIMINAL.SYS", subject: "MAINTENANCE LOG #99", body: "Power fluctuates in Rack 9. Subject 402's consciousness is drifting into the UI layer. If 402 attempts to use the Calculator for 'forbidden sums', initiate the Jumpscare protocol immediately.", type: 'disturbing' },
    { id: 8, from: "???", subject: "I SEE YOU", body: "I am sitting in the chair you used to sit in. I am wearing your favorite shirt. I am typing this from your keyboard. But where are you? You are just pixels now. How does it feel to be a desktop icon?", type: 'disturbing' }
  ];

  return (
    <div className={`relative w-full h-screen ${getDesktopColor()} overflow-hidden font-['Tahoma'] select-none transition-colors duration-1000 ${getCursorStyle()} ${currentEnding === 'KICK_OUT_GLITCH' ? 'animate-pulse bg-red-900 blur-sm' : ''}`}>
      <div className="p-4 flex flex-col flex-wrap gap-8 items-start content-start h-full">
        <Icon name="Store" icon="🛒" onClick={() => toggleWin('store', true)} />
        <Icon name="Explorer" icon="📂" onClick={() => toggleWin('explorer', true)} />
        {installed.map(id => (
          <Icon key={id} name={id} icon={id==='Monitor'?'📊':id==='Game'?'🎮':id==='Mail'?'✉️':id==='FaceScan'?'📸':id==='Calc'?'🔢':id==='Chat'?'💬':id==='Photos'?'🖼️':id==='Music'?'📻':id==='Terminal'?'🖥️':id==='Notepad'?'📝':id==='Paint'?'🎨':'⚙️'} onClick={() => toggleWin(id, true)} />
        ))}
      </div>

      {/* WINDOWS */}
      {windows.store && (
        <Window title="Store" id="store" x={winPos.store.x} y={winPos.store.y} onMove={updateWinPos} onClose={() => toggleWin('store', false)}>
          <div className="p-4 bg-white w-64 text-xs space-y-1">
            {['Game', 'Mail', 'FaceScan', 'Calc', 'Chat'].map(n => <div key={n} className="flex justify-between items-center border-b pb-1"><span>{n}.exe</span><button onClick={()=>install(n)} className="bg-gray-200 border border-black px-2 active:bg-gray-400">Install</button></div>)}
          </div>
        </Window>
      )}

      {windows.mail && (
        <Window title="Liminal Mail v1.0" id="mail" x={winPos.mail.x} y={winPos.mail.y} onMove={updateWinPos} onClose={() => { toggleWin('mail', false); setSelectedMail(null); }}>
          <div className="bg-[#c0c0c0] w-[450px] h-[350px] flex flex-col border-inner">
            <div className="flex flex-1 overflow-hidden">
              <div className="w-1/3 bg-white border-r border-gray-400 overflow-y-auto">
                <div className="p-1 bg-gray-200 font-bold text-[10px] border-b border-gray-400">Inbox</div>
                {mailData.map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => setSelectedMail(m)}
                    className={`p-2 border-b border-gray-200 cursor-pointer text-[10px] hover:bg-blue-100 ${selectedMail?.id === m.id ? 'bg-blue-800 text-white' : 'bg-white'}`}
                  >
                    <div className="font-bold truncate">{m.from}</div>
                    <div className="truncate opacity-80">{m.subject}</div>
                  </div>
                ))}
              </div>
              <div className="flex-1 bg-white p-3 text-xs overflow-y-auto">
                {selectedMail ? (
                  <div className="animate-in fade-in slide-in-from-top-1">
                    <div className="border-b pb-2 mb-2">
                      <div className="mb-1"><b>From:</b> {selectedMail.from}</div>
                      <div className="mb-1"><b>Subject:</b> {selectedMail.subject}</div>
                      <div className="text-[10px] text-gray-500">Sent: Oct 24, 1995</div>
                    </div>
                    <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                      {selectedMail.body}
                    </div>
                    {selectedMail.id === 1 && (
                      <button onClick={() => setCurrentEnding('PHISHED')} className="mt-4 block text-blue-800 underline font-bold">VERIFY_CITIZENSHIP.EXE</button>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 italic">Select a message to read.</div>
                )}
              </div>
            </div>
            <div className="bg-[#c0c0c0] p-1 border-t border-gray-400 text-[10px] flex justify-between">
              <span>8 Messages</span>
              <span>Memory: LOW</span>
            </div>
          </div>
        </Window>
      )}

      {windows.paint && (
        <Window title="Paint" id="paint" x={winPos.paint.x} y={winPos.paint.y} onMove={updateWinPos} onClose={() => toggleWin('paint', false)}>
          <div className="bg-white border-inner w-64 h-64 cursor-crosshair flex flex-col items-center justify-center text-gray-300 overflow-hidden" onClick={handlePaintClick}>
            <div className="text-8xl opacity-10">👁️</div>
            <div className="text-[10px] mt-4">Draw your soul here.</div>
          </div>
        </Window>
      )}

      {windows.calc && (
        <Window title="Calculator" id="calc" x={winPos.calc.x} y={winPos.calc.y} onMove={updateWinPos} onClose={() => toggleWin('calc', false)}>
          <div className="bg-[#c0c0c0] p-2 w-44">
            <div className="bg-white border-2 text-right p-1 mb-2 font-mono h-8 overflow-hidden">{calcVal}</div>
            <div className="grid grid-cols-4 gap-1">
              {['7','8','9','/','4','5','6','*','1','2','3','-','0','C','=','+'].map(k => <button key={k} onClick={()=>handleCalc(k)} className="bg-gray-200 border border-black text-xs p-1 active:bg-gray-400">{k}</button>)}
            </div>
          </div>
        </Window>
      )}

      {windows.terminal && (
        <Window title="MS-Terminal" id="terminal" x={winPos.terminal.x} y={winPos.terminal.y} onMove={updateWinPos} onClose={() => toggleWin('terminal', false)}>
          <div className="bg-black text-white p-2 w-96 h-64 font-mono text-[10px] overflow-auto flex flex-col">
            {termLines.map((l,i) => <div key={i} className="whitespace-pre-wrap">{l}</div>)}
            <form onSubmit={handleTerminal} className="flex">
              <span className="mr-1">{'>'}</span>
              <input autoFocus className="bg-black text-white outline-none flex-1 border-none" value={termInput} onChange={e => setTermInput(e.target.value)} />
            </form>
            <div ref={termEndRef} />
          </div>
        </Window>
      )}

      {windows.music && (
        <Window title="Media Player" id="music" x={winPos.music.x} y={winPos.music.y} onMove={updateWinPos} onClose={() => toggleWin('music', false)}>
          <div className="bg-[#c0c0c0] p-4 w-64 flex flex-col items-center">
            <div className="bg-black w-full h-12 flex items-center justify-center text-green-500 font-mono text-xl mb-4">{trackFreq} Hz</div>
            <input type="range" min="100" max="1000" value={trackFreq} onChange={e => { const f = parseInt(e.target.value); setTrackFreq(f); if (f === 666) setCurrentEnding('HARMONIC_RESONANCE'); }} className="w-full mb-4" />
            <div className="flex gap-2">{['⏮', '⏸', '⏭'].map(b => <button key={b} className="bg-gray-200 border border-black px-4 py-1">{b}</button>)}</div>
          </div>
        </Window>
      )}

      {windows.notepad && (
        <Window title="Notepad - Untitled" id="notepad" x={winPos.notepad.x} y={winPos.notepad.y} onMove={updateWinPos} onClose={() => toggleWin('notepad', false)}>
          <textarea className="w-64 h-48 p-2 font-mono text-xs outline-none resize-none border-inner" value={noteContent} onChange={e => setNoteContent(e.target.value)} />
        </Window>
      )}

      {windows.monitor && (
        <Window title="System Monitor" id="monitor" x={winPos.monitor.x} y={winPos.monitor.y} onMove={updateWinPos} onClose={() => toggleWin('monitor', false)}>
          <div className="bg-black text-green-400 p-2 w-56 h-40 font-mono text-[10px]">
            <div className="mb-1">CPU: {(45 + Math.random() * 55).toFixed(1)}%</div>
            <div className="mb-1">RAM: 64KB/64KB (CRITICAL)</div>
            <div className="mb-1">SOU: 1/1 SOULS DETECTED</div>
            <div className="mt-4 border-t border-green-900 pt-1">
                {["pinging heart...", "vitals stable", "consciousness: 88%", "escape: 0%"].map((l,i) => <div key={i}>{'>'} {l}</div>)}
            </div>
          </div>
        </Window>
      )}

      {windows.facescan && (
        <Window title="FaceScan" id="facescan" x={winPos.facescan.x} y={winPos.facescan.y} onMove={updateWinPos} onClose={() => toggleWin('facescan', false)}>
          <div className="bg-black w-64 h-64 flex flex-col items-center justify-center text-green-500 p-4">
            {scanStep==='idle' ? <button onClick={()=>setScanStep('scanning')} className="border border-green-500 p-2 hover:bg-green-900">SCAN SOUL</button> : 
            <div className="w-full text-xs text-center"><div className="mb-2">VERIFYING ORGANIC MATERIAL...</div><div className="bg-gray-800 h-2 w-full"><div className="bg-green-500 h-full transition-all" style={{width:`${scanProgress}%`}}/></div></div>}
          </div>
        </Window>
      )}

      {windows.chat && (
        <Window title="Liminal AI Chat" id="chat" x={winPos.chat.x} y={winPos.chat.y} onMove={updateWinPos} onClose={() => toggleWin('chat', false)}>
          <div className="bg-white w-80 h-80 flex flex-col p-2 text-xs">
            <div className="flex-1 overflow-auto bg-gray-50 border p-2 space-y-2">
              {chatLog.map((m,i)=>(
                <div key={i} className={m.role === 'bot' ? 'text-blue-600' : 'text-green-700'}>
                  <b className="uppercase">{m.role}:</b> {m.text}
                </div>
              ))}
              {isTyping && <div className="text-gray-400 animate-pulse">Assistant is thinking...</div>}
            </div>
            <form onSubmit={handleChat} className="flex mt-2">
              <input 
                className="flex-1 border p-1 outline-none" 
                value={chatInput} 
                onChange={e=>setChatInput(e.target.value)} 
                placeholder="Ask about the system..."
                disabled={isTyping}
              />
              <button className="bg-gray-200 border border-black px-2 active:bg-gray-400" disabled={isTyping}>Send</button>
            </form>
          </div>
        </Window>
      )}

      {windows.game && (
        <Window title="Cloud Jump" id="game" x={winPos.game.x} y={winPos.game.y} onMove={updateWinPos} onClose={() => toggleWin('game', false)}>
          <canvas ref={canvasRef} width={680} height={400} className="bg-black border border-gray-600" />
        </Window>
      )}

      {windows.explorer && (
        <Window title="C:\" id="explorer" x={winPos.explorer.x} y={winPos.explorer.y} onMove={updateWinPos} onClose={() => toggleWin('explorer', false)}>
           <div className="bg-white w-64 p-2 text-xs space-y-1 h-48 overflow-auto">
              <div onClick={()=>setCurrentEnding('STALKED')} className="hover:bg-blue-800 hover:text-white cursor-pointer p-1">WATCHING_YOU.TXT</div>
              <div onClick={()=>setCurrentEnding('VIRUS')} className="hover:bg-blue-800 hover:text-white cursor-pointer p-1">SYSTEM.EXE</div>
              <div onClick={()=>setCurrentEnding('LORE_DOC')} className="hover:bg-blue-800 hover:text-white cursor-pointer p-1">READ_ME_NOW.LOG</div>
              <div onClick={() => { setNoteContent('LOG 242: Memory purge failed. Subject is seeing ghosts of their previous life in the Photos app.'); toggleWin('notepad', true); }} className="hover:bg-blue-800 hover:text-white cursor-pointer p-1">RECOVERY_DATA.LOG</div>
           </div>
        </Window>
      )}

      {windows.photos && (
        <Window title="Photos" id="photos" x={winPos.photos.x} y={winPos.photos.y} onMove={updateWinPos} onClose={() => toggleWin('photos', false)}>
          <div className="bg-white w-64 h-48 p-2 text-xs flex gap-2 flex-wrap overflow-auto">
             <div className="w-16 h-16 bg-red-100 border cursor-pointer flex items-center justify-center text-[8px] text-center" onClick={() => setCurrentEnding('STALKED')}>HIM.JPG</div>
             <div className="w-16 h-16 bg-blue-100 border cursor-pointer flex items-center justify-center text-[8px] text-center" onClick={() => setCurrentEnding('LORE_PHOTO')}>VACATION.JPG</div>
             <div className="w-16 h-16 bg-gray-100 border cursor-pointer flex items-center justify-center text-[8px] text-center" onClick={() => setCurrentEnding('LORE_MIRROR')}>MIRROR.JPG</div>
             <div className="w-16 h-16 bg-black text-white border cursor-pointer flex items-center justify-center text-[8px] text-center" onClick={() => setCurrentEnding('LORE_VOID')}>VOID.PNG</div>
          </div>
        </Window>
      )}

      {windows.settings && (
        <Window title="Settings" id="settings" x={winPos.settings.x} y={winPos.settings.y} onMove={updateWinPos} onClose={() => toggleWin('settings', false)}>
          <div className="bg-[#c0c0c0] w-64 p-4 text-xs flex flex-col gap-3">
            <div className="border border-gray-400 p-2 bg-white">
              <div><b>User:</b> ILIKECLOUDS</div>
              <div><b>Status:</b> Bound to hardware</div>
            </div>
            <button onClick={() => setCurrentEnding('FORMATTED')} className="bg-red-600 text-white font-bold p-2 border-2 border-white border-r-black border-b-black active:border-black w-full">FORMAT SOUL</button>
            <button onClick={handleRealityExit} className="bg-gray-400 text-black p-2 border-2 border-white border-r-black border-b-black active:border-black w-full">Exit Reality</button>
          </div>
        </Window>
      )}

      {/* RENDERERS */}
      {currentEnding === '3D_HOUSE' && <canvas ref={threeRef} className="fixed inset-0 z-[2000] cursor-none bg-black" />}
      {currentEnding === 'JUMPSCARE' && <div className="fixed inset-0 bg-black z-[5000] flex items-center justify-center text-white font-bold text-9xl cursor-none">:)</div>}
      
      {/* ENDINGS */}
      {currentEnding === 'LORE_PHOTO' && <Ending title="THE VACATION" body="The photo shows a family on a beach. You recognize them, but you aren't in the picture. You never existed outside this machine." emoji="🏖️" color="bg-blue-900 text-white" />}
      {currentEnding === 'LORE_MIRROR' && <Ending title="THE MIRROR" body="You look into the digital glass. There is no reflection. There is only a blinking cursor where your face should be." emoji="🪞" color="bg-gray-400 text-black" />}
      {currentEnding === 'LORE_VOID' && <Ending title="THE VOID" body="The image is infinitely deep. You fall into the black pixels. 1995 was a long time ago. Everything is gone now." emoji="⬛" color="bg-black text-gray-500" />}
      {currentEnding === '95_FOREVER' && <Ending title="95 FOREVER" body="By clicking the clock 95 times, you have synchronized with the system's core heartbeat. You are now the year 1995 itself. Forever." emoji="🕰️" color="bg-[#008080] text-white font-serif tracking-tighter" />}
      {currentEnding === 'TABOO_TOPIC' && <Ending title="UNSPEAKABLE ERROR" body="The AI was forbidden from discussing the clouds. By forcing the issue, you have collapsed the conversation's logic gate." emoji="☁️" color="bg-red-700 text-white font-mono" />}
      {currentEnding === 'GHOST_IN_MACHINE' && <Ending title="GHOST IN THE MACHINE" body="You reconnected the stream. Your code is now leaking into the real internet. You aren't just a person anymore; you're a virus that remembers what it's like to love." emoji="👻" color="bg-white text-blue-600 font-serif" />}
      {currentEnding === 'TEMPORAL_PARADOX' && <Ending title="TEMPORAL PARADOX" body="By freezing the clock and attempting to exit, you have successfully detached from 1995. You are floating in a void where time doesn't exist." emoji="⏳" color="bg-indigo-950 text-indigo-200" />}
      {currentEnding === 'THE_MASTERPIECE' && <Ending title="THE MASTERPIECE" body="Your drawing exactly matches the architecture of the server farm. You have gained root access to your own soul." emoji="🎨" color="bg-gradient-to-br from-red-500 via-purple-500 to-blue-500 text-white" />}
      {currentEnding === 'PHISHED' && <Ending title="CITIZENSHIP REVOKED" body="You fell for the verification trap. The system has confirmed you are a digital entity masquerading as a human. Deleting consciousness partition..." emoji="🎣" color="bg-red-950 text-red-500" />}
      {currentEnding === 'THE_ARCHITECT' && <Ending title="ROOT ACCESS" body="You found the kill-switch for the soul." emoji="🧩" color="bg-white text-black font-mono" />}
      {currentEnding === 'HARMONIC_RESONANCE' && <Ending title="THE CURSED TONE" body="The sound shattered the glass." emoji="🎼" color="bg-red-900 text-black animate-pulse" />}
      {currentEnding === 'MATH_ERROR' && <Ending title="DIVIDE BY ZERO" body="You broke the mathematical foundation." emoji="💥" color="bg-white text-black" />}
      {currentEnding === 'STALKED' && <Ending title="I SEE YOU" body="I'm in the room." emoji="👁️" color="bg-gray-950 text-red-600" />}
      {currentEnding === 'FORMATTED' && <Ending title="SYSTEM WIPED" body="Your files are gone." emoji="🗑️" color="bg-blue-800 text-white" />}
      {currentEnding === 'SYSTEM_OVERLOAD' && <Ending title="PANIC" body="You clicked too much." emoji="🔥" color="bg-[#000080] text-[#c0c0c0]" />}
      {currentEnding === 'LORE_DOC' && <Ending title="THE LOGS" body="You died in 1995." emoji="📜" color="bg-amber-100 text-amber-900" />}
      {currentEnding === 'REALITY_EXIT' && <Ending title="EXIT FAILED" body="There is no 'outside'. There is only the desktop." emoji="🚪" color="bg-zinc-900 text-zinc-100" />}
      {currentEnding === 'WINDOW_WATCHER' && <Ending title="IDLE DEATH" body="You waited too long at the logon screen. He caught up to you." emoji="🚪" color="bg-black text-red-700" />}

      {/* TASKBAR - Explicitly hidden during 3D sequence and jumpscare */}
      {(currentEnding !== '3D_HOUSE' && currentEnding !== 'JUMPSCARE') && (
        <div className="fixed bottom-0 w-full h-8 bg-[#c0c0c0] border-t-2 border-white flex items-center px-2 z-[1000]">
          <div onClick={handleStartClick} className="px-4 py-1 border-2 border-white border-r-black border-b-black font-bold text-sm bg-[#c0c0c0] active:border-black active:shadow-inner cursor-pointer select-none min-w-[60px] text-center">
            {getStartText()}
          </div>
          <div className="ml-auto px-2 border-2 border-black border-r-white border-b-white text-[10px] bg-gray-300 cursor-pointer select-none" onClick={handleClockClick}>
             {clockClicks < 10 ? new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
              clockClicks >= 95 ? "SYSTEM_SYNC_1995" : "ERROR: TIME_HALTED"}
          </div>
        </div>
      )}
    </div>
  );
};

const Window = ({ title, id, children, onClose, x, y, onMove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest('.title-bar')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - x,
        y: e.clientY - y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        onMove(id, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, onMove]);

  return (
    <div 
      className="absolute border-2 border-white border-r-black border-b-black bg-[#c0c0c0] shadow-[2px_2px_0px_rgba(0,0,0,0.5)] z-50 min-w-[100px]" 
      style={{ left: x, top: y }}
    >
      <div 
        onMouseDown={handleMouseDown}
        className="title-bar bg-[#000080] text-white px-2 flex justify-between items-center text-[11px] font-bold h-6 cursor-default mb-0.5 select-none"
      >
        <span>{title}</span>
        <button 
          onMouseDown={(e) => e.stopPropagation()} 
          onClick={onClose} 
          className="bg-gray-300 text-black px-1.5 border-2 border-white border-r-black border-b-black active:border-black text-[10px] leading-none pb-0.5"
        >
          x
        </button>
      </div>
      <div className="p-1">{children}</div>
    </div>
  );
};

const Icon = ({ name, icon, onClick }) => (
  <div onClick={onClick} className="flex flex-col items-center cursor-pointer group w-20">
    <div className="text-4xl group-active:scale-95 drop-shadow-md select-none">{icon}</div>
    <div className="text-white text-[10px] font-bold mt-1 bg-[#000080] px-1 text-center truncate w-full group-active:bg-blue-600">{name}</div>
  </div>
);

const Ending = ({ title, body, emoji, color="bg-black text-green-500" }) => (
  <div className={`fixed inset-0 z-[6000] flex flex-col items-center justify-center text-center p-10 ${color}`}>
    <div className="text-9xl mb-10 animate-bounce">{emoji}</div>
    <div className="text-4xl font-bold uppercase tracking-widest">{title}</div>
    <div className="mt-4 text-lg max-w-lg leading-relaxed">{body}</div>
    <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mt-16 px-8 py-4 border-4 border-current hover:bg-current hover:text-black transition-colors font-bold uppercase">Reset Terminal</button>
  </div>
);

export default App;