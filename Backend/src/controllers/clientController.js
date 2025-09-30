const Client = require("../models/Client");
const jwt = require("jsonwebtoken");

// Dummy clients (replace later with DB)
let clients = [
  {
    id: 1,
    name: "Emily Rodriguez",
    email: "emily@techcorp.com",
    company: "TechCorp Solutions",
    loginId: "emi4821",
    passwordHash: "Abc123@!" // for demo only, plain text
  },
  {
    id: 2,
    name: "John Doe",
    email: "john@business.com",
    company: "Business Inc.",
    loginId: "joh1234",
    passwordHash: "Xyz987@!"
  }
];

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret123", { expiresIn: "7d" });
};

// @desc Get all clients
const getClients = (req, res) => {
  res.json(clients);
};

// @desc Get client by ID
const getClientById = (req, res) => {
  const client = clients.find((c) => c.id === parseInt(req.params.id));
  if (client) res.json(client);
  else res.status(404).json({ message: "Client not found" });
};

// @desc Add client
const addClient = (req, res) => {
  const { name, email, company, loginId, password } = req.body;
  if (!name || !email || !company || !loginId || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }
  const newClient = { id: clients.length + 1, name, email, company, loginId, passwordHash: password };
  clients.push(newClient);
  res.status(201).json(newClient);
};

// @desc Update client
const updateClient = (req, res) => {
  const client = clients.find((c) => c.id === parseInt(req.params.id));
  if (client) {
    client.name = req.body.name || client.name;
    client.email = req.body.email || client.email;
    client.company = req.body.company || client.company;
    res.json(client);
  } else res.status(404).json({ message: "Client not found" });
};

// @desc Delete client
const deleteClient = (req, res) => {
  const index = clients.findIndex((c) => c.id === parseInt(req.params.id));
  if (index !== -1) {
    const deleted = clients.splice(index, 1);
    res.json({ message: "Client removed", client: deleted });
  } else res.status(404).json({ message: "Client not found" });
};

// @desc Client login
const loginClient = (req, res) => {
  const { loginId, password } = req.body;
  if (!loginId || !password) return res.status(400).json({ message: "Please provide loginId and password" });

  const client = clients.find((c) => c.loginId === loginId);
  if (!client) return res.status(401).json({ message: "Invalid credentials" });

  if (client.passwordHash !== password) return res.status(401).json({ message: "Invalid credentials" });

  const token = generateToken(client.id);
  res.json({
    token,
    name: client.name,
    clientId: client.id,
    loginId: client.loginId
  });
};

module.exports = {
  getClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
  loginClient
};
