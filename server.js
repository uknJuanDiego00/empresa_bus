const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db.js');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/clientes', require('./src/routes/customerRoutes'));
app.use('/api/customers', require('./src/routes/customerRoutes'));

app.use('/api/vehiculos', require('./src/routes/busRoutes'));
app.use('/api/buses', require('./src/routes/busRoutes'));

app.use('/api/viajes', require('./src/routes/tripRoutes'));
app.use('/api/trips', require('./src/routes/tripRoutes'));

app.use('/api/ventas', require('./src/routes/bookingRoutes'));
app.use('/api/reservas', require('./src/routes/bookingRoutes'));
app.use('/api/bookings', require('./src/routes/bookingRoutes'));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de Via Bus Express Funcionando Correctamente',
    modules: ['clientes', 'vehiculos', 'viajes', 'ventas']
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto http://localhost:${PORT}`);
});