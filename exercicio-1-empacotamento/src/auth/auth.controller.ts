import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ApiTags, ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: CreateAuthDto })
  @ApiResponse({
    status: 201,
    description: 'Login bem sucedido. Retorna um token JWT.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos. Username ou password não enviados.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas.',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor.',
  })
  @ApiOperation({ summary: 'Realizar login e obter token JWT' })
  @Post('login')
  async login(@Body() body: CreateAuthDto) {
    const user = { id: 1, username: body.username };
    return this.authService.login(user);
  }
}
