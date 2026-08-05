import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import Matter from 'matter-js';

const { Engine, World, Bodies, Body, Events } = Matter;

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

// WebSocket Server & Server-Authoritative Physics Room Manager
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

function startServerPhysicsRoom(room) {
    const engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 1;
    const world = engine.world;

    const width = 1280;
    const height = 720;
    const wallThickness = 40;

    const topBorder = Bodies.rectangle(width / 2, wallThickness / 2, width, wallThickness, { isStatic: true });
    const bottomBorder = Bodies.rectangle(width / 2, height - wallThickness / 2, width, wallThickness, { isStatic: true });
    const leftBorder = Bodies.rectangle(wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });
    const rightBorder = Bodies.rectangle(width - wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });

    const centerPlatform = Bodies.rectangle(640, 460, 220, 30, {
        isStatic: true,
        friction: 0.3,
        restitution: 0.5
    });

    const p1Goal = Bodies.rectangle(160, 115, 120, 50, { isStatic: true, isSensor: true, label: 'p1_goal' });
    const p2Goal = Bodies.rectangle(1120, 115, 120, 50, { isStatic: true, isSensor: true, label: 'p2_goal' });

    const ballRadius = 24;
    const ball = Bodies.circle(640, 640, ballRadius, {
        restitution: 0.6,
        friction: 0.05,
        frictionAir: 0.001,
        density: 0.05,
        label: 'ball'
    });
    Body.setInertia(ball, 0.5 * ball.mass * ballRadius * ballRadius);

    const p1Puck = Bodies.circle(160, 640, 12, { isStatic: false, isSensor: true, ignoreGravity: true, label: 'p1_puck' });
    const p2Puck = Bodies.circle(1120, 640, 12, { isStatic: false, isSensor: true, ignoreGravity: true, label: 'p2_puck' });

    World.add(world, [
        topBorder, bottomBorder, leftBorder, rightBorder,
        centerPlatform, p1Goal, p2Goal, ball, p1Puck, p2Puck
    ]);

    room.physics = { engine, world, ball, p1Puck, p2Puck, p1Goal, p2Goal };
    room.isMatchOver = false;

    Events.on(engine, 'collisionStart', (event) => {
        if (room.isMatchOver) return;
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair;
            let scorer = null;
            if ((bodyA === p1Goal && bodyB === ball) || (bodyB === p1Goal && bodyA === ball)) {
                scorer = 'P2';
            } else if ((bodyA === p2Goal && bodyB === ball) || (bodyB === p2Goal && bodyA === ball)) {
                scorer = 'P1';
            }

            if (scorer) {
                if (scorer === 'P1') room.scores.p1++;
                if (scorer === 'P2') room.scores.p2++;

                Body.setPosition(ball, { x: 640, y: 640 });
                Body.setVelocity(ball, { x: 0, y: 0 });
                Body.setAngularVelocity(ball, 0);

                const goalMsg = JSON.stringify({ type: 'GOAL_SCORED', scorer, scores: room.scores });
                if (room.p1 && room.p1.readyState === 1) room.p1.send(goalMsg);
                if (room.p2 && room.p2.readyState === 1) room.p2.send(goalMsg);

                if (room.mode === 'firstToX' && (room.scores.p1 >= room.target || room.scores.p2 >= room.target)) {
                    room.isMatchOver = true;
                    const winner = room.scores.p1 >= room.target ? 'P1' : 'P2';
                    const overMsg = JSON.stringify({ type: 'MATCH_OVER', winner, scores: room.scores });
                    if (room.p1 && room.p1.readyState === 1) room.p1.send(overMsg);
                    if (room.p2 && room.p2.readyState === 1) room.p2.send(overMsg);
                    if (room.gameLoop) clearInterval(room.gameLoop);
                }
            }
        });
    });

    if (room.mode === 'timed') {
        room.timerSeconds = room.target;
        room.timerEvent = setInterval(() => {
            if (room.isMatchOver) {
                clearInterval(room.timerEvent);
                return;
            }
            room.timerSeconds--;
            if (room.timerSeconds <= 0) {
                room.isMatchOver = true;
                let winner = 'DRAW';
                if (room.scores.p1 > room.scores.p2) winner = 'P1';
                else if (room.scores.p2 > room.scores.p1) winner = 'P2';
                const overMsg = JSON.stringify({ type: 'MATCH_OVER', winner, scores: room.scores });
                if (room.p1 && room.p1.readyState === 1) room.p1.send(overMsg);
                if (room.p2 && room.p2.readyState === 1) room.p2.send(overMsg);
                clearInterval(room.timerEvent);
                if (room.gameLoop) clearInterval(room.gameLoop);
            }
        }, 1000);
    }

    room.gameLoop = setInterval(() => {
        if (room.isMatchOver) return;
        Engine.update(engine, 1000 / 60);

        const gameStateMsg = JSON.stringify({
            type: 'GAME_STATE',
            ball: {
                x: ball.position.x,
                y: ball.position.y,
                vx: ball.velocity.x,
                vy: ball.velocity.y,
                angle: ball.angle,
                angularVelocity: ball.angularVelocity
            },
            p1Puck: { x: p1Puck.position.x, y: p1Puck.position.y },
            p2Puck: { x: p2Puck.position.x, y: p2Puck.position.y },
            scores: room.scores,
            timerSeconds: room.timerSeconds
        });

        if (room.p1 && room.p1.readyState === 1) room.p1.send(gameStateMsg);
        if (room.p2 && room.p2.readyState === 1) room.p2.send(gameStateMsg);
    }, 1000 / 60);
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
                        
                        startServerPhysicsRoom(room);

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
                    if (room && room.physics) {
                        const puckBody = ws.role === 'P1' ? room.physics.p1Puck : room.physics.p2Puck;
                        if (puckBody) {
                            Body.setPosition(puckBody, { x: data.x, y: data.y });
                            Body.setVelocity(puckBody, { x: data.vx, y: data.vy });
                        }
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
                if (room.gameLoop) clearInterval(room.gameLoop);
                if (room.timerEvent) clearInterval(room.timerEvent);
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
