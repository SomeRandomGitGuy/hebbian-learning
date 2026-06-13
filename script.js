
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
        ctx.fillStyle = "#ffd60a";
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
    neuron.triggeredBy = "";
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
                            selected.activated = 200;//*Math.floor(Math.random() * neuron.connections[connection]) * 30;
                            selected.triggered = true;
                            selected.triggeredBy = neuron.name;
                            neuron.connections[connection] -= 0.1;
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
            neuron.triggeredBy = "";
        }
    }
    render();
    document.getElementById("data").textContent = "";
    for (let neuron of neurons){
        if(Math.random() * 20 < 1) {
            for (let connection in neuron.connections){
                if (neuron.connections[connection] > 0){
                    neuron.connections[connection] -= 0.001;
                    neuron.connections[connection] = rT3(neuron.connections[connection]);
                }
            }
        }
        document.getElementById("data").textContent += `${JSON.stringify(neuron)}\n`;
    }
    

}

function render(){
    ctx.clearRect(0, 0, canv.width, canv.height);
    for (let neuron of neurons){
        for (let connection in neuron.connections){
            for (let possible of neurons){
                if (possible.name == connection){
                    if (neuron.activated > 0 && possible.activated > 0 && possible.triggered && possible.triggeredBy == neuron.name){
                        ctx.strokeStyle = "#ffd60a";
                    } else if (neuron.activated > 0 && possible.activated > 0 && !neuron.triggered && !possible.triggered){
                        ctx.strokeStyle = "#21ad15";
                    }
                    ctx.lineWidth = neuron.connections[connection];
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
    ctx.lineWidth = 4;
    
    for (let neuron of neurons){
        drawNeuron(neuron.posx,neuron.posy,neuron.name,neuron.activated > 0,neuron);
    }
}

function rT3(number){
    return Math.round(parseFloat(number)*1000)/1000;
}


document.addEventListener("keydown", logKey);
function logKey(e) {
    if (e.key.length > 1){
        return;
    }
    for (let neuron of neurons){
        if (neuron.name == e.key.toUpperCase() && (neuron.activated == 0 || neuron.triggered)){
            neuron.activated = 200;
            neuron.triggered = false;
            neuron.startTime = Date.now();
            return;
        } else if (neuron.name == e.key.toUpperCase() && neuron.activated > 0){
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

setInterval(update,1);
