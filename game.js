class Gomoku {
    constructor() {
        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.boardSize = 15; // 15x15的棋盘
        this.cellSize = this.canvas.width / this.boardSize;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black'; // 黑子先手
        this.gameOver = false;
        this.blackScore = 0;
        this.whiteScore = 0;
        this.moveHistory = [];

        this.init();
    }

    init() {
        this.drawBoard();
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
    }

    drawBoard() {
        // 绘制棋盘背景
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 添加整体阴影
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 4;

        // 绘制网格线
        this.ctx.shadowColor = 'transparent';
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
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

        // 绘制中心点
        this.drawPoint(7, 7);
    }

    drawPoint(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(
            x * this.cellSize + this.cellSize / 2,
            y * this.cellSize + this.cellSize / 2,
            4,
            0,
            Math.PI * 2
        );
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fill();
    }

    drawPiece(x, y, color) {
        this.ctx.save();
        
        const centerX = x * this.cellSize + this.cellSize / 2;
        const centerY = y * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize * 0.4;

        // 绘制主阴影
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 4;

        // 绘制棋子
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

        if (color === 'black') {
            // 黑子渐变
            const gradient = this.ctx.createRadialGradient(
                centerX - radius/3, centerY - radius/3,
                0,
                centerX, centerY,
                radius
            );
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(0.5, '#333');
            gradient.addColorStop(1, '#000');
            this.ctx.fillStyle = gradient;
        } else {
            // 白子渐变
            const gradient = this.ctx.createRadialGradient(
                centerX - radius/3, centerY - radius/3,
                0,
                centerX, centerY,
                radius
            );
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#f0f0f0');
            this.ctx.fillStyle = gradient;
        }
        
        this.ctx.fill();

        // 为白子添加边框和内阴影
        if (color === 'white') {
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // 添加内阴影效果
            const innerShadow = this.ctx.createRadialGradient(
                centerX + radius/4, centerY + radius/4,
                0,
                centerX, centerY,
                radius
            );
            innerShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
            innerShadow.addColorStop(1, 'rgba(0, 0, 0, 0.07)');
            this.ctx.fillStyle = innerShadow;
            this.ctx.fill();

            // 添加高光效果
            const highlight = this.ctx.createRadialGradient(
                centerX - radius/2, centerY - radius/2,
                0,
                centerX - radius/3, centerY - radius/3,
                radius
            );
            highlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            highlight.addColorStop(0.2, 'rgba(255, 255, 255, 0.4)');
            highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = highlight;
            this.ctx.fill();
        } else {
            // 为黑子添加高光
            const highlight = this.ctx.createRadialGradient(
                centerX - radius/2, centerY - radius/2,
                0,
                centerX, centerY,
                radius
            );
            highlight.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
            highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
            highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = highlight;
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    handleClick(e) {
        if (this.gameOver) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.cellSize);
        const y = Math.floor((e.clientY - rect.top) / this.cellSize);

        if (this.isValidMove(x, y)) {
            this.makeMove(x, y);
            if (this.checkWin(x, y)) {
                this.gameOver = true;
                return;
            }
            this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
            document.getElementById('player-turn').textContent = 
                `当前玩家: ${this.currentPlayer === 'black' ? '黑子' : '白子'}`;
        }
    }

    isValidMove(x, y) {
        return x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize && this.board[y][x] === null;
    }

    makeMove(x, y) {
        this.board[y][x] = this.currentPlayer;
        this.moveHistory.push({x, y, player: this.currentPlayer});
        this.drawPiece(x, y, this.currentPlayer);
    }

    checkWin(x, y) {
        const directions = [
            [[0, 1], [0, -1]],  // 垂直
            [[1, 0], [-1, 0]],  // 水平
            [[1, 1], [-1, -1]], // 对角线
            [[1, -1], [-1, 1]]  // 反对角线
        ];

        const hasWon = directions.some(direction => {
            const count = 1 + this.countPieces(x, y, direction[0][0], direction[0][1]) 
                           + this.countPieces(x, y, direction[1][0], direction[1][1]);
            return count >= 5;
        });

        if (hasWon) {
            if (this.currentPlayer === 'black') {
                this.blackScore++;
                document.getElementById('black-score').textContent = this.blackScore;
            } else {
                this.whiteScore++;
                document.getElementById('white-score').textContent = this.whiteScore;
            }
            
            // 创建胜利动画
            this.createWinAnimation();
        }

        return hasWon;
    }

    countPieces(x, y, dx, dy) {
        let count = 0;
        let currentX = x + dx;
        let currentY = y + dy;
        const player = this.board[y][x];

        while (
            currentX >= 0 && 
            currentX < this.boardSize && 
            currentY >= 0 && 
            currentY < this.boardSize && 
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
        document.getElementById('player-turn').textContent = '当前玩家: 黑子';
    }

    undo() {
        if (this.moveHistory.length === 0 || this.gameOver) return;
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.y][lastMove.x] = null;
        this.currentPlayer = lastMove.player;
        this.drawBoard();
        this.redrawAllPieces();
        
        document.getElementById('player-turn').textContent = 
            `当前玩家: ${this.currentPlayer === 'black' ? '黑子' : '白子'}`;
        document.getElementById('player-turn-piece').className = 
            `piece ${this.currentPlayer}`;
    }

    redrawAllPieces() {
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.board[y][x]) {
                    this.drawPiece(x, y, this.board[y][x]);
                }
            }
        }
    }

    // 添加新方法
    createWinAnimation() {
        // 创建容器
        const container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        // 创建胜利文本
        const winText = document.createElement('div');
        winText.className = 'win-text';
        winText.textContent = `${this.currentPlayer === 'black' ? '黑子' : '白子'}获胜！`;
        container.appendChild(winText);

        // 创建彩带
        const colors = [
            '#ff718d', '#fdff6a', '#ffaf7a', 
            '#7af6ff', '#7a96ff', '#ff7af1',
            '#FFA07A', '#98FB98', '#87CEFA',
            '#DDA0DD', '#F0E68C', '#00CED1'
        ];
        
        for (let i = 0; i < 200; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = Math.random() * 20 - 20 + 'vh';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
            // 随机旋转角度
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            // 随机大小
            const size = Math.random() * 0.8 + 0.2;
            confetti.style.width = `${10 * size}px`;
            confetti.style.height = `${25 * size}px`;
            container.appendChild(confetti);
        }

        // 移除动画元素
        setTimeout(() => {
            container.remove();
        }, 8000);  // 延长动画时间
    }
}

// 初始化游戏
window.onload = () => {
    new Gomoku();
}; 