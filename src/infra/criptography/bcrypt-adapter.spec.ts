import bcrypt from 'bcrypt';
import { BcryptAdapter } from './bcrypt-adapter';

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
    return Promise.resolve('valid_hash');
  }
}));

describe('Bcrypt Adapter', () => {
  test('Should call Bcrypt with correct values', async () => {
    const rounds = 12;
    const sut = new BcryptAdapter(rounds);
    const hashSpy = jest.spyOn(bcrypt, 'hash');
    await sut.encrypt('any_value');
    expect(hashSpy).toHaveBeenCalledWith('any_value', rounds);
  });

  test('Should return a hash on success', async () => {
    const rounds = 12;
    const sut = new BcryptAdapter(rounds);
    const hash = await sut.encrypt('any_value');
    expect(hash).toBe('valid_hash');
  });
});
