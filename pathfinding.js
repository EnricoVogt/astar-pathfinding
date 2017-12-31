/**
 * Autor: Enrico Vogt
 */


export class Queue {

    constructor() {
        this.queue = [];
    }

    push(node, p) {
        for (var i = 0; i < this.queue.length && this.queue[i].f <= p; i++) { }
        this.queue.splice(i, 0, node);
    }
	
	contains(item){
		return this.queue.indexOf(item) !== -1;
	}

    pop() {
        return this.queue.shift();
    }

    size() {
        return this.queue.length;
    }
}

export class AStar {

    constructor() {
        this.openlist = new Queue();
        this.closedlist = [];
        this.map = null;
    }

    getPath(startNode, endNode, onStep, onFinish) {


        let getNeighbourNodes = (current) => {
            let neighbourCoords = [
                { x: current.x - 1, y: current.y - 1 },
                { x: current.x, y: current.y - 1 },
                { x: current.x + 1, y: current.y - 1 },
                { x: current.x - 1, y: current.y },
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y + 1 },
                { x: current.x, y: current.y + 1 },
                { x: current.x + 1, y: current.y + 1 }
            ]

            let calcG = function(n){
                if(current.x !== n.x && current.y !== n.y) {
                    return 14;
                }
                return 10;
            }
            
            let calcH = function(n) {

                /*
                let a = Math.abs(endNode.x - n.x);
                let b = Math.abs(endNode.y - n.y);
                let d = 1;
                let d2 = Math.sqrt(2);
                return (d * (a + b)) + ((d2 - (2 * D)) * Math.min(a, b));
                */
			
                let a = Math.abs(endNode.x - n.x)
                let b = Math.abs(endNode.y - n.y)
                return (a+b)*10;
            }

            let neighbours = [];
            neighbourCoords.forEach((neigbourCoord) => {
                if(this.map[neigbourCoord.y] !== undefined && this.map[neigbourCoord.y][neigbourCoord.x] !== undefined) {
                    let neigbour = this.map[neigbourCoord.y][neigbourCoord.x];
                    // walkable and not on closelist
                    if (neigbour.walkable && this.closedlist.indexOf(neigbour) === -1) {

                        let g = calcG(neigbour);
                        let h = calcH(neigbour)

                        neigbour.g = g
                        neigbour.h = h
                        neigbour.f = (g+h)
                        neigbour.parent = current
                        neighbours.push(neigbour);
                    }
                }
            })

            return neighbours;
        }

        let addToOpenlist = (n) => {
            n.forEach((item) => {
                // n is not on openlist
                if(!this.openlist.contains(item)){
                    this.openlist.push(item, item.f);
                }
            })
        }


        let run = (onStep, onFinish) => {

            let current = this.openlist.pop();
            this.closedlist.push(current);


            let n = getNeighbourNodes(current);
            addToOpenlist(n);
            onStep(current, n); // callback
            if(this.openlist.contains(endNode)) {
                this.openlist = new Queue();
                this.closedlist = [];
                onFinish(endNode) // callback
                return "ENDE"
            }
            //debugger;
            return run(onStep, onFinish);
        }

        this.openlist.push(startNode, 0);
        document.querySelector('button').addEventListener('click', () => {
            run(onStep, onFinish);
        })
    }
}

export class Map {

    constructor(map, selector) {
        this.map = map;
        this.element = document.querySelector(selector)
        this.tiles = [];
    }


    getTile(x,y) {
        return this.tiles[y][x];
    }

    getMapTile(x,y) {
        return this.map[y][x];
    }

    drawMap(startNode,endNode, tileSize = 60) {
        
        // tilesize*maplen + bordersize*maplen
        let mapLen =  (this.map.length*tileSize)+(this.map.length*2);
        this.element.style.width = mapLen+"px";
        this.element.style.height = mapLen+"px";

        for(let i=0;i<this.map.length;i++){
            this.tiles[i] = [];
            for(let j=0;j<this.map[i].length;j++) {

                let tile = document.createElement("maptile");

                tile.style.width = tileSize+"px";
                tile.style.height = tileSize+"px";
                tile.style.display = "inline-block";
                tile.style.border = "1px solid #eee";
                tile.title = 'x: '+j+'/y: '+i;

                tile.style.background = "silver";

                if(i === startNode.y && j === startNode.x){
                    tile.style.background = "lightblue";
                }

                if(i === endNode.y && j === endNode.x){
                    tile.style.background = "green";
                }

                tile.addEventListener('click', () =>  {
                    this.map[i][j].walkable = !this.map[i][j].walkable;
                    if(this.map[i][j].walkable) {
                        tile.style.background = "silver";
                    }else{
                        tile.style.background = "grey";
                    }
                })

                this.tiles[i][j] = tile;
                this.element.appendChild(tile);
            }
        }
    }

    static getMap(len) {
        let xLen = len;
        let yLen = len;
        let map = [];
        for (let i = 0; i < yLen; i++) {
            map[i] = [];
            for (let j = 0; j < xLen; j++) {
                map[i][j] = {
                    x: j,
                    y: i,
                    walkable: true
                }
            }
        }
        return map;
    }
}