import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Tipos de consumo ────────────────────────────────────────────────────────
  const agua = await prisma.tipoConsumo.upsert({
    where: { nome: 'Água' },
    update: {},
    create: { nome: 'Água', unidadeMedida: 'm³' },
  });

  const energia = await prisma.tipoConsumo.upsert({
    where: { nome: 'Energia' },
    update: {},
    create: { nome: 'Energia', unidadeMedida: 'kWh' },
  });

  console.log(`Tipo "Água" (id=${agua.id}), "Energia" (id=${energia.id}) OK.`);

  // ── Dicas ───────────────────────────────────────────────────────────────────
  // Estratégia: busca dicas existentes e insere apenas as que ainda não existem,
  // comparando pelo título. Seguro para re-execuções sem precisar de @@unique no schema.
  const dicasParaInserir = [
    {
      titulo: 'Reduza o tempo de banho',
      descricao:
        'Tomar banhos mais curtos pode economizar até 40 litros de água por minuto. Tente reduzir em 2 minutos e economize mais de 80 litros por banho.',
      categoria: 'Agua',
      nivelRelevancia: 'Alta',
      tipoConsumoId: agua.id,
    },
    {
      titulo: 'Feche a torneira ao escovar os dentes',
      descricao:
        'Deixar a torneira aberta durante a escovação desperdiça cerca de 12 litros de água por minuto. Molhe a escova, feche e abra somente para enxaguar.',
      categoria: 'Agua',
      nivelRelevancia: 'Alta',
      tipoConsumoId: agua.id,
    },
    {
      titulo: 'Use a lavadora com carga completa',
      descricao:
        'Máquinas de lavar roupas consomem em média 100 litros por ciclo. Utilize sempre com a capacidade máxima para otimizar o consumo de água e energia.',
      categoria: 'Agua',
      nivelRelevancia: 'Media',
      tipoConsumoId: agua.id,
    },
    {
      titulo: 'Reutilize a água de chuva',
      descricao:
        'A água da chuva captada em reservatórios pode ser usada para regar plantas, lavar o quintal e até descarregar o vaso sanitário, reduzindo o consumo da rede.',
      categoria: 'Agua',
      nivelRelevancia: 'Media',
      tipoConsumoId: agua.id,
    },
    {
      titulo: 'Verifique vazamentos regularmente',
      descricao:
        'Um vazamento de apenas 1 gota por segundo desperdiça mais de 30 litros de água por dia. Verifique torneiras, válvulas e encanamentos periodicamente.',
      categoria: 'Agua',
      nivelRelevancia: 'Alta',
      tipoConsumoId: agua.id,
    },
    {
      titulo: 'Evite aparelhos em modo standby',
      descricao:
        'Televisores, computadores e carregadores em standby podem representar até 10% da conta de energia. Desligue-os completamente ou use filtros de linha com chave.',
      categoria: 'Energia',
      nivelRelevancia: 'Alta',
      tipoConsumoId: energia.id,
    },
    {
      titulo: 'Aproveite a luz natural',
      descricao:
        'Mantenha cortinas abertas durante o dia e posicione mesas de trabalho próximas a janelas. Isso reduz significativamente o uso de iluminação artificial.',
      categoria: 'Energia',
      nivelRelevancia: 'Alta',
      tipoConsumoId: energia.id,
    },
    {
      titulo: 'Troque lâmpadas incandescentes por LED',
      descricao:
        'Lâmpadas LED consomem até 80% menos energia que as incandescentes e duram muito mais. A troca se paga em poucos meses de uso.',
      categoria: 'Energia',
      nivelRelevancia: 'Alta',
      tipoConsumoId: energia.id,
    },
    {
      titulo: 'Ajuste a temperatura do ar-condicionado',
      descricao:
        'Cada grau abaixo de 23°C aumenta o consumo de energia em cerca de 8%. Mantenha o ar-condicionado entre 23°C e 24°C para um equilíbrio entre conforto e economia.',
      categoria: 'Energia',
      nivelRelevancia: 'Media',
      tipoConsumoId: energia.id,
    },
    {
      titulo: 'Prefira transporte sustentável',
      descricao:
        'Optar por caminhadas, bicicleta ou transporte público reduz a emissão de carbono e contribui para um ambiente mais saudável nas cidades.',
      categoria: 'Geral',
      nivelRelevancia: 'Media',
      tipoConsumoId: null,
    },
    {
      titulo: 'Reduza o uso de descartáveis',
      descricao:
        'Substitua copos, talheres e embalagens descartáveis por versões reutilizáveis. Pequenas mudanças de hábito têm grande impacto na redução de resíduos.',
      categoria: 'Geral',
      nivelRelevancia: 'Media',
      tipoConsumoId: null,
    },
    {
      titulo: 'Faça a compostagem dos resíduos orgânicos',
      descricao:
        'Transformar restos de alimentos em adubo reduz o volume de lixo enviado aos aterros e ainda gera fertilizante natural para plantas e jardins.',
      categoria: 'Geral',
      nivelRelevancia: 'Baixa',
      tipoConsumoId: null,
    },
  ];

  // Busca títulos já existentes para evitar duplicatas em re-execuções
  const titulosExistentes = new Set(
    (await prisma.dica.findMany({ select: { titulo: true } })).map((d) => d.titulo)
  );

  const novasDicas = dicasParaInserir.filter((d) => !titulosExistentes.has(d.titulo));

  if (novasDicas.length > 0) {
    await prisma.dica.createMany({ data: novasDicas });
    console.log(`${novasDicas.length} dica(s) inserida(s).`);
  } else {
    console.log('Dicas já existem — nenhuma inserção necessária.');
  }

  // ── Usuário de demonstração ─────────────────────────────────────────────────
  const senhaHash = await bcrypt.hash('Demo@1234', 10);
  await prisma.usuario.upsert({
    where: { email: 'demo@consumoconsciente.com' },
    update: {},
    create: {
      nome: 'Usuário Demo',
      email: 'demo@consumoconsciente.com',
      senha: senhaHash,
    },
  });

  console.log('');
  console.log('✅ Seed concluído com sucesso!');
  console.log('');
  console.log('Credenciais de demonstração:');
  console.log('  E-mail : demo@consumoconsciente.com');
  console.log('  Senha  : Demo@1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
