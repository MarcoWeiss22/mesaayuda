const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

// Cargar la base de datos desde db.json
const dbPath = path.join(__dirname, "db.json");
let db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

// Endpoint de login
app.post("/loginCliente", (req, res) => {
    const { id, password } = req.body;
    const cliente = db.clientes.find(
        (c) => c.id === id && c.password === password
    );

    if (!cliente) {
        return res.status(401).json({ response: "ERROR", message: "Credenciales inválidas" });
    }

    res.json({
        response: "OK",
        id: cliente.id,
        nombre: cliente.nombre,
        contacto: cliente.contacto,
        fecha_ultimo_ingreso: cliente.fecha_ultimo_ingreso
    });
});

// Listar tickets de un cliente
app.get("/listarTicket/:clienteId", (req, res) => {
    const { clienteId } = req.params;
    const tickets = db.tickets.filter((t) => t.usuario_id === clienteId);

    if (tickets.length === 0) {
        return res.status(404).json({ response: "ERROR", message: "No hay tickets para este cliente" });
    }

    res.json({ tickets });
});

// Consultar un ticket por ID
app.get("/ticket/:id", (req, res) => {
    const ticket = db.tickets.find((t) => t.id === req.params.id);
    if (!ticket) {
        return res.status(404).json({ response: "ERROR", message: "Ticket no encontrado" });
    }
    res.json({ ticket });
});

// Crear un ticket
app.post("/ticket", (req, res) => {
    const { usuario_id, descripcion } = req.body;

    if (!usuario_id || !descripcion) {
        return res.status(400).json({ response: "ERROR", message: "Faltan datos obligatorios" });
    }

    const nuevoTicket = {
        id: `tkt-${Date.now()}`,
        usuario_id,
        soporte_id: null,
        estado: "INICIAL",
        fecha_alta: new Date().toISOString().split("T")[0],
        fecha_revision: null,
        fecha_cierre: null,
        descripcion,
        solucion: null
    };

    db.tickets.push(nuevoTicket);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    res.status(201).json({ response: "OK", ticket: nuevoTicket });
});

// Levantar el servidor
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor simulado escuchando en http://localhost:${PORT}`);
});
