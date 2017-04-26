import * as express from 'express';

export type HttpMethods = 'all' | 'get' | 'post' | 'put' | 'head' | 'delete' | 'options' | 'trace' | 'copy' | 'lock' | 'mkcol' | 'move' | 'purge' | 'propfind' | 'proppatch' | 'unlock' | 'report' | 'mkactivity' | 'checkout' | 'merge' | 'm-search' | 'notify' | 'subscribe' | 'unsubscribe' | 'patch' | 'search' | 'connect' |
'GET' | 'POST' | 'PUT' | 'HEAD' | 'DELETE' | 'OPTIONS' | 'TRACE' | 'COPY' | 'LOCK' | 'MKCOL' | 'MOVE' | 'PURGE' | 'PROPFIND' | 'PROPPATCH' | 'UNLOCK' | 'REPORT' | 'MKACTIVITY' | 'CHECKOUT' | 'MERGE' | 'M-SEARCH' | 'NOTIFY' | 'SUBSCRIBE' | 'UNSUBSCRIBE' | 'PATCH' | 'SEARCH' | 'CONNECT';

const ROOT_ROUTE = 'ROOT_ROUTE';
const PATH_ROUTE = 'PATH_ROUTE';
const HTTP_METHOD = 'HTTP_METHOD';
const MIDDLEWARE = 'MIDDLEWARE';
const startsWithForwardSlashRegExp = /^\//;

/**
 * Class decorator used to define the router's mounting point.
 * @param rootRoute - router's mounting point (as known from Express: `app.use('/mountingpoint', router)`).
 */
export function Root (rootRoute: string) {
  return function (target) {
    target[ROOT_ROUTE] = rootRoute;
  }
}

/**
 * Methods decorator that defines the routes within router's instance.
 * @param pathRoute - defines the url path (obeying exactly the same rules as in barebones Express).
 * @param httpMethod - defines the url path (obeying exactly the same rules as in barebones Express).
 */
export function Path (pathRoute: string | RegExp, httpMethod?: HttpMethods) {
  return function (target: any, propertyKey: string) {
    target[propertyKey][PATH_ROUTE] = pathRoute;
    target[propertyKey][HTTP_METHOD] = (httpMethod || 'get').toLowerCase();
  }
}

/**
 * Methods decorator that defines the routes within router's instance.
 */
export function Use (target, propertyKey: string) {
  target[propertyKey][MIDDLEWARE] = true;
}

/**
 * Attaches the router controllers to the main express application instance.
 * @param app - express application instance (result of call to `express()`)
 * @param controllers - controller classes (rest parameter) decorated with @Root and @Path/@Use
 */
export function bindControllers (app: express.Express, ...controllers: Function[]) {
  for (const Clazz of controllers) {
    const router = express.Router();
    const instance = new (<any> Clazz)();

    const rootRoute = Clazz[ROOT_ROUTE];
    if (!rootRoute || !startsWithForwardSlashRegExp.test(rootRoute)) {
      // TODO test it
      throw new Error('Class-level \'@Root\' decorator must be used with single string argument starting with forward slash (eg. \'/\' or \'/myRoot\')!');
    }
    
    // @Use
    const middlewareDeclarationMethods = getClassMethodsByDecoratedProperty(Clazz, MIDDLEWARE);
    middlewareDeclarationMethods.forEach(middlewareDeclarationMethod => {
      router.use(instance[middlewareDeclarationMethod].bind(instance));
    });
    
    // @Path
    const pathRouteMethods = getClassMethodsByDecoratedProperty(Clazz, PATH_ROUTE);
    pathRouteMethods.forEach(pathRouteMethod => {
      const {PATH_ROUTE, HTTP_METHOD} = instance[pathRouteMethod];
      router[HTTP_METHOD](PATH_ROUTE, instance[pathRouteMethod].bind(instance));
    });

    app.use(rootRoute, router);
  }
}

/**
 * Recursively (taking into account super classes) find names of the methods, that were decorated with given property, in a class.
 * @param clazz - target class
 * @param decoratedPropertyName - name of the property known to be added by decorator, eg. 'ROOT_ROUTE'
 * @param foundMethodsNames - array of methods names found (useful when concatenating results of recursive search through superclasses)
 */
function getClassMethodsByDecoratedProperty (clazz, decoratedPropertyName: string, foundMethodsNames: string[] = []): string[] {
  const clazzMethods = foundMethodsNames.concat(
    Object.getOwnPropertyNames(clazz.prototype)
      .filter(functionName => functionName !== 'constructor')
      .filter(functionName => clazz.prototype[functionName][decoratedPropertyName] !== undefined)
  );
  
  const parentClazz = Object.getPrototypeOf(clazz);
  if (parentClazz.name !== '') {
    return getClassMethodsByDecoratedProperty(parentClazz, decoratedPropertyName, clazzMethods);
  }
  // returns an array of *unique* method names
  return clazzMethods.filter((methodName, index, array) => array.indexOf(methodName) === index);
}
