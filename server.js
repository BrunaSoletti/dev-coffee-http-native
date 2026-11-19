const http = require('node:http');
const { URL } = require('node:url');

// Banco de dados em memória
let orders = [];
let nextId = 1;

// Lista de status permitidos
const validStatuses = ['pendente', 'pronto', 'cancelado'];

const server = http.createServer((req, res) => {
    // Configura o cabeçalho padrão para JSON em todas as respostas
    // (Exceção para o 204 que faremos depois)
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // Criamos um objeto URL para facilitar a leitura da rota e query params
    const baseURL = `http://${req.headers.host || 'localhost'}`;
    const parsedUrl = new URL(req.url, baseURL);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // --- LÓGICA DE ROTEAMENTO ---

    // ROTA: GET /orders
    if (method === 'GET' && pathname === '/orders') {
        const statusFilter = parsedUrl.searchParams.get('status');
        let result = orders;

        if (statusFilter) {
            result = orders.filter(o => o.status === statusFilter);
        }

        res.writeHead(200);
        return res.end(JSON.stringify(result));
    }

    // ROTA: GET /orders/:id
    const getOrderRegex = /^\/orders\/(\d+)$/;
    const getMatch = pathname.match(getOrderRegex);

    if (method === 'GET' && getMatch) {
        const id = parseInt(getMatch[1]);
        const order = orders.find(o => o.id === id);

        if (!order) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: 'Pedido não encontrado' }));
        }

        res.writeHead(200);
        return res.end(JSON.stringify(order));
    }

    // ROTA: POST /orders
    if (method === 'POST' && pathname === '/orders') {
        let body = '';

        // REQUISITO: Manipulação de Streams
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // REQUISITO: Tolerância a falhas (try/catch)
                const data = JSON.parse(body);

                if (!data.client || !data.item) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: 'Campos "client" e "item" são obrigatórios' }));
                }

                const newOrder = {
                    id: nextId++,
                    client: data.client,
                    item: data.item,
                    status: 'pendente' // Status inicial obrigatório
                };

                orders.push(newOrder);

                res.writeHead(201);
                return res.end(JSON.stringify(newOrder));
            } catch (error) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Corpo da requisição inválido (JSON malformado)' }));
            }
        });
        return; // Importante: retorna aqui pois a resposta será enviada dentro do evento 'end'
    }

    // ROTA: PATCH /orders/:id/status
    const patchStatusRegex = /^\/orders\/(\d+)\/status$/;
    const patchMatch = pathname.match(patchStatusRegex);

    if (method === 'PATCH' && patchMatch) {
        const id = parseInt(patchMatch[1]);
        const orderIndex = orders.findIndex(o => o.id === id);

        if (orderIndex === -1) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: 'Pedido não encontrado' }));
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);

                if (!data.status || !validStatuses.includes(data.status)) {
                    res.writeHead(400);
                    return res.end(JSON.stringify({ error: 'Status inválido. Use: pendente, pronto ou cancelado' }));
                }

                orders[orderIndex].status = data.status;
                res.writeHead(200);
                return res.end(JSON.stringify(orders[orderIndex]));
            } catch (error) {
                res.writeHead(400);
                return res.end(JSON.stringify({ error: 'Corpo da requisição inválido' }));
            }
        });
        return;
    }

    // ROTA: DELETE /orders/:id
    const deleteRegex = /^\/orders\/(\d+)$/;
    const deleteMatch = pathname.match(deleteRegex);

    if (method === 'DELETE' && deleteMatch) {
        const id = parseInt(deleteMatch[1]);
        const orderIndex = orders.findIndex(o => o.id === id);

        if (orderIndex === -1) {
            res.writeHead(404);
            return res.end(JSON.stringify({ error: 'Pedido não encontrado' }));
        }

        orders.splice(orderIndex, 1);

        // REQUISITO: 204 No Content (sem corpo)
        res.writeHead(204);
        return res.end();
    }

    // REQUISITO: Qualquer rota/verbo não previsto -> 404 JSON
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Rota não encontrada' }));
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor Dev Coffee rodando na porta ${PORT}`);
    console.log('Acesse: http://localhost:${PORT}/orders');
});