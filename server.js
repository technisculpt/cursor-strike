import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') {
        reqUrl = '/index.html';
    }

    const filePath = path.join(__dirname, reqUrl);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
        });

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
    });
});

// WebSocket Server & Cross-LAN Room Manager
const wss = new WebSocketServer({ server });
const rooms = new Map();

function generateRoomId() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

function broadcastRoomList() {
    const roomList = [];
    rooms.forEach((room) => {
        if (!room.p2) {
            roomList.push({
                id: room.id,
                name: room.name,
                mode: room.mode,
                target: room.target,
                playerCount: 1
            });
        }
    });
    const msg = JSON.stringify({ type: 'ROOM_LIST', rooms: roomList });
    wss.clients.forEach(client => {
        if (client.readyState === 1 && client.inLobby) {
            client.send(msg);
        }
    });
}

wss.on('connection', (ws) => {
    ws.roomId = null;
    ws.role = null;
    ws.inLobby = false;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            switch (data.type) {
                case 'ENTER_LOBBY': {
                    ws.inLobby = true;
                    broadcastRoomList();
                    break;
                }
                case 'CREATE_ROOM': {
                    ws.inLobby = false;
                    const roomId = generateRoomId();
                    const room = {
                        id: roomId,
                        name: data.roomName || `Room ${roomId}`,
                        mode: data.mode || 'firstToX',
                        target: data.target || 3,
                        p1: ws,
                        p2: null,
                        scores: { p1: 0, p2: 0 },
                        state: 'waiting'
                    };
                    rooms.set(roomId, room);
                    ws.roomId = roomId;
                    ws.role = 'P1';
                    ws.send(JSON.stringify({ type: 'ROOM_CREATED', roomId, role: 'P1', mode: room.mode, target: room.target }));
                    broadcastRoomList();
                    break;
                }
                case 'JOIN_ROOM': {
                    const room = rooms.get(data.roomId);
                    if (room && !room.p2) {
                        ws.inLobby = false;
                        room.p2 = ws;
                        room.state = 'playing';
                        ws.roomId = room.id;
                        ws.role = 'P2';
                        ws.send(JSON.stringify({ type: 'ROOM_JOINED', roomId: room.id, role: 'P2', mode: room.mode, target: room.target }));
                        
                        const startMsg = JSON.stringify({
                            type: 'GAME_START',
                            mode: room.mode,
                            target: room.target
                        });
                        if (room.p1 && room.p1.readyState === 1) room.p1.send(startMsg);
                        if (room.p2 && room.p2.readyState === 1) room.p2.send(startMsg);
                        broadcastRoomList();
                    } else {
                        ws.send(JSON.stringify({ type: 'ERROR', message: 'Room full or not found' }));
                    }
                    break;
                }
                case 'SYNC_PUCK': {
                    const room = rooms.get(ws.roomId);
                    if (room) {
                        const targetWs = ws.role === 'P1' ? room.p2 : room.p1;
                        if (targetWs && targetWs.readyState === 1) {
                            targetWs.send(JSON.stringify({
                                type: 'PUCK_POS',
                                role: ws.role,
                                x: data.x,
                                y: data.y,
                                vx: data.vx,
                                vy: data.vy
                            }));
                        }
                    }
                    break;
                }
                case 'SYNC_BALL': {
                    const room = rooms.get(ws.roomId);
                    if (room && ws.role === 'P1' && room.p2 && room.p2.readyState === 1) {
                        room.p2.send(JSON.stringify({
                            type: 'BALL_STATE',
                            x: data.x,
                            y: data.y,
                            vx: data.vx,
                            vy: data.vy,
                            angle: data.angle,
                            angularVelocity: data.angularVelocity
                        }));
                    }
                    break;
                }
                case 'SCORE_GOAL': {
                    const room = rooms.get(ws.roomId);
                    if (room) {
                        if (data.scorer === 'P1') room.scores.p1++;
                        if (data.scorer === 'P2') room.scores.p2++;

                        const goalMsg = JSON.stringify({
                            type: 'GOAL_SCORED',
                            scorer: data.scorer,
                            scores: room.scores
                        });
                        if (room.p1 && room.p1.readyState === 1) room.p1.send(goalMsg);
                        if (room.p2 && room.p2.readyState === 1) room.p2.send(goalMsg);

                        let gameOver = false;
                        let winner = null;
                        if (room.mode === 'firstToX' && (room.scores.p1 >= room.target || room.scores.p2 >= room.target)) {
                            gameOver = true;
                            winner = room.scores.p1 >= room.target ? 'P1' : 'P2';
                        }
                        if (gameOver) {
                            const overMsg = JSON.stringify({ type: 'MATCH_OVER', winner, scores: room.scores });
                            if (room.p1 && room.p1.readyState === 1) room.p1.send(overMsg);
                            if (room.p2 && room.p2.readyState === 1) room.p2.send(overMsg);
                        }
                    }
                    break;
                }
                case 'MATCH_TIME_EXPIRED': {
                    const room = rooms.get(ws.roomId);
                    if (room && ws.role === 'P1') {
                        let winner = 'DRAW';
                        if (room.scores.p1 > room.scores.p2) winner = 'P1';
                        else if (room.scores.p2 > room.scores.p1) winner = 'P2';
                        const overMsg = JSON.stringify({ type: 'MATCH_OVER', winner, scores: room.scores });
                        if (room.p1 && room.p1.readyState === 1) room.p1.send(overMsg);
                        if (room.p2 && room.p2.readyState === 1) room.p2.send(overMsg);
                    }
                    break;
                }
            }
        } catch (e) {
            console.error('Error handling WS message:', e);
        }
    });

    ws.on('close', () => {
        if (ws.roomId) {
            const room = rooms.get(ws.roomId);
            if (room) {
                const other = ws.role === 'P1' ? room.p2 : room.p1;
                if (other && other.readyState === 1) {
                    other.send(JSON.stringify({ type: 'PLAYER_DISCONNECTED' }));
                }
                rooms.delete(ws.roomId);
                broadcastRoomList();
            }
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log(`\n==================================================`);
    console.log(` CursorStrike Local Network Server Running!`);
    console.log(` Host: ${HOST} | Port: ${PORT}`);
    console.log(`==================================================`);
    console.log(` Local Access:       http://localhost:${PORT}`);

    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const net of interfaces[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(` LAN Access (${name}): http://${net.address}:${PORT}`);
            }
        }
    }
    console.log(`==================================================\n`);
});
