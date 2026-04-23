'use strict';

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

const BASE_PORT = 9000;
const PORT_RANGE = 3;
const CDP_TIMEOUT_MS = 5000;
const HEALTH_CHECK_INTERVAL_MS = 10000;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 2000;

class CDPHandler extends EventEmitter {
    constructor(logger = console.log) {
        super();
        this.logger = logger;
        this.connections = new Map();
        this.isEnabled = false;
        this.msgId = 1;
        this.healthCheckTimer = null;
        this.reconnectAttempts = new Map();
        this.scriptVersion = 'v17';
        this.scriptCache = null;
    }

    log(msg) { this.logger(`[TXA-CDP-${this.scriptVersion}] ${msg}`); }

    getVersionedApi(method) {
        const apiMap = {
            'start': '__txaStart_v17',
            'stop': '__txaStop_v17',
            'getStats': '__txaGetStats_v17',
            'getState': '__txaGetState_v17',
            'setPickMode': '__txaSetPickMode_v17',
            'getPickedSelector': '__txaGetPickedSelector_v17',
            'syncState': '__txaSyncState_v17'
        };
        return apiMap[method] || `__txa${method.charAt(0).toUpperCase() + method.slice(1)}`;
    }

    async isCDPAvailable() {
        for (let port = BASE_PORT - PORT_RANGE; port <= BASE_PORT + PORT_RANGE; port++) {
            try {
                const pages = await this._getPages(port);
                if (pages.length > 0) return true;
            } catch (e) { }
        }
        return false;
    }

    async start(config) {
        this.isEnabled = true;
        this._startHealthCheck();
        await this._scanAndConnect(config);
    }

    async stop() {
        this.isEnabled = false;
        this._stopHealthCheck();

        const stopPromises = [];
        for (const [id, conn] of this.connections) {
            stopPromises.push(
                this._evalSafe(id, `if(${this.getVersionedApi('stop')}) ${this.getVersionedApi('stop')}()`)
                    .catch(() => {})
            );
            try { conn.ws.close(); } catch (e) { }
        }

        await Promise.all(stopPromises);
        this.connections.clear();
        this.log('Stopped all connections.');
    }

    async updateConfig(config) {
        for (const [id] of this.connections) {
            try {
                await this._eval(id, `if(${this.getVersionedApi('start')}) ${this.getVersionedApi('start')}(${JSON.stringify(config)})`);
                this.emit('configUpdated', { id, config });
            } catch (e) {
                this.log(`Config update failed for ${id}: ${e.message}`);
            }
        }
    }

    async syncState(partialState) {
        const results = [];
        for (const [id] of this.connections) {
            try {
                const res = await this._eval(id, `if(${this.getVersionedApi('syncState')}) ${this.getVersionedApi('syncState')}(${JSON.stringify(partialState)})`);
                if (res?.result?.value) {
                    results.push(JSON.parse(res.result.value));
                }
            } catch (e) { }
        }
        return results;
    }

    async getStats() {
        let totalClicks = 0;
        let totalScans = 0;
        let allEvents = [];
        let memoryStats = { gcCount: 0, peakEvents: 0 };

        for (const [id] of this.connections) {
            try {
                const apiName = this.getVersionedApi('getStats');
                const res = await this._eval(id, `if(${apiName}) ${apiName}() : "{}"`);
                if (res?.result?.value) {
                    const s = JSON.parse(res.result.value);
                    totalClicks += s.clicks || 0;
                    totalScans += s.scanCount || 0;
                    if (s.events) allEvents.push(...s.events);
                    if (s.memoryStats) {
                        memoryStats.gcCount += s.memoryStats.gcCount || 0;
                        memoryStats.peakEvents = Math.max(memoryStats.peakEvents, s.memoryStats.peakEvents || 0);
                    }
                }
            } catch (e) { }
        }

        return {
            clicks: totalClicks,
            scans: totalScans,
            events: allEvents,
            memoryStats,
            connectionCount: this.connections.size
        };
    }

    async getDetailedState() {
        const states = [];
        for (const [id] of this.connections) {
            try {
                const apiName = this.getVersionedApi('getState');
                const res = await this._eval(id, `if(${apiName}) ${apiName}() : null`);
                if (res?.result?.value) {
                    states.push({ id, state: JSON.parse(res.result.value) });
                }
            } catch (e) { }
        }
        return states;
    }

    async setPickMode(enabled) {
        for (const [id] of this.connections) {
            try {
                const apiName = this.getVersionedApi('setPickMode');
                await this._eval(id, `if(${apiName}) ${apiName}(${enabled})`);
            } catch (e) { }
        }
    }

    async getPickedSelector() {
        for (const [id] of this.connections) {
            try {
                const apiName = this.getVersionedApi('getPickedSelector');
                const res = await this._eval(id, `if(${apiName}) ${apiName}() : null`);
                if (res?.result?.value) return res.result.value;
            } catch (e) { }
        }
        return null;
    }

    getConnectionCount() { return this.connections.size; }

    getConnectionInfo() {
        const info = [];
        for (const [id, conn] of this.connections) {
            info.push({
                id,
                connected: conn.ws?.readyState === WebSocket.OPEN,
                injected: conn.injected,
                reconnectAttempts: this.reconnectAttempts.get(id) || 0
            });
        }
        return info;
    }

    _loadScript() {
        if (this.scriptCache) return this.scriptCache;
        try {
            const scriptPath = path.join(__dirname, 'inject-script.js');
            this.scriptCache = fs.readFileSync(scriptPath, 'utf8');
            return this.scriptCache;
        } catch (e) {
            this.log(`Failed to load script: ${e.message}`);
            return null;
        }
    }

    _startHealthCheck() {
        this._stopHealthCheck();
        this.healthCheckTimer = setInterval(async () => {
            await this._performHealthCheck();
        }, HEALTH_CHECK_INTERVAL_MS);
    }

    _stopHealthCheck() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }
    }

    async _performHealthCheck() {
        if (!this.isEnabled) return;

        const deadConnections = [];
        for (const [id, conn] of this.connections) {
            try {
                if (conn.ws.readyState !== WebSocket.OPEN) {
                    deadConnections.push(id);
                    continue;
                }

                const res = await this._eval(id, '1+1', 2000);
                if (res === null) {
                    deadConnections.push(id);
                }
            } catch (e) {
                deadConnections.push(id);
            }
        }

        for (const id of deadConnections) {
            this.log(`Health check failed for ${id}, attempting reconnect...`);
            await this._handleDisconnection(id);
        }

        if (deadConnections.length > 0) {
            this.emit('healthCheck', { dead: deadConnections.length, total: this.connections.size });
        }
    }

    async _handleDisconnection(id) {
        const conn = this.connections.get(id);
        if (!conn) return;

        const attempts = (this.reconnectAttempts.get(id) || 0) + 1;

        if (attempts > MAX_RECONNECT_ATTEMPTS) {
            this.log(`Max reconnect attempts reached for ${id}, removing...`);
            this.connections.delete(id);
            this.reconnectAttempts.delete(id);
            this.emit('connectionLost', { id, reason: 'max-attempts' });
            return;
        }

        this.reconnectAttempts.set(id, attempts);
        this.emit('reconnecting', { id, attempt: attempts });

        await new Promise(r => setTimeout(r, RECONNECT_DELAY_MS * attempts));

        try {
            conn.ws.close();
        } catch (e) { }

        const [port, pageId] = id.split(':');
        const pages = await this._getPages(parseInt(port));

        const targetPage = pages.find(p => p.id === pageId);
        if (!targetPage) {
            this.log(`Page ${id} no longer available`);
            this.connections.delete(id);
            this.reconnectAttempts.delete(id);
            this.emit('connectionLost', { id, reason: 'page-not-found' });
            return;
        }

        try {
            const ok = await this._connect(id, targetPage.webSocketDebuggerUrl);
            if (ok) {
                this.log(`Reconnected to ${id} on attempt ${attempts}`);
                this.reconnectAttempts.set(id, 0);
                const script = this._loadScript();
                if (script) {
                    await this._eval(id, script);
                    conn.injected = true;
                }
                await this._eval(id, `if(${this.getVersionedApi('start')}) ${this.getVersionedApi('start')}(${JSON.stringify(this._lastConfig || {})})`);
                this.emit('reconnected', { id });
            }
        } catch (e) {
            this.log(`Reconnect failed for ${id}: ${e.message}`);
            await this._handleDisconnection(id);
        }
    }

    async _scanAndConnect(config) {
        this._lastConfig = config;

        for (let port = BASE_PORT - PORT_RANGE; port <= BASE_PORT + PORT_RANGE; port++) {
            try {
                const pages = await this._getPages(port);
                for (const page of pages) {
                    const id = `${port}:${page.id}`;
                    if (!this.connections.has(id)) {
                        const ok = await this._connect(id, page.webSocketDebuggerUrl);
                        if (ok) {
                            this.log(`Connected: ${id} (${page.title || 'no title'})`);
                            this.emit('connected', { id, title: page.title, port });
                        }
                    }
                    if (this.connections.has(id)) {
                        await this._inject(id, config);
                    }
                }
            } catch (e) {
                this.log(`Scan error on port ${port}: ${e.message}`);
            }
        }

        if (this.connections.size === 0) {
            this.log(`No CDP pages found on ports ${BASE_PORT - PORT_RANGE}–${BASE_PORT + PORT_RANGE}`);
            this.emit('noConnections');
        }
    }

    async _getPages(port) {
        return new Promise((resolve) => {
            const req = http.get(
                { hostname: '127.0.0.1', port, path: '/json/list', timeout: 800 },
                (res) => {
                    let body = '';
                    res.on('data', c => body += c);
                    res.on('end', () => {
                        try {
                            const pages = JSON.parse(body);
                            resolve(pages.filter(p => p.webSocketDebuggerUrl &&
                                (p.type === 'page' || p.type === 'webview')));
                        } catch (e) { resolve([]); }
                    });
                }
            );
            req.on('error', () => resolve([]));
            req.on('timeout', () => { req.destroy(); resolve([]); });
        });
    }

    async _connect(id, url) {
        return new Promise((resolve) => {
            try {
                const ws = new WebSocket(url, {
                    handshakeTimeout: 5000,
                    maxPayload: 10 * 1024 * 1024
                });

                const timeout = setTimeout(() => {
                    ws.terminate();
                    resolve(false);
                }, 5000);

                ws.on('open', () => {
                    clearTimeout(timeout);
                    this.connections.set(id, { ws, injected: false, createdAt: Date.now() });
                    resolve(true);
                });

                ws.on('error', (err) => {
                    clearTimeout(timeout);
                    this.log(`WebSocket error for ${id}: ${err.message}`);
                    resolve(false);
                });

                ws.on('close', () => {
                    if (this.connections.has(id)) {
                        this.log(`Connection closed: ${id}`);
                        this.emit('connectionClosed', { id });
                    }
                });

            } catch (e) {
                resolve(false);
            }
        });
    }

    async _inject(id, config) {
        const conn = this.connections.get(id);
        if (!conn) return;

        try {
            if (!conn.injected) {
                const script = this._loadScript();
                if (!script) {
                    this.log(`No script to inject for ${id}`);
                    return;
                }

                await this._eval(id, script);
                conn.injected = true;
                this.log(`Script injected into ${id}`);
                this.emit('scriptInjected', { id });
            }

            const startApi = this.getVersionedApi('start');
            await this._eval(id, `if(${startApi}) ${startApi}(${JSON.stringify(config)})`);
            this._lastConfig = config;

        } catch (e) {
            this.log(`Inject failed for ${id}: ${e.message}`);
            conn.injected = false;
        }
    }

    async _eval(id, expression, timeout = CDP_TIMEOUT_MS) {
        const conn = this.connections.get(id);
        if (!conn || conn.ws.readyState !== WebSocket.OPEN) return null;

        return new Promise((resolve, reject) => {
            const currentId = this.msgId++;
            const timer = setTimeout(() => {
                conn.ws.off('message', onMsg);
                reject(new Error('CDP timeout'));
            }, timeout);

            const onMsg = (data) => {
                try {
                    const msg = JSON.parse(data.toString());
                    if (msg.id === currentId) {
                        conn.ws.off('message', onMsg);
                        clearTimeout(timer);
                        resolve(msg.result);
                    }
                } catch (e) { }
            };

            conn.ws.on('message', onMsg);

            try {
                conn.ws.send(JSON.stringify({
                    id: currentId,
                    method: 'Runtime.evaluate',
                    params: { expression, userGesture: true, awaitPromise: true }
                }));
            } catch (e) {
                clearTimeout(timer);
                reject(e);
            }
        });
    }

    async _evalSafe(id, expression) {
        try {
            return await this._eval(id, expression);
        } catch (e) {
            return null;
        }
    }

    dispose() {
        this._stopHealthCheck();
        for (const [id, conn] of this.connections) {
            try { conn.ws.close(); } catch (e) { }
        }
        this.connections.clear();
        this.removeAllListeners();
    }
}

module.exports = { CDPHandler };
