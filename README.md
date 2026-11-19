# Dev Coffee API

API RESTful em memória desenvolvida com o módulo HTTP nativo do Node.js (`node:http`, `node:url` etc.), sem dependências externas via `npm`, para gerenciar a fila de pedidos da cafeteria **Dev Coffee**.

## Autor

* **Nome:** [Bruna Alexsandra Soletti]
* **Repositório:** `dev-coffee-http-native`

## Requisitos e Execução

* **Node.js** instalado (sem necessidade de `npm install`, pois utiliza apenas módulos nativos do Node.js).

Para iniciar o servidor na porta `3000`:

```bash
npm start

## Endpoints

### 1. GET /orders
Retorna todos os pedidos. Aceita filtro opcional por status via query string.
```bash
# Listar todos
curl http://localhost:3000/orders

# Filtrar por status
curl http://localhost:3000/orders?status=pendente

curl http://localhost:3000/orders/1

curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"client": "Bruna", "item": "Café com Leite"}'

curl -X PATCH http://localhost:3000/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "pronto"}'

curl -X DELETE http://localhost:3000/orders/1

