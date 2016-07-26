//Objetos importantes de canvas
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');

//Crear el objeto del bueno
var bueno = {
    x: 100,
    y: canvas.height - 65,
    width: 50,
    height: 50,
    contador: 0
}

var juego = {
    estado: 'iniciando'
};

var textoRespuesta = {
    contador: -1,
    titulo: '',
    subtitulo: ''
}

var teclado = {};

//Array para los disparos
var disparos = [];
var disparosEnemigos = [];
//Array que almacena los enemigos
var enemigos = [];
//Definir variables para las imágenes
var fondo,imgBueno,imgDisparo,imgDisparoEnemigo,imgEnemigo;
var imagenes = ['images/background.jpg','images/bueno.png','images/disparo.png','images/disparoEnemigo.png','images/enemigo.png'];

//Definicion de funciones
function loadMedia(){
    fondo = new Image();
    fondo.src = 'images/background.jpg';
    imgBueno = new Image();
    imgBueno.src = 'images/bueno.png';
    imgDisparo = new Image();
    imgDisparo.src = 'images/disparo.png';
    imgDisparoEnemigo = new Image();
    imgDisparoEnemigo.src = 'images/disparoEnemigo.png';
    imgEnemigo = new Image();
    imgEnemigo.src = 'images/enemigo.png';
    fondo.onload = function(){
        var intervalo = window.setInterval(frameLoop,1000/55);
    }
}

function dibujarEnemigos(){
    for(var i in enemigos){
        var enemigo = enemigos[i];
        ctx.save();
        if(enemigo.estado == 'vivo') ctx.fillStyle = 'red';
        if(enemigo.estado == 'muerto') ctx.fillStyle = 'black';
        ctx.drawImage(imgEnemigo,enemigo.x, enemigo.y, enemigo.width, enemigo.height);
    }
}

function dibujarFondo(){
    ctx.drawImage(fondo,0,0,910,580);
}

function dibujarBueno(){
    ctx.save();
    ctx.drawImage(imgBueno,bueno.x,bueno.y,bueno.width,bueno.height);
    ctx.restore();
}

function agregarEventosTeclado(){
    agregarEvento(document,"keydown",function(e){
        //Ponemos en true la tecla presionada
        teclado[e.keyCode] = true;
    });
    agregarEvento(document,"keyup",function(e){
        //Ponemos en falso la tecla que dejo de ser presionada
        teclado[e.keyCode] = false;
    });
    
    function agregarEvento(elemento,nombreEvento,funcion){
        if(elemento.addEventListener){
            //Navegadores de verdad
            elemento.addEventListener(nombreEvento,funcion,false);
        }
        else if(elemento.attachEvent){
            //Internet Explorer
            elemento.attachEvent(nombreEvento,funcion);
        }
    }
}

function moverBueno(){
    if(teclado[37]){
        //Movimiento a la izquiera
        bueno.x -= 8;
        if(bueno.x < 0) bueno.x = 0; 
    }
    if(teclado[39]){
        //Movimiento a la derecha
        var limite = canvas.width - bueno.width;
        bueno.x += 8;
        if(bueno.x > limite) bueno.x = limite; 
    }
    if(teclado[32]){
        //Disparos
        if(!teclado.fire){
            fire();
            teclado.fire = true;
        }
    }
    else teclado.fire = false;
    if(bueno.estado == 'hit'){
        bueno.contador++;
        if(bueno.contador >= 20){
            bueno.contador = 0;
            bueno.estado = 'muerto'
            juego.estado = 'perdido'
            textoRespuesta.titulo = 'Game Over';
            textoRespuesta.subtitulo = 'Presiona la tecla R para continuar';
            textoRespuesta.contador = 0;
        }
    }
}

function dibujarDisparosEnemigos(){
    for(var i in disparosEnemigos){
        var disparo = disparosEnemigos[i];
        ctx.save();
        ctx.drawImage(imgDisparoEnemigo,disparo.x, disparo.y, disparo.width, disparo.height);
        ctx.restore();
    }
}

function moverDisparosEnemigos(){
    for(var i in disparosEnemigos){
        var disparo = disparosEnemigos[i];
        disparo.y += 3;
    }
    disparosEnemigos = disparosEnemigos.filter(function(disparo){
        return disparo.y < canvas.height; 
    });
}

function actualizaEnemigos(){
    function agregarDisparosEnemigos(enemigo){
        return {
            x: enemigo.x,
            y: enemigo.y,
            width: 10,
            height: 33,
            contador: 0
        }
    }
    if(juego.estado == 'iniciando'){
        for(var i = 0; i < 10; i++){
            enemigos.push({
                x: -30 + (i*70),
                y: 10,
                height: 50,
                width: 50,
                estado: 'vivo',
                contador: 0
            });
        }
        juego.estado = 'jugando';
    }
    for(var i in enemigos){
        var enemigo = enemigos[i];
        if(!enemigo) continue;
        if(enemigo && enemigo.estado == 'vivo'){
            enemigo.contador++;
            enemigo.x += Math.sin(enemigo.contador * Math.PI / 90) * 5;
            
            if(aleatorio(0,enemigos.length * 10) == 4){
                disparosEnemigos.push(agregarDisparosEnemigos(enemigo));
            }
        }
        if(enemigo && enemigo.estado == 'hit'){
            enemigo.contador++;
            if(enemigo.contador >= 16){
                enemigo.estado = 'muerto';
                enemigo.contador = 0;
            }
        }
    }
    enemigos = enemigos.filter(function(enemigo){
        if(enemigo && enemigo.estado != 'muerto') return true;
        return false;
    });
}

function moverDisparos(){
    for(var i in disparos){
        var disparo = disparos[i];
        disparo.y -= 4;
    }
    disparos = disparos.filter(function(disparo){
        return disparo.y > 0;
    });
}

function fire(){
    disparos.push({
       x: bueno.x + 20,
       y: bueno.y - 10,
       width: 10,    
       height: 30    
    });
}

function dibujarDisparos(){
    ctx.save();
    ctx.fillStyle = 'white';
    for(var i in disparos){
        var disparo = disparos[i];
        ctx.drawImage(imgDisparo,disparo.x, disparo.y, disparo.width, disparo.height);
    }
    ctx.restore();
}

function dibujaTexto(){
    if(textoRespuesta.contador == -1) return;
    var alpha = textoRespuesta.contador/50.0;
    if(alpha>1){
        for(var i in enemigos){
            delete enemigos[i];
        }
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    if(juego.estado == 'perdido'){
        ctx.fillStyle = 'white';
        ctx.font = 'Bold 40pt Arial';
        ctx.fillText(textoRespuesta.titulo,140,200);
        ctx.font = '14pt Arial';
        ctx.fillText(textoRespuesta.subtitulo,190,250);
    }
    if(juego.estado == 'victoria'){
        ctx.fillStyle = 'white';
        ctx.font = 'Bold 40pt Arial';
        ctx.fillText(textoRespuesta.titulo,140,200);
        ctx.font = '14pt Arial';
        ctx.fillText(textoRespuesta.subtitulo,190,250);
    }
}

function actualizarEstadoJuego(){
    if(juego.estado == 'jugando' && enemigos.length == 0){
        juego.estado = 'victoria';
        textoRespuesta.titulo = 'Derrotaste a los enemigos';
        textoRespuesta.subtitulo = 'Presiona la tecla R para reiniciar';
        textoRespuesta.contador = 0;
    }
    if(textoRespuesta.contador >= 0){
        textoRespuesta.contador++;
    }
    if((juego.estado == 'perdido' || juego.estado == 'victoria') && teclado[82]){
        juego.estado = 'iniciando';
        bueno.estado = 'vivo';
        textoRespuesta.contador = -1
    }
}

function hit(a,b){
    var hit = false;
    if(b.x + b.width >= a.x && b.x < a.x + a.width){
        if(b.y + b.height >= a.y && b.y < a.y + a.height){
            hit = true;
        }
    }
    if(b.x <= a.x && b.x + b.width >= a.x + a.width){
        if(b.y <= a.y && b.y + b.height >= a.y + a.height){
            hit = true;
        }
    }
    if(a.x <= b.x && a.x + a.width >= b.x + b.width){
        if(a.y <= b.y && a.y + a.height >= b.y + b.height){
            hit = true;
        }
    }    
    return hit;
}

function verificarContacto(){
    for(var i in disparos){
        var disparo = disparos[i];
        for(j in enemigos){
            var enemigo = enemigos[j];
            if(hit(disparo,enemigo)){
                enemigo.estado = 'hit';
                enemigo.contador = 0;
            }
        }
    }
    if(bueno.estado == 'hit' || bueno.estado == 'muerto') return;
    for(var i in disparosEnemigos){
        var disparo = disparosEnemigos[i];
        if(hit(disparo,bueno)){
            bueno.estado = 'hit';
        }
    }
}

function aleatorio(inferior,superior){
    var posibilidades = superior - inferior;
    var a = Math.random() * posibilidades;
    a = Math.floor(a);
    return parseInt(inferior) + a;
}

function frameLoop(){
    actualizarEstadoJuego();
    moverBueno();
    moverDisparos();
    moverDisparosEnemigos();
    dibujarFondo();
    verificarContacto();
    actualizaEnemigos();
    dibujarEnemigos();
    dibujarDisparosEnemigos();
    dibujarDisparos();
    dibujaTexto();
    dibujarBueno();
}

//Ejecucion de funciones

window.addEventListener('load', init);
function init(){
    agregarEventosTeclado();
    loadMedia();
}
