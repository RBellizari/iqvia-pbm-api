import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Interface para o usuário
interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  perfil: string;
  industria_id: number | null;
  farmacia_id: number | null;
  pbm_id: number | null;
  industria_codigo: string | null;
  farmacia_codigo: string | null;
  pbm_codigo: string | null;
  ativo: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.email || !body.senha) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Buscar usuário pelo email
    const usuario = await queryOne<Usuario>(`
      SELECT u.id, u.nome, u.email, u.senha, u.perfil, 
             u.industria_id, u.farmacia_id, u.pbm_id,
             i.codigo_gestor as industria_codigo,
             f.codigo_gestor as farmacia_codigo,
             p.codigo_gestor as pbm_codigo,
             u.ativo
      FROM usuarios u
      LEFT JOIN industrias i ON u.industria_id = i.id
      LEFT JOIN farmacias f ON u.farmacia_id = f.id
      LEFT JOIN pbms p ON u.pbm_id = p.id
      WHERE u.email = $1
    `, [body.email]);
    
    if (!usuario || !usuario.ativo) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }
    
    // Verificar senha
    const senhaCorreta = await bcrypt.compare(body.senha, usuario.senha);
    
    if (!senhaCorreta) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }
    
    // Atualizar último acesso
    await execute(
      'UPDATE usuarios SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = $1',
      [usuario.id]
    );
    
    // Gerar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        industria_id: usuario.industria_id,
        farmacia_id: usuario.farmacia_id,
        pbm_id: usuario.pbm_id,
        industria_codigo: usuario.industria_codigo,
        farmacia_codigo: usuario.farmacia_codigo,
        pbm_codigo: usuario.pbm_codigo
      },
      process.env.JWT_SECRET || 'seu_segredo_jwt',
      { expiresIn: '8h' }
    );
    
    // Remover senha do objeto de resposta
    const { senha, ...usuarioSemSenha } = usuario;
    
    return NextResponse.json({
      usuario: usuarioSemSenha,
      token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro no login' },
      { status: 500 }
    );
  }
}

// Importar a função execute que esqueci de incluir
import { execute } from '@/lib/db';