import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    login: jest.fn().mockResolvedValue({ access_token: 'signed-token' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('POST /auth/login: deve delegar para AuthService.login e retornar o token', async () => {
    const body = { username: 'arthur', password: '123' } as any;

    const res = await controller.login(body);

    expect(authServiceMock.login).toHaveBeenCalledTimes(1);
    expect(authServiceMock.login).toHaveBeenCalledWith({
      id: 1,
      username: 'arthur',
    });
    expect(res).toEqual({ access_token: 'signed-token' });
  });
});
