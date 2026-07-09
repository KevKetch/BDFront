require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data storage (JSON files for simplicity)
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Helper functions
const readData = (file) => {
  const filePath = path.join(DATA_DIR, `${file}.json`);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const writeData = (file, data) => {
  const filePath = path.join(DATA_DIR, `${file}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Routes
app.get('/api/villes', (req, res) => {
  const villes = readData('villes');
  res.json(villes);
});

app.get('/api/parents', (req, res) => {
  const parents = readData('parents');
  res.json(parents);
});

app.post('/api/parents', (req, res) => {
  const parents = readData('parents');
  const newParent = {
    id: `p${Date.now()}`,
    ...req.body,
    dateInscription: new Date().toISOString(),
    actif: true
  };
  parents.push(newParent);
  writeData('parents', parents);
  res.json(newParent);
});

app.get('/api/eleves', (req, res) => {
  const eleves = readData('eleves');
  res.json(eleves);
});

app.post('/api/eleves', (req, res) => {
  const eleves = readData('eleves');
  const dateInscription = new Date();
  const anneeScolaire = dateInscription.getMonth() >= 8 ? `${dateInscription.getFullYear()}-${dateInscription.getFullYear() + 1}` : `${dateInscription.getFullYear() - 1}-${dateInscription.getFullYear()}`;

  const newEleve = {
    id: `e${Date.now()}`,
    ...req.body,
    dateInscription: dateInscription.toISOString(),
    anneeScolaire,
    statut: 'actif'
  };
  eleves.push(newEleve);
  writeData('eleves', newEleve);
  res.json(newEleve);
});

app.get('/api/paiements', (req, res) => {
  const paiements = readData('paiements');
  res.json(paiements);
});

app.post('/api/paiements', (req, res) => {
  const paiements = readData('paiements');
  const newPaiement = {
    id: `p${Date.now()}`,
    ...req.body,
    datePaiement: new Date().toISOString()
  };
  paiements.push(newPaiement);
  writeData('paiements', paiements);
  res.json(newPaiement);
});

app.get('/api/messages', (req, res) => {
  const messages = readData('messages');
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const messages = readData('messages');
  const newMessage = {
    id: `m${Date.now()}`,
    ...req.body,
    dateEnvoi: new Date().toISOString()
  };
  messages.push(newMessage);
  writeData('messages', messages);
  res.json(newMessage);
});

// Mock OTP endpoint (simulate WhatsApp)
app.post('/api/send-otp', (req, res) => {
  const { telephone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  console.log(`OTP pour ${telephone}: ${otp}`);
  // In real app, send via WhatsApp API
  res.json({ success: true, otp });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});