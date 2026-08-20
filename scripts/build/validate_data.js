'use strict';

const fs = require('fs');
const path = require('path');
const { z } = require('zod');

const rootDir = path.join(__dirname, '..', '..');
const vagasPath = path.join(rootDir, 'src', 'data', 'vagas.json');
const amenitiesPath = path.join(rootDir, 'src', 'data', 'amenities.json');

const vagasSchema = z
  .object({
    year: z
      .string()
      .regex(
        /^\d{4}\.\d$/,
        'Formato de ano inválido (esperado: AAAA.S, ex: 2026.2)'
      ),
    total_slots: z
      .number()
      .int()
      .min(0, 'total_slots deve ser um número inteiro >= 0'),
    occupied_slots: z
      .number()
      .int()
      .min(0, 'occupied_slots deve ser um número inteiro >= 0'),
    room_type: z.string().min(1, 'room_type não pode ser vazio'),
  })
  .refine((data) => data.total_slots >= data.occupied_slots, {
    message:
      'total_slots deve ser maior ou igual a occupied_slots (vagas ocupadas não podem exceder o total)',
    path: ['occupied_slots'],
  });

const amenityItemSchema = z.object({
  iconPath: z.string().min(5, 'iconPath SVG inválido'),
  content: z.string().min(1, 'content não pode ser vazio'),
});

const amenitiesSchema = z
  .array(amenityItemSchema)
  .min(1, 'amenities.json deve conter pelo menos 1 item');

function validateAllData() {
  console.log('--- Validando Esquemas de Dados (Zod) ---');
  let hasError = false;

  // Validar vagas.json
  try {
    const rawVagas = JSON.parse(fs.readFileSync(vagasPath, 'utf8'));
    const result = vagasSchema.safeParse(rawVagas);
    if (!result.success) {
      console.error('❌ ERRO: Esquema inválido em src/data/vagas.json:');
      console.error(JSON.stringify(result.error.format(), null, 2));
      hasError = true;
    } else {
      console.log('✅ src/data/vagas.json validado com sucesso.');
    }
  } catch (err) {
    console.error(`❌ ERRO ao ler src/data/vagas.json: ${err.message}`);
    hasError = true;
  }

  // Validar amenities.json
  try {
    const rawAmenities = JSON.parse(fs.readFileSync(amenitiesPath, 'utf8'));
    const result = amenitiesSchema.safeParse(rawAmenities);
    if (!result.success) {
      console.error('❌ ERRO: Esquema inválido em src/data/amenities.json:');
      console.error(JSON.stringify(result.error.format(), null, 2));
      hasError = true;
    } else {
      console.log('✅ src/data/amenities.json validado com sucesso.');
    }
  } catch (err) {
    console.error(`❌ ERRO ao ler src/data/amenities.json: ${err.message}`);
    hasError = true;
  }

  if (hasError) {
    console.error('🛑 Validação de dados falhou!');
    process.exit(1);
  } else {
    console.log('✅ Todos os dados JSON estão válidos!');
  }
}

if (require.main === module) {
  validateAllData();
}

module.exports = {
  vagasSchema,
  amenitiesSchema,
  validateAllData,
};
