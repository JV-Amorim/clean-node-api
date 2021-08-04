import { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols';
import { LogControllerDecorator } from './log';
import { serverError } from '../../presentation/helpers/http-helper';
import { LogErrorRepository } from '../../data/protocols/log-error-repository';

const makeController = (): Controller => {
  class ControllerStub implements Controller {
    async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
      const httpResponse = {
        statusCode: 200,
        body: {
          name: 'any_name'
        }
      };
      return Promise.resolve(httpResponse);
    }
  }
  return new ControllerStub();
};

const makeLogErrorRepository = (): LogErrorRepository => {
  class LogErrorRepositoryStub implements LogErrorRepository {
    async log (stack: string): Promise<void> {
      return Promise.resolve();
    }
  }
  return new LogErrorRepositoryStub();
};

interface SutType {
  sut: LogControllerDecorator;
  controllerStub: Controller;
  logErrorRepositoryStub: LogErrorRepository;
}

const makeSut = (): SutType => {
  const controllerStub = makeController();
  const logErrorRepositoryStub = makeLogErrorRepository();
  const sut = new LogControllerDecorator(controllerStub, logErrorRepositoryStub);
  return { sut, controllerStub, logErrorRepositoryStub };
};

describe('LogController Decorator', () => {
  test('Should call controller handle', async () => {
    const { sut, controllerStub } = makeSut();
    const handleSpy = jest.spyOn(controllerStub, 'handle');
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    };
    await sut.handle(httpRequest);
    expect(handleSpy).toHaveBeenCalledWith(httpRequest);
  });

  test('Should return the same result of the controller handle', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    };
    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual({
      statusCode: 200,
      body: {
        name: 'any_name'
      }
    });
  });

  test('Should call LogErrorRepository with correct error if controller returns a server error', async () => {
    const { sut, controllerStub, logErrorRepositoryStub } = makeSut();
    const logSpy = jest.spyOn(logErrorRepositoryStub, 'log');

    const fakeError = new Error();
    fakeError.stack = 'any_stack';
    const error = serverError(fakeError);
    jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(Promise.resolve(error));

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    };
    await sut.handle(httpRequest);
    expect(logSpy).toHaveBeenCalledWith('any_stack');
  });
});
