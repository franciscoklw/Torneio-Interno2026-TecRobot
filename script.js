const SUPABASE_URL = "https://zorolzmqvpsltemcxkjq.supabase.co";
const SUPABASE_KEY = "sb_publishable_-LUkRDPS0OVlf1kUuaoB0A_BITtikgi";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =========================
// NAVEGAÇÃO
// =========================

const linksNavegacao = document.querySelectorAll("nav a");
const secoes = document.querySelectorAll("section");

linksNavegacao.forEach(link => {

    link.addEventListener("click", function (evento) {

        evento.preventDefault();

        const secaoEscolhida = this.dataset.secao;

        secoes.forEach(secao => {
            secao.style.display = "none";
        });

        const secao = document.getElementById(secaoEscolhida);

        if (secao) {
            secao.style.display = "block";
        }

        linksNavegacao.forEach(item => {
            item.classList.remove("ativa");
        });

        this.classList.add("ativa");

    });

});


// =========================
// RANKING
// =========================

const seletorModalidade = document.getElementById("modalidade");
const rankingLinha = document.getElementById("ranking-linha");
const rankingBalao = document.getElementById("ranking-balao");


function atualizarRanking() {

    if (!seletorModalidade) {
        return;
    }

    if (seletorModalidade.value === "linha") {

        rankingLinha.style.display = "block";
        rankingBalao.style.display = "none";

        carregarRankingLinha();

    } else {

        rankingLinha.style.display = "none";
        rankingBalao.style.display = "block";

        carregarRankingBalao();

    }

}


if (seletorModalidade) {

    seletorModalidade.addEventListener(
        "change",
        atualizarRanking
    );

}


// =========================
// RANKING — SEGUIDOR DE LINHA
// =========================

async function carregarRankingLinha() {

    const {
        data: equipes,
        error: erroEquipes
    } = await supabaseClient
        .from("equipes")
        .select("id, nome")
        .order("id");

    if (erroEquipes) {

        console.error(
            "Erro ao buscar equipes:",
            erroEquipes
        );

        return;
    }


    const {
        data: partidas,
        error: erroPartidas
    } = await supabaseClient
        .from("partidas")
        .select("id")
        .eq(
            "modalidade",
            "Seguidor de Linha"
        );

    if (erroPartidas) {

        console.error(
            "Erro ao buscar partidas de Linha:",
            erroPartidas
        );

        return;
    }


    const idsPartidasLinha =
        partidas.map(partida => partida.id);


    if (idsPartidasLinha.length === 0) {
        return;
    }


    const {
        data: participantes,
        error: erroParticipantes
    } = await supabaseClient
        .from("participantes")
        .select(
            "equipe_id, partida_id, pontos, tempo_segundos, finalizado"
        )
        .in(
            "partida_id",
            idsPartidasLinha
        );


    if (erroParticipantes) {

        console.error(
            "Erro ao buscar resultados de Linha:",
            erroParticipantes
        );

        return;
    }


    const ranking =
        equipes.map(equipe => {

            const resultados =
                participantes.filter(
                    participante =>
                        participante.equipe_id === equipe.id &&
                        participante.finalizado === true
                );


            const pontosTotais =
                resultados.reduce(
                    (total, participante) =>
                        total +
                        Number(
                            participante.pontos || 0
                        ),
                    0
                );


            const tempoTotal =
                resultados.reduce(
                    (total, participante) =>
                        total +
                        Number(
                            participante.tempo_segundos || 0
                        ),
                    0
                );


            return {
                nome: equipe.nome,
                pontos: pontosTotais,
                tempo: tempoTotal
            };

        });


    // Maior pontuação primeiro.
    // Em caso de empate, menor tempo primeiro.
    ranking.sort((a, b) => {

        if (b.pontos !== a.pontos) {
            return b.pontos - a.pontos;
        }

        return a.tempo - b.tempo;

    });


    ranking.forEach((equipe, index) => {

        const posicao = index + 1;


        const elementoNome =
            document.getElementById(
                `linha-equipe-${posicao}`
            );


        const elementoPontos =
            document.getElementById(
                `linha-pontos-${posicao}`
            );


        const elementoTempo =
            document.getElementById(
                `linha-tempo-${posicao}`
            );


        if (elementoNome) {

            elementoNome.textContent =
                equipe.nome;

        }


        if (elementoPontos) {

            elementoPontos.textContent =
                equipe.pontos;

        }


        if (elementoTempo) {

            elementoTempo.textContent =
                equipe.tempo + "s";

        }

    });


    console.log(
        "Ranking de Linha:",
        ranking
    );

}


// =========================
// RANKING — DESAFIO DO BALÃO
// =========================

async function carregarRankingBalao() {

    const {
        data: equipes,
        error: erroEquipes
    } = await supabaseClient
        .from("equipes")
        .select("id, nome")
        .order("id");


    if (erroEquipes) {

        console.error(
            "Erro ao buscar equipes:",
            erroEquipes
        );

        return;
    }


    const {
        data: partidas,
        error: erroPartidas
    } = await supabaseClient
        .from("partidas")
        .select("id")
        .eq(
            "modalidade",
            "Desafio do balão"
        );


    if (erroPartidas) {

        console.error(
            "Erro ao buscar partidas do balão:",
            erroPartidas
        );

        return;
    }


    const idsPartidas =
        partidas.map(partida => partida.id);


    if (idsPartidas.length === 0) {
        return;
    }


    const {
        data: participantes,
        error: erroParticipantes
    } = await supabaseClient
        .from("participantes")
        .select(
            "equipe_id, partida_id, pontos"
        )
        .in(
            "partida_id",
            idsPartidas
        );


    if (erroParticipantes) {

        console.error(
            "Erro ao buscar resultados do balão:",
            erroParticipantes
        );

        return;
    }


    const ranking =
        equipes.map(equipe => {

            const resultados =
                participantes.filter(
                    participante =>
                        participante.equipe_id === equipe.id
                );


            const pontos =
                resultados.reduce(
                    (total, participante) =>
                        total +
                        Number(
                            participante.pontos || 0
                        ),
                    0
                );


            return {
                nome: equipe.nome,
                pontos: pontos
            };

        });


    ranking.sort((a, b) =>
        b.pontos - a.pontos
    );


    ranking.forEach((equipe, index) => {

        const posicao = index + 1;


        const elementoNome =
            document.getElementById(
                `balao-equipe-${posicao}`
            );


        const elementoPontos =
            document.getElementById(
                `balao-pontos-${posicao}`
            );


        if (elementoNome) {

            elementoNome.textContent =
                equipe.nome;

        }


        if (elementoPontos) {

            elementoPontos.textContent =
                equipe.pontos;

        }

    });


    console.log(
        "Ranking do Balão:",
        ranking
    );

}


// =========================
// CHAVEAMENTO
// =========================

async function carregarChaveamento() {

    const {
        data: chaveamento,
        error: erroChaveamento
    } = await supabaseClient
        .from("chaveamento")
        .select(`
            id,
            semifinal1_equipe1,
            semifinal1_equipe2,
            semifinal2_equipe1,
            semifinal2_equipe2,
            semifinal1_vencedor,
            semifinal2_vencedor,
            semifinal1_perdedor,
            semifinal2_perdedor,
            final_vencedor,
            terceiro_vencedor
        `)
        .order("id", {
            ascending: false
        })
        .limit(1);


    if (erroChaveamento) {

        console.error(
            "Erro ao buscar chaveamento:",
            erroChaveamento
        );

        return;
    }


    if (
        !chaveamento ||
        chaveamento.length === 0
    ) {

        console.log(
            "Nenhum chaveamento encontrado."
        );

        return;
    }


    const dados = chaveamento[0];

    if (
    dados.semifinal1_vencedor === null &&
    dados.semifinal2_vencedor === null &&
    dados.final_vencedor === null &&
    dados.terceiro_vencedor === null
) {
    return;
}


    // =========================
    // BUSCAR IDs DAS EQUIPES
    // =========================

    const idsEquipes = [

        dados.semifinal1_equipe1,
        dados.semifinal1_equipe2,

        dados.semifinal2_equipe1,
        dados.semifinal2_equipe2,

        dados.semifinal1_vencedor,
        dados.semifinal2_vencedor,

        dados.semifinal1_perdedor,
        dados.semifinal2_perdedor,

        dados.final_vencedor,
        dados.terceiro_vencedor

    ].filter(id =>
        id !== null &&
        id !== undefined
    );


    const idsUnicos = [
        ...new Set(idsEquipes)
    ];


    let nomesEquipes = {};


    if (idsUnicos.length > 0) {

        const {
            data: equipes,
            error: erroEquipes
        } = await supabaseClient
            .from("equipes")
            .select("id, nome")
            .in(
                "id",
                idsUnicos
            );


        if (erroEquipes) {

            console.error(
                "Erro ao buscar nomes das equipes:",
                erroEquipes
            );

            return;
        }


        equipes.forEach(equipe => {

            nomesEquipes[equipe.id] =
                equipe.nome;

        });

    }


    function nomeEquipe(id) {

        if (
            id === null ||
            id === undefined
        ) {

            return "Aguardando";

        }

        return nomesEquipes[id] || "Aguardando";

    }


    // =========================
    // FUNÇÃO PARA ATUALIZAR EQUIPE
    // =========================

    function atualizarEquipe(
        elemento,
        idEquipe,
        idVencedor
    ) {

        if (!elemento) {
            return;
        }


        // Remove estados anteriores
        elemento.classList.remove(
            "vencedor",
            "derrotado"
        );


        elemento.textContent =
            nomeEquipe(idEquipe);


        if (
            idEquipe !== null &&
            idEquipe !== undefined &&
            idVencedor !== null &&
            idVencedor !== undefined
        ) {

            if (idEquipe === idVencedor) {

                elemento.classList.add(
                    "vencedor"
                );

            } else {

                elemento.classList.add(
                    "derrotado"
                );

            }

        }

    }


    // =========================
    // SEMIFINAL 1
    // =========================

    atualizarEquipe(

        document.getElementById(
            "semifinal1-equipe1"
        ),

        dados.semifinal1_equipe1,

        dados.semifinal1_vencedor

    );


    atualizarEquipe(

        document.getElementById(
            "semifinal1-equipe2"
        ),

        dados.semifinal1_equipe2,

        dados.semifinal1_vencedor

    );


    // =========================
    // SEMIFINAL 2
    // =========================

    atualizarEquipe(

        document.getElementById(
            "semifinal2-equipe1"
        ),

        dados.semifinal2_equipe1,

        dados.semifinal2_vencedor

    );


    atualizarEquipe(

        document.getElementById(
            "semifinal2-equipe2"
        ),

        dados.semifinal2_equipe2,

        dados.semifinal2_vencedor

    );


    // =========================
    // 3º LUGAR
    // =========================

    atualizarEquipe(

        document.getElementById(
            "terceiro-equipe1"
        ),

        dados.semifinal1_perdedor,

        dados.terceiro_vencedor

    );

    // =========================
// PÓDIO
// =========================

document.getElementById(
    "podio-primeiro"
).textContent =
    nomeEquipe(
        dados.final_vencedor
    );

document.getElementById(
    "podio-terceiro"
).textContent =
    nomeEquipe(
        dados.terceiro_vencedor
    );


// O vice-campeão é o perdedor da final
let segundoLugar = null;

if (
    dados.final_vencedor === dados.semifinal1_vencedor
) {

    segundoLugar =
        dados.semifinal2_vencedor;

} else if (
    dados.final_vencedor === dados.semifinal2_vencedor
) {

    segundoLugar =
        dados.semifinal1_vencedor;

}

document.getElementById(
    "podio-segundo"
).textContent =
    nomeEquipe(
        segundoLugar
    );


    atualizarEquipe(

        document.getElementById(
            "terceiro-equipe2"
        ),

        dados.semifinal2_perdedor,

        dados.terceiro_vencedor

    );


    // =========================
    // FINAL
    // =========================

    const finalEquipe1 =
        dados.semifinal1_vencedor;

    const finalEquipe2 =
        dados.semifinal2_vencedor;


    atualizarEquipe(

        document.getElementById(
            "final-equipe1"
        ),

        finalEquipe1,

        dados.final_vencedor

    );


    atualizarEquipe(

        document.getElementById(
            "final-equipe2"
        ),

        finalEquipe2,

        dados.final_vencedor

    );

    console.log(
        "Chaveamento:",
        dados
    );

}



// =========================
// INICIALIZAÇÃO
// =========================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        secoes.forEach(secao => {
            secao.style.display = "none";
        });


        const cronograma =
            document.getElementById(
                "cronograma"
            );


        if (cronograma) {
            cronograma.style.display = "block";
        }


        linksNavegacao.forEach(link => {
            link.classList.remove("ativa");
        });


        const linkCronograma =
            document.querySelector(
                'nav a[data-secao="cronograma"]'
            );


        if (linkCronograma) {
            linkCronograma.classList.add("ativa");
        }


        atualizarRanking();

        carregarRankingBalao();

        carregarRankingLinha();

        carregarChaveamento();

    }
);


// =========================
// ATUALIZAÇÃO AUTOMÁTICA
// =========================

setInterval(() => {

    carregarRankingBalao();

    carregarRankingLinha();

    carregarChaveamento();

}, 5000);
