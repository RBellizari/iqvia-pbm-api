import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Interface para indústria
interface Industria {
  id: number;
  nome: string;
  codigo_gestor: string;
  cnpj: string;
  razao_social: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  telefone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  data_cadastro: string;
  ativo: boolean;
}

// GET - Listar todas as indústrias
export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros de consulta
    const { searchParams } = new URL(request.url);
    const nome = searchParams.get('nome');
    const codigoGestor = searchParams.get('codigo_gestor');
    const cnpj = searchParams.get('cnpj');
    const ativo = searchParams.get('ativo');
    
    // Construir consulta SQL base
    let sql = `
      SELECT id, nome, codigo_gestor, cnpj, razao_social, cidade, estado, 
             email, website, logo_url, data_cadastro, ativo
      FROM industrias
      WHERE 1=1
    `;
    
    // Array para armazenar os parâmetros
    const params: any[] = [];
    
    // Adicionar filtros se fornecidos
    if (nome) {
      params.push(`%${nome}%`);
      sql += ` AND nome ILIKE $${params.length}`;
    }
    
    if (codigoGestor) {
      params.push(codigoGestor);
      sql += ` AND codigo_gestor = $${params.length}`;
    }
    
    if (cnpj) {
      params.push(cnpj);
      sql += ` AND cnpj = $${params.length}`;
    }
    
    if (ativo !== null) {
      params.push(ativo === 'true');
      sql += ` AND ativo = $${params.length}`;
    } else {
      // Por padrão, mostrar apenas ativos
      params.push(true);
      sql += ` AND ativo = $${params.length}`;
    }
    
    // Adicionar ordenação
    sql += ` ORDER BY nome`;
    
    // Executar consulta
    const industrias = await query<Industria>(sql, params);
    
    return NextResponse.json(industrias);
  } catch (error) {
    console.error('Erro ao buscar indústrias:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar indústrias' },
      { status: 500 }
    );
  }
}

// POST - Criar uma nova indústria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.nome || !body.codigo_gestor || !body.cnpj) {
      return NextResponse.json(
        { error: 'Nome, código gestor e CNPJ são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Verificar se o código gestor já existe
    const codigoExistente = await query(
      'SELECT id FROM industrias WHERE codigo_gestor = $1',
      [body.codigo_gestor]
    );
    
    if (codigoExistente.length > 0) {
      return NextResponse.json(
        { error: 'Código gestor já está em uso' },
        { status: 400 }
      );
    }
    
    // Verificar se o CNPJ já existe
    const cnpjExistente = await query(
      'SELECT id FROM industrias WHERE cnpj = $1',
      [body.cnpj]
    );
    
    if (cnpjExistente.length > 0) {
      return NextResponse.json(
        { error: 'CNPJ já está em uso' },
        { status: 400 }
      );
    }
    
    // Inserir nova indústria
    const result = await query<Industria>(`
      INSERT INTO industrias (
        nome, codigo_gestor, cnpj, razao_social, endereco, cidade, estado, 
        cep, telefone, email, website, logo_url, ativo
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      ) RETURNING id, nome, codigo_gestor, cnpj, razao_social, cidade, estado, 
                email, website, logo_url, data_cadastro, ativo
    `, [
      body.nome,
      body.codigo_gestor,
      body.cnpj,
      body.razao_social || null,
      body.endereco || null,
      body.cidade || null,
      body.estado || null,
      body.cep || null,
      body.telefone || null,
      body.email || null,
      body.website || null,
      body.logo_url || null,
      body.ativo !== undefined ? body.ativo : true
    ]);
    
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar indústria:', error);
    return NextResponse.json(
      { error: 'Erro ao criar indústria' },
      { status: 500 }
    );
  }
}