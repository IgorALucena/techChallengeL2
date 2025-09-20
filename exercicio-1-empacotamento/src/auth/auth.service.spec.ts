import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const jwtSignMock = jest.fn().mockReturnValue('signed-token');
  const jwtServiceMock = { sign: jwtSignMock };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('login: deve assinar o payload e retornar { access_token }', async () => {
    const user = { id: 1, username: 'arthur' };
    const res = await service.login(user);

    expect(jwtSignMock).toHaveBeenCalledTimes(1);
    expect(jwtSignMock).toHaveBeenCalledWith({ sub: 1, username: 'arthur' });

    expect(res).toEqual({ access_token: 'signed-token' });
  });
});
