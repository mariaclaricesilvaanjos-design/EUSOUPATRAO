(() => {
  "use strict";
  const STORAGE_KEY = "prato-prosa-data-v1";
  const donationPixPayload = "00020126330014br.gov.bcb.pix0111015619225015204000053039865802BR5921FABIO SILVA DOS ANJOS6009Sao Paulo62290525REC6AF09CB01264A2203363336304C140";
  const palettes = {blue:["Azul índigo","#6658d3"],green:["Verde esmeralda","#2f9676"],violet:["Roxo violeta","#8156c8"],coral:["Laranja coral","#de7852"],rose:["Rosa carmim","#c84f79"],graphite:["Cinza grafite","#596174"]};
  const templates = [
    {key:"greeting",title:"Boas-vindas",icon:"☀",hint:"Para receber um novo cliente.",text:"Oi, {cliente}! Que bom ter você por aqui 💛\n\nNo {negocio}, tudo é preparado com carinho. Como posso ajudar?"},
    {key:"confirmation",title:"Pedido confirmado",icon:"✓",hint:"Confirme o pedido e compartilhe o Pix.",text:"Pedido confirmado, {cliente}! 🎉\n\nSeu pedido: {pedido}\nTotal: {valor}\nPix: {pix}\n\nObrigada por escolher o {negocio}!"},
    {key:"route",title:"Saiu para entrega",icon:"↗",hint:"Avise que o pedido está a caminho.",text:"Oi, {cliente}! Seu pedido já saiu para entrega 🛵\n\nQualquer coisa, pode me chamar por aqui. Até já!"},
    {key:"soldout",title:"Produto esgotado",icon:"♡",hint:"Avise com cuidado e ofereça uma alternativa.",text:"Oi, {cliente}! O {produto} esgotou por hoje 😅\n\nPosso te oferecer outra opção? Logo teremos mais. Obrigada pela compreensão!"},
    {key:"afterSale",title:"Pós-venda",icon:"✿",hint:"Um carinho depois da entrega.",text:"Oi, {cliente}! Passando para saber se chegou tudo certinho 💛\n\nAdorei preparar seu pedido. Quando bater a vontade, é só chamar o {negocio}!"},
    {key:"hours",title:"Horário de atendimento",icon:"◷",hint:"Compartilhe quando você está por aqui.",text:"Oi! O {negocio} atende {horarios}.\n\nPode mandar seu pedido por aqui. Vou adorar preparar para você!"}
  ];
  const seed = {
    settings:{businessName:"Cantinho da Ana",ownerName:"Ana Souza",whatsapp:"",pix:"",hours:"Seg a sáb, 10h às 20h",palette:"blue",mode:"light",logo:"",cover:""},
    products:[
      {id:"p1",name:"Geladinho de morango",category:"Geladinhos",quantity:8,minimum:10,price:5,emoji:"🍓"},
      {id:"p2",name:"Brownie tradicional",category:"Doces",quantity:18,minimum:6,price:8,emoji:"🍫"},
      {id:"p3",name:"Brigadeiro gourmet",category:"Doces",quantity:4,minimum:8,price:4,emoji:"🍬"},
      {id:"p4",name:"Suco natural 300ml",category:"Bebidas",quantity:12,minimum:5,price:7,emoji:"🍊"}
    ],
    clients:[
      {id:"c1",name:"Mariana Oliveira",phone:"",orders:5,total:142,lastOrderDate:todayIso()},
      {id:"c2",name:"Lucas Mendes",phone:"",orders:3,total:86,lastOrderDate:daysAgoIso(1)},
      {id:"c3",name:"Camila Santos",phone:"",orders:2,total:54,lastOrderDate:daysAgoIso(5)},
      {id:"c4",name:"Rafael Lima",phone:"",orders:1,total:32,lastOrderDate:daysAgoIso(18)}
    ],
    orders:[
      {id:"PED-042",client:"Mariana Oliveira",item:"2x Brownie tradicional",total:16,status:"Em preparo",date:todayIso()},
      {id:"PED-041",client:"Lucas Mendes",item:"1x Geladinho de morango",total:5,status:"Pronto",date:new Date(Date.now()-3600000).toISOString()},
      {id:"PED-040",client:"Camila Santos",item:"3x Brigadeiro gourmet",total:12,status:"Entregue",date:new Date(Date.now()-7200000).toISOString()}
    ],
    sales:[{id:"v1",description:"Pedidos do dia",amount:148,kind:"Faturamento bruto",date:todayIso()}],
    ingredients:[
      {id:"i1",name:"Chocolate em pó",quantity:2400,unit:"g",minimum:500,unitCost:.035},
      {id:"i2",name:"Farinha de trigo",quantity:3000,unit:"g",minimum:800,unitCost:.008},
      {id:"i3",name:"Leite condensado",quantity:12,unit:"lata",minimum:3,unitCost:6.5}
    ],
    recipes:[{id:"r1",name:"Brownie tradicional",productId:"p2",yield:12,price:8,ingredients:[{ingredientId:"i1",quantity:300},{ingredientId:"i2",quantity:250}]}],
    batches:[
      {id:"b1",ingredientId:"i1",lot:"CH-2401",quantity:1400,expiry:daysFromToday(34)},
      {id:"b2",ingredientId:"i1",lot:"CH-2402",quantity:1000,expiry:daysFromToday(80)},
      {id:"b3",ingredientId:"i2",lot:"FT-112",quantity:3000,expiry:daysFromToday(70)}
    ],
    expenses:[{id:"e1",description:"Embalagens",amount:32,type:"Variável",date:todayIso()}],
    messages:{},advanced:false
  };
  function todayIso(){return new Date().toISOString();}
  function daysAgoIso(days){return new Date(Date.now()-days*86400000).toISOString();}
  function daysFromToday(days){return new Date(Date.now()+days*86400000).toISOString().slice(0,10);}
  const $ = (selector,root=document)=>root.querySelector(selector);
  const $$ = (selector,root=document)=>[...root.querySelectorAll(selector)];
  const escapeHtml = value=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const money = value=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(value)||0);
  const clone = data=>JSON.parse(JSON.stringify(data));
  const firstVisit=(()=>{try{return localStorage.getItem(STORAGE_KEY)===null;}catch{return false;}})();
  let state=loadState(),orderFilter="todos",advancedTab="recipes",toastTimer;
  const CLOUD_REVISION_KEY="prato-prosa-cloud-revision-v1";
  const CLOUD_LOGIN_PENDING_KEY="prato-prosa-google-login-pending-v1";
  let supabaseClient=null,supabaseModulePromise=null,cloudUser=null,cloudRevision=null,cloudSyncEnabled=false,cloudMfaRequired=false,cloudMfaMode="enroll",cloudConnecting=false,cloudSaveTimer=null,cloudSaveQueue=Promise.resolve(),suppressCloudSave=false,cloudStatusText="Dados salvos neste dispositivo",cloudDetailText="Entre para configurar a sincronização Supabase.";

  function loadState(){
    try{
      const saved=localStorage.getItem(STORAGE_KEY);
      if(!saved)return clone(seed);
      const data=JSON.parse(saved);
      return {...clone(seed),...data,settings:{...seed.settings,...data.settings},products:Array.isArray(data.products)?data.products:seed.products,clients:Array.isArray(data.clients)?data.clients:seed.clients,orders:Array.isArray(data.orders)?data.orders:seed.orders,sales:Array.isArray(data.sales)?data.sales:seed.sales,ingredients:Array.isArray(data.ingredients)?data.ingredients:seed.ingredients,recipes:Array.isArray(data.recipes)?data.recipes:seed.recipes,batches:Array.isArray(data.batches)?data.batches:seed.batches,expenses:Array.isArray(data.expenses)?data.expenses:seed.expenses,messages:data.messages||{}};
    }catch(error){console.error("Não foi possível ler os dados locais.",error);return clone(seed);}
  }
  function persist(){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));if(!suppressCloudSave)scheduleCloudSave();return true;}
    catch(error){console.error("Não foi possível salvar os dados locais.",error);notify("Não foi possível salvar. Verifique o espaço disponível no navegador.");return false;}
  }
  function notify(message){
    const toast=$("#toast");toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2800);
  }
  function cloudConfig(){
    const config=window.PRATO_PROSA_SUPABASE;
    return config&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(config.url||"")&&typeof config.anonKey==="string"&&config.anonKey.length>20?config:null;
  }
  function updateCloudUI(status,detail){
    const configured=Boolean(cloudConfig());
    if(status)cloudStatusText=status;
    if(detail)cloudDetailText=detail;
    $("#cloud-status").textContent=cloudStatusText;
    $("#cloud-account-email").textContent=cloudDetailText;
    $("#cloud-status-dot").classList.toggle("cloud-connected",Boolean(cloudUser&&cloudSyncEnabled));
    $("#cloud-status-dot").classList.toggle("cloud-authenticated",Boolean(cloudUser&&!cloudSyncEnabled));
    $("#cloud-signin").hidden=!configured||Boolean(cloudUser);
    $("#cloud-mfa-enroll").hidden=!cloudMfaRequired;
    $("#cloud-mfa-enroll").dataset.action=cloudMfaMode==="challenge"?"cloud-mfa-challenge":"cloud-mfa-enroll";
    $("#cloud-mfa-enroll").textContent=cloudMfaMode==="challenge"?"Digitar código de verificação":"Configurar verificação em duas etapas";
    $("#cloud-upload").hidden=!cloudUser||cloudSyncEnabled||cloudMfaRequired;
    $("#cloud-signout").hidden=!cloudUser;
    $("#business-storage-status").textContent=cloudUser?(cloudSyncEnabled?"Google conectado · sincronizado":"Google conectado"):"Dados neste dispositivo";
    $("#storage-label").textContent=cloudUser?"Conta Google conectada":"Seus dados são locais";
    $("#connection-label").textContent=cloudUser
      ?cloudSyncEnabled?"Sincronização Supabase ativa":cloudMfaRequired?"Verificação em duas etapas pendente":"Sincronização de dados pendente"
      :"Disponível offline";
    $("#cloud-sync-note").textContent=!configured
      ?"O projeto Supabase ainda não está configurado. O app continua salvando localmente; adicione Project URL e chave publicável em supabase-config.js. Nunca use a chave service_role aqui."
      :cloudUser
        ?"O app mantém dados locais e sincroniza uma cópia privada da conta após a escolha explícita. Conflitos entre dispositivos pausam a sincronização para evitar sobrescrita silenciosa."
        :"Conecte um projeto Supabase configurado. A chave publicável é apropriada para o navegador quando a migração com RLS estiver aplicada.";
  }
  async function getSupabaseClient(){
    const config=cloudConfig();
    if(!config)throw new Error("Supabase não está configurado. Adicione a URL do projeto e a chave publicável em supabase-config.js.");
    if(supabaseClient)return supabaseClient;
    if(!supabaseModulePromise)supabaseModulePromise=import("https://esm.sh/@supabase/supabase-js@2");
    const {createClient}=await supabaseModulePromise;
    supabaseClient=createClient(config.url.replace(/\/$/,""),config.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    supabaseClient.auth.onAuthStateChange((event,session)=>{
      if(event==="INITIAL_SESSION")return;
      window.setTimeout(()=>handleCloudAuthChange(session?.user||null),0);
    });
    return supabaseClient;
  }
  async function handleCloudAuthChange(user){
    if(!user){
      cloudUser=null;cloudRevision=null;cloudSyncEnabled=false;cloudMfaRequired=false;cloudMfaMode="enroll";clearTimeout(cloudSaveTimer);
      updateCloudUI("Sessão encerrada","Seus dados locais continuam disponíveis.");return;
    }
    try{await connectCloudUser(user);}
    catch(error){
      console.error("Não foi possível verificar a conta Supabase.",error);
      updateCloudUI("Não foi possível verificar a conta",error.message);
      notify("A conta foi autenticada, mas a verificação de segurança falhou.");
    }
  }
  async function connectCloudUser(user){
    if(cloudConnecting&&cloudUser?.id===user.id)return;
    cloudConnecting=true;cloudUser=user;cloudSyncEnabled=false;cloudMfaRequired=false;
    try{await loadCloudUser(user);}finally{cloudConnecting=false;}
  }
  async function loadCloudUser(user){
    const client=await getSupabaseClient();
    updateCloudUI("Conta Google conectada",user.email||"Conta autenticada");
    const {data:assurance,error:assuranceError}=await client.auth.mfa.getAuthenticatorAssuranceLevel();
    if(assuranceError)throw assuranceError;
    if(assurance.currentLevel!=="aal2"){
      const {data:factors,error:factorsError}=await client.auth.mfa.listFactors();
      if(factorsError)throw factorsError;
      const verifiedFactor=factors.totp.find(factor=>factor.status==="verified");
      if(verifiedFactor){
        cloudMfaRequired=true;cloudMfaMode="challenge";
        updateCloudUI("Verificação em duas etapas necessária","Digite o código do seu aplicativo autenticador.");
        await challengeCloudMfa(verifiedFactor);
      }else{
        cloudMfaRequired=true;cloudMfaMode="enroll";
        updateCloudUI("Configure a verificação em duas etapas","A sincronização só é liberada após verificar um aplicativo autenticador.");
      }
      return;
    }
    updateCloudUI("Verificando dados na nuvem",user.email||"Conta autenticada");
    const {data,error}=await client.from("user_app_state").select("payload,revision,updated_at").eq("user_id",user.id).maybeSingle();
    if(error){
      console.error("Não foi possível ler os dados do Supabase.",error);
      cloudRevision=null;
      updateCloudUI("Conta Google conectada; banco indisponível",error.message);
      notify("Não foi possível acessar a tabela. Aplique a migração Supabase e confira as policies RLS.");return;
    }
    const hasLocal=localStorage.getItem(STORAGE_KEY)!==null;
    let syncMarker=null;
    try{syncMarker=JSON.parse(localStorage.getItem(CLOUD_REVISION_KEY)||"null");}catch{}
    const knownRevision=syncMarker?.userId===user.id?Number(syncMarker.revision):0;
    if(!data){
      cloudRevision=null;
      updateCloudUI("Conta Google conectada",hasLocal?"Não há cópia na nuvem. Escolha se quer enviar os dados deste dispositivo.":"Não há cópia na nuvem. A conta está pronta para receber os primeiros dados.");
      return;
    }
    if(hasLocal&&knownRevision!==Number(data.revision)){
      const useCloud=confirm("Há dados salvos na nuvem e uma cópia diferente neste dispositivo. OK: manter uma cópia local de segurança e carregar os dados da nuvem. Cancelar: manter os dados deste dispositivo; a sincronização ficará pausada até você escolher enviá-los.");
      if(!useCloud){
        cloudRevision=Number(data.revision);
        updateCloudUI("Conectado; versões diferentes","Os dados locais foram mantidos. Use “Enviar dados deste dispositivo” somente se quiser substituir a cópia da nuvem.");
        return;
      }
      try{
        localStorage.setItem(`${STORAGE_KEY}-backup-${Date.now()}`,localStorage.getItem(STORAGE_KEY));
      }catch(error){
        console.error("Não foi possível preservar os dados locais antes da restauração.",error);
        updateCloudUI("Restauração cancelada","Não foi possível criar uma cópia local de segurança.");
        notify("A restauração foi cancelada para proteger os dados deste dispositivo.");return;
      }
    }
    if(!hasLocal||knownRevision!==Number(data.revision)){
      try{state=validateImport({data:data.payload});}
      catch(error){
        console.error("Os dados recebidos do Supabase são inválidos.",error);
        updateCloudUI("Dados na nuvem inválidos","Nada foi substituído neste dispositivo.");
        notify("A cópia do Supabase não passou na validação. Os dados locais foram preservados.");return;
      }
      suppressCloudSave=true;
      try{persist();}finally{suppressCloudSave=false;}
      renderAll();
    }
    cloudRevision=Number(data.revision);cloudSyncEnabled=true;
    localStorage.setItem(CLOUD_REVISION_KEY,JSON.stringify({userId:user.id,revision:cloudRevision}));
    updateCloudUI("Sincronizado com Supabase",user.email||"Conta autenticada");
  }
  async function initializeCloud(){
    if(!cloudConfig()){updateCloudUI();return;}
    updateCloudUI("Verificando sessão Supabase","Conectando com segurança…");
    try{
      const client=await getSupabaseClient(),{data,error}=await client.auth.getSession();
      if(error)throw error;
      const loginPending=localStorage.getItem(CLOUD_LOGIN_PENDING_KEY);
      const authError=new URLSearchParams(location.search).get("error_description")||new URLSearchParams(location.search).get("error");
      if(authError){
        localStorage.removeItem(CLOUD_LOGIN_PENDING_KEY);
        updateCloudUI("Não foi possível entrar com Google","Confira a configuração do provedor e tente novamente.");
        notify(`Login com Google não concluído: ${authError}`);
        return;
      }
      if(data.session){
        await connectCloudUser(data.session.user);
        if(loginPending){
          localStorage.removeItem(CLOUD_LOGIN_PENDING_KEY);
          const returnRoute=loginPending.replace(/^#/,"");
          if(routeNames[returnRoute])navigate(returnRoute,true);
          notify(`Login com Google confirmado${data.session.user.email?`: ${data.session.user.email}`:""}.`);
        }
      }else{
        localStorage.removeItem(CLOUD_LOGIN_PENDING_KEY);
        updateCloudUI("Dados salvos neste dispositivo","Entre com Google para conectar à sua conta.");
        if(loginPending)notify("Não foi possível confirmar a sessão Google. Tente entrar novamente.");
      }
    }catch(error){
      console.error("Não foi possível inicializar o Supabase.",error);
      updateCloudUI("Supabase indisponível","Confira a conexão, a URL e a chave publicável.");
      notify("Não foi possível conectar ao Supabase. Os dados locais continuam disponíveis.");
    }
  }
  function scheduleCloudSave(){
    if(!cloudSyncEnabled||!cloudUser)return;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer=setTimeout(()=>saveCloudState(false),700);
  }
  function saveCloudState(explicit){
    if(!cloudUser||!supabaseClient)return Promise.resolve(false);
    cloudSaveQueue=cloudSaveQueue.then(async()=>{
      if(!cloudUser||(!cloudSyncEnabled&&!explicit))return false;
      const snapshot=clone(state),revision=cloudRevision;
      const {data,error}=await supabaseClient.rpc("save_my_app_state",{p_payload:snapshot,p_expected_revision:revision});
      if(error){
        console.error("A sincronização Supabase falhou.",error);
        cloudSyncEnabled=false;
        const conflict=error.code==="40001"||/changed on another device/i.test(error.message||"");
        updateCloudUI(conflict?"Conflito entre dispositivos":"Falha na sincronização",conflict?"Outra sessão alterou os dados. Recarregue e escolha a versão que deseja manter.":error.message);
        notify(conflict?"A sincronização foi pausada para proteger os dados. Recarregue antes de escolher uma versão.":"Os dados continuam salvos neste dispositivo; não foi possível enviá-los.");
        return false;
      }
      cloudRevision=Number(data);cloudSyncEnabled=true;
      localStorage.setItem(CLOUD_REVISION_KEY,JSON.stringify({userId:cloudUser.id,revision:cloudRevision}));
      updateCloudUI("Sincronizado com Supabase",cloudUser.email||"Conta autenticada");
      if(JSON.stringify(snapshot)!==JSON.stringify(state))scheduleCloudSave();
      return true;
    }).catch(error=>{
      console.error("Erro inesperado ao sincronizar com Supabase.",error);
      cloudSyncEnabled=false;updateCloudUI("Falha na sincronização",error.message);
      notify("A sincronização falhou. Seus dados locais foram mantidos.");return false;
    });
    return cloudSaveQueue;
  }
  async function signInToCloud(){
    const client=await getSupabaseClient();
    localStorage.setItem(CLOUD_LOGIN_PENDING_KEY,location.hash||"#configuracoes");
    updateCloudUI("Abrindo o login do Google","Você voltará para esta tela após autorizar a conta.");
    try{
      const {error}=await client.auth.signInWithOAuth({provider:"google",options:{redirectTo:`${location.origin}${location.pathname}`}});
      if(error)throw error;
    }catch(error){
      localStorage.removeItem(CLOUD_LOGIN_PENDING_KEY);
      updateCloudUI("Não foi possível iniciar o login","Os dados locais continuam disponíveis.");
      throw error;
    }
  }
  async function signOutFromCloud(){
    clearTimeout(cloudSaveTimer);
    await cloudSaveQueue;
    const client=await getSupabaseClient(),{error}=await client.auth.signOut();
    if(error)throw error;
    cloudUser=null;cloudRevision=null;cloudSyncEnabled=false;cloudMfaRequired=false;cloudMfaMode="enroll";
    updateCloudUI("Sessão encerrada","Seus dados locais continuam disponíveis.");
  }
  function showMfaDialog({mode,factorId,challengeId,qrCode,secret}){
    const setup=mode==="enroll";
    $("#dialog-content").innerHTML=`<div class="dialog-inner"><div class="dialog-heading"><div><p class="eyebrow">SEGURANÇA DA CONTA</p><h2 id="dialog-title">${setup?"Ative a verificação em duas etapas":"Confirme sua identidade"}</h2><p>${setup?"Leia o QR code no aplicativo autenticador e informe o código de 6 dígitos.":"Informe o código de 6 dígitos do seu aplicativo autenticador."}</p></div><button class="dialog-close" type="button" data-action="close-dialog" aria-label="Fechar">×</button></div>${setup?'<img id="cloud-mfa-qr" class="cloud-mfa-qr" alt="QR code para configurar o aplicativo autenticador"><p class="small-note">Se não puder ler o QR code, use esta chave manual:</p><code id="cloud-mfa-secret" class="cloud-mfa-secret"></code>':""}<form class="dialog-form" id="cloud-mfa-form" data-mode="${setup?"enroll":"challenge"}" data-factor-id="${escapeHtml(factorId)}" ${challengeId?`data-challenge-id="${escapeHtml(challengeId)}"`:""}><label class="field">Código de verificação<input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required aria-label="Código de verificação com seis dígitos"></label><div class="dialog-actions"><button class="button button-secondary" type="button" data-action="close-dialog">Cancelar</button><button class="button button-primary" type="submit">Verificar</button></div></form></div>`;
    if(setup){$("#cloud-mfa-qr").src=qrCode;$("#cloud-mfa-secret").textContent=secret;}
    const dialog=$("#app-dialog");dialog.showModal();$('input[name="code"]',dialog).focus();
  }
  async function challengeCloudMfa(factor){
    const client=await getSupabaseClient(),{data,error}=await client.auth.mfa.challenge({factorId:factor.id});
    if(error)throw error;
    showMfaDialog({mode:"challenge",factorId:factor.id,challengeId:data.id});
  }
  async function enrollCloudMfa(){
    const client=await getSupabaseClient(),{data,error}=await client.auth.mfa.enroll({factorType:"totp",friendlyName:"Prato & Prosa"});
    if(error)throw error;
    showMfaDialog({mode:"enroll",factorId:data.id,qrCode:data.totp.qr_code,secret:data.totp.secret});
  }
  async function verifyCloudMfa(form){
    const client=await getSupabaseClient(),formData=new FormData(form),code=String(formData.get("code")||"").trim(),factorId=form.dataset.factorId;
    let challengeId=form.dataset.challengeId;
    if(!challengeId){
      const challenge=await client.auth.mfa.challenge({factorId});
      if(challenge.error)throw challenge.error;
      challengeId=challenge.data.id;
    }
    const {error}=await client.auth.mfa.verify({factorId,challengeId,code});
    if(error)throw error;
    $("#app-dialog").close();cloudMfaRequired=false;
    const sessionResult=await client.auth.getSession();
    if(sessionResult.error)throw sessionResult.error;
    if(sessionResult.data.session)await connectCloudUser(sessionResult.data.session.user);
    notify("Verificação em duas etapas concluída.");
  }
  const todayKey=()=>new Date().toDateString();
  const todaysOrders=()=>state.orders.filter(order=>new Date(order.date).toDateString()===todayKey());
  const todaysSales=()=>state.sales.filter(sale=>new Date(sale.date).toDateString()===todayKey()).reduce((sum,sale)=>sum+Number(sale.amount||0),0);
  const dateDisplay=value=>new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"short"}).format(new Date(value));
  const localDateKey=()=>{const date=new Date();return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;};
  const batchIsValid=batch=>{
    if(typeof batch.expiry!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(batch.expiry))return false;
    const [year,month,day]=batch.expiry.split("-").map(Number),expiry=new Date(year,month-1,day);
    return expiry.getFullYear()===year&&expiry.getMonth()===month-1&&expiry.getDate()===day&&batch.expiry>=localDateKey()&&Number(batch.quantity)>0;
  };
  function applyAppearance(){
    document.documentElement.dataset.palette=state.settings.palette||"blue";
    const mode=state.settings.mode||"light",dark=mode==="dark"||(mode==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.mode=dark?"dark":"light";$("#color-mode").value=mode;$("#theme-toggle").textContent=dark?"☀":"◐";
  }
  function updateIdentity(){
    const name=state.settings.businessName||"Meu negócio",owner=state.settings.ownerName||"Você",logo=state.settings.logo;
    $("#business-name").textContent=name;$("#profile-name").textContent=owner;
    $("#welcome-title").innerHTML=`Olá, ${escapeHtml(owner.split(" ")[0])} <span class="wave">✳</span>`;
    document.title=`${name} — Prato & Prosa`;
    for(const element of [$("#business-avatar"),$("#profile-avatar"),$("#top-avatar")])element.innerHTML=logo?`<img src="${logo}" alt="">`:escapeHtml((element===$("#business-avatar")?name:owner).charAt(0).toUpperCase());
    const cover=state.settings.cover||"";
    $("#dashboard-cover").hidden=!cover;
    if(cover){$("#dashboard-cover-image").src=cover;$("#cover-business-name").textContent=name;$("#cover-hours").textContent=state.settings.hours||"";}
  }
  function updateDate(){
    const now=new Date();
    $("#today-date").textContent=new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"short",year:"numeric"}).format(now);
    $("#welcome-date").textContent=new Intl.DateTimeFormat("pt-BR",{weekday:"long",day:"numeric",month:"long"}).format(now).toUpperCase();
  }
  function statusClass(status){return status==="Em preparo"?"status-preparo":status==="Pronto"?"status-pronto":status==="Entregue"?"status-entregue":"status-cancelado";}
  function metric(label,value,foot,icon,iconClass){return `<article class="metric-card"><div class="metric-top"><span class="metric-label">${label}</span><span class="metric-icon ${iconClass}">${icon}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${foot}</div></article>`;}
  function revenueSeries(){
    const days=Array.from({length:7},(_,index)=>{
      const date=new Date();date.setHours(0,0,0,0);date.setDate(date.getDate()-(6-index));
      const key=date.toDateString(),total=state.sales.filter(sale=>new Date(sale.date).toDateString()===key).reduce((sum,sale)=>sum+Number(sale.amount||0),0);
      return {date,total,label:new Intl.DateTimeFormat("pt-BR",{weekday:"short"}).format(date).replace(".","")};
    });
    return days;
  }
  function revenueChart(id,container){
    const days=revenueSeries(),maximum=Math.max(...days.map(day=>day.total));
    if(maximum<=0)return '<div class="chart-empty"><span>◷</span><strong>Sem vendas registradas nesta semana</strong><small>Quando registrar vendas, a evolução aparece aqui.</small></div>';
    const width=720,height=258,chartFontSize=Math.min(24,Math.max(8,8640/(container.clientWidth||720))),left=66,right=704,top=20,bottom=202,plotWidth=right-left,plotHeight=bottom-top,step=Math.max(1,Math.ceil(maximum/4/10)*10),axisMax=step*4;
    const points=days.map((day,index)=>({x:left+plotWidth*index/(days.length-1),y:bottom-plotHeight*day.total/axisMax,...day}));
    const line=points.map(point=>`${point.x},${point.y}`).join(" "),area=`${left},${bottom} ${line} ${right},${bottom}`;
    const grid=Array.from({length:5},(_,index)=>{
      const value=axisMax*(4-index)/4,y=top+plotHeight*index/4;
      return `<g class="chart-gridline"><line x1="${left}" y1="${y}" x2="${right}" y2="${y}"/><text style="font-size:${chartFontSize}px" x="${left-12}" y="${y+4}" text-anchor="end">${value>=1000?`R$ ${(value/1000).toLocaleString("pt-BR",{maximumFractionDigits:1})} mil`:`R$ ${Math.round(value)}`}</text></g>`;
    }).join("");
    const labels=points.map(point=>`<text class="chart-x-label" style="font-size:${chartFontSize}px" x="${point.x}" y="${bottom+28}" text-anchor="middle">${escapeHtml(point.label)}</text>`).join("");
    const dots=points.map(point=>`<circle class="chart-point" cx="${point.x}" cy="${point.y}" r="5"><title>${new Intl.DateTimeFormat("pt-BR",{weekday:"long",day:"numeric",month:"long"}).format(point.date)}: ${money(point.total)}</title></circle>`).join("");
    const description=days.map(day=>`${new Intl.DateTimeFormat("pt-BR",{day:"2-digit",month:"2-digit"}).format(day.date)}: ${money(day.total)}`).join("; ");
    return `<svg class="revenue-chart" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" preserveAspectRatio="xMidYMid meet"><title id="${id}-title">Faturamento bruto por dia nos últimos 7 dias</title><desc id="${id}-desc">${escapeHtml(description)}</desc><defs><linearGradient id="${id}-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".24"/><stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>${grid}<polygon class="chart-area" points="${area}" fill="url(#${id}-area)"/><polyline class="chart-line" points="${line}"/>${dots}${labels}</svg><div class="chart-footnote"><span><i></i> Faturamento bruto</span><strong>${money(days.reduce((sum,day)=>sum+day.total,0))} <small>na semana</small></strong></div>`;
  }
  function renderDashboard(){
    const orders=todaysOrders();
    $("#dashboard-metrics").innerHTML=[
      metric("Faturamento de hoje",money(todaysSales()),'<span class="trend-up">↑</span> Valor bruto registrado',"↗","metric-purple"),
      metric("Pedidos hoje",orders.length,`${orders.filter(item=>item.status==="Em preparo").length} em preparo`,"▤","metric-green"),
      metric("Ticket médio",money(orders.length?orders.reduce((sum,o)=>sum+Number(o.total),0)/orders.length:0),"Média dos pedidos de hoje","◷","metric-orange"),
      metric("Clientes",state.clients.length,"Pessoas que já compraram","♙","metric-pink")
    ].join("");
    $("#recent-orders").innerHTML=orders.length?`<div class="order-list">${orders.slice(0,4).map(order=>`<div class="order-row"><span class="order-badge">${escapeHtml(order.id.slice(-3))}</span><span class="order-description"><strong>${escapeHtml(order.client)}</strong><small>${escapeHtml(order.item)}</small></span><span class="order-price">${money(order.total)}</span><span class="status ${statusClass(order.status)}">${escapeHtml(order.status)}</span></div>`).join("")}</div>`:`<div class="empty-state"><span>▤</span>Nenhum pedido registrado hoje.<br>Que tal anotar sua primeira venda?</div>`;
    const dashboardChart=$("#dashboard-revenue-chart");dashboardChart.innerHTML=revenueChart("dashboard-chart",dashboardChart);
    const low=state.products.filter(product=>Number(product.quantity)<=Number(product.minimum));
    $("#stock-alerts").innerHTML=low.length?low.slice(0,4).map(product=>`<div class="stock-item"><span class="stock-emoji">${escapeHtml(product.emoji||"📦")}</span><span class="stock-copy"><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.category||"Produto")}</small></span><span class="stock-level ${product.quantity===0?"low":""}">${product.quantity===0?"Esgotado":`${product.quantity} un.`}</span></div>`).join(""):`<div class="empty-state"><span>✓</span>Seu estoque está em dia!</div>`;
    $("#pending-count").textContent=state.orders.filter(order=>order.status==="Em preparo").length;
  }
  function renderOrders(){
    const query=($("#order-search")?.value||"").toLocaleLowerCase("pt-BR"),list=state.orders.filter(order=>(orderFilter==="todos"||order.status===orderFilter)&&order.client.toLocaleLowerCase("pt-BR").includes(query));
    $("#orders-table").innerHTML=list.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Itens</th><th>Valor</th><th>Status</th><th>Ação</th></tr></thead><tbody>${list.map(order=>`<tr><td class="table-primary">${escapeHtml(order.id)}<span class="table-secondary">${new Intl.DateTimeFormat("pt-BR",{hour:"2-digit",minute:"2-digit"}).format(new Date(order.date))}</span></td><td>${escapeHtml(order.client)}</td><td>${escapeHtml(order.item)}</td><td class="table-primary">${money(order.total)}</td><td><span class="status ${statusClass(order.status)}">${escapeHtml(order.status)}</span></td><td><div class="table-actions">${order.status==="Em preparo"?`<button class="small-action" data-action="order-status" data-id="${escapeHtml(order.id)}" data-status="Pronto">Marcar pronto</button>`:order.status==="Pronto"?`<button class="small-action" data-action="order-status" data-id="${escapeHtml(order.id)}" data-status="Entregue">Entregar</button>`:"—"}</div></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty-state"><span>▤</span>Nenhum pedido encontrado.</div>`;
  }
  function renderProducts(){
    const query=($("#product-search")?.value||"").toLocaleLowerCase("pt-BR"),products=state.products.filter(p=>p.name.toLocaleLowerCase("pt-BR").includes(query)),low=state.products.filter(p=>Number(p.quantity)<=Number(p.minimum)).length;
    $("#stock-metrics").innerHTML=[metric("Produtos cadastrados",state.products.length,"No seu catálogo","▦","metric-purple"),metric("Estoque baixo",low,"No limite ou abaixo","!","metric-orange"),metric("Unidades disponíveis",state.products.reduce((n,p)=>n+Number(p.quantity),0),"Produtos prontos","＋","metric-green"),metric("Valor potencial",money(state.products.reduce((n,p)=>n+Number(p.quantity)*Number(p.price),0)),"Se vender todo o estoque","↗","metric-pink")].join("");
    $("#products-table").innerHTML=products.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Produto</th><th>Categoria</th><th>Disponível</th><th>Alerta em</th><th>Preço</th><th>Ações</th></tr></thead><tbody>${products.map(p=>`<tr><td><span class="table-primary">${escapeHtml(p.emoji||"📦")} ${escapeHtml(p.name)}</span></td><td>${escapeHtml(p.category||"—")}</td><td class="table-primary">${Number(p.quantity)} un. ${Number(p.quantity)<=Number(p.minimum)?'<span class="table-secondary" style="color:var(--warning)">Repor em breve</span>':""}</td><td>${Number(p.minimum)} un.</td><td>${money(p.price)}</td><td><div class="table-actions"><button class="small-action" data-action="adjust-product" data-id="${escapeHtml(p.id)}">± Ajustar</button><button class="small-action" data-action="delete-product" data-id="${escapeHtml(p.id)}" aria-label="Remover ${escapeHtml(p.name)}">Remover</button></div></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty-state"><span>▦</span>Nenhum produto encontrado.</div>`;
  }
  function renderClients(){
    const query=($("#client-search")?.value||"").toLocaleLowerCase("pt-BR"),clients=state.clients.filter(c=>c.name.toLocaleLowerCase("pt-BR").includes(query)),orders=state.clients.reduce((n,c)=>n+Number(c.orders),0),spend=state.clients.reduce((n,c)=>n+Number(c.total),0);
    $("#client-metrics").innerHTML=[metric("Clientes cadastrados",state.clients.length,"Relacionamentos que você cultiva","♙","metric-purple"),metric("Compras registradas",orders,"Pedidos de clientes cadastrados","▤","metric-green"),metric("Ticket médio",money(orders?spend/orders:0),"Baseado nos pedidos registrados","◷","metric-orange"),metric("Valor vendido",money(spend),"Para clientes cadastrados","↗","metric-pink")].join("");
    $("#clients-table").innerHTML=clients.length?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Cliente</th><th>WhatsApp</th><th>Pedidos</th><th>Total comprado</th><th>Último pedido</th><th>Ação</th></tr></thead><tbody>${clients.map(c=>`<tr><td class="table-primary">${escapeHtml(c.name)}</td><td>${escapeHtml(c.phone||"Não informado")}</td><td>${Number(c.orders)}</td><td class="table-primary">${money(c.total)}</td><td>${c.lastOrderDate?dateDisplay(c.lastOrderDate):"—"}</td><td><button class="small-action" data-action="delete-client" data-id="${escapeHtml(c.id)}">Remover</button></td></tr>`).join("")}</tbody></table></div>`:`<div class="empty-state"><span>♙</span>Nenhum cliente encontrado.</div>`;
  }
  function renderFinance(){
    const total=todaysSales(),all=state.sales.reduce((n,s)=>n+Number(s.amount),0);
    $("#finance-metrics").innerHTML=[metric("Faturamento de hoje",money(total),"Vendas brutas registradas","↗","metric-purple"),metric("Vendas registradas",state.sales.length,"Neste dispositivo","▤","metric-green"),metric("Ticket médio hoje",money(todaysOrders().length?total/todaysOrders().length:0),"Considerando pedidos de hoje","◷","metric-orange"),metric("Faturamento total",money(all),"Desde o início do controle","＋","metric-pink")].join("");
    const financeChart=$("#finance-revenue-chart");financeChart.innerHTML=revenueChart("finance-chart",financeChart);
    const sales=[...state.sales].sort((a,b)=>new Date(b.date)-new Date(a.date));
    $("#sales-list").innerHTML=sales.length?sales.map(s=>`<div class="sale-row"><span class="sale-date"><strong>${new Date(s.date).getDate()}</strong><small>${new Intl.DateTimeFormat("pt-BR",{month:"short"}).format(new Date(s.date))}</small></span><span class="sale-copy"><strong>${escapeHtml(s.description)}</strong><small>${new Intl.DateTimeFormat("pt-BR",{hour:"2-digit",minute:"2-digit"}).format(new Date(s.date))} · ${escapeHtml(s.kind||"Venda")}</small></span><span class="sale-amount">${money(s.amount)}</span></div>`).join(""):`<div class="empty-state"><span>◷</span>Nenhuma venda registrada.</div>`;
  }
  function renderMessages(){
    $("#message-cards").innerHTML=templates.map(template=>`<article class="panel message-card"><div class="message-title"><span>${template.icon}</span><h2>${template.title}</h2></div><textarea aria-label="Mensagem: ${template.title}" data-message="${template.key}">${escapeHtml(state.messages[template.key]??template.text)}</textarea><div class="message-actions"><span class="message-hint">${template.hint}</span><button class="button button-secondary" data-action="copy-message" data-key="${template.key}">Copiar mensagem</button></div></article>`).join("");
  }
  function renderSettings(){
    const form=$("#business-form");for(const [key,value] of Object.entries(state.settings)){const input=form.elements.namedItem(key);if(input&&input.type!=="file")input.value=value||"";}
    renderImagePreview($("#logo-preview"),state.settings.logo,"logo");
    renderImagePreview($("#settings-cover-preview"),state.settings.cover,"capa");
    $("#theme-options").innerHTML=Object.entries(palettes).map(([key,[name,color]])=>`<button type="button" class="theme-option" role="radio" aria-checked="${state.settings.palette===key}" data-palette="${key}" aria-label="${name}"><span class="theme-swatch" style="background:${color}"></span>${name}</button>`).join("");
    $("#advanced-toggle").textContent=state.advanced?"Desativar":"Ativar";
    $("#advanced-note").textContent=state.advanced?"Modo avançado ativo. Os controles não são integrados a sistemas fiscais ou contábeis.":"Ative para habilitar receitas, lotes com PVPS, custos e indicadores locais.";
    $(".advanced-link").hidden=!state.advanced;
    updateCloudUI();
  }
  function advancedContent(tab=advancedTab){
    const content=$("#advanced-content");if(!content)return;
    const tabs=$$(".advanced-tab");tabs.forEach(button=>{const selected=button.dataset.advancedTab===tab;button.classList.toggle("selected",selected);button.setAttribute("aria-selected",String(selected));});
    if(tab==="recipes"){
      const rows=state.recipes.map(recipe=>{
        const cost=recipe.ingredients.reduce((sum,item)=>sum+Number(item.quantity)*Number(state.ingredients.find(i=>i.id===item.ingredientId)?.unitCost||0),0);
        const margin=recipe.price?Math.round((recipe.price-cost/Math.max(1,recipe.yield))*100/recipe.price):0;
        return `<div class="ingredient-row"><span><strong>${escapeHtml(recipe.name)}</strong><small class="table-secondary">Rendimento: ${Number(recipe.yield)} un. · Custo estimado: ${money(cost)} por receita · Margem bruta estimada: ${margin}%</small></span><button class="small-action" data-action="produce-recipe" data-id="${escapeHtml(recipe.id)}">Produzir</button></div>`;
      }).join("");
      const ingredients=state.ingredients.map(i=>`<div class="ingredient-row"><span><strong>${escapeHtml(i.name)}</strong><small class="table-secondary">${Number(i.quantity)} ${escapeHtml(i.unit)} disponíveis · mínimo ${Number(i.minimum)} · ${money(i.unitCost)}/${escapeHtml(i.unit)}</small></span><button class="small-action" data-action="adjust-ingredient" data-id="${escapeHtml(i.id)}">Ajustar</button></div>`).join("");
      content.innerHTML=`<div class="advanced-layout"><section class="panel"><div class="panel-heading"><div><h2>Fichas técnicas</h2><p>Custos estimados a partir dos insumos cadastrados.</p></div><button class="button button-primary" data-action="new-recipe">＋ Receita</button></div>${rows||'<div class="empty-state">Cadastre sua primeira receita.</div>'}</section><section class="panel"><div class="panel-heading"><div><h2>Insumos</h2><p>Quantidade e custo unitário.</p></div><button class="button button-secondary" data-action="new-ingredient">＋ Insumo</button></div>${ingredients||'<div class="empty-state">Cadastre os insumos usados nas receitas.</div>'}</section><section class="panel advanced-full"><div class="security-notice"><span>✦</span><div><strong>Baixa de insumos</strong><p>Ao registrar uma produção, o sistema desconta os insumos da ficha e adiciona o rendimento ao estoque do produto associado. A baixa usa as quantidades cadastradas na receita.</p></div></div></section></div>`;
    }else if(tab==="batches"){
      const batches=[...state.batches].sort((a,b)=>a.expiry.localeCompare(b.expiry)||a.id.localeCompare(b.id));
      const rows=batches.map(batch=>{const ingredient=state.ingredients.find(i=>i.id===batch.ingredientId),diff=Math.ceil((new Date(`${batch.expiry}T00:00:00`)-new Date(new Date().toDateString()))/86400000),status=Number(batch.quantity)<=0?"Esgotado":diff<0?"Vencido":diff<=7?"Vence em breve":`${diff} dias`;return `<tr><td class="table-primary">${escapeHtml(ingredient?.name||"Insumo removido")}</td><td>${escapeHtml(batch.lot)}</td><td>${Number(batch.quantity)} ${escapeHtml(ingredient?.unit||"")}</td><td>${dateDisplay(batch.expiry)}</td><td class="${diff<0?"batch-expired":diff<=7?"batch-soon":""}">${status}</td><td><button class="small-action" data-action="use-batch" data-id="${escapeHtml(batch.ingredientId)}" ${Number(batch.quantity)<=0?"disabled":""}>Baixa PVPS</button></td></tr>`;}).join("");
      content.innerHTML=`<section class="panel"><div class="panel-heading"><div><h2>Lotes de insumos</h2><p>Primeiro que vence, primeiro que sai (PVPS).</p></div><button class="button button-primary" data-action="new-batch">＋ Registrar lote</button></div>${rows?`<div class="table-wrap"><table class="data-table"><thead><tr><th>Insumo</th><th>Lote</th><th>Quantidade</th><th>Validade</th><th>Situação</th><th>Ação</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="empty-state">Nenhum lote registrado. Registre um lote com validade para começar.</div>'}<p class="small-note">A ordenação orienta o uso manual; confirme sempre a validade e as condições reais do produto.</p></section>`;
    }else if(tab==="costs"){
      const revenue=state.sales.reduce((sum,sale)=>sum+Number(sale.amount),0),expenseTotal=state.expenses.reduce((sum,item)=>sum+Number(item.amount),0),fixed=state.expenses.filter(item=>item.type==="Fixo").reduce((sum,item)=>sum+Number(item.amount),0),variable=expenseTotal-fixed;
      const expenseRows=[...state.expenses].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(item=>`<div class="sale-row"><span class="sale-copy"><strong>${escapeHtml(item.description)}</strong><small>${escapeHtml(item.type)} · ${dateDisplay(item.date)}</small></span><span class="sale-amount">${money(item.amount)}</span><button class="small-action" data-action="delete-expense" data-id="${escapeHtml(item.id)}">Remover</button></div>`).join("");
      content.innerHTML=`<div class="advanced-layout"><section class="panel"><div class="panel-heading"><div><h2>Resumo registrado</h2><p>Valores informados manualmente; sem integração bancária.</p></div></div><div class="metric-grid advanced-metrics">${metric("Faturamento bruto",money(revenue),"Vendas anotadas","↗","metric-purple")}${metric("Despesas registradas",money(expenseTotal),"Fixo + variável","−","metric-orange")}${metric("Após despesas anotadas",money(revenue-expenseTotal),"Não inclui impostos ou outros custos","◷","metric-green")}${metric("Despesas fixas / variáveis",`${money(fixed)} / ${money(variable)}`,"Classificação cadastrada","▤","metric-pink")}</div></section><section class="panel"><div class="panel-heading"><div><h2>Despesas</h2><p>Custos fixos e variáveis.</p></div><button class="button button-primary" data-action="new-expense">＋ Despesa</button></div>${expenseRows||'<div class="empty-state">Nenhuma despesa registrada.</div>'}</section></div>`;
    }else{
      const now=Date.now(),inactive=state.clients.filter(client=>client.lastOrderDate&&now-new Date(client.lastOrderDate).getTime()>30*86400000).sort((a,b)=>new Date(a.lastOrderDate)-new Date(b.lastOrderDate)),orders=state.clients.reduce((n,c)=>n+Number(c.orders),0),total=state.clients.reduce((n,c)=>n+Number(c.total),0);
      const rows=inactive.map(client=>`<div class="ingredient-row"><span><strong>${escapeHtml(client.name)}</strong><small class="table-secondary">Último pedido: ${dateDisplay(client.lastOrderDate)} · ${Number(client.orders)} pedido(s)</small></span><a class="small-action" href="${client.phone?`https://wa.me/${client.phone.replace(/\D/g,"")}`:"#mensagens"}" ${client.phone?'target="_blank" rel="noopener noreferrer"':`data-route="mensagens"`}>${client.phone?"Abrir WhatsApp":"Ver mensagens"}</a></div>`).join("");
      content.innerHTML=`<div class="advanced-layout"><div class="metric-grid advanced-metrics advanced-full">${metric("Clientes cadastrados",state.clients.length,"Base local","♙","metric-purple")}${metric("Ticket médio",money(orders?total/orders:0),"Compras registradas","◷","metric-green")}${metric("Clientes sem comprar há 30+ dias",inactive.length,"Indicador por data do último pedido","!","metric-orange")}${metric("Faturamento associado",money(total),"Total dos pedidos de clientes cadastrados","↗","metric-pink")}</div><section class="panel advanced-full"><div class="panel-heading"><div><h2>Clientes inativos</h2><p>Uma lista para ajudar você a retomar o contato.</p></div><a href="#mensagens" class="inline-link" data-route="mensagens">Mensagens prontas →</a></div>${rows||'<div class="empty-state">Nenhum cliente está inativo há mais de 30 dias.</div>'}</section></div>`;
    }
  }
  function renderAll(){applyAppearance();updateIdentity();updateDate();renderDashboard();renderOrders();renderProducts();renderClients();renderFinance();renderMessages();renderSettings();advancedContent();}
  const routeNames={inicio:"Visão geral",pedidos:"Pedidos",estoque:"Estoque",clientes:"Clientes",financeiro:"Financeiro",mensagens:"Mensagens",avancado:"Modo avançado",configuracoes:"Configurações"};
  function navigate(route,replace=false){
    if(!routeNames[route]||(route==="avancado"&&!state.advanced))route="inicio";
    if(location.hash!==`#${route}`){if(replace)history.replaceState(null,"",`#${route}`);else history.pushState(null,"",`#${route}`);}
    $$(".page").forEach(page=>page.classList.toggle("active",page.id===`page-${route}`));
    $$("[data-route]").forEach(link=>link.classList.toggle("active",link.dataset.route===route));
    $("#page-crumb").textContent=routeNames[route];$("#sidebar").classList.remove("open");$("#menu-toggle").setAttribute("aria-expanded","false");
    renderForRoute(route);window.scrollTo(0,0);
  }
  function renderForRoute(route){if(route==="inicio")renderDashboard();if(route==="pedidos")renderOrders();if(route==="estoque")renderProducts();if(route==="clientes")renderClients();if(route==="financeiro")renderFinance();if(route==="mensagens")renderMessages();if(route==="configuracoes")renderSettings();if(route==="avancado")advancedContent();}
  const field=(label,name,options={})=>{
    const control=options.select
      ? `<select name="${name}" ${options.required?"required":""}>${options.options.map(item=>`<option value="${escapeHtml(item.value??item)}">${escapeHtml(item.label??item)}</option>`).join("")}</select>`
      : `<input name="${name}" type="${options.type||"text"}" ${options.required?"required":""} ${options.min!==undefined?`min="${options.min}"`:""} ${options.step?`step="${options.step}"`:""} ${options.placeholder?`placeholder="${escapeHtml(options.placeholder)}"`:""}>`;
    return `<label class="field">${label}${control}</label>`;
  };
  function openForm(kind,id=""){
    const ingredientOptions=state.ingredients.map(item=>({value:item.id,label:`${item.name} (${item.unit})`}));
    const productOptions=state.products.map(item=>({value:item.id,label:item.name}));
    const configs={
      order:{title:"Novo pedido",desc:"Anote uma venda e acompanhe o preparo.",fields:`${field("Nome do cliente","client",{required:true,placeholder:"Ex.: Mariana Oliveira"})}${field("Produto / itens","item",{required:true,placeholder:"Ex.: 2 brownies"})}${field("Valor total (R$)","total",{required:true,type:"number",min:"0.01",step:"0.01",placeholder:"0,00"})}${field("Status","status",{select:true,options:["Em preparo","Pronto","Entregue"]})}`,submit:"Salvar pedido"},
      product:{title:"Adicionar produto",desc:"Cadastre um produto pronto para vender.",fields:`${field("Nome do produto","name",{required:true,placeholder:"Ex.: Bolo de cenoura"})}${field("Categoria","category",{placeholder:"Ex.: Doces"})}${field("Quantidade disponível","quantity",{required:true,type:"number",min:"0",step:"1",placeholder:"0"})}${field("Alerta de estoque em","minimum",{required:true,type:"number",min:"0",step:"1",placeholder:"5"})}${field("Preço por unidade (R$)","price",{required:true,type:"number",min:"0",step:"0.01",placeholder:"0,00"})}${field("Emoji identificador","emoji",{placeholder:"🍰"})}`,submit:"Adicionar produto"},
      client:{title:"Adicionar cliente",desc:"Guarde os dados para cuidar dessa relação.",fields:`${field("Nome do cliente","name",{required:true,placeholder:"Nome completo"})}${field("WhatsApp (opcional)","phone",{type:"tel",placeholder:"(11) 99999-9999"})}`,submit:"Adicionar cliente"},
      sale:{title:"Registrar venda",desc:"Registre o faturamento bruto, sem deduzir custos.",fields:`${field("Descrição","description",{required:true,placeholder:"Ex.: Venda no balcão"})}${field("Valor bruto (R$)","amount",{required:true,type:"number",min:"0.01",step:"0.01",placeholder:"0,00"})}`,submit:"Registrar venda"},
      adjust:{title:"Ajustar estoque",desc:"Use número negativo para registrar uma saída.",fields:field("Quantidade (ex.: 5 ou -2)","adjustment",{required:true,type:"number",step:"1",placeholder:"0"}),submit:"Atualizar estoque"},
      ingredient:{title:"Adicionar insumo",desc:"Cadastre o estoque e custo unitário do ingrediente.",fields:`${field("Nome","name",{required:true,placeholder:"Ex.: Açúcar"})}${field("Unidade de medida","unit",{required:true,placeholder:"g, ml, unidade..."})}${field("Quantidade atual","quantity",{required:true,type:"number",min:"0",step:"0.01"})}${field("Estoque mínimo","minimum",{required:true,type:"number",min:"0",step:"0.01"})}${field("Custo por unidade (R$)","unitCost",{required:true,type:"number",min:"0",step:"0.001"})}`,submit:"Salvar insumo"},
      recipe:{title:"Nova ficha técnica",desc:"Defina o produto final e dois insumos. Cadastre mais receitas para detalhar seus custos.",fields:`${field("Nome da receita","name",{required:true,placeholder:"Ex.: Bolo de chocolate"})}${field("Produto final","productId",{required:true,select:true,options:productOptions})}${field("Rendimento por receita (un.)","yield",{required:true,type:"number",min:"1",step:"1"})}${field("Preço de venda por unidade (R$)","price",{required:true,type:"number",min:"0.01",step:"0.01"})}${field("Insumo 1","ingredient1",{required:true,select:true,options:ingredientOptions})}${field("Quantidade usada por receita","quantity1",{required:true,type:"number",min:"0.01",step:"0.01"})}${field("Insumo 2 (opcional)","ingredient2",{select:true,options:[{value:"",label:"Nenhum"},...ingredientOptions]})}${field("Quantidade usada","quantity2",{type:"number",min:"0",step:"0.01"})}`,submit:"Salvar receita"},
      batch:{title:"Registrar lote",desc:"Informe a quantidade e validade para usar PVPS.",fields:`${field("Insumo","ingredientId",{required:true,select:true,options:ingredientOptions})}${field("Identificação do lote","lot",{required:true,placeholder:"Ex.: LT-2026-001"})}${field("Quantidade recebida","quantity",{required:true,type:"number",min:"0.01",step:"0.01"})}${field("Data de validade","expiry",{required:true,type:"date"})}`,submit:"Registrar lote"},
      expense:{title:"Registrar despesa",desc:"Registre os custos fixos ou variáveis do seu negócio.",fields:`${field("Descrição","description",{required:true,placeholder:"Ex.: Embalagens"})}${field("Valor (R$)","amount",{required:true,type:"number",min:"0.01",step:"0.01"})}${field("Classificação","type",{select:true,options:["Variável","Fixo"]})}`,submit:"Salvar despesa"},
      adjustIngredient:{title:"Ajustar insumo",desc:"Informe uma entrada ou saída de estoque.",fields:field("Quantidade (negativo para saída)","adjustment",{required:true,type:"number",step:"0.01"}),submit:"Atualizar insumo"}
    };
    const config=configs[kind];if(!config)return;
    const dialog=$("#app-dialog");
    $("#dialog-content").innerHTML=`<div class="dialog-inner"><div class="dialog-heading"><div><h2 id="dialog-title">${config.title}</h2><p>${config.desc}</p></div><button class="dialog-close" type="button" data-action="close-dialog" aria-label="Fechar">×</button></div><form class="dialog-form" id="entity-form" data-kind="${kind}" ${id?`data-id="${escapeHtml(id)}"`:""}><div class="form-grid">${config.fields}</div><div class="dialog-actions"><button class="button button-secondary" type="button" data-action="close-dialog">Cancelar</button><button class="button button-primary" type="submit">${config.submit}</button></div></form></div>`;
    dialog.showModal();const first=$("input,select",dialog);if(first)first.focus();
  }
  function addOrder(form){
    const data=new FormData(form),client=String(data.get("client")).trim(),item=String(data.get("item")).trim(),total=Number(data.get("total"));
    if(!client||!item||!Number.isFinite(total)||total<=0)return notify("Confira o cliente, os itens e o valor.");
    const product=state.products.find(p=>item.toLocaleLowerCase("pt-BR").includes(p.name.toLocaleLowerCase("pt-BR")));
    const itemCount=Number(item.match(/^\s*(\d+)\s*x?\s*/i)?.[1]||1);
    if(product&&product.quantity<itemCount)return notify(`Estoque insuficiente de ${product.name}.`);
    const order={id:`PED-${String(Date.now()).slice(-5)}`,client,item,total,status:String(data.get("status")),date:todayIso()};state.orders.unshift(order);
    let existing=state.clients.find(c=>c.name.toLocaleLowerCase("pt-BR")===client.toLocaleLowerCase("pt-BR"));
    if(existing){existing.orders++;existing.total=Number(existing.total)+total;existing.lastOrderDate=order.date;}
    else state.clients.unshift({id:`c${Date.now()}`,name:client,phone:"",orders:1,total,lastOrderDate:order.date});
    state.sales.unshift({id:`v${Date.now()}`,description:`Pedido ${order.id} · ${item}`,amount:total,kind:"Pedido",date:order.date});
    if(product)product.quantity-=itemCount;
    finishDialog("Pedido registrado com sucesso!");
  }
  function finishDialog(message){persist();renderAll();$("#app-dialog").close();notify(message);}
  function onEntitySubmit(form){
    const data=new FormData(form),kind=form.dataset.kind,value=key=>String(data.get(key)||"").trim();
    if(kind==="order")return addOrder(form);
    if(kind==="product"){const name=value("name"),quantity=Number(data.get("quantity")),minimum=Number(data.get("minimum")),price=Number(data.get("price"));if(!name||![quantity,minimum,price].every(Number.isFinite))return notify("Confira os dados do produto.");state.products.unshift({id:`p${Date.now()}`,name,category:value("category")||"Geral",quantity,minimum,price,emoji:value("emoji")||"📦"});}
    if(kind==="client"){const name=value("name");if(!name)return notify("Informe o nome do cliente.");state.clients.unshift({id:`c${Date.now()}`,name,phone:value("phone"),orders:0,total:0,lastOrderDate:""});}
    if(kind==="sale"){const amount=Number(data.get("amount"));if(!value("description")||!Number.isFinite(amount)||amount<=0)return notify("Informe a descrição e um valor maior que zero.");state.sales.unshift({id:`v${Date.now()}`,description:value("description"),amount,kind:"Venda registrada",date:todayIso()});}
    if(kind==="adjust"){const product=state.products.find(p=>p.id===form.dataset.id),delta=Number(data.get("adjustment"));if(!product||!Number.isInteger(delta)||product.quantity+delta<0)return notify("A quantidade deve ser válida e não pode deixar o estoque negativo.");product.quantity+=delta;}
    if(kind==="ingredient"){const quantity=Number(data.get("quantity")),minimum=Number(data.get("minimum")),unitCost=Number(data.get("unitCost"));if(!value("name")||!value("unit")||![quantity,minimum,unitCost].every(Number.isFinite))return notify("Confira os dados do insumo.");state.ingredients.unshift({id:`i${Date.now()}`,name:value("name"),unit:value("unit"),quantity,minimum,unitCost});}
    if(kind==="recipe"){
      const ingredient1=state.ingredients.find(i=>i.id===value("ingredient1")),ingredient2=state.ingredients.find(i=>i.id===value("ingredient2")),recipeIngredients=[];
      if(ingredient1)recipeIngredients.push({ingredientId:ingredient1.id,quantity:Number(data.get("quantity1"))});
      if(ingredient2)recipeIngredients.push({ingredientId:ingredient2.id,quantity:Number(data.get("quantity2"))});
      const yieldCount=Number(data.get("yield")),price=Number(data.get("price"));
      if(!value("name")||!value("productId")||!recipeIngredients.length||recipeIngredients.some(i=>!Number.isFinite(i.quantity)||i.quantity<=0)||!Number.isInteger(yieldCount)||yieldCount<1||!Number.isFinite(price)||price<=0)return notify("Confira o produto final, rendimento, preço e quantidades de insumos.");
      state.recipes.unshift({id:`r${Date.now()}`,name:value("name"),productId:value("productId"),yield:yieldCount,price,ingredients:recipeIngredients});
    }
    if(kind==="batch"){
      const ingredient=state.ingredients.find(i=>i.id===value("ingredientId")),quantity=Number(data.get("quantity")),expiry=value("expiry");
      if(!ingredient||!value("lot")||!Number.isFinite(quantity)||quantity<=0||!expiry)return notify("Confira os dados do lote.");
      state.batches.push({id:`b${Date.now()}`,ingredientId:ingredient.id,lot:value("lot"),quantity,expiry});ingredient.quantity+=quantity;
    }
    if(kind==="expense"){const amount=Number(data.get("amount"));if(!value("description")||!Number.isFinite(amount)||amount<=0)return notify("Informe a descrição e um valor maior que zero.");state.expenses.unshift({id:`e${Date.now()}`,description:value("description"),amount,type:value("type"),date:todayIso()});}
    if(kind==="adjustIngredient"){
      const ingredient=state.ingredients.find(i=>i.id===form.dataset.id),delta=Number(data.get("adjustment"));
      if(!ingredient||!Number.isFinite(delta)||ingredient.quantity+delta<0)return notify("A quantidade deve ser válida e não pode deixar o estoque negativo.");
      if(state.batches.some(batch=>batch.ingredientId===ingredient.id))return notify("Este insumo tem lotes controlados. Registre entradas como novos lotes e faça saídas na aba Lotes e validade para manter os saldos sincronizados.");
      ingredient.quantity+=delta;
    }
    finishDialog("Alteração salva.");
  }
  function produceRecipe(id){
    const recipe=state.recipes.find(item=>item.id===id);if(!recipe)return;
    const product=state.products.find(item=>item.id===recipe.productId);
    if(!product)return notify("Produto final não encontrado. Confira a receita.");
    const requirements=new Map();
    for(const item of recipe.ingredients){
      const current=requirements.get(item.ingredientId)||0;
      requirements.set(item.ingredientId,current+Number(item.quantity));
    }
    const plan=[];
    for(const [ingredientId,quantity] of requirements){
      const ingredient=state.ingredients.find(item=>item.id===ingredientId);
      if(!ingredient)return notify("Um insumo da ficha não foi encontrado.");
      const batches=state.batches.filter(batch=>batch.ingredientId===ingredientId);
      const validBatches=batches.filter(batchIsValid).sort((a,b)=>a.expiry.localeCompare(b.expiry)||a.id.localeCompare(b.id));
      const available=validBatches.reduce((sum,batch)=>sum+Number(batch.quantity),0);
      if(!Number.isFinite(quantity)||quantity<=0||ingredient.quantity+Number.EPSILON<quantity)return notify(`Estoque total insuficiente de ${ingredient.name}.`);
      if(batches.length&&available+Number.EPSILON<quantity)return notify(`Lotes válidos insuficientes para ${ingredient.name}; lotes vencidos não podem ser consumidos.`);
      plan.push({ingredient,quantity,validBatches,hasBatches:batches.length>0});
    }
    for(const item of plan){
      let remaining=item.quantity;
      if(item.hasBatches){
        for(const batch of item.validBatches){
          const used=Math.min(remaining,Number(batch.quantity));
          batch.quantity-=used;remaining-=used;
          if(remaining<=Number.EPSILON)break;
        }
      }
      item.ingredient.quantity=Math.max(0,item.ingredient.quantity-item.quantity);
    }
    product.quantity+=Number(recipe.yield);persist();renderAll();notify(`${recipe.yield} un. de ${recipe.name} adicionadas ao estoque.`);
  }
  function useBatch(ingredientId){
    const ingredient=state.ingredients.find(item=>item.id===ingredientId);
    if(!ingredient)return notify("Insumo não encontrado.");
    const validBatches=state.batches.filter(item=>item.ingredientId===ingredientId&&batchIsValid(item));
    const available=validBatches.reduce((sum,item)=>sum+Number(item.quantity),0);
    if(available<=0)return notify("Não há saldo em lotes válidos para este insumo.");
    const quantity=Number(prompt(`Quantidade para dar baixa em ${ingredient.name} (${ingredient.unit}). A saída usará primeiro o lote com validade mais próxima. Disponível em lotes válidos: ${available}.`));
    if(!Number.isFinite(quantity)||quantity<=0||quantity>available||quantity>ingredient.quantity)return notify("Informe uma quantidade válida dentro do saldo dos lotes não vencidos e do estoque total.");
    let remaining=quantity;
    for(const batch of validBatches.sort((a,b)=>new Date(a.expiry)-new Date(b.expiry))){
      const used=Math.min(remaining,batch.quantity);batch.quantity-=used;remaining-=used;if(remaining<=0)break;
    }
    ingredient.quantity=Math.max(0,ingredient.quantity-quantity);
    persist();renderAll();notify("Baixa PVPS registrada.");
  }
  function exportData(){
    const blob=new Blob([JSON.stringify({version:1,exportedAt:todayIso(),data:state},null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download=`prato-prosa-copia-${new Date().toISOString().slice(0,10)}.json`;link.click();URL.revokeObjectURL(url);notify("Cópia dos dados baixada.");
  }
  function validateImport(fileData){
    if(!fileData||typeof fileData!=="object"||!fileData.data||typeof fileData.data!=="object")throw new Error("Formato de arquivo inválido.");
    const incoming=fileData.data;
    for(const key of ["products","clients","orders","sales","ingredients","recipes","batches","expenses"])if(!Array.isArray(incoming[key]))throw new Error(`O arquivo não contém uma lista válida de ${key}.`);
    if(!incoming.settings||typeof incoming.settings!=="object")throw new Error("O arquivo não contém configurações.");
    for(const key of ["logo","cover"]){
      const image=incoming.settings[key];
      if(!image)continue;
      const match=String(image).match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+=*)$/);
      if(!match)throw new Error("Uma imagem da cópia é inválida ou excede 1 MB.");
      const encoded=match[2],padding=encoded.endsWith("==")?2:encoded.endsWith("=")?1:0;
      if(encoded.length/4*3-padding>1024*1024)throw new Error("Uma imagem da cópia é inválida ou excede 1 MB.");
    }
    return {...clone(seed),...incoming,settings:{...seed.settings,...incoming.settings}};
  }
  async function loadImage(file,label){
    if(!file)return "";
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>1024*1024)throw new Error(`Escolha uma imagem de ${label} PNG, JPG ou WebP de até 1 MB.`);
    return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("Não foi possível ler a imagem."));reader.readAsDataURL(file);});
  }
  function renderImagePreview(element,source,kind){
    if(!element)return;
    element.hidden=!source;
    element.replaceChildren();
    if(!source)return;
    const image=document.createElement("img");
    image.src=source;image.alt=`Prévia da ${kind}`;
    const button=document.createElement("button");
    button.type="button";button.className="small-action";button.dataset.action="remove-image";button.dataset.image=kind;button.textContent=`Remover ${kind}`;
    element.append(image,button);
  }
  function showOnboarding(){
    const dialog=$("#app-dialog");
    $("#dialog-content").innerHTML=`<div class="dialog-inner"><div class="dialog-heading"><div><p class="eyebrow">BEM-VINDA AO PRATO & PROSA</p><h2 id="dialog-title">Vamos conhecer seu negócio</h2><p>Personalize seu espaço. Os dados ficam só neste dispositivo. Os registros iniciais são exemplos fictícios.</p></div></div><form class="dialog-form" id="onboarding-form"><div class="form-grid">${field("Nome do negócio","businessName",{required:true,placeholder:"Ex.: Delícias da Ju"})}${field("Seu nome","ownerName",{placeholder:"Como podemos te chamar?"})}${field("WhatsApp","whatsapp",{type:"tel",placeholder:"(11) 99999-9999"})}${field("Chave Pix","pix",{placeholder:"Opcional"})}${field("Horário de atendimento","hours",{placeholder:"Ex.: Seg a sáb, 10h às 20h"})}<div class="field full-field image-setting"><label class="field">Logo do negócio (opcional)<input name="logo" type="file" accept="image/png,image/jpeg,image/webp"><small class="field-help">PNG, JPG ou WebP, até 1 MB.</small></label><div class="image-preview logo-preview" id="onboarding-logo-preview" hidden></div></div><div class="field full-field image-setting"><label class="field">Capa do negócio (opcional)<input name="cover" type="file" accept="image/png,image/jpeg,image/webp"><small class="field-help">Aparece no início do app. PNG, JPG ou WebP, até 1 MB.</small></label><div class="image-preview cover-setting-preview" id="onboarding-cover-preview" hidden></div></div><label class="check-field full-field"><input name="emptyStart" type="checkbox" checked><span>Começar com listas vazias, sem registros de demonstração</span></label></div><div class="dialog-actions"><button class="button button-secondary" type="button" data-action="skip-onboarding">Usar dados de exemplo</button><button class="button button-primary" type="submit">Começar</button></div></form></div>`;
    dialog.showModal();$("input",dialog)?.focus();
  }
  function showDonationDialog(){
    const dialog=$("#app-dialog");
    $("#dialog-content").innerHTML=`<div class="dialog-inner donation-dialog-content"><div class="dialog-heading"><div><p class="eyebrow">APOIO VOLUNTÁRIO</p><h2 id="dialog-title">Ajude o desenvolvedor</h2><p>Copie o código Pix e cole no app do seu banco.</p></div><button class="dialog-close" type="button" data-action="close-dialog" aria-label="Fechar">×</button></div><label class="field donation-code-label">Pix Copia e Cola<textarea id="donation-pix-code" class="donation-payload" rows="4" readonly spellcheck="false" aria-label="Código Pix Copia e Cola">${donationPixPayload}</textarea></label><p class="small-note">Destinatário: <strong>Fábio Silva dos Anjos</strong>. A contribuição é opcional; confira o nome no banco antes de confirmar.</p><div class="dialog-actions"><button class="button button-secondary" type="button" data-action="close-dialog">Fechar</button><button class="button button-primary" type="button" data-action="copy-donation-pix">Copiar código Pix</button></div></div>`;
    dialog.showModal();
  }
  document.addEventListener("click",async event=>{
    const route=event.target.closest("[data-route]");
    if(route){event.preventDefault();navigate(route.dataset.route);return;}
    const filter=event.target.closest("[data-filter]");
    if(filter){orderFilter=filter.dataset.filter;$$(".filter-tab").forEach(tab=>tab.classList.toggle("selected",tab===filter));renderOrders();return;}
    const palette=event.target.closest("button[data-palette]");
    if(palette){state.settings.palette=palette.dataset.palette;persist();renderSettings();applyAppearance();return;}
    const tab=event.target.closest("[data-advanced-tab]");
    if(tab){advancedTab=tab.dataset.advancedTab;advancedContent();return;}
    const action=event.target.closest("[data-action]");if(!action)return;
    const id=action.dataset.id;
    switch(action.dataset.action){
      case "new-order":openForm("order");break;
      case "new-product":openForm("product");break;
      case "new-client":openForm("client");break;
      case "new-sale":openForm("sale");break;
      case "new-recipe":openForm("recipe");break;
      case "new-ingredient":openForm("ingredient");break;
      case "new-batch":openForm("batch");break;
      case "new-expense":openForm("expense");break;
      case "show-donation":showDonationDialog();break;
      case "cloud-signin":
        try{await signInToCloud();}
        catch(error){console.error("Não foi possível iniciar o login Google pelo Supabase.",error);notify(`Não foi possível iniciar o login: ${error.message}`);}
        break;
      case "cloud-signout":
        try{await signOutFromCloud();notify("Sessão encerrada. Os dados locais foram mantidos.");}
        catch(error){console.error("Não foi possível encerrar a sessão Supabase.",error);notify(`Não foi possível encerrar a sessão: ${error.message}`);}
        break;
      case "cloud-mfa-enroll":
        try{await enrollCloudMfa();}
        catch(error){console.error("Não foi possível iniciar a verificação em duas etapas.",error);notify(`Não foi possível configurar MFA: ${error.message}`);}
        break;
      case "cloud-mfa-challenge":
        try{
          const client=await getSupabaseClient(),{data,error}=await client.auth.mfa.listFactors();
          if(error)throw error;
          const factor=data.totp.find(item=>item.status==="verified");
          if(!factor)throw new Error("Nenhum aplicativo autenticador verificado foi encontrado.");
          await challengeCloudMfa(factor);
        }catch(error){console.error("Não foi possível solicitar o código MFA.",error);notify(`Não foi possível solicitar o código: ${error.message}`);}
        break;
      case "cloud-upload":
        if(!cloudUser)break;
        if(cloudRevision!==null&&!confirm("Substituir a cópia Supabase desta conta pelos dados deste dispositivo? Essa ação não altera outros dados locais."))break;
        cloudSyncEnabled=true;
        updateCloudUI("Enviando dados para Supabase","Mantendo uma cópia local neste dispositivo.");
        await saveCloudState(true);
        break;
      case "close-dialog":$("#app-dialog").close();break;
      case "remove-image":{
        const key=action.dataset.image==="capa"?"cover":"logo";
        state.settings[key]="";persist();renderSettings();updateIdentity();
        const input=(event.target.closest("#app-dialog")||document).querySelector(`#${event.target.closest("#app-dialog")?"onboarding-form":"business-form"} [name="${key}"]`);
        if(input)input.value="";
        renderImagePreview(event.target.closest(".image-setting")?.querySelector(".image-preview"),"",action.dataset.image);
        notify(`${action.dataset.image==="capa"?"Capa":"Logo"} removido(a).`);
        break;
      }
      case "skip-onboarding":state.onboardingDone=true;persist();$("#app-dialog").close();break;
      case "enable-advanced":state.advanced=true;persist();renderSettings();navigate("avancado");notify("Modo avançado ativado.");break;
      case "order-status":{const order=state.orders.find(o=>o.id===id);if(order){order.status=action.dataset.status;persist();renderAll();notify("Status do pedido atualizado.");}break;}
      case "adjust-product":openForm("adjust",id);break;
      case "adjust-ingredient":openForm("adjustIngredient",id);break;
      case "produce-recipe":produceRecipe(id);break;
      case "use-batch":useBatch(id);break;
      case "copy-donation-pix":{
        const code=$("#donation-pix-code");
        if(!code)break;
        code.focus();code.select();
        try{await navigator.clipboard.writeText(donationPixPayload);notify("Código Pix copiado. Cole no app do seu banco. Obrigado pelo apoio!");}
        catch{
          notify("Código Pix selecionado. Copie e cole no app do seu banco.");
        }
        break;
      }
      case "delete-product":{const product=state.products.find(p=>p.id===id);if(product&&confirm(`Remover ${product.name} do estoque?`)){state.products=state.products.filter(p=>p.id!==id);persist();renderAll();notify("Produto removido.");}break;}
      case "delete-client":{const client=state.clients.find(c=>c.id===id);if(client&&confirm(`Remover ${client.name} da lista de clientes?`)){state.clients=state.clients.filter(c=>c.id!==id);persist();renderAll();notify("Cliente removido.");}break;}
      case "delete-expense":{const expense=state.expenses.find(item=>item.id===id);if(expense&&confirm(`Remover a despesa ${expense.description}?`)){state.expenses=state.expenses.filter(item=>item.id!==id);persist();advancedContent("costs");notify("Despesa removida.");}break;}
      case "copy-message":{
        const area=$(`[data-message="${action.dataset.key}"]`);if(!area)break;
        const replacements={negocio:state.settings.businessName||"meu negócio",pix:state.settings.pix||"(adicione sua chave Pix nas configurações)",horarios:state.settings.hours||"(adicione seu horário nas configurações)",cliente:"[nome do cliente]",pedido:"[seu pedido]",valor:"[valor]",produto:"[produto]"};
        let text=area.value;for(const [key,value] of Object.entries(replacements))text=text.replaceAll(`{${key}}`,value);
        try{await navigator.clipboard.writeText(text);notify("Mensagem copiada. É só colar no WhatsApp!");}
        catch{area.focus();area.select();notify("Copie a mensagem selecionada e cole no WhatsApp.");}break;
      }
      case "export-data":exportData();break;
      case "clear-data":if(confirm("Apagar todos os dados salvos neste dispositivo? Essa ação não pode ser desfeita. Uma cópia exportada não será apagada.")){localStorage.removeItem(STORAGE_KEY);state=clone(seed);renderAll();notify("Dados locais apagados. O app voltou ao exemplo inicial.");}break;
    }
  });
  document.addEventListener("submit",async event=>{
    if(event.target.id==="cloud-mfa-form"){
      event.preventDefault();
      try{await verifyCloudMfa(event.target);}
      catch(error){console.error("A verificação em duas etapas falhou.",error);notify(`Não foi possível verificar o código: ${error.message}`);}
      return;
    }
    if(event.target.id==="entity-form"){event.preventDefault();onEntitySubmit(event.target);return;}
    if(event.target.id==="onboarding-form"){
      event.preventDefault();const form=event.target,name=String(new FormData(form).get("businessName")||"").trim();
      if(!name)return notify("Informe o nome do negócio para continuar.");
      const formData=new FormData(form);
      let logo,cover;
      try{
        logo=await loadImage(form.elements.namedItem("logo").files[0],"logo");
        cover=await loadImage(form.elements.namedItem("cover").files[0],"capa");
      }catch(error){notify(error.message);return;}
      for(const key of ["businessName","ownerName","whatsapp","pix","hours"])state.settings[key]=String(formData.get(key)||"").trim();
      state.settings.logo=logo;state.settings.cover=cover;
      if(formData.has("emptyStart"))for(const key of ["products","clients","orders","sales","ingredients","recipes","batches","expenses"])state[key]=[];
      state.onboardingDone=true;persist();$("#app-dialog").close();renderAll();notify("Seu espaço está pronto. Os dados ficam salvos neste dispositivo.");return;
    }
    if(event.target.id==="business-form"){
      event.preventDefault();const form=event.target;
      let logo,cover;
      try{
        logo=await loadImage(form.elements.namedItem("logo").files[0],"logo");
        cover=await loadImage(form.elements.namedItem("cover").files[0],"capa");
      }
      catch(error){notify(error.message);return;}
      for(const key of ["businessName","ownerName","whatsapp","pix","hours"])state.settings[key]=String(form.elements.namedItem(key).value||"").trim();
      if(logo)state.settings.logo=logo;
      if(cover)state.settings.cover=cover;
      persist();updateIdentity();renderSettings();$("#business-feedback").textContent="Alterações salvas neste dispositivo.";setTimeout(()=>$("#business-feedback").textContent="",3000);
    }
  });
  document.addEventListener("input",event=>{
    if(event.target.id==="order-search")renderOrders();
    if(event.target.id==="product-search")renderProducts();
    if(event.target.id==="client-search")renderClients();
    if(event.target.matches("[data-message]")){state.messages={...state.messages,[event.target.dataset.message]:event.target.value};persist();}
  });
  document.addEventListener("change",event=>{
    const input=event.target;
    if(!["logo","cover"].includes(input.name)||!input.files?.[0])return;
    const kind=input.name==="cover"?"capa":"logo",preview=input.closest(".image-setting")?.querySelector(".image-preview");
    const file=input.files[0];
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)||file.size>1024*1024){input.value="";renderImagePreview(preview,"",kind);notify(`Escolha uma imagem de ${kind} PNG, JPG ou WebP de até 1 MB.`);return;}
    renderImagePreview(preview,URL.createObjectURL(file),kind);
  });
  $("#color-mode").addEventListener("change",event=>{state.settings.mode=event.target.value;persist();applyAppearance();});
  $("#theme-toggle").addEventListener("click",()=>{state.settings.mode=document.documentElement.dataset.mode==="dark"?"light":"dark";persist();applyAppearance();$("#color-mode").value=state.settings.mode;});
  $("#advanced-toggle").addEventListener("click",()=>{state.advanced=!state.advanced;persist();renderSettings();if(!state.advanced&&location.hash==="#avancado")navigate("inicio");notify(state.advanced?"Modo avançado ativado. Seus dados continuam locais.":"Modo simples ativado.");});
  $("#menu-toggle").addEventListener("click",()=>{const open=$("#sidebar").classList.toggle("open");$("#menu-toggle").setAttribute("aria-expanded",String(open));});
  $("#import-file").addEventListener("change",async event=>{
    const file=event.target.files?.[0];if(!file)return;
    try{const data=validateImport(JSON.parse(await file.text()));if(confirm("Substituir os dados atuais pelos dados da cópia selecionada?")){state=data;persist();renderAll();notify("Cópia importada com sucesso.");}}
    catch(error){notify(`Não foi possível importar: ${error.message}`);}finally{event.target.value="";}
  });
  $("#app-dialog").addEventListener("click",event=>{if(event.target===$("#app-dialog"))$("#app-dialog").close();});
  document.addEventListener("keydown",event=>{if(event.key==="Escape")$("#sidebar").classList.remove("open");});
  let chartResizeTimer;
  window.addEventListener("resize",()=>{
    clearTimeout(chartResizeTimer);
    chartResizeTimer=setTimeout(()=>{
      const dashboardChart=$("#dashboard-revenue-chart"),financeChart=$("#finance-revenue-chart");
      dashboardChart.innerHTML=revenueChart("dashboard-chart",dashboardChart);
      financeChart.innerHTML=revenueChart("finance-chart",financeChart);
    },120);
  });
  window.addEventListener("hashchange",()=>navigate(location.hash.slice(1),true));
  renderAll();navigate(routeNames[location.hash.slice(1)]?location.hash.slice(1):"inicio",true);
  initializeCloud();
  if(firstVisit&&!state.onboardingDone)showOnboarding();
  if("serviceWorker" in navigator&&location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(error=>{console.error("Não foi possível ativar o modo offline.",error);notify("Não foi possível ativar o modo offline neste navegador.");}));
})();
