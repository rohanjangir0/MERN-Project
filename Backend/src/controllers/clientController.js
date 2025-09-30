const Client = require("../models/Client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // for password hashing

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret123", { expiresIn: "7d" });
};

// @desc Get all clients
const getClients = async (req, res) => {
  try {
    const clients = await Client.find().select("-passwordHash");
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Get client by ID
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).select("-passwordHash");
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Add client
const addClient = async (req, res) => {
  try {
    const { name, email, company, loginId, password } = req.body;
    if (!name || !loginId || !password) return res.status(400).json({ message: "Please provide required fields" });

    // Check if loginId already exists
    const exists = await Client.findOne({ loginId });
    if (exists) return res.status(400).json({ message: "Login ID already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const newClient = await Client.create({ name, email, company, loginId, passwordHash });
    res.status(201).json({
      id: newClient._id,
      name: newClient.name,
      loginId: newClient.loginId,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Update client
const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    const { name, email, company, password } = req.body;

    if (name) client.name = name;
    if (email) client.email = email;
    if (company) client.company = company;
    if (password) client.passwordHash = await bcrypt.hash(password, 10);

    await client.save();
    res.json({ message: "Client updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Delete client
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc Client login
const loginClient = async (req, res) => {
  try {
    const { loginId, password } = req.body;
    if (!loginId || !password) return res.status(400).json({ message: "Please provide loginId and password" });

    const client = await Client.findOne({ loginId });
    if (!client) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, client.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(client._id);

    res.json({
      token,
      name: client.name,
      clientId: client._id,
      loginId: client.loginId,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getClients,
  getClientById,
  addClient,
  updateClient,
  deleteClient,
  loginClient,
};
