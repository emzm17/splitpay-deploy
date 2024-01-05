    class Graph {
        constructor(numVertices) {
            this.numVertices = numVertices;
            this.adjMatrix = new Array(numVertices).fill(0.00).map(() => new Array(numVertices).fill(0.00));
        }
    
        addEdge(fromVertex, toVertex, weight) {
            this.adjMatrix[fromVertex][toVertex] = weight;
        }
    
        printGraph() {
            console.log("Adjacency Matrix:");
            for (let i = 0; i < this.numVertices; i++) {
                console.log(this.adjMatrix[i].map(val => (val === 0 ? '-' : val)).join(' '));
            }
        }
    }
    
    

  

module.exports=Graph;

