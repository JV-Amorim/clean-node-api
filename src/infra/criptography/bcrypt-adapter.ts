import bcrypt from 'bcrypt';
import { Encrypter } from '../../data/protocols/encrypter';

export class BcryptAdapter implements Encrypter {
  constructor (private readonly saltOrRounds: string | number) { }

  async encrypt (value: string): Promise<string> {
    const hash = await bcrypt.hash(value, this.saltOrRounds);
    return hash;
  }
}
