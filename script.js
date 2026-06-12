
const canv = document.querySelector(".canv");
let ctx = canv.getContext("2d");
const dpr = 2;
const rect = canv.getBoundingClientRect();
canv.width = rect.width * dpr;
canv.height = rect.height * dpr;
ctx.scale(dpr, dpr);
ctx.font = "40px Old Standard TT";
ctx.fillStyle = "black";
let row = 0;
let column = 1;
let rowdist = 150;
let rowoffset = -100;
let columnoffset = -100;
let columndist = 150;

function drawNeuron(posx,posy,text,activated,neuron){
    ctx.beginPath();
    ctx.strokeStyle = "grey";
    ctx.arc(posx, posy, 40, 0, Math.PI * 2, true);
    ctx.fillStyle = "#FAF9F6";
    if (activated){
        ctx.fillStyle = "#ffdd00";
    }
    ctx.lineWidth = 4;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "black";
    ctx.fillText(text,posx-14,posy+10);
}

let neurons = [];


function newNeuron(posx, posy, name){
    let neuron = {};
    neuron.name = name;
    neuron.posx = posx;
    neuron.posy = posy;
    neuron.activated = 0;
    neuron.triggered = false;
    neuron.connections = {};
    neuron.startTime = 0;
    neuron.threshold = 5;
    neurons.push(neuron);
}

function update(){
    for (let neuron of neurons){
        if (neuron.activated > 0){
            if (neuron.activated > 195){
                for (let connection in neuron.connections){
                    if (Math.random() * neuron.connections[connection] < neuron.threshold){
                        continue;
                    }
                    for (let selected of neurons){
                        if (selected.name == connection && selected.activated == 0){
                            selected.activated = Math.floor(Math.random() * neuron.connections[connection]) * 30;
                            selected.triggered = true;
                            neuron.connections[connection] -= 0.01;
                        }
                    }
                }
            }
            
            if(!neuron.triggered) {
                for (let possibleConnections of neurons){
                    if (possibleConnections.activated > 0 && !possibleConnections.triggered && possibleConnections != neuron && possibleConnections.startTime > neuron.startTime){
                        if (possibleConnections.name in neuron.connections){
                            neuron.connections[possibleConnections.name] += 0.01;
                        } else {
                            neuron.connections[possibleConnections.name] = 0;
                        }
                    }
                }
            }
            neuron.activated -= 1;
        } else if (neuron.triggered){
            neuron.triggered = false;
        }
    }
    render();
    console.log(neurons);
}

function render(){
    ctx.clearRect(0, 0, canv.width, canv.height);
    for (let neuron of neurons){
        for (let connection in neuron.connections){
            for (let possible of neurons){
                if (possible.name == connection){
                    if (neuron.activated > 100 && possible.activated > 100 && neuron.triggered){
                        ctx.strokeStyle = "yellow";
                    } else {
                        ctx.strokeStyle = "grey";
                    }
                    ctx.beginPath();
                    ctx.moveTo(neuron.posx,neuron.posy);
                    ctx.lineTo(possible.posx, possible.posy);
                    ctx.stroke();
                    ctx.strokeStyle = "grey";
                    break;
                }
            }
        }
    }
    
    for (let neuron of neurons){
        drawNeuron(neuron.posx,neuron.posy,neuron.name,neuron.activated > 100,neuron);
    }
}


document.addEventListener("keydown", logKey);
function logKey(e) {
    for (let neuron of neurons){
        if (neuron.name == e.key.toUpperCase()){
            neuron.activated = 200;
            neuron.triggered = false;
            neuron.startTime = Date.now();
            return;
        }
    }
    if (row < 8){
        row++;
    } else {
        column++;
        row = 1;
    }
    newNeuron(row * rowdist + rowoffset, column * columndist + columnoffset, e.key.toUpperCase());
}

setInterval(update,0,1);
