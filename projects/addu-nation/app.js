
angular.module('adduApp',[]).controller('Main',['$scope','$timeout',function($s,$t){
  /* ─── STATE ─── */
  $s.in=false; $s.lf={role:'alumni'}; $s.role='alumni'; $s.pg='home';
  $s.dtab='urgent'; $s.qtab='all'; $s.ptype='rec'; $s.pfreq='15'; $s.pamt='50.00'; $s.ppay='card'; $s.ccat='com'; $s.q='';
  var chartsOk=false,pledgeOk=false;

  $s.titles={home:'Home',network:'Alumni Network',donate:'Donation Hub',career:'Career Opportunities',docs:'Academic Records',profile:'Profile',pledge:'Pledge & Automate',impact:'My Impact',campaign:'Create Campaign','proj-detail':'Project Details','ty-student':'Donation Complete','emg-detail':'Emergency Detail','ty-emg':'Donation Complete',queue:'Moderation Queue',review:'Reviewing of Charity',insights:'Donation Insights',messages:'Messages'};
  $s.subs={home:'Good day! Here\'s your daily overview.',network:'Discover and connect with peers.',donate:'Support University Initiatives.',career:'Discover and connect with peers.',docs:'Manage your credentials.',profile:'Your verified alumni profile.',pledge:'Tracking your generosity.',impact:'Tracking your generosity.',campaign:'Submit a new fundraising campaign.',queue:'Pending submissions for review.',insights:'Platform analytics overview.',messages:'Staff communications.'};

  $s.doLogin=function(){$s.role=$s.lf.role;$s.in=true;$s.pg='home';if($s.role=='admin')$t(initCharts,400);else $t(initPledge,400);};
  $s.logout=function(){$s.in=false;$s.lf={role:'alumni'};};
  $s.swRole=function(r){$s.role=r;$s.pg='home';if(r=='admin')$t(initCharts,400);else $t(initPledge,400);};
  $s.go=function(p){$s.pg=p;if(p==='insights')$t(initCharts,350);if(p==='pledge')$t(initPledge,350);};
  $s.$watch('pg',function(n){if(n==='insights'&&$s.role==='admin')$t(initCharts,350);if(n==='pledge')$t(initPledge,350);});
  $s.fQ=function(){return $s.qtab==='all'?$s.d.queue:$s.d.queue.filter(function(q){return q.type===$s.qtab;});};

  /* ─── DATA ─── */
  $s.d={
    acts:[
      {ico:'💬',bg:'#DBEAFE',title:'New Mentor Message',sub:'Dr. Reyes replied to your inquiry about...',time:'15m ago'},
      {ico:'🧾',bg:'#DCFCE7',title:'Donation Receipt Ready',sub:'Thank you for your contribution to the...',time:'2h ago'},
      {ico:'⏰',bg:'#EDE9FE',title:'Job Application Update',sub:'Your application for "Project Manager" wa...',time:'1d ago'}
    ],
    network:[
      {init:'SC',name:'Sarah Chen',role:'Senior Product Designer at TechFlow',prog:"BS Computer Science '18"},
      {init:'MJ',name:'Marcus Johnson',role:'Head of Marketing at Global Corp',prog:"BA Communications '15"},
      {init:'ER',name:'Elena Rodriguez',role:'Civil Engineer at BuildRight Inc.',prog:"BS Civil Engineering '19"},
      {init:'KP',name:'Kevin Park',role:'Data Scientist at Meta',prog:"BS Mathematics '20"},
      {init:'AL',name:'Ana Lim',role:'UX Designer at Canva',prog:"BS Multimedia Arts '17"},
      {init:'RM',name:'Ramos Miguel',role:'Software Engineer at Google',prog:"BS Computer Science '16"}
    ],
    urgent:[
      {emoji:'🎓',bg:'linear-gradient(135deg,#1e3a8a,#3b82f6)',title:"Class of '24 Scholarship F...",desc:"Helping underprivileged students with educational support and resources.",raised:'4,500',goal:'5,000',pct:90},
      {emoji:'🤖',bg:'linear-gradient(135deg,#064e3b,#059669)',title:'Robotics Club Finals Trip',desc:'Support our team reaching the national robotics championship.',raised:'800',goal:'1,200',pct:67},
      {emoji:'🏥',bg:'linear-gradient(135deg,#7c2d12,#ea580c)',title:'Medical Aid for Alumni Jo...',desc:'Urgent assistance for surgery costs for an alumnus in need.',raised:'2,000',goal:'10,000',pct:20}
    ],
    projects:[
      {emoji:'🤖',bg:'linear-gradient(135deg,#1e3a8a,#60a5fa)',dept:'ENGINEERING',title:'Robotics Team Finals',org:'👥 Engineering Club',desc:'Building a semi-autonomous rover for the University Rover Challenge. We need...',raised:'1,200',goal:'2,000',pct:60},
      {emoji:'🌱',bg:'linear-gradient(135deg,#14532d,#22c55e)',dept:'AGRICULTURE',title:'Urban Garden Study',org:'🌿 Agriculture Dept.',desc:'Studying the effects of vertical farming in urban environments. Help us set up...',raised:'450',goal:'1,500',pct:30},
      {emoji:'🎨',bg:'linear-gradient(135deg,#4c1d95,#a78bfa)',dept:'ARTS',title:'Campus Mural Project',org:'🎨 Fine Arts Society',desc:'Bringing campus spaces to life through collaborative large-scale art murals.',raised:'800',goal:'800',pct:100}
    ],
    emergency:[
      {emoji:'🔥',aico:'👤',bg:'linear-gradient(180deg,#450a0a,#7f1d1d)',person:'House Fire Reco...',fund:"Fund for Michael Chen '15",priority:'High Priority',ptag:'t-red',cap:'Message from Michael',desc:'My family lost our home in the recent wildfires. We are safe but lost everything. Funds will be used for temporary housing and basic necessities.',raised:'18,450',goal:'25k',pct:73,pctlbl:'73%',urgency:'Immediate Assistance Needed',donors:142},
      {emoji:'🏥',aico:'👩',bg:'linear-gradient(180deg,#0c1a4a,#1e3a8a)',person:'Urgent Surgery Fund',fund:"Fund for Sarah Miller '19",priority:'Medical',ptag:'t-blue',cap:'Update Video',desc:'Unforeseen complications from a recent accident have led to emergency surgery not fully covered by insurance. Any help is deeply appreciated.',raised:'5,200',goal:'15k',pct:34,pctlbl:'34%',urgency:'Surgery in 3 days',donors:45}
    ],
    jobs:[
      {logo:'🔍',title:'Senior Product Designer',company:'Google',loc:'Mountain View, CA',salary:'$140k–$180k',type:'Full-time',remote:true},
      {logo:'🎵',title:'UX Researcher',company:'Spotify',loc:'New York, NY',salary:'$110k–$145k',type:'Contract',remote:false}
    ],
    mentors:[
      {init:'SJ',name:"Sarah Jenkins, '15",role:'VP Marketing @ Adobe',bio:"Specializing in digital strategy and brand growth. Happy to review..."},
      {init:'DK',name:"David Kim, '12",role:'Engineering Lead @ Shopify',bio:'Can help with technical interviews and engineering career paths...'}
    ],
    docSvc:[
      {ico:'📋',bg:'#DCFCE7',name:'Official Transcript',sub:'Sealed & Certified Copy',act:'Request'},
      {ico:'🏅',bg:'#EDE9FE',name:'e-Diploma',sub:'Digital Certificate',act:'Download'},
      {ico:'🔖',bg:'#FFF7ED',name:'Degree Verification',sub:'For HR & Employers',act:'Request'}
    ],
    docHist:[
      {ico:'📋',name:'Official Transcript',req:'Req #TR-2024-892',date:'Oct 12',st:'Processing'},
      {ico:'🛡️',name:'Certificate of Good Moral',req:'Req #GM-2024-110',date:'Sep 28',st:'Ready'},
      {ico:'🪪',name:'Student ID Replacement',req:'Req #ID-2024-005',date:'Sep 15',st:'Completed'}
    ],
    creds:[
      {ico:'📊',name:'Advanced Data Analytics',iss:'Google Career Certs',active:true,pending:false},
      {ico:'🏅',name:'Project Management',iss:'PMI Institute',active:false,pending:true}
    ],
    pfields:[
      {l:'Full Name',r:'Alex Johnson'},{l:'Student ID',r:'ADDU-2018-0921'},{l:'Email',r:'alex.johnson@addu.edu.ph'},
      {l:'Program',r:'BS Information Technology'},{l:'Year Graduated',r:'2018'},{l:'Honors',r:'Magna Cum Laude'}
    ],
    settings:[
      {ico:'🔔',lbl:'Notifications',path:'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0'},
      {ico:'🔒',lbl:'Privacy Settings',path:'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4'},
      {ico:'🌙',lbl:'Theme',path:'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'},
      {ico:'📋',lbl:'Activity History',path:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2'},
      {ico:'❓',lbl:'Help & Support',path:'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01'}
    ],
    adminActs:[
      {ico:'💸',bg:'#DCFCE7',title:'New Donation Received',sub:'Maria C. donated $500 to "Scholars Fund"',time:'2m ago'},
      {ico:'💼',bg:'#DBEAFE',title:'Job Posting Approval',sub:'Pending review for "Senior Dev" at...',time:'1h ago'},
      {ico:'👤',bg:'#EDE9FE',title:'New Alumni Registration',sub:'Batch 2024 graduate registered via portal',time:'3h ago'}
    ],
    queue:[
      {ico:'📢',bg:'#DBEAFE',title:'New Campaign: Annual Charity Gala',sub:'Sarah Jenkins',time:'2 hrs ago',type:'donations',tc:'t-blue',tl:'Donation',dl:'Target Goal',dv:'$25,000.00'},
      {ico:'👤',bg:'#EDE9FE',title:'New Member Request',sub:'Class of 2023',time:'5 hrs ago',type:'network',tc:'t-purple',tl:'Network',mn:'Michael Chen',md:'BS Computer Science'},
      {ico:'💼',bg:'#FFF7ED',title:'Job Post: Senior Analyst',sub:'TechFlow Inc.',time:'1 day ago',type:'career',tc:'t-orange',tl:'Career',jd:'Seeking a senior analyst to join our expanding team. Responsibilities include data modeling and strategi...'},
      {ico:'✅',bg:'#DCFCE7',title:'Diploma Verification',sub:'Maria Gonzales',time:'2 days ago',type:'document',tc:'t-green',tl:'Document',fn:'diploma_scan_2023.pdf',fs:'2.4 MB'},
      {ico:'🚨',bg:'#FEE2E2',title:'Emergency Fund Request',sub:'John Dela Cruz',time:'30m ago',type:'emergency',tc:'t-red',tl:'Emergency',dl:'Amount Requested',dv:'$8,000.00'}
    ],
    legend:[
      {l:'Student Projects',c:'#135BEC',p:35},{l:'Alumni Business',c:'#a855f7',p:25},
      {l:'Community',c:'#f97316',p:20},{l:'Emergency Funds',c:'#22c55e',p:15},{l:'Other',c:'#e5e7eb',p:5}
    ],
    msgs:[
      {init:'MS',bg:'#FEF3C7',from:'Maria Santos',subject:'Regarding my scholarship application',time:'10m ago',unread:true},
      {init:'JR',bg:'#DBEAFE',from:'Jose Reyes',subject:'Document verification follow-up',time:'2h ago',unread:true},
      {init:'AC',bg:'#DCFCE7',from:'Ana Cruz',subject:'Re: Emergency fund request',time:'1d ago',unread:false},
      {init:'LG',bg:'#FCE7F3',from:'Luis Garcia',subject:'Campaign creation assistance',time:'2d ago',unread:false}
    ],
    txns:[
      {ico:'🔬',name:'Science Lab Fund',type:'Monthly Contribution',st:'Completed',date:'Oct 24, 2023',amt:'50.00'},
      {ico:'🎓',name:'Scholarship Fund',type:'One-time Donation',st:'Completed',date:'Oct 15, 2023',amt:'1,200.00'},
      {ico:'🎟️',name:'Reunion Ticket',type:'Event Purchase',st:'Processing',date:'Yesterday',amt:'125.00'}
    ],
    team:[
      {init:'S',name:'Sarah',dept:'MECHE'},{init:'D',name:'David',dept:'CS'},
      {init:'P',name:'Priya',dept:'EE'},{init:'M',name:'Marcus',dept:'PHYSICS'}
    ]
  };

  /* ─── CHARTS ─── */
  function initCharts(){
    if(chartsOk)return;
    var tC=document.getElementById('trendC'),dC=document.getElementById('donutC');
    if(!tC||!dC)return;
    chartsOk=true;
    new Chart(tC,{type:'line',data:{labels:['Week 1','Week 2','Week 3','Week 4'],datasets:[{label:'Donations',data:[18000,32000,42500,38000],borderColor:'#135BEC',backgroundColor:'rgba(19,91,236,.07)',borderWidth:3,fill:true,tension:0.45,pointBackgroundColor:'#135BEC',pointRadius:5,pointHoverRadius:7}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return'$'+c.parsed.y.toLocaleString();}}}},scales:{y:{grid:{color:'#f3f4f6'},ticks:{callback:function(v){return'$'+(v/1000)+'k';}}},x:{grid:{display:false}}}}});
    new Chart(dC,{type:'doughnut',data:{labels:$s.d.legend.map(function(l){return l.l;}),datasets:[{data:$s.d.legend.map(function(l){return l.p;}),backgroundColor:$s.d.legend.map(function(l){return l.c;}),borderWidth:0,hoverOffset:5}]},options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false}}}});
  }
  function initPledge(){
    if(pledgeOk)return;
    var c=document.getElementById('pledgeC');
    if(!c)return;
    pledgeOk=true;
    new Chart(c,{type:'doughnut',data:{labels:['Scholarships','Projects','Events','Emergency'],datasets:[{data:[562.5,312.5,250,125],backgroundColor:['#040354','#eab308','#ec4899','#22c55e'],borderWidth:0,hoverOffset:4}]},options:{responsive:true,maintainAspectRatio:false,cutout:'60%',plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return'$'+c.parsed.toLocaleString();}}}}}});
  }
}]);
