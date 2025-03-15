import { neon } from '@neondatabase/serverless';

// Tipos para parâmetros SQL válidos
type SqlPrimitive = string | number | boolean | null | Date | Buffer;
type SqlParameter = SqlPrimitive | SqlPrimitive[] | Record<string, SqlPrimitive>;

// Interface para resultados de consulta genéricos
interface DbRecord {
  [column: string]: unknown;
}

// Inicializa a conexão com o banco de dados
const neonClient = neon(process.env.DATABASE_URL!);

/**
 * Executa uma consulta SQL e retorna os resultados tipados.
 * @param text - O texto da consulta SQL
 * @param parameters - Os parâmetros para a consulta SQL
 * @returns Uma Promise que resolve para um array de resultados tipados
 */
export async function query<T = DbRecord>(
  text: string, 
  parameters: SqlParameter[] = []
): Promise<T[]> {
  try {
    return await neonClient(text, parameters) as T[];
  } catch (error) {
    console.error('Erro na consulta SQL:', error);
    throw error;
  }
}

/**
 * Executa uma única consulta SQL e retorna o primeiro resultado.
 * @param text - O texto da consulta SQL
 * @param parameters - Os parâmetros para a consulta SQL
 * @returns Uma Promise que resolve para um único resultado tipado ou null se não houver resultados
 */
export async function queryOne<T = DbRecord>(
  text: string, 
  parameters: SqlParameter[] = []
): Promise<T | null> {
  const results = await query<T>(text, parameters);
  return results.length > 0 ? results[0] : null;
}

/**
 * Executa uma consulta SQL que não retorna resultados (INSERT, UPDATE, DELETE).
 * @param text - O texto da consulta SQL
 * @param parameters - Os parâmetros para a consulta SQL
 * @returns Uma Promise que resolve para o número de linhas afetadas
 */
export async function execute(
  text: string, 
  parameters: SqlParameter[] = []
): Promise<number> {
  try {
    const result = await neonClient(text, parameters);
    return Array.isArray(result) ? result.length : 0;
  } catch (error) {
    console.error('Erro na execução SQL:', error);
    throw error;
  }
}

/**
 * Executa várias consultas SQL em uma única transação.
 * @param callback - Uma função que recebe um objeto de transação e executa consultas
 * @returns Uma Promise que resolve para o resultado do callback
 */
export async function transaction<T>(
  callback: (tx: { 
    query: typeof query, 
    queryOne: typeof queryOne, 
    execute: typeof execute 
  }) => Promise<T>
): Promise<T> {
  try {
    // Iniciar transação
    await neonClient('BEGIN');
    
    // Criar objeto de transação
    const tx = {
      query,
      queryOne,
      execute
    };
    
    // Executar callback
    const result = await callback(tx);
    
    // Confirmar transação
    await neonClient('COMMIT');
    
    return result;
  } catch (error) {
    // Reverter transação em caso de erro
    await neonClient('ROLLBACK');
    console.error('Erro na transação SQL:', error);
    throw error;
  }
}

// Exportar o cliente Neon diretamente para casos de uso avançados
export const sql = neonClient;