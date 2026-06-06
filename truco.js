// ==========================================
// 1. CONFIGURAÇÕES E ESTADO DO JOGO
// ==========================================
const naipes = ['♦', '♠', '♥', '♣']; 
const ordemForca = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];

let baralho = [];
let maoJogador = [];
let maoBot = [];
let mesaBloqueada = false; 

// Placar e Turnos
let placarJogador = 0;
let placarBot = 0;
let vitoriasJogadorRodada = 0;
let vitoriasBotRodada = 0;
let quemVenceuPrimeira = null; 

let quemComecouAMao = 'jogador'; 
let turnoAtual = 'jogador'; 
let cartaNaMesa = null; 

// Mecânica de Truco
let valorMao = 2;
let trucoGritado = false;

// Elementos da tela
const divMaoJogador = document.getElementById('player-hand');
const divMaoBot = document.getElementById('bot-hand');
const divVira = document.getElementById('vira-card'); 
const divPlayerPlay = document.getElementById('player-play');
const divBotPlay = document.getElementById('bot-play');
const spanScoreJogador = document.getElementById('score-player');
const spanScoreBot = document.getElementById('score-bot');
const btnTruco = document.getElementById('btn-truco'); 

btnTruco.onclick = gritarTruco;

function calcularPoderGeral(carta) {
    if (carta.valor === '4' && carta.naipe === '♣') return 104; 
    if (carta.valor === '7' && carta.naipe === '♥') return 103; 
    if (carta.valor === 'A' && carta.naipe === '♠') return 102; 
    if (carta.valor === '7' && carta.naipe === '♦') return 101; 
    return ordemForca.indexOf(carta.valor);
}

// ==========================================
// 2. PREPARAÇÃO DA MÃO (AQUI ESTÁ A CORREÇÃO)
// ==========================================
function iniciarNovaMao() {
    baralho = [];
    for (let naipe of naipes) {
        for (let valor of ordemForca) {
            baralho.push({ valor: valor, naipe: naipe });
        }
    }

    for (let i = baralho.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [baralho[i], baralho[j]] = [baralho[j], baralho[i]];
    }

    maoJogador = [baralho.pop(), baralho.pop(), baralho.pop()];
    maoBot = [baralho.pop(), baralho.pop(), baralho.pop()];

    vitoriasJogadorRodada = 0;
    vitoriasBotRodada = 0;
    quemVenceuPrimeira = null;
    valorMao = 2; 
    trucoGritado = false;
    btnTruco.disabled = true; 

    // === CORREÇÃO: Limpa o centro da mesa ao iniciar nova mão ===
    divPlayerPlay.className = 'card empty'; 
    divPlayerPlay.innerHTML = '';
    divPlayerPlay.style.boxShadow = 'none'; 
    divPlayerPlay.style.borderColor = 'var(--gold)';
    
    divBotPlay.className = 'card empty'; 
    divBotPlay.innerHTML = '';
    divBotPlay.style.boxShadow = 'none'; 
    divBotPlay.style.borderColor = 'var(--gold)';
    
    cartaNaMesa = null;
    // ==============================================================

    quemComecouAMao = (quemComecouAMao === 'jogador') ? 'bot' : 'jogador';
    turnoAtual = quemComecouAMao;

    renderizarMesa();
    verificarTurno();
}

function renderizarMesa() {
    divVira.className = 'card card-back';
    divVira.innerHTML = '';

    divMaoBot.innerHTML = '';
    for(let i = 0; i < maoBot.length; i++) {
        let cartaOculta = document.createElement('div');
        cartaOculta.className = 'card card-back';
        divMaoBot.appendChild(cartaOculta);
    }

    divMaoJogador.innerHTML = '';
    maoJogador.forEach((carta, index) => {
        let divCarta = document.createElement('div');
        let cor = (carta.naipe === '♥' || carta.naipe === '♦') ? 'red' : 'black';
        divCarta.className = `card ${cor}`;
        divCarta.innerHTML = `${carta.valor}<br>${carta.naipe}`;
        
        divCarta.onclick = () => jogarCartaJogador(index, carta);
        divMaoJogador.appendChild(divCarta);
    });
}

// ==========================================
// 3. FLUXO DE TURNOS E TRUCO
// ==========================================
function verificarTurno() {
    if (turnoAtual === 'bot') {
        mesaBloqueada = true;
        btnTruco.disabled = true; 
        setTimeout(turnoDoBot, 1000);
    } else {
        mesaBloqueada = false; 
        if (!trucoGritado) btnTruco.disabled = false; 
    }
}

function gritarTruco() {
    if (mesaBloqueada || turnoAtual !== 'jogador') return;
    
    trucoGritado = true;
    btnTruco.disabled = true; 
    mesaBloqueada = true; 

    alert("VOCÊ GRITOU: TRUCO!");
    setTimeout(botRespondeTruco, 1500);
}

function botRespondeTruco() {
    let forcaMaximaBot = 0;
    
    maoBot.forEach(carta => {
        let poder = calcularPoderGeral(carta);
        if (poder > forcaMaximaBot) forcaMaximaBot = poder;
    });

    let botAceita = false;
    
    if (forcaMaximaBot >= 8) {
        botAceita = true; 
    } else if (Math.random() > 0.85) {
        botAceita = true; 
    }

    if (botAceita) {
        alert("🤖 MÁQUINA DIZ: CAI PRA DENTRO! (A mão agora vale 4)");
        valorMao = 4;
        mesaBloqueada = false; 
    } else {
        alert("🤖 MÁQUINA DIZ: CORRO... (A máquina correu)");
        placarJogador += valorMao; 
        verificarFimDeJogo();
        if (placarJogador < 12) iniciarNovaMao();
    }
}

function jogarCartaJogador(index, cartaObj) {
    if (mesaBloqueada || turnoAtual !== 'jogador') return; 
    mesaBloqueada = true;
    btnTruco.disabled = true; 

    maoJogador.splice(index, 1); 
    let cor = (cartaObj.naipe === '♥' || cartaObj.naipe === '♦') ? 'red' : 'black';
    divPlayerPlay.className = `card ${cor}`;
    divPlayerPlay.innerHTML = `${cartaObj.valor}<br>${cartaObj.naipe}`;
    renderizarMesa();

    if (cartaNaMesa === null) {
        cartaNaMesa = { dono: 'jogador', carta: cartaObj };
        turnoAtual = 'bot';
        setTimeout(turnoDoBot, 1000);
    } else {
        setTimeout(() => calcularVencedorEmbate(cartaObj, cartaNaMesa.carta), 500);
    }
}

function turnoDoBot() {
    if (maoBot.length === 0) return;

    let indexAleatorio = Math.floor(Math.random() * maoBot.length);
    let cartaBotObj = maoBot.splice(indexAleatorio, 1)[0];

    let cor = (cartaBotObj.naipe === '♥' || cartaBotObj.naipe === '♦') ? 'red' : 'black';
    divBotPlay.className = `card ${cor}`;
    divBotPlay.innerHTML = `${cartaBotObj.valor}<br>${cartaBotObj.naipe}`;
    renderizarMesa();

    if (cartaNaMesa === null) {
        cartaNaMesa = { dono: 'bot', carta: cartaBotObj };
        turnoAtual = 'jogador';
        verificarTurno(); 
    } else {
        setTimeout(() => calcularVencedorEmbate(cartaNaMesa.carta, cartaBotObj), 500);
    }
}

// ==========================================
// 4. JUIZ E PONTUAÇÃO
// ==========================================
function calcularVencedorEmbate(cartaP1, cartaBot) {
    let poderP1 = calcularPoderGeral(cartaP1);
    let poderBot = calcularPoderGeral(cartaBot);

    divPlayerPlay.style.transition = "box-shadow 0.3s, border-color 0.3s";
    divBotPlay.style.transition = "box-shadow 0.3s, border-color 0.3s";

    let vencedorVaza = null;

    if (poderP1 > poderBot) {
        divPlayerPlay.style.borderColor = "#2ecc71"; divPlayerPlay.style.boxShadow = "0 0 20px #2ecc71"; 
        vitoriasJogadorRodada++;
        vencedorVaza = 'jogador';
    } else if (poderBot > poderP1) {
        divBotPlay.style.borderColor = "#e74c3c"; divBotPlay.style.boxShadow = "0 0 20px #e74c3c"; 
        vitoriasBotRodada++;
        vencedorVaza = 'bot';
    } else {
        divPlayerPlay.style.borderColor = "#f1c40f"; divPlayerPlay.style.boxShadow = "0 0 20px #f1c40f"; 
        divBotPlay.style.borderColor = "#f1c40f"; divBotPlay.style.boxShadow = "0 0 20px #f1c40f";
        
        if (quemVenceuPrimeira === null) {
            vitoriasJogadorRodada++; vitoriasBotRodada++; 
        } else {
            vencedorVaza = quemVenceuPrimeira; 
            if(vencedorVaza === 'jogador') vitoriasJogadorRodada = 2;
            else vitoriasBotRodada = 2;
        }
    }

    if (quemVenceuPrimeira === null && vencedorVaza !== null) {
        quemVenceuPrimeira = vencedorVaza;
    }

    turnoAtual = (vencedorVaza !== null) ? vencedorVaza : quemComecouAMao;

    setTimeout(limparMesaEVerificarVencedor, 2000);
}

function limparMesaEVerificarVencedor() {
    if (vitoriasJogadorRodada >= 2 || vitoriasBotRodada >= 2) {
        if (vitoriasJogadorRodada > vitoriasBotRodada) {
            placarJogador += valorMao; 
            alert(`VOCÊ GANHOU A MÃO! +${valorMao} Pontos.`);
        } else if (vitoriasBotRodada > vitoriasJogadorRodada) {
            placarBot += valorMao;
            alert(`A MÁQUINA GANHOU A MÃO! +${valorMao} Pontos.`);
        } else {
            alert("MÃO EMPATADA!");
        }

        verificarFimDeJogo();
        if (placarJogador < 12 && placarBot < 12) iniciarNovaMao();

    } else {
        divPlayerPlay.className = 'card empty'; divPlayerPlay.innerHTML = '';
        divPlayerPlay.style.boxShadow = 'none'; divPlayerPlay.style.borderColor = 'var(--gold)';
        divBotPlay.className = 'card empty'; divBotPlay.innerHTML = '';
        divBotPlay.style.boxShadow = 'none'; divBotPlay.style.borderColor = 'var(--gold)';
        cartaNaMesa = null;
        
        verificarTurno(); 
    }
}

function verificarFimDeJogo() {
    spanScoreJogador.innerText = placarJogador;
    spanScoreBot.innerText = placarBot;

    if (placarJogador >= 12 || placarBot >= 12) {
        let campeao = placarJogador >= 12 ? "VOCÊ" : "A MÁQUINA";
        alert(`🏆 FIM DE JOGO! ${campeao} VENCEU POR ${placarJogador} a ${placarBot}!`);
        placarJogador = 0; placarBot = 0;
        spanScoreJogador.innerText = placarJogador; spanScoreBot.innerText = placarBot;
    }
}

// Inicia o Jogo
iniciarNovaMao();