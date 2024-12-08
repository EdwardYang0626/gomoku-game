class Gomoku {
    constructor() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 15;
        this.cellSize = this.canvas.width / this.boardSize;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        
        this.drawBoard();
    }

    drawBoard() {
        // 清空画布
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 画网格线
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            // 横线
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize / 2, i * this.cellSize + this.cellSize / 2);
            this.ctx.lineTo(this.canvas.width - this.cellSize / 2, i * this.cellSize + this.cellSize / 2);
            this.ctx.stroke();
            
            // 竖线
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize + this.cellSize / 2, this.cellSize / 2);
            this.ctx.lineTo(i * this.cellSize + this.cellSize / 2, this.canvas.height - this.cellSize / 2);
            this.ctx.stroke();
        }
    }

    drawPiece(x, y, color) {
        const centerX = x * this.cellSize + this.cellSize / 2;
        const centerY = y * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize * 0.4;

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color === 'black' ? '#000000' : '#ffffff';
        this.ctx.fill();
        if (color === 'white') {
            this.ctx.strokeStyle = '#000000';
            this.ctx.stroke();
        }
    }

    handleClick(e) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.cellSize);
        const y = Math.floor((e.clientY - rect.top) / this.cellSize);

        if (this.isValidMove(x, y)) {
            this.makeMove(x, y);
        }
    }

    isValidMove(x, y) {
        return x >= 0 && x < this.boardSize && 
               y >= 0 && y < this.boardSize && 
               this.board[y][x] === null;
    }

    makeMove(x, y) {
        this.board[y][x] = this.currentPlayer;
        this.drawPiece(x, y, this.currentPlayer);
        
        if (this.checkWin(x, y)) {
            alert(`${this.currentPlayer === 'black' ? '黑' : '白'}方获胜！`);
            this.gameOver = true;
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
    }

    checkWin(x, y) {
        const directions = [
            [[0, 1], [0, -1]],  // 垂直
            [[1, 0], [-1, 0]],  // 水平
            [[1, 1], [-1, -1]], // 对角线
            [[1, -1], [-1, 1]]  // 反对角线
        ];

        return directions.some(direction => {
            const count = 1 + this.countPieces(x, y, direction[0][0], direction[0][1]) 
                           + this.countPieces(x, y, direction[1][0], direction[1][1]);
            return count >= 5;
        });
    }

    countPieces(x, y, dx, dy) {
        let count = 0;
        let currentX = x + dx;
        let currentY = y + dy;
        const player = this.board[y][x];

        while (
            currentX >= 0 && currentX < this.boardSize &&
            currentY >= 0 && currentY < this.boardSize &&
            this.board[currentY][currentX] === player
        ) {
            count++;
            currentX += dx;
            currentY += dy;
        }

        return count;
    }

    restart() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.drawBoard();
    }
}

// 初始化游戏
window.onload = () => {
    new Gomoku();
}; 