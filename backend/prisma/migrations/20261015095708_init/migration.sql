-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_consumo" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "unidadeMedida" TEXT NOT NULL,

    CONSTRAINT "tipos_consumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumos" (
    "id" SERIAL NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "periodo" TEXT NOT NULL,
    "valorPago" DOUBLE PRECISION,
    "dataRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "tipoConsumoId" INTEGER NOT NULL,

    CONSTRAINT "consumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analises_consumo" (
    "id" SERIAL NOT NULL,
    "consumoCalculado" DOUBLE PRECISION NOT NULL,
    "mediaConsumo" DOUBLE PRECISION,
    "variacaoConsumo" DOUBLE PRECISION,
    "classificacao" TEXT,
    "observacao" TEXT,
    "dataAnalise" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consumoId" INTEGER NOT NULL,

    CONSTRAINT "analises_consumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dicas" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "nivelRelevancia" TEXT,
    "tipoConsumoId" INTEGER,

    CONSTRAINT "dicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AnaliseConsumoToDica" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_consumo_nome_key" ON "tipos_consumo"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "analises_consumo_consumoId_key" ON "analises_consumo"("consumoId");

-- CreateIndex
CREATE UNIQUE INDEX "_AnaliseConsumoToDica_AB_unique" ON "_AnaliseConsumoToDica"("A", "B");

-- CreateIndex
CREATE INDEX "_AnaliseConsumoToDica_B_index" ON "_AnaliseConsumoToDica"("B");

-- AddForeignKey
ALTER TABLE "consumos" ADD CONSTRAINT "consumos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumos" ADD CONSTRAINT "consumos_tipoConsumoId_fkey" FOREIGN KEY ("tipoConsumoId") REFERENCES "tipos_consumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analises_consumo" ADD CONSTRAINT "analises_consumo_consumoId_fkey" FOREIGN KEY ("consumoId") REFERENCES "consumos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dicas" ADD CONSTRAINT "dicas_tipoConsumoId_fkey" FOREIGN KEY ("tipoConsumoId") REFERENCES "tipos_consumo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnaliseConsumoToDica" ADD CONSTRAINT "_AnaliseConsumoToDica_A_fkey" FOREIGN KEY ("A") REFERENCES "analises_consumo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnaliseConsumoToDica" ADD CONSTRAINT "_AnaliseConsumoToDica_B_fkey" FOREIGN KEY ("B") REFERENCES "dicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
