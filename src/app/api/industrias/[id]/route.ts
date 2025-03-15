import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';

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

// Interface para PBM
interface PBM {
  id: number;
  nome: string;
  codigo_gestor: string;
  cnpj: string;
  nome_programa: string | null;
  descricao: string | null;
  logo_url: string | null;
  data_inicio: string | null;
  data_fim: string | null;
  ativo: boolean;
}

// Interface para Produto
interface Produto {
  id: number;
  ean: string;
  nome_produto: string;
  descricao_produto: string | null;
  url_imagem: string | null;
  ativo: boolean;
}

// GET - Obter uma indústria específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Buscar indústria
    const industria = await queryOne<Industria>(`
      SELECT id, nome, codigo_gestor, cnpj, razao_social, endereco, cidade, estado, 
             cep, telefone, email, website, logo_url, data_cadastro, ativo
      FROM industrias
      WHERE id = $1
    `, [id]);
    
    if (!industria) {
      return NextResponse.json(
        { error: 'Indústria não encontrada' },
        { status: 404 }
      );
    }
    
    // Buscar PBMs associados a esta indústria
    const pbms = await query<PBM>(`
      SELECT id, nome, codigo_gestor, cnpj, nome_programa, descricao, 
             logo_url, data_inicio, data_fim, ativo
      FROM pbms
      WHERE industria_id = $1 AND ativo = true
    `, [id]);
    
    // Buscar produtos associados a esta indústria
    const produtos = await query<Produto>(`
      SELECT id, ean, nome_produto, descricao_produto, url_imagem, ativo
      FROM produtos
      WHERE industria_id = $1 AND ativo = true
      LIMIT 10
    `, [id]);
    
    // Retornar indústria com seus relacionamentos
    return NextResponse.json({
      ...industria,
      pbms,
      produtos
    });
  } catch (error) {
    console.error('Erro ao buscar indústria:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar indústria' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar uma indústria
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Verificar se a indústria existe
    const industria = await queryOne('SELECT id FROM industrias WHERE id = $1', [id]);
    
    if (!industria) {
      return NextResponse.json(
        { error: 'Indústria não encontrada' },
        { status: 404 }
      );
    }
    
    // Se estiver atualizando o código gestor, verificar se já existe
    if (body.codigo_gestor) {
      const codigoExistente = await query(
        'SELECT id FROM industrias WHERE codigo_gestor = $1 AND id != $2',
        [body.codigo_gestor, id]
      );
      
      if (codigoExistente.length > 0) {
        return NextResponse.json(
          { error: 'Código gestor já está em uso' },
          { status: 400 }
        );
      }
    }
    
    // Se estiver atualizando o CNPJ, verificar se já existe
    if (body.cnpj) {
      const cnpjExistente = await query(
        'SELECT id FROM industrias WHERE cnpj = $1 AND id != $2',
        [body.cnpj, id]
      );
      
      if (cnpjExistente.length > 0) {
        return NextResponse.json(
          { error: 'CNPJ já está em uso' },
          { status: 400 }
        );
      }
    }
    
    // Atualizar indústria
    const result = await query<Industria>(`
      UPDATE industrias
      SET nome = COALESCE($1, nome),
          codigo_gestor = COALESCE($2, codigo_gestor),
          cnpj = COALESCE($3, cnpj),
          razao_social = $4,
          endereco = $5,
          cidade = $6,
          estado = $7,
          cep = $8,
          telefone = $9,
          email = $10,
          website = $11,
          logo_url = $12,
          ativo = COALESCE($13, ativo)
      WHERE id = $14
      RETURNING id, nome, codigo_gestor, cnpj, razao_social, cidade, estado, 
                email, website, logo_url, data_cadastro, ativo
    `, [
      body.nome || null,
      body.codigo_gestor || null,
      body.cnpj || null,
      body.razao_social !== undefined ? body.razao_social : null,
      body.endereco !== undefined ? body.endereco : null,
      body.cidade !== undefined ? body.cidade : null,
      body.estado !== undefined ? body.estado : null,
      body.cep !== undefined ? body.cep : null,
      body.telefone !== undefined ? body.telefone : null,
      body.email !== undefined ? body.email : null,
      body.website !== undefined ? body.website : null,
      body.logo_url !== undefined ? body.logo_url : null,
      body.ativo !== undefined ? body.ativo : null,
      id
    ]);
    
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao atualizar indústria:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar indústria' },
      { status: 500 }
    );
  }
}

// DELETE - Desativar uma indústria (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Verificar se a indústria existe
    const industria = await queryOne('SELECT id FROM industrias WHERE id = $1', [id]);
    
    if (!industria) {
      return NextResponse.json(
        { error: 'Indústria não encontrada' },
        { status: 404 }
      );
    }
    
    // Desativar indústria (soft delete)
    await execute('UPDATE industrias SET ativo = false WHERE id = $1', [id]);
    
    return NextResponse.json({ message: 'Indústria desativada com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar indústria:', error);
    return NextResponse.json(
      { error: 'Erro ao desativar indústria' },
      { status: 500 }
    );
  }
}