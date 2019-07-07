const pup = require('puppeteer');
const math = require('mathjs');
var browser;
const config = {
    refrescolive: 10000,
    refresconormal: 240000,
    maximolive: 1000,
    maximonormal: 20
};

var pages = new Array({
    titulo: 'live-baloncesto',
    enlace: 'https://livebetting.bwin.es/es/live#/overview/sport/7?sortBy=Time',
    page: new Object()

}, {
    titulo: 'baloncesto',
    enlace: 'https://sports.bwin.es/es/sports/7/apuestas/baloncesto#sportId=7',
    page: new Object()

});



const init = async () => {

    let ipage;

    browser = await pup.launch();

    for (ipage = 0; ipage < pages.length; ipage++) {
        pages[ipage].page = await browser.newPage();
        await pages[ipage].page.goto(pages[ipage].enlace);

    }

}


const intervalNormal = () => {
    let ipage = 0;
    for (ipage; ipage < pages.length; ipage++) {
        if (pages[ipage].titulo.indexOf('live') == -1) {
            evaluateNormal(ipage);
        }
    }
}

const evaluateLive = async ipage => {
    var partidos = await pages[ipage].page.evaluate(() => {
        //document.querySelectorAll('.events-table-time .event-row');event-name-wrapper 
        var lista_partidos = document.querySelectorAll('.events-table-time .event-row');
        var ilista_partidos;
        var alista_partidos = new Array();
        var objlista_partidos;

        for (ilista_partidos = 0; ilista_partidos < lista_partidos.length; ilista_partidos++) {
            objlista_partidos = new Object();
            objlista_partidos.id = lista_partidos[ilista_partidos].querySelectorAll('.event-name-wrapper .event-name')[0].getAttribute('href').split('/')[1];
            objlista_partidos.nomeLocal = lista_partidos[ilista_partidos].querySelectorAll('.event-name-wrapper .player-name')[0].textContent;

            objlista_partidos.nomeVisitante = lista_partidos[ilista_partidos].querySelectorAll('.event-name-wrapper .player-name')[1].textContent;


            let cuotas = lista_partidos[ilista_partidos].querySelectorAll('.market-column')[0].querySelectorAll('table td .option-button-odds');
            if (cuotas.length > 0) {
                objlista_partidos.cuotaLocal = parseFloat(cuotas[0].textContent);
                objlista_partidos.cuotaVisitante = parseFloat(cuotas[1].textContent);
                alista_partidos.push(objlista_partidos);
            }

        }
        return alista_partidos;
    });
    console.log(partidos);
}

const evaluateNormal = async (ipage) => {

    var partidos = await pages[ipage].page.evaluate(() => {

        let lista_partidos = document.querySelectorAll('#markets-container #markets .ui-widget-content .marketboard-event-group__item--sub-group .marketboard-event-group__item--event .marketboard-event-with-header__markets-list');
        let ilista_partidos;
        var alista_partidos = new Array();
        var objlista_partidos;

        for (ilista_partidos = 0; ilista_partidos < lista_partidos.length; ilista_partidos++) {
            objlista_partidos = new Object();

            let datos_partido = lista_partidos[ilista_partidos].querySelectorAll('td button div');
            if (datos_partido.length > 0) {
                objlista_partidos.id = lista_partidos[ilista_partidos].querySelectorAll('td')[0].getAttribute('data-option').split('/')[3];
                objlista_partidos.nomeLocal = datos_partido[0].textContent;
                objlista_partidos.cuotaLocal = parseFloat(datos_partido[1].textContent);
                objlista_partidos.nomeVisitante = datos_partido[2].textContent;
                objlista_partidos.cuotaVisitante = parseFloat(datos_partido[3].textContent);
                alista_partidos.push(objlista_partidos);
            }
        }
        return alista_partidos;
    });

    console.log(partidos);
}

const evaluateTodasNomal = async () => {
    let ipage = 0;
    for (ipage; ipage < pages.length; ipage++) {
        if (pages[ipage].titulo.indexOf('live') == -1) {
            await evaluateNormal(ipage);
        }
    }
}

const evaluateTodasLive = async () => {
    let ipage = 0;
    for (ipage; ipage < pages.length; ipage++) {
        if (pages[ipage].titulo.indexOf('live') != -1) {
            await evaluateLive(ipage);
        }
    }
}

const LiveClose = async () => {
    let ipage = 0;
    for (ipage; i < pages.length; ipage++) {

        if (pages[ipage].titulo.indexOf('live') != -1) {
            await pages[ipage].page.close();
        }
    }
}

const NormalClose = async () => {
    let ipage = 0;
    for (ipage; i < pages.length; ipage++) {

        if (pages[ipage].titulo.indexOf('live') == -1) {
            await pages[ipage].page.close();
        }
    }
}



const LiveInit = async () => {
    let ipage = 0;
    for (ipage; ipage < pages.length; ipage++) {
        if (pages[ipage].titulo.indexOf('live') != -1) {
            pages[ipage].page = await browser.newPage();
            await pages[ipage].page.goto(pages[ipage].enlace);

        }
    }
}

const NormalInit = async () => {
    let ipage = 0;
    for (ipage; ipage < pages.length; ipage++) {
        if (pages[ipage].titulo.indexOf('live') == -1) {
            pages[ipage].page = await browser.newPage();
            await pages[ipage].page.goto(pages[ipage].enlace);

        }
    }
}

const close = async () => {

    await browser.close();
    browser = null;

}


(async () => {

    var contador_live = 0;
    var contador_normal = 0;

    console.log("Esperando lecturas de la web..");
    await init();


    let inteval_live = setInterval(async () => {
        if (config.maximolive == contador_live) {
            contador_live = 0;
            await LiveClose();
            await LiveInit();
        }

        await evaluateTodasLive();
        contador_live++;
    }, config.refrescolive);

    let interval_normal = setInterval(async () => {
        if (config.maximonormal == contador_normal) {
            contador_normal = 0;
            await NormalClose();
            await NormalInit();
        }
        await evaluateTodasNomal();
        contador_normal++;
    }, config.refresconormal);

})();