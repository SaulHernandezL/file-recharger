"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//Funcion Renderizamos ventana del plugin
figma.showUI(__html__, {
    width: 500,
    height: 350, //* Alto de la ventana
});
//* Mostrar la UI
//main Variables de la selección
let selArray = []; //* Array de la selección dada por el usuario
let frameUno; //* Primer frame seleccionado
let frameDos; //* Segundo frame seleccionado
//main Variables del conector
let x1, x2, y1, y2; //* Coordenadas A y B del conector
let x1P, x2P, y1P, y2P; //* Coordenadas A y B del "guardacables"
let xC, yC; //* Coordenadas del centro del conector
let xC1, yC1; //* Coordenadas del centro del primer doblez
let xC2, yC2; //* Coordenadas del centro del segundo doblez
let sector = []; //* Array que guarda el sector en el que se encuentra el frame dos
//main Variables de las opciones
let colorG = {
    type: "SOLID",
    color: { r: 1, g: 0, b: 0.5 },
}; //* Color del conector y del hipervínculo
let sobre = true; //* Opción de sobreescritura
let hiper = true; //* Opción de hipervínculo
let conect = true; //* Opción de conector
const referencers = [
    "c7bce078c52e884ca4f3d3aa38b8d669987529d8",
    "82d915d54aab466e830306ea16bda503cdc87bfc",
]; //* Array de los id de los componentes de hipervínculos
//main Recibimos el mensaje de la UI
figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    colorG = {
        type: "SOLID",
        color: {
            r: msg.opcion0[0] / 255,
            g: msg.opcion0[1] / 255,
            b: msg.opcion0[2] / 255, //* Convertimos los valores de 0 a 255 a 0 a 1
        },
    }; //* Color del conector y del hipervínculo
    sobre = msg.opcion1; //* Opción de sobreescritura
    hiper = msg.opcion2; //* Opción de hipervínculo
    conect = msg.opcion3; //* Opción de conector
});
//main Evento de selección
figma.on("selectionchange", () => __awaiter(void 0, void 0, void 0, function* () {
    let selection = figma.currentPage.selection; //* Array de la selección dada por el usuario
    //* Comprobamos la selección
    switch (selection.length) {
        case 0: //* Si no hay selección
            selArray = []; //* Vaciamos el array de selección
            break;
        case 1: //* Si hay una selección
            frameUno = selection[0]; //* Guardamos la selección en el frameUno
            selArray[0] = frameUno; //* Guardamos la selección en el array de selección
            break;
        case 2: //* Si hay dos selecciones
            let pos = selArray.indexOf(selection[0]); //* Guardamos la posición de la selección en el array de selección
            //* Evaluamos si la posición de nodos es diferente a la posición de la selección
            pos == 0 ? (frameDos = selection[1]) : (frameDos = selection[0]);
            selArray.length == 1 ? selArray.push(frameDos) : (selArray = []); //* Guardamos la selección en el array de selección
            break;
        default: //* Si hay más de dos selecciones
            //console.log("más de 2 seleccionados");
            selArray = []; //* Vaciamos el array de selección
            break;
    }
    //* Comprobamos si hay dos elementos en el array de selección
    if (selArray.length == 2) {
        //* Comprobamos si los elementos son frames
        if (selArray[0].type == "FRAME" && selArray[1].type == "FRAME") {
            //* Comprobamos si la opción de sobreescritura está activada
            if (sobre) {
                //* Eliminamos todos los elementos del frame dos
                for (let i = frameDos.children.length - 1; i >= 0; i--) {
                    frameDos.children[i].remove(); //* Eliminamos el elemento
                }
                //Funcion crear y setear imagen
                (() => __awaiter(void 0, void 0, void 0, function* () {
                    //* Creamos la imagen
                    const bytes = yield selArray[0].exportAsync({
                        format: "PNG",
                        constraint: { type: "SCALE", value: 1 }, //* Escala de la imagen
                    });
                    yield selArray[1].resize(selArray[0].width, selArray[0].height); //* Redimensionamos el frame dos
                    const image = figma.createImage(bytes); //* Creamos la imagen
                    //* Pintamos el frame dos con la imagen
                    selArray[1].fills = [
                        {
                            imageHash: image.hash,
                            scaleMode: "FILL",
                            scalingFactor: 1,
                            type: "IMAGE", //* Tipo de relleno
                        },
                    ];
                }))();
            }
            //* Comprobamos si la opción de hipervínculo está activada
            if (hiper) {
                //Funcion para importar componente de hipervínculo
                //param index: indice del array de referencers
                yield importNode(0);
                yield importNode(1);
            }
            //* Comprobamos si la opción de conector está activada
            if (conect) {
                //Funcion para dibujar conector
                yield conectar();
            }
            figma.selection = []; //* Vaciamos la selección
            figma.notify("🎉 Conector creado 🎉"); //* Notificamos al usuario que se ha creado el conector
        }
        else {
            figma.notify("Selecciona dos frames"); //* Notificamos al usuario que seleccione dos frames
            return;
        }
    }
    //Funcion para dibujar conector
    function conectar() {
        //* Guardamos los frames en variables
        frameUno = selArray[0]; //* Primer frame seleccionado
        frameDos = selArray[1]; //* Segundo frame seleccionado
        //* Comprobamos la posición de los frames en el eje X
        if (frameUno.x + frameUno.width + 100 < frameDos.x) {
            sector[0] = 2; //* El frame dos se encuentra a la derecha del frame uno
        }
        else if (frameUno.x - 100 > frameDos.x + frameDos.width) {
            sector[0] = 0; //* El frame dos se encuentra a la izquierda del frame uno
        }
        else {
            sector[0] = 1; //* El frame dos se encuentra sobre el frame uno en X
        }
        //* Comprobamos la posición de los frames en el eje Y
        if (frameUno.y + frameUno.height + 100 < frameDos.y) {
            sector[1] = 2; //* El frame dos se encuentra debajo del frame uno
        }
        else if (frameUno.y - 100 > frameDos.y + frameDos.height) {
            sector[1] = 0; //* El frame dos se encuentra arriba del frame uno
        }
        else {
            sector[1] = 1; //* El frame dos se encuentra sobre el frame uno en Y
        }
        //* Seteamos las coordenadas A y B del conector así como del "guardacables"
        if (sector[1] == 0) {
            x1 = frameUno.x + frameUno.width / 2;
            x1P = frameUno.x + frameUno.width / 2;
            y1 = frameUno.y;
            y1P = frameUno.y - 50;
            switch (sector[0]) {
                case 0:
                    x2 = frameDos.x + frameDos.width;
                    x2P = frameDos.x + frameDos.width + 50;
                    y2 = frameDos.y + frameDos.height / 2;
                    y2P = frameDos.y + frameDos.height / 2;
                    break;
                case 1:
                    x2 = frameDos.x + frameDos.width / 2;
                    x2P = frameDos.x + frameDos.width / 2;
                    y2 = frameDos.y + frameDos.height;
                    y2P = frameDos.y + frameDos.height + 50;
                    break;
                case 2:
                    x2 = frameDos.x;
                    x2P = frameDos.x - 50;
                    y2 = frameDos.y + frameDos.height / 2;
                    y2P = frameDos.y + frameDos.height / 2;
                    break;
            }
        }
        else if (sector[1] == 1 && sector[0] == 0) {
            x1 = frameUno.x;
            x1P = frameUno.x - 50;
            y1 = frameUno.y + frameUno.height / 2;
            y1P = frameUno.y + frameUno.height / 2;
            x2 = frameDos.x + frameDos.width;
            x2P = frameDos.x + frameDos.width + 50;
            y2 = frameDos.y + frameDos.height / 2;
            y2P = frameDos.y + frameDos.height / 2;
        }
        else if (sector[1] == 1 && sector[0] == 1) {
            x1 = frameUno.x + frameUno.width / 2;
            x1P = frameUno.x + frameUno.width / 2;
            y1 = frameUno.y;
            y1P = frameUno.y - 50;
            x2 = frameDos.x + frameDos.width / 2;
            x2P = frameDos.x + frameDos.width / 2;
            y2 = frameDos.y;
            y2P = frameDos.y - 50;
        }
        else if (sector[1] == 1 && sector[0] == 2) {
            x1 = frameUno.x + frameUno.width;
            x1P = frameUno.x + frameUno.width + 50;
            y1 = frameUno.y + frameUno.height / 2;
            y1P = frameUno.y + frameUno.height / 2;
            x2 = frameDos.x;
            x2P = frameDos.x - 50;
            y2 = frameDos.y + frameDos.height / 2;
            y2P = frameDos.y + frameDos.height / 2;
        }
        else if (sector[1] == 2) {
            x1 = frameUno.x + frameUno.width / 2;
            x1P = frameUno.x + frameUno.width / 2;
            y1 = frameUno.y + frameUno.height;
            y1P = frameUno.y + frameUno.height + 50;
            switch (sector[0]) {
                case 0:
                    x2 = frameDos.x + frameDos.width;
                    x2P = frameDos.x + frameDos.width + 50;
                    y2 = frameDos.y + frameDos.height / 2;
                    y2P = frameDos.y + frameDos.height / 2;
                    break;
                case 1:
                    x2 = frameDos.x + frameDos.width / 2;
                    x2P = frameDos.x + frameDos.width / 2;
                    y2 = frameDos.y;
                    y2P = frameDos.y - 50;
                    break;
                case 2:
                    x2 = frameDos.x;
                    x2P = frameDos.x - 50;
                    y2 = frameDos.y + frameDos.height / 2;
                    y2P = frameDos.y + frameDos.height / 2;
                    break;
            }
        }
        xC = (x1P + x2P) / 2; //* Coordenada X del centro
        yC = (y1P + y2P) / 2; //* Coordenada Y del centro
        //* Seteamos las coordenadas del centro de los dobleces
        if (sector[1] == 0 || sector[1] == 2) {
            xC1 = x1P;
            yC1 = yC;
            xC2 = x2P;
            yC2 = yC;
        }
        else if (sector[1] == 1 && sector[0] == 1) {
            xC1 = x1P;
            yC1 = yC;
            xC2 = x2P;
            yC2 = yC;
        }
        else {
            xC1 = xC;
            yC1 = y1P;
            xC2 = xC;
            yC2 = y2P;
        }
        const line = figma.createVector(); //* Creamos el conector
        //* Lineas y nodos del conector
        line.vectorPaths = [
            {
                windingRule: "EVENODD",
                data: "M " +
                    x1 +
                    " " +
                    y1 +
                    " L " +
                    x1P +
                    " " +
                    y1P +
                    " L " +
                    xC1 +
                    " " +
                    yC1 +
                    " L " +
                    xC2 +
                    " " +
                    yC2 +
                    " L " +
                    x2P +
                    " " +
                    y2P +
                    " L " +
                    x2 +
                    " " +
                    y2,
            },
        ];
        line.strokeWeight = 5; //* Grosor del borde
        line.strokeAlign = "CENTER"; //* Posicion del borde
        line.strokeCap = "ARROW_LINES"; //* Terminación de la linea
        line.strokes = [colorG]; //* Color del border
        line.strokeJoin = "ROUND"; //* Tipo de union de las lineas
        line.cornerRadius = 50; //* Radio de las esquinas
        line.cornerSmoothing = 0; //* Suavizado de las esquinas
        line.name = frameUno.name + " <-> " + frameDos.name; //* Nombre del conector
    }
    //Funcion importar componente
    //param index: indice del array de referencers
    function importNode(index) {
        return __awaiter(this, void 0, void 0, function* () {
            //* Importamos el componente
            //Param key: id del componente
            let importComponent = yield figma.importComponentByKeyAsync(referencers[index]);
            let instance = importComponent.createInstance(); //* Creamos una instancia del componente
            let thisPage = figma.currentPage; //* Seleccionamos la página actual
            thisPage.appendChild(instance); //* Añadimos la instancia a la página
            let frameName; //* Nombre del frame
            let link; //* Hipervínculo
            index == 0 ? (link = selArray[1].id) : (link = selArray[0].id); //* Obtenemos el id del frame que no es el frame actual
            instance.children[0].hyperlink = { type: "NODE", value: link }; //* Seteamos el hipervínculo
            //* Seteamos la posición del hiperlink
            if (index == 0) { //* Si el frame actual es el frame uno
                instance.x = selArray[index].x + selArray[index].width - 400;
                instance.y = selArray[index].y - 150;
            }
            else { //* Si el frame actual es el frame dos
                instance.x = selArray[index].x;
                instance.y = selArray[index].y - 150;
            }
            //* Seteamos el nombre a escribir en el hipervinculo
            index == 0
                ? (frameName = selArray[1].name)
                : (frameName = selArray[0].name);
            //* Escribimos el nombre dentro del link
            instance.setProperties({
                "FrameName#1695:0": frameName,
            });
            instance.fills = [colorG]; //* Seteamos el color del hipervínculo
        });
    }
}));
