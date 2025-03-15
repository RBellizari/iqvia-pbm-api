import { neon } from '@neondatabase/serverless';

// Função para obter uma conexão com o banco de dados
export const sql = neon(process.env.DATABASE_URL!);

// Função auxiliar para executar consultas SQL
export async function query(sql: string, params: any[] = []) {
  try {
    return await sql(sql, params);
  } catch (error) {
    console.error('Erro na consulta SQL:', error);
    throw error;
  }
}