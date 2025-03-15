import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Seu código aqui
    const id = params.id;
    
    // Resto do código...
    
    return NextResponse.json({ /* seus dados */ });
  } catch (error) {
    console.error('Erro ao buscar indústria:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar indústria' },
      { status: 500 }
    );
  }
}