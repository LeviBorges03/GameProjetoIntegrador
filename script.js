// =================================================================================================
// 1. SETUP E VARIÁVEIS GLOBAIS
// =================================================================================================

// 1.1. ELEMENTOS DO DOM
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const vidasContainerEsquerda = document.getElementById("vidasContainerEsquerda");
const vidasContainerDireita = document.getElementById("vidasContainerDireita");
const nivelDisplay = document.getElementById("nivelDisplay");
const xpBar = document.getElementById("xpBar");
const btnReiniciarNivel = document.getElementById("btnReiniciarNivel");
const telaInicial = document.getElementById("telaInicial");
const telaFinal = document.getElementById("telaFinal");
const btnJogar = document.getElementById("btnJogar");
const btnJogarNovamente = document.getElementById("btnJogarNovamente");
const tituloFinal = document.getElementById("tituloFinal");
const mensagemFinal = document.getElementById("mensagemFinal");

// 1.2. CONFIGURAÇÕES GERAIS (CONFIG)
const CONFIG = {
    // Canvas & Blocos
    CANVAS_LARGURA: 800,
    CANVAS_ALTURA: 600,
    LARGURA_BLOCO: 40,
    ALTURA_BLOCO: 40,

    // Jogo
    MAX_VIDAS: 10,
    MAX_NIVEIS: 15,
    INVENCIBILIDADE_FRAMES: 60,
    MORTE_INSTANTANEA_DELAY: 10,
    MORTE_POR_QUEDA_Y_OFFSET: 200,

    // Física do Jogador
    PLAYER_SPEED_X: 5,
    GRAVITY: 0.8,
    JUMP_FORCE: 15,
    MAX_JUMPS: 2,

    // Visuais e Itens
    PORTAL_LARGURA: 100,
    PORTAL_ALTURA: 10,
    PORTAL_SHADOW_BLUR: 20,
    PORTAL_COOLDOWN_FRAMES: 30,
    PORTA_LARGURA: 80,
    PORTA_ALTURA: 100,
    PORTA_LARGURA_BASE: 70,
    PORTA_ALTURA_BASE: 60,
    PORTA_X_OFFSET: 120,
    PORTA_BRILHO_SHADOW_BLUR: 30,
    PORTA_BRILHO_RAIO_BASE: 25,
    PORTA_BRILHO_RAIO_ANIM: 8,
    PORTA_BRILHO_ANIM_SPEED: 0.1,
    CHAVE_TAMANHO: 20,
    ESPINHO_ALTURA: 20,
    ESPINHO_DENTE_LARGURA: 10,
    ESPINHO_LINE_WIDTH: 4,
    ESPINHO_SHADOW_LINE_WIDTH: 2,
    CORACAO_TAMANHO: 20,
    CORACAO_REFLEXO_ROTATION_DEGREES: -15,

    // Geração Aleatória de Corações
    CHANCE_CORACAO_INICIAL: 0.25,
    CHANCE_CORACAO_INCREMENTO_POR_NIVEL: 0.02,
    CORACAO_GERACAO_TENTATIVAS: 5,
    CORACAO_GERACAO_X_PADDING: 50,
    CORACAO_GERACAO_Y_MIN: 100,
    CORACAO_GERACAO_Y_MAX_OFFSET: 350,
    CORACAO_GERACAO_OVERLAP_MARGIN: 50,

    // Efeitos Visuais
    NUM_ESTRELAS_PERTO: 50,
    NUM_ESTRELAS_LONGE: 150,
    LUA_X_OFFSET: 120,
    LUA_Y: 100,
    LUA_RAIO: 50,
    LUA_HALO_SIZE_MULT: 2,
    RASTRO_COMPRIMENTO: 20,

    // Partículas
    MORTE_PARTICULAS: 30,
    POEIRA_MAX_PARTICULAS: 25,
    POEIRA_IMPACTO_MINIMO: 8,
    CURA_PARTICULAS: 20,

    // Cores
    CORES: {
        CURA_RGB: "244, 63, 94",
        JOGADOR: "#a7d1fa",
        JOGADOR_RASTRO_RGB: "138, 184, 255",
        BLOCO: "#475569",
        BLOCO_GRAD_TOP: "#64748b",
        ESPINHO: "#a78bfa",
        CHAVE: "#a5f3fc",
        PORTA_FECHADA: "#312e81",
        PORTA_ABERTA: "#c026d3",
        PORTA_STROKE_COR: "rgba(0, 0, 0, 0.2)",
        PORTAL: "orange",
        PORTAL_BRILHO: "yellow",
        CORACAO: "#f43f5e",
        LUA_CLARA: "#f0f9ff",
        LUA_COR_INTERNA: "#b0b0b0",
        LUA_HALO: "rgba(167, 209, 250, 0.1)",
        POEIRA_RGB: "203, 213, 225",
        MORTE_RGB: "167, 209, 250",
        CENARIO_GRAD_COR_1: "#010A1A",
        CENARIO_GRAD_COR_2: "#002040",
        CENARIO_GRAD_COR_3: "#004B7D",
        CHAO_GRAD_COR_1: "#253D3D",
        CHAO_GRAD_COR_2: "#152525",
    }
};

CONFIG.CHAO_Y = CONFIG.CANVAS_ALTURA - CONFIG.ALTURA_BLOCO;
CONFIG.PLAYER_LARGURA = CONFIG.LARGURA_BLOCO * 0.8;
CONFIG.PLAYER_ALTURA = CONFIG.LARGURA_BLOCO * 0.8;
CONFIG.PLAYER_RAIO = CONFIG.PLAYER_LARGURA / 2;


// 1.3. ESTADO DO JOGO (gameState)
let gameState = {
    jogoRodando: false,
    nivelAtual: 1,
    numMortes: 0,
    vidas: CONFIG.MAX_VIDAS,
    mapa: [],
    chavesColetadas: 0,
    framesDesdeInicio: 0,
    framesDesdeRespawn: 0,
    portalCooldown: 0,
};

// 1.4. DADOS DO PERSONAGEM
let personagem = {
    nick: "",
    cor: "#a7d1fa",
    efeito: "nenhum",
    opacidade: 1.0,
};

// 1.5. JOGADOR (jogador)
let jogador = {
    x: CONFIG.LARGURA_BLOCO * 2,
    y: CONFIG.CHAO_Y - CONFIG.LARGURA_BLOCO * 3,
    largura: CONFIG.PLAYER_LARGURA,
    altura: CONFIG.PLAYER_ALTURA,
    raio: CONFIG.PLAYER_RAIO,
    velocidadeX: 0,
    velocidadeY: 0,
    saltosRestantes: CONFIG.MAX_JUMPS,
    noChao: false,
    pulando: false,
    rastro: [],
};

// 1.6. ELEMENTOS DE CENÁRIO (estrelas, partículas)
let estrelas = [
    ...Array.from({ length: CONFIG.NUM_ESTRELAS_LONGE }, () => ({
        x: Math.random() * CONFIG.CANVAS_LARGURA,
        y: Math.random() * CONFIG.CANVAS_ALTURA * 0.7,
        r: Math.random() * 1.2 + 0.3,
        brilho: Math.random(),
        velocidade: 0.05 + Math.random() * 0.05,
    })),
    ...Array.from({ length: CONFIG.NUM_ESTRELAS_PERTO }, () => ({
        x: Math.random() * CONFIG.CANVAS_LARGURA,
        y: Math.random() * CONFIG.CANVAS_ALTURA * 0.7,
        r: Math.random() * 1.8 + 0.5,
        brilho: Math.random() * 0.5 + 0.5,
        velocidade: 0.1 + Math.random() * 0.1,
    }))
];
let particulas = [];

// 1.7. CONTROLES (teclas)
const teclas = {};
document.addEventListener("keydown", (e) => (teclas[e.key.toLowerCase()] = true));
document.addEventListener("keyup", (e) => (teclas[e.key.toLowerCase()] = false));


// =================================================================================================
// 2. FUNÇÕES DE CRIAÇÃO E UTILIDADES
// =================================================================================================

// 2.1. UTILIDADES GERAIS
const colisao = (a, b) => (
    a.x < b.x + b.largura && a.x + a.largura > b.x &&
    a.y < b.y + b.altura && a.y + a.altura > b.y
);

function hexParaRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

// 2.2. CRIAÇÃO DE PARTÍCULAS
function criarParticula(x, y, cor, tamanho, duracao, vx = 0, vy = 0) {
    particulas.push({
        x, y, cor, tamanho, duracao,
        vida: duracao,
        velocidadeX: vx + (Math.random() - 0.5) * 2,
        velocidadeY: vy + (Math.random() - 0.5) * 2
    });
}


// =================================================================================================
// 3. LÓGICA DE DESENHO (RENDERIZAÇÃO)
// =================================================================================================

// 3.1. FUNÇÃO PRINCIPAL DE DESENHO
function desenhar() {
    desenharCenario();
    desenharRastro();
    desenharMapa();
    desenharJogador();
    desenharParticulas();
}

// 3.2. DESENHO DOS ELEMENTOS
function desenharCenario() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, CONFIG.CORES.CENARIO_GRAD_COR_1);
    grad.addColorStop(0.5, CONFIG.CORES.CENARIO_GRAD_COR_2);
    grad.addColorStop(1, CONFIG.CORES.CENARIO_GRAD_COR_3);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    estrelas.forEach(e => {
        e.brilho += (Math.random() - 0.5) * 0.04;
        e.brilho = Math.max(0.1, Math.min(e.brilho, 1));

        ctx.fillStyle = `rgba(255,255,255,${e.brilho})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();

        e.x -= e.velocidade;
        if (e.x < -5) e.x = canvas.width + 5;
    });

    const luaX = canvas.width - CONFIG.LUA_X_OFFSET;
    const luaY = CONFIG.LUA_Y;
    const luaR = CONFIG.LUA_RAIO;
    const haloSize = luaR * CONFIG.LUA_HALO_SIZE_MULT;

    const gradHalo = ctx.createRadialGradient(luaX, luaY, 10, luaX, luaY, haloSize);
    gradHalo.addColorStop(0, CONFIG.CORES.LUA_HALO);
    gradHalo.addColorStop(1, "transparent");
    ctx.fillStyle = gradHalo;
    ctx.fillRect(luaX - haloSize, luaY - haloSize, haloSize * 2, haloSize * 2);

    const gradLua = ctx.createRadialGradient(luaX, luaY, 10, luaX, luaY, luaR);
    gradLua.addColorStop(0, CONFIG.CORES.LUA_CLARA);
    gradLua.addColorStop(1, CONFIG.CORES.LUA_COR_INTERNA);
    ctx.fillStyle = gradLua;
    ctx.beginPath();
    ctx.arc(luaX, luaY, luaR, 0, Math.PI * 2);
    ctx.fill();

    const gradChao = ctx.createLinearGradient(0, CONFIG.CHAO_Y, 0, canvas.height);
    gradChao.addColorStop(0, CONFIG.CORES.CHAO_GRAD_COR_1);
    gradChao.addColorStop(0.6, CONFIG.CORES.CHAO_GRAD_COR_2);
    ctx.fillStyle = gradChao;
    ctx.fillRect(0, CONFIG.CHAO_Y, canvas.width, canvas.height - CONFIG.CHAO_Y);
}

function desenharRastro() {
    if (jogador.rastro.length < 2) return;
    const corRastroRGB = hexParaRgb(personagem.cor) || CONFIG.CORES.JOGADOR_RASTRO_RGB;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = jogador.rastro.length - 1; i > 0; i--) {
        const pontoAtual = jogador.rastro[i];
        const pontoAnterior = jogador.rastro[i - 1];
        const alpha = (i / jogador.rastro.length);

        ctx.beginPath();
        ctx.moveTo(pontoAnterior.x, pontoAnterior.y);
        ctx.lineTo(pontoAtual.x, pontoAtual.y);

        ctx.strokeStyle = `rgba(${corRastroRGB}, ${alpha * 0.5})`;
        ctx.lineWidth = (jogador.raio * alpha) * 1.8;
        ctx.stroke();
    }
}

function aplicarEfeitos(ctx, cx, cy) {
    // Resetar opacidade padrão
    personagem.opacidade = 1.0; 

    switch (personagem.efeito) {
        case 'fantasma':
            personagem.opacidade = 0.6 + Math.sin(gameState.framesDesdeInicio * 0.1) * 0.1;
            break;
        case 'partículas':
            const corParticula = hexParaRgb(personagem.cor) || '255,255,255';
            if (gameState.framesDesdeInicio % 5 === 0) { // Gera partículas com menos frequência
                criarParticula(
                    cx + (Math.random() - 0.5) * jogador.largura,
                    cy + (Math.random() - 0.5) * jogador.altura,
                    corParticula,
                    Math.random() * 2 + 1,
                    20,
                    (Math.random() - 0.5) * 0.5,
                    (Math.random() - 0.5) * 0.5
                );
            }
            break;
        case 'rastro luminoso':
            // O rastro principal já é desenhado, aqui podemos adicionar um brilho extra
            ctx.shadowBlur = 15;
            ctx.shadowColor = personagem.cor;
            break;
        case 'bolhas':
            if (gameState.framesDesdeInicio % 10 === 0) {
                 criarParticula(
                    cx + (Math.random() - 0.5) * jogador.largura,
                    cy + jogador.raio,
                    '255, 255, 255',
                    Math.random() * 4 + 2,
                    50,
                    (Math.random() - 0.5) * 0.2,
                    -Math.random() * 1.5 - 0.5
                );
            }
            break;
        case 'elétrico':
            if (Math.random() > 0.95) {
                ctx.strokeStyle = `rgba(255, 255, 0, ${Math.random() * 0.7 + 0.3})`;
                ctx.lineWidth = Math.random() * 3 + 1;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                for (let i = 0; i < 4; i++) {
                    ctx.lineTo(
                        cx + (Math.random() - 0.5) * 60,
                        cy + (Math.random() - 0.5) * 60
                    );
                }
                ctx.stroke();
            }
            break;
        case 'fogo':
             if (gameState.framesDesdeInicio % 3 === 0) {
                const cor = Math.random() > 0.5 ? '255, 87, 34' : '255, 193, 7';
                criarParticula(
                    cx, cy + jogador.raio / 2, cor,
                    Math.random() * 5 + 3, 30,
                    (Math.random() - 0.5) * 1, -Math.random() * 1.5
                );
            }
            break;
        case 'gelo':
            if (gameState.framesDesdeInicio % 4 === 0) {
                criarParticula(
                    cx + (Math.random() - 0.5) * jogador.largura,
                    cy + (Math.random() - 0.5) * jogador.altura,
                    '200, 225, 255',
                    Math.random() * 2 + 1, 40, 0, 0
                );
            }
            break;
        case 'glitch':
             if (Math.random() > 0.9) {
                const offsetX = (Math.random() - 0.5) * 15;
                const offsetY = (Math.random() - 0.5) * 15;
                ctx.drawImage(canvas, 
                    jogador.x, jogador.y, jogador.largura, jogador.altura,
                    jogador.x + offsetX, jogador.y + offsetY, jogador.largura, jogador.altura
                );
            }
            break;
        case 'sombra':
            ctx.shadowOffsetX = 10;
            ctx.shadowOffsetY = 10;
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 5;
            break;
        case 'arco-íris':
            personagem.cor = `hsl(${gameState.framesDesdeInicio % 360}, 100%, 70%)`;
            break;
        case 'holograma':
            personagem.opacidade = 0.7;
            ctx.strokeStyle = `hsla(${gameState.framesDesdeInicio % 360}, 100%, 80%, 0.7)`;
            ctx.lineWidth = 2;
            ctx.strokeRect(jogador.x - 5, jogador.y - 5, jogador.largura + 10, jogador.altura + 10);
            if (Math.random() > 0.8) {
                ctx.fillStyle = `hsla(${gameState.framesDesdeInicio % 360}, 100%, 80%, 0.1)`;
                ctx.fillRect(0, Math.random() * canvas.height, canvas.width, Math.random() * 5);
            }
            break;
        case 'psicodélico':
            const r = Math.sin(gameState.framesDesdeInicio * 0.1) * 127 + 128;
            const g = Math.sin(gameState.framesDesdeInicio * 0.1 + 2) * 127 + 128;
            const b = Math.sin(gameState.framesDesdeInicio * 0.1 + 4) * 127 + 128;
            personagem.cor = `rgb(${r},${g},${b})`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = `rgb(${g},${b},${r})`;
            break;
        case 'coração':
            if (gameState.framesDesdeInicio % 15 === 0) {
                criarParticula(cx, cy, '255, 105, 180', 10, 50, (Math.random() - 0.5) * 1, -Math.random() * 1);
            }
            break;
        case 'musical':
            if (gameState.framesDesdeInicio % 20 === 0) {
                const nota = ['🎵', '🎶', '🎼'][Math.floor(Math.random() * 3)];
                const p = { x: cx, y: cy, duracao: 30, vida: 30, texto: nota, vy: -2 };
                particulas.push(p); // Adiciona uma partícula de texto
            }
            break;
        case 'cósmico':
            ctx.shadowBlur = 25;
            ctx.shadowColor = `hsl(${(gameState.framesDesdeInicio + 180) % 360}, 100%, 70%)`;
            break;
        case 'matrix':
            if (gameState.framesDesdeInicio % 4 === 0) {
                const p = { x: cx + (Math.random() - 0.5) * jogador.largura, y: cy, duracao: 60, vida: 60, texto: String.fromCharCode(0x30A0 + Math.random() * 96), vy: 2, cor: '#00ff00' };
                particulas.push(p);
            }
            break;
        case 'nuvem':
            personagem.opacidade = 0.8;
            if (gameState.framesDesdeInicio % 8 === 0) {
                criarParticula(cx, cy + jogador.altura / 2, '255, 255, 255', 15, 60, (Math.random() - 0.5) * 0.5, 0);
            }
            break;
        case 'tóxico':
             if (gameState.framesDesdeInicio % 10 === 0) {
                 criarParticula(cx, cy + jogador.raio, '173, 255, 47', 8, 50, (Math.random() - 0.5) * 0.3, -Math.random() * 1);
            }
            break;
        case 'estático':
            if (Math.random() > 0.5) {
                personagem.opacidade = 0.7;
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
                ctx.fillRect(jogador.x + (Math.random() - 0.5) * 10, jogador.y + (Math.random() - 0.5) * 10, jogador.largura, jogador.altura);
            }
            break;
    }
}

function desenharJogador() {
    ctx.save();
    const cx = jogador.x + jogador.raio;
    const cy = jogador.y + jogador.raio;

    // Aplica os efeitos visuais que podem modificar a opacidade ou gerar partículas
    aplicarEfeitos(ctx, cx, cy);

    ctx.globalAlpha = personagem.opacidade;

    const gradJog = ctx.createRadialGradient(cx, cy - 5, 5, cx, cy, jogador.raio);
    gradJog.addColorStop(0, "#ffffff");
    gradJog.addColorStop(1, personagem.cor);
    ctx.fillStyle = gradJog;
    ctx.beginPath();
    ctx.arc(cx, cy, jogador.raio, 0, Math.PI * 2);
    ctx.fill();

    if (gameState.framesDesdeRespawn < CONFIG.INVENCIBILIDADE_FRAMES && gameState.framesDesdeRespawn % 6 < 3) {
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, jogador.raio + 3, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();

    // Desenha o Nick
    if (personagem.nick) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.font = "12px 'Courier New', Courier, monospace";
        const nickWidth = ctx.measureText(personagem.nick).width;
        ctx.fillRect(cx - nickWidth / 2 - 5, cy - jogador.raio - 20, nickWidth + 10, 18);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(personagem.nick, cx, cy - jogador.raio - 8);
    }
}

function desenharMapa() {
    gameState.mapa.forEach(e => {
        if (e.tipo === "bloco") {
            const grad = ctx.createLinearGradient(e.x, e.y, e.x, e.y + e.altura);
            grad.addColorStop(0, CONFIG.CORES.BLOCO_GRAD_TOP);
            grad.addColorStop(1, CONFIG.CORES.BLOCO);
            ctx.fillStyle = grad;
            ctx.fillRect(e.x, e.y, e.largura, e.altura);
        } else if (e.tipo === "espinho") {
            ctx.fillStyle = CONFIG.CORES.ESPINHO;
            ctx.strokeStyle = CONFIG.CORES.ESPINHO;
            ctx.lineWidth = CONFIG.ESPINHO_LINE_WIDTH;
            ctx.lineJoin = "round";
            ctx.beginPath();
            const num = Math.floor(e.largura / CONFIG.ESPINHO_DENTE_LARGURA);
            for (let i = 0; i < num; i++) {
                const x = e.x + i * CONFIG.ESPINHO_DENTE_LARGURA;
                ctx.moveTo(x, e.y + e.altura);
                ctx.lineTo(x + CONFIG.ESPINHO_DENTE_LARGURA / 2, e.y);
                ctx.lineTo(x + CONFIG.ESPINHO_DENTE_LARGURA, e.y + e.altura);
            }
            ctx.stroke();
            ctx.fill();

            ctx.strokeStyle = CONFIG.CORES.PORTA_STROKE_COR;
            ctx.lineWidth = CONFIG.ESPINHO_SHADOW_LINE_WIDTH;
            ctx.stroke();

            ctx.lineJoin = "miter"; ctx.lineWidth = 1;
        } else if (e.tipo === "chave") {
            ctx.fillStyle = CONFIG.CORES.CHAVE;
            ctx.beginPath();
            ctx.arc(e.x + e.largura / 2, e.y + e.largura / 2, e.largura / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (e.tipo === "porta") {
            const pX = e.x + (e.largura - CONFIG.PORTA_LARGURA) / 2;
            const pY = e.y - (CONFIG.PORTA_ALTURA - e.altura);
            const cor = gameState.chavesColetadas >= e.chavesNecessarias ? CONFIG.CORES.PORTA_ABERTA : CONFIG.CORES.PORTA_FECHADA;
            const grad = ctx.createLinearGradient(pX, pY, pX + CONFIG.PORTA_LARGURA, pY + CONFIG.PORTA_ALTURA);
            grad.addColorStop(0, cor);
            grad.addColorStop(1, cor === CONFIG.CORES.PORTA_ABERTA ? "#f9a8d4" : "#1e1b4b");

            ctx.fillStyle = grad;
            ctx.fillRect(pX, pY, CONFIG.PORTA_LARGURA, CONFIG.PORTA_ALTURA);

            ctx.strokeStyle = CONFIG.CORES.PORTA_STROKE_COR;
            ctx.lineWidth = 4;
            ctx.strokeRect(pX, pY, CONFIG.PORTA_LARGURA, CONFIG.PORTA_ALTURA);

            if (gameState.chavesColetadas >= e.chavesNecessarias) {
                ctx.shadowBlur = CONFIG.PORTA_BRILHO_SHADOW_BLUR;
                ctx.shadowColor = CONFIG.CORES.PORTA_ABERTA;
                ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(gameState.framesDesdeInicio * CONFIG.PORTA_BRILHO_ANIM_SPEED) * 0.1})`;
                ctx.beginPath();
                const raioBrilho = CONFIG.PORTA_BRILHO_RAIO_BASE + Math.sin(gameState.framesDesdeInicio * CONFIG.PORTA_BRILHO_ANIM_SPEED) * CONFIG.PORTA_BRILHO_RAIO_ANIM;
                ctx.arc(pX + CONFIG.PORTA_LARGURA / 2, pY + CONFIG.PORTA_ALTURA / 2, raioBrilho, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        } else if (e.tipo === "portal") {
            ctx.fillStyle = CONFIG.CORES.PORTAL;
            ctx.shadowColor = CONFIG.CORES.PORTAL_BRILHO;
            ctx.shadowBlur = CONFIG.PORTAL_SHADOW_BLUR;
            ctx.fillRect(e.x, e.y, e.largura, e.altura);
            ctx.shadowBlur = 0;
        } else if (e.tipo === "coracao") {
            const x = e.x;
            const y = e.y;
            const w = e.largura;
            const h = e.altura;

            // Cor e gradiente para imitar o estilo do HUD
            const grad = ctx.createRadialGradient(x + w / 2, y + h / 2, 1, x + w / 2, y + h / 2, w);
            grad.addColorStop(0, "#fb7185"); // Centro mais claro
            grad.addColorStop(1, CONFIG.CORES.CORACAO); // Cor da borda
            ctx.fillStyle = grad;

            // Path aprimorado para uma forma de coração mais definida
            ctx.beginPath();
            ctx.moveTo(x + w / 2, y + h * 0.35);
            ctx.bezierCurveTo(x, y, x, y + h * 0.7, x + w / 2, y + h);
            ctx.bezierCurveTo(x + w, y + h * 0.7, x + w, y, x + w / 2, y + h * 0.35);
            ctx.closePath();
            ctx.fill();

            // Desenha o reflexo para ser idêntico ao do HUD
            ctx.save();
            const reflexoX = x + w * 0.5;
            const reflexoY = y + h * 0.3;
            const reflexoRaioX = w * 0.38;
            const reflexoRaioY = h * 0.18;

            ctx.translate(reflexoX, reflexoY);
            ctx.rotate((Math.PI / 180) * CONFIG.CORACAO_REFLEXO_ROTATION_DEGREES);

            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.beginPath();
            ctx.ellipse(0, 0, reflexoRaioX, reflexoRaioY, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    });
}

function desenharParticulas() {
    particulas.forEach(p => {
        const opacidade = p.vida / p.duracao;
        if (p.texto) { // Se for uma partícula de texto
            ctx.font = '20px Arial';
            ctx.fillStyle = p.cor ? `rgba(${hexParaRgb(p.cor)}, ${opacidade})` : `rgba(255, 255, 255, ${opacidade})`;
            ctx.fillText(p.texto, p.x, p.y);
        } else { // Partícula normal
            ctx.fillStyle = `rgba(${p.cor}, ${opacidade})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.tamanho * opacidade, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// =================================================================================================
// 4. LÓGICA DE ATUALIZAÇÃO (UPDATE)
// =================================================================================================

// 4.1. FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO
function atualizar() {
    gameState.framesDesdeInicio++;
    gameState.framesDesdeRespawn++;

    handleInput();
    updatePlayerState();
    updateParticles();
    checkGameStatus();
}

// 4.2. ATUALIZAÇÃO DO JOGADOR
function handleInput() {
    let dir = 0;
    if (teclas["a"] || teclas["arrowleft"]) dir = -1;
    if (teclas["d"] || teclas["arrowright"]) dir = 1;

    jogador.velocidadeX = dir * CONFIG.PLAYER_SPEED_X;

    if ((teclas["w"] || teclas[" "] || teclas["arrowup"]) && !jogador.pulando) {
        if (jogador.saltosRestantes > 0) {
            jogador.velocidadeY = -CONFIG.JUMP_FORCE;
            jogador.saltosRestantes--;
            jogador.pulando = true;
        }
    }
    if (!(teclas["w"] || teclas[" "] || teclas["arrowup"])) {
        jogador.pulando = false;
    }
}

function updatePlayerState() {
    // Física e Movimento
    jogador.velocidadeY += CONFIG.GRAVITY;
    jogador.x += jogador.velocidadeX;
    jogador.y += jogador.velocidadeY;

    // Limites da Tela
    jogador.x = Math.max(0, Math.min(jogador.x, CONFIG.CANVAS_LARGURA - jogador.largura));

    // Rastro do Jogador
    const seMovendo = Math.abs(jogador.velocidadeX) > 0.1 || Math.abs(jogador.velocidadeY) > 0.1;
    if (seMovendo) {
        jogador.rastro.push({ x: jogador.x + jogador.raio, y: jogador.y + jogador.raio });
    }
    if (jogador.rastro.length > CONFIG.RASTRO_COMPRIMENTO || (!seMovendo && jogador.rastro.length > 0)) {
        jogador.rastro.shift();
    }

    // Cooldown do Portal
    if (gameState.portalCooldown > 0) gameState.portalCooldown--;

    // Lógica de Colisão
    handleCollisions();
}

// 4.3. LÓGICA DE COLISÃO
function handleCollisions() {
    jogador.noChao = false;
    gameState.mapa.forEach(elemento => {
        if (colisao(jogador, elemento)) {
            switch (elemento.tipo) {
                case "bloco":
                    handleBlocoCollision(elemento);
                    break;
                case "espinho":
                    handleEspinhoCollision(elemento);
                    break;
                case "chave":
                    handleChaveCollision(elemento);
                    break;
                case "portal":
                    handlePortalCollision(elemento);
                    break;
                case "coracao":
                    handleCoracaoCollision(elemento);
                    break;
            }
        }
    });
}

function handleBlocoCollision(bloco) {
    if (jogador.velocidadeY > 0 && (jogador.y + jogador.altura - jogador.velocidadeY) <= bloco.y) {
        const impacto = jogador.velocidadeY;
        jogador.y = bloco.y - jogador.altura;
        jogador.velocidadeY = 0;
        jogador.saltosRestantes = CONFIG.MAX_JUMPS;
        jogador.noChao = true;

        if (impacto > CONFIG.POEIRA_IMPACTO_MINIMO) {
            const numParticulas = Math.min(Math.floor(impacto * 1.5), CONFIG.POEIRA_MAX_PARTICULAS);
            for (let i = 0; i < numParticulas; i++) {
                criarParticula(jogador.x + jogador.raio, jogador.y + jogador.altura, CONFIG.CORES.POEIRA_RGB,
                    Math.random() * 2.5 + 1, Math.random() * 40 + 30, (Math.random() - 0.5) * 4, -Math.random() * 2);
            }
        }
    }
}

function handleEspinhoCollision() {
    if (gameState.framesDesdeRespawn >= CONFIG.INVENCIBILIDADE_FRAMES) {
        morrer();
    }
}

function handleChaveCollision(chave) {
    gameState.chavesColetadas++;
    gameState.mapa = gameState.mapa.filter(item => item !== chave);
}

function handlePortalCollision(portal) {
    if (gameState.portalCooldown === 0) {
        const destino = gameState.mapa.find(p => p.tipo === "portal" && p.id === portal.id && p !== portal);
        if (destino) {
            jogador.x = destino.x;
            jogador.y = destino.y;
            gameState.portalCooldown = CONFIG.PORTAL_COOLDOWN_FRAMES;
        }
    }
}

function handleCoracaoCollision(coracao) {
    if (gameState.vidas < CONFIG.MAX_VIDAS) {
        gameState.vidas++;
        const heartCenterX = coracao.x + coracao.largura / 2;
        const heartCenterY = coracao.y + coracao.altura / 2;
        for (let i = 0; i < CONFIG.CURA_PARTICULAS; i++) {
            const angulo = Math.random() * Math.PI * 2;
            const velocidade = Math.random() * 3 + 1;
            const vx = Math.cos(angulo) * velocidade;
            const vy = Math.sin(angulo) * velocidade;
            criarParticula(heartCenterX, heartCenterY, CONFIG.CORES.CURA_RGB, Math.random() * 3 + 2, 40, vx, vy);
        }
    }
    gameState.mapa = gameState.mapa.filter(item => item !== coracao);
}

// 4.4. ATUALIZAÇÃO DAS PARTÍCULAS
function updateParticles() {
    for (let i = particulas.length - 1; i >= 0; i--) {
        const p = particulas[i];
        if (p.texto) {
            p.y += p.vy;
        } else {
            p.x += p.velocidadeX;
            p.y += p.velocidadeY;
        }
        p.vida--;
        if (p.vida <= 0) particulas.splice(i, 1);
    }
}

// 4.5. VERIFICAÇÃO DE STATUS DO JOGO
function checkGameStatus() {
    const porta = gameState.mapa.find(e => e.tipo === "porta");
    if (porta) {
        const colisaoPorta = {
            x: porta.x + (porta.largura - CONFIG.PORTA_LARGURA) / 2,
            y: porta.y - (CONFIG.PORTA_ALTURA - porta.altura),
            largura: CONFIG.PORTA_LARGURA, altura: CONFIG.PORTA_ALTURA
        };
        if (colisao(jogador, colisaoPorta) && gameState.chavesColetadas >= porta.chavesNecessarias) {
            gameState.nivelAtual++;
            (gameState.nivelAtual > CONFIG.MAX_NIVEIS) ? mostrarTelaFinal("VITÓRIA!", `Você completou ${CONFIG.MAX_NIVEIS} níveis!`) : reiniciarNivel();
        }
    }
    if (jogador.y > CONFIG.CANVAS_ALTURA + CONFIG.MORTE_POR_QUEDA_Y_OFFSET) morrer();
}

// =================================================================================================
// 5. CRIAÇÃO DE MAPAS
// =================================================================================================

// 5.1. FUNÇÕES DE CRIAÇÃO DE OBJETOS
const criarBloco = (x, y, w = CONFIG.LARGURA_BLOCO, h = CONFIG.ALTURA_BLOCO) => ({ tipo: "bloco", x, y, largura: w, altura: h });
const criarEspinho = (x, y, w = CONFIG.LARGURA_BLOCO, h = CONFIG.ESPINHO_ALTURA) => ({ tipo: "espinho", x, y, largura: w, altura: h });
const criarChave = (x, y) => ({ tipo: "chave", x, y, largura: CONFIG.CHAVE_TAMANHO, altura: CONFIG.CHAVE_TAMANHO });
const criarPorta = (x, y, ch = 0) => ({ tipo: "porta", x, y, largura: CONFIG.PORTA_LARGURA_BASE, altura: CONFIG.PORTA_ALTURA_BASE, chavesNecessarias: ch });
const criarPortal = (x, y, id, w = CONFIG.PORTAL_LARGURA, h = CONFIG.PORTAL_ALTURA) => ({ tipo: "portal", x, y, largura: w, altura: h, id });
const criarCoracao = (x, y) => ({ tipo: "coracao", x, y, largura: CONFIG.CORACAO_TAMANHO, altura: CONFIG.CORACAO_TAMANHO });

// 5.2. LÓGICA DE GERAÇÃO DE NÍVEIS
function criarMapa(nivel) {
    let m = [criarBloco(0, CONFIG.CHAO_Y, CONFIG.CANVAS_LARGURA, CONFIG.ALTURA_BLOCO * 2)];

    // Adiciona o layout específico do nível
    const layoutNivel = obterLayoutNivel(nivel);
    if (layoutNivel) {
        m.push(...layoutNivel);
    }

    // Adiciona corações aleatoriamente
    adicionarCoracoes(m, nivel);

    return m;
}

function obterLayoutNivel(nivel) {
    const XPORTA = CONFIG.CANVAS_LARGURA - CONFIG.PORTA_X_OFFSET;
    const ESPINHO_Y = CONFIG.CHAO_Y - CONFIG.ESPINHO_ALTURA;

    switch (nivel) {
        case 1:
            return [
                criarBloco(200, CONFIG.CHAO_Y - 80, 100),
                criarEspinho(400, ESPINHO_Y, 150),
                criarChave(230, CONFIG.CHAO_Y - 120),
                criarPorta(XPORTA, CONFIG.CHAO_Y - 60, 1)
            ];
        case 2:
            const platformWidth = CONFIG.LARGURA_BLOCO * 3;
            return [
                criarBloco(200, CONFIG.CHAO_Y - 80, 100),
                criarBloco(450, CONFIG.CHAO_Y - 150, platformWidth),
                criarChave(450 + (platformWidth - CONFIG.CHAVE_TAMANHO) / 2, CONFIG.CHAO_Y - 150 - CONFIG.CHAVE_TAMANHO),
                criarEspinho(300, ESPINHO_Y, 50),
                criarEspinho(600, ESPINHO_Y, 80),
                criarBloco(450, CONFIG.CHAO_Y - 250, platformWidth),
                criarEspinho(450, CONFIG.CHAO_Y - 250 - CONFIG.ESPINHO_ALTURA, platformWidth),
                criarPorta(XPORTA, CONFIG.CHAO_Y - 60, 1),
                criarBloco(50, CONFIG.CHAO_Y - 350, platformWidth),
                criarBloco(CONFIG.CANVAS_LARGURA - 110 - (platformWidth - 60), CONFIG.CHAO_Y - 450, platformWidth),
                criarPortal(50 + (platformWidth - CONFIG.PORTAL_LARGURA) / 2, CONFIG.CHAO_Y - 350 - CONFIG.PORTAL_ALTURA, 1),
                criarPortal(CONFIG.CANVAS_LARGURA - 110 - (platformWidth - 60) + (platformWidth - CONFIG.PORTAL_LARGURA) / 2, CONFIG.CHAO_Y - 450 - CONFIG.PORTAL_ALTURA, 1)
            ];
        // Adicione mais casos para mais níveis aqui
        default:
            // Por padrão, cria um nível vazio se não houver layout definido
            return [criarPorta(XPORTA, CONFIG.CHAO_Y - 60, 0)];
    }
}

function adicionarCoracoes(mapa, nivel) {
    const chanceCoracao = CONFIG.CHANCE_CORACAO_INICIAL + (nivel * CONFIG.CHANCE_CORACAO_INCREMENTO_POR_NIVEL);
    if (Math.random() < chanceCoracao) {
        let tentativas = CONFIG.CORACAO_GERACAO_TENTATIVAS;
        while (tentativas > 0) {
            const platLargura = CONFIG.LARGURA_BLOCO * 3;
            const platX = Math.random() * (CONFIG.CANVAS_LARGURA - platLargura - (CONFIG.CORACAO_GERACAO_X_PADDING * 2)) + CONFIG.CORACAO_GERACAO_X_PADDING;
            const platY = Math.random() * (CONFIG.CHAO_Y - CONFIG.CORACAO_GERACAO_Y_MAX_OFFSET) + CONFIG.CORACAO_GERACAO_Y_MIN;

            const novaPlataforma = criarBloco(platX, platY, platLargura, CONFIG.ALTURA_BLOCO);

            let overlap = mapa.some(elemento => colisao(elemento, {
                x: novaPlataforma.x - CONFIG.CORACAO_GERACAO_OVERLAP_MARGIN, y: novaPlataforma.y - CONFIG.CORACAO_GERACAO_OVERLAP_MARGIN,
                largura: novaPlataforma.largura + (CONFIG.CORACAO_GERACAO_OVERLAP_MARGIN * 2), altura: novaPlataforma.altura + (CONFIG.CORACAO_GERACAO_OVERLAP_MARGIN * 2)
            }));

            if (!overlap) {
                mapa.push(novaPlataforma);
                mapa.push(criarCoracao(
                    novaPlataforma.x + novaPlataforma.largura / 2 - CONFIG.CORACAO_TAMANHO / 2,
                    novaPlataforma.y - CONFIG.CORACAO_TAMANHO
                ));
                break;
            }
            tentativas--;
        }
    }
}


// =================================================================================================
// 6. FLUXO PRINCIPAL DO JOGO
// =================================================================================================

// 6.1. FUNÇÕES DE CONTROLE DE FLUXO
function morrer() {
    if (gameState.framesDesdeRespawn < CONFIG.MORTE_INSTANTANEA_DELAY || !gameState.jogoRodando) return;
    const corParticula = hexParaRgb(personagem.cor) || CONFIG.CORES.MORTE_RGB;

    for (let i = 0; i < CONFIG.MORTE_PARTICULAS; i++) {
        criarParticula(jogador.x + jogador.raio, jogador.y + jogador.raio, corParticula, 4, 50);
    }
    gameState.numMortes++;
    gameState.vidas--;
    (gameState.vidas <= 0) ? mostrarTelaFinal("GAME OVER!", `Você morreu ${gameState.numMortes} vezes!`) : reiniciarNivel();
}

function atualizarPlacar() {
    vidasContainerEsquerda.innerHTML = "";
    vidasContainerDireita.innerHTML = "";

    for (let i = 0; i < CONFIG.MAX_VIDAS; i++) {
        const heartContainer = (i < 5) ? vidasContainerEsquerda : vidasContainerDireita;
        if (i < gameState.vidas) {
            const heart = document.createElement("div");
            heart.classList.add("heart");
            heart.innerHTML = `<span class="reflexo"></span>`;
            heartContainer.appendChild(heart);
        }
    }

    nivelDisplay.textContent = gameState.nivelAtual;
    xpBar.style.width = `${(gameState.nivelAtual / CONFIG.MAX_NIVEIS) * 100}%`;
}

function reiniciarNivel() {
    gameState.framesDesdeRespawn = 0;
    gameState.mapa = criarMapa(gameState.nivelAtual);
    jogador.x = CONFIG.LARGURA_BLOCO * 2;
    jogador.y = CONFIG.CHAO_Y - CONFIG.LARGURA_BLOCO * 3;
    jogador.velocidadeX = 0;
    jogador.velocidadeY = 0;
    jogador.saltosRestantes = CONFIG.MAX_JUMPS;
    jogador.noChao = false;
    gameState.chavesColetadas = 0;
}

function mostrarTelaFinal(titulo, msg) {
    gameState.jogoRodando = false;
    telaFinal.classList.remove("hidden");
    tituloFinal.textContent = titulo;
    mensagemFinal.innerHTML = msg;
}

function iniciarJogo() {
    telaInicial.classList.add("hidden");
    telaFinal.classList.add("hidden");
    if (!gameState.jogoRodando || gameState.vidas <= 0) {
        gameState.nivelAtual = 1;
        gameState.numMortes = 0;
        gameState.vidas = CONFIG.MAX_VIDAS;
    }
    atualizarPlacar();
    reiniciarNivel();
    gameState.jogoRodando = true;
    gameLoop();
}

function reiniciarFaseAtual() {
    if (gameState.jogoRodando) {
        reiniciarNivel();
    }
}

// 6.2. LOOP PRINCIPAL DO JOGO
function gameLoop() {
    if (!gameState.jogoRodando) return;
    atualizar();
    desenhar();
    atualizarPlacar();
    requestAnimationFrame(gameLoop);
}

// 6.3. INICIALIZAÇÃO
function setup() {
    // Botões principais do jogo
    btnJogar.onclick = iniciarJogo;
    btnJogarNovamente.onclick = iniciarJogo;
    btnReiniciarNivel.onclick = reiniciarFaseAtual;

    // --- LÓGICA DE CUSTOMIZAÇÃO ---
    const btnCustomizacao = document.getElementById("btnCustomizacao");
    const menuCustomizacao = document.getElementById("menuCustomizacao");
    const btnFecharMenu = document.getElementById("btnFecharMenu");
    const inputNick = document.getElementById("inputNick");
    const seletorCorAvancado = document.getElementById("seletorCorAvancado");
    const listaEfeitosContainer = document.getElementById("listaEfeitos");
    const previewCanvas = document.getElementById("previewCanvas");
    const previewCtx = previewCanvas.getContext("2d");
    const slotsContainer = document.getElementById("slotsContainer");
    const btnAjuda = document.getElementById("btnAjuda");

    const efeitos = [
        { nome: "Nenhum", emoji: "⚪" }, { nome: "Fantasma", emoji: "👻" }, { nome: "Partículas", emoji: "✨" },
        { nome: "Rastro Luminoso", emoji: "💫" }, { nome: "Bolhas", emoji: "🧼" }, { nome: "Elétrico", emoji: "⚡" },
        { nome: "Fogo", emoji: "🔥" }, { nome: "Gelo", emoji: "❄️" }, { nome: "Glitch", emoji: "💥" },
        { nome: "Sombra", emoji: "🌑" }, { nome: "Arco-íris", emoji: "🌈" }, { nome: "Holograma", emoji: "🌐" },
        { nome: "Psicodélico", emoji: "🌀" }, { nome: "Coração", emoji: "💖" }, { nome: "Musical", emoji: "🎶" },
        { nome: "Cósmico", emoji: "🌌" }, { nome: "Matrix", emoji: "💻" }, { nome: "Nuvem", emoji: "☁️" },
        { nome: "Tóxico", emoji: "☣️" }, { nome: "Estático", emoji: "📺" }
    ];

    function salvarPersonagem(slot) {
        if (!personagem.nick) {
            alert("Por favor, dê um nick ao seu personagem antes de salvar!");
            return;
        }
        localStorage.setItem(`personagem_slot_${slot}`, JSON.stringify(personagem));
        popularSlots(); // Atualiza a UI dos slots
    }

    function carregarPersonagem(slot) {
        const salvo = localStorage.getItem(`personagem_slot_${slot}`);
        if (salvo) {
            const dados = JSON.parse(salvo);
            personagem.nick = dados.nick;
            personagem.cor = dados.cor;
            personagem.efeito = dados.efeito;

            // Atualiza a UI de customização
            inputNick.value = personagem.nick;
            seletorCorAvancado.value = personagem.cor;
            document.querySelectorAll('.efeito-btn').forEach(btn => {
                btn.classList.toggle('selecionado', btn.textContent.toLowerCase() === personagem.efeito);
            });
            desenharPreview();
        }
    }

    function deletarPersonagem(slot) {
        localStorage.removeItem(`personagem_slot_${slot}`);
        popularSlots();
    }

    function popularSlots() {
        slotsContainer.innerHTML = "";
        for (let i = 1; i <= 4; i++) {
            const slot = document.createElement("div");
            slot.classList.add("slot");

            const salvo = localStorage.getItem(`personagem_slot_${i}`);
            const dados = salvo ? JSON.parse(salvo) : null;

            slot.innerHTML = `
                <div class="slot-preview" style="background-color: ${dados ? dados.cor : '#020617'};"></div>
                <div class="slot-nick">${dados ? dados.nick : 'Vazio'}</div>
                <div class="slot-botoes">
                    <button class="btn-salvar-slot">Salvar</button>
                    ${dados ? '<button class="btn-carregar-slot">Carregar</button><button class="btn-deletar-slot">X</button>' : ''}
                </div>
            `;
            
            slot.querySelector('.btn-salvar-slot').onclick = () => salvarPersonagem(i);
            if (dados) {
                slot.querySelector('.btn-carregar-slot').onclick = () => carregarPersonagem(i);
                slot.querySelector('.btn-deletar-slot').onclick = () => deletarPersonagem(i);
            }

            slotsContainer.appendChild(slot);
        }
    }


    // Preencher cores e efeitos
    efeitos.forEach(efeito => {
        const btnEfeito = document.createElement("button");
        btnEfeito.classList.add("efeito-btn");
        btnEfeito.textContent = efeito.emoji;
        btnEfeito.title = efeito.nome; // Adiciona o nome do efeito como tooltip
        btnEfeito.onclick = () => {
            personagem.efeito = efeito.nome.toLowerCase();
            desenharPreview();
            document.querySelectorAll('.efeito-btn').forEach(btn => btn.classList.remove('selecionado'));
            btnEfeito.classList.add('selecionado');
        };
        listaEfeitosContainer.appendChild(btnEfeito);
    });
    
    // Listeners dos controles
    btnCustomizacao.onclick = () => {
        menuCustomizacao.classList.remove("hidden");
        if (gameState.jogoRodando) {
            gameState.jogoRodando = false;
        }
        desenharPreview();
        popularSlots(); // Popula os slots sempre que o menu é aberto
    };

    btnFecharMenu.onclick = () => {
        menuCustomizacao.classList.add("hidden");
        if (!telaInicial.classList.contains("hidden") || !telaFinal.classList.contains("hidden")) {
           // Não faz nada
        } else {
            gameState.jogoRodando = true;
            gameLoop();
        }
    };
    
    inputNick.oninput = (e) => {
        personagem.nick = e.target.value;
        desenharPreview();
    };

    seletorCorAvancado.oninput = (e) => {
        personagem.cor = e.target.value;
        desenharPreview();
    };

    btnAjuda.onclick = () => {
        alert(
            'MENU DE CUSTOMIZAÇÃO:\n\n' +
            '1. Nick: Escreva um nome de até 7 letras para seu personagem.\n' +
            '2. Cores: Clique em uma das cores predefinidas ou use o seletor para uma cor personalizada.\n' +
            '3. Efeitos: Selecione um efeito visual para seu personagem durante o jogo.\n' +
            '4. Slots de Personagem:\n' +
            '   - Salvar: Salva seu personagem atual no slot selecionado (requer um nick).\n' +
            '   - Carregar: Carrega a aparência de um personagem salvo.\n' +
            '   - X: Deleta um personagem salvo.\n\n' +
            'Clique em "Fechar" para voltar ao jogo.'
        );
    };

    function desenharPreview() {
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        const cx = previewCanvas.width / 2;
        const cy = previewCanvas.height / 2;
        const raio = CONFIG.PLAYER_RAIO * 1.5;

        const grad = previewCtx.createRadialGradient(cx, cy - 5, 5, cx, cy, raio);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(1, personagem.cor);
        
        previewCtx.fillStyle = grad;
        previewCtx.beginPath();
        previewCtx.arc(cx, cy, raio, 0, Math.PI * 2);
        previewCtx.fill();
        
        if (personagem.nick) {
            previewCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
            previewCtx.font = "14px 'Courier New', Courier, monospace";
            const nickWidth = previewCtx.measureText(personagem.nick).width;
            previewCtx.fillRect(cx - nickWidth / 2 - 5, cy - raio - 25, nickWidth + 10, 20);
            
            previewCtx.fillStyle = "white";
            previewCtx.textAlign = "center";
            previewCtx.fillText(personagem.nick, cx, cy - raio - 10);
        }
    }

    // Início do jogo
    popularSlots(); // Popula os slots inicialmente
    reiniciarNivel();
    desenhar();
}

setup();
