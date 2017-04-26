import test from 'ava';
import * as sinon from 'sinon';
import * as express from 'express';
import { Root, Path, Use, bindControllers } from './index';

test('@Root should add static "ROOT_ROUTE" property to class', t => {
  const rootRoute = '/root';

  @Root(rootRoute)
  class Target {}

  t.true(Target['ROOT_ROUTE'] === rootRoute);
});

test('@Path with 1 arg should add "PATH_ROUTE" property to method and default "HTTP_METHOD" equal to "get"', t => {
  const path = '/path';

  class Target {
    @Path(path)
    method () {}
  }

  t.true(Target.prototype.method['PATH_ROUTE'] === path);
  t.true(Target.prototype.method['HTTP_METHOD'] === 'get');
});

test('@Path with 2 args should add "PATH_ROUTE" & "HTTP_METHOD" properties to method', t => {
  const path = '/path';
  const httpMethod = 'put';

  class Target {
    @Path(path, httpMethod)
    method () {}
  }

  t.true(Target.prototype.method['PATH_ROUTE'] === path);
  t.true(Target.prototype.method['HTTP_METHOD'] === httpMethod);
});

test('@Use should mark the method as router middleware by adding "MIDDLEWARE" property', t => {
  class Target {
    @Use
    method () {}
  }

  t.true(Target.prototype.method['MIDDLEWARE']);
});

test('bindControllers should add the controller to the app at given root path', t => {
  const appMock = {
    use: sinon.spy()
  };
  const rootRoute = '/root';

  @Root(rootRoute)
  class Target {}

  bindControllers(appMock as express.Express, Target);

  t.true(appMock.use.calledWith(rootRoute, sinon.match.any));
});

test('bindControllers should throw an Error if \'@Root\' decorator was not used on a class', t => {
  const appMock = {};

  class Target {}

  t.throws(() => bindControllers(appMock as express.Express, Target), Error);
});
