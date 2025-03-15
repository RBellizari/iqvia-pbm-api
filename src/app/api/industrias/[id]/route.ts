import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Definindo a interface para os parâmetros
interface RouteParams {
  params: {
    id: string;
  }
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const id = params.id;
    
    const industrias = await query(
      'SELECT * FROM industrias WHERE id = $1',
      [id]
    );
    
    if (industrias.length === 0) {
      return NextResponse.json(
        { error: 'Indústria não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(industrias[0]);
  } catch (error) {
    console.error('Erro ao buscar indústria:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar indústria' },
      { status: 500 }
    );
  }
}

// Mesmo padrão para outros métodos HTTP
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Resto do código...
    
    return NextResponse.json({ /* resposta */ });
  } catch (error) {
    console.error('Erro ao atualizar indústria:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar indústria' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const id = params.id;
    
    // Resto do código...
    
    return NextResponse.json({ /* resposta */ });
  } catch (error) {
    console.error('Erro ao excluir indústria:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir indústria' },
      { status: 500 }
    );
  }
}