import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import consumoRoutes from './routes/consumo.routes';
import dashboardRoutes from './routes/dashboard.routes';
import graficosRoutes from './routes/graficos.routes';
import dicasRoutes from './routes/dicas.routes';
import perfilRoutes from './routes/perfil.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/consumos', consumoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/graficos', graficosRoutes);
app.use('/api/dicas', dicasRoutes);
app.use('/api/perfil', perfilRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handler global de erros
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
