# express-router-decorators

Write your Express (4+) routers declaratively with ES2015 classes and ES decorators.
TypeScript and Babel supported.

## Example

Using express-router-decorators, you can define your Router controller as ES2015 class, which lets you keep cleaner and well-readable code. Remember to add `@Root` decorator to the class - this is a 'mounting point' of your router.
Particular paths in your router are defined using `@Path` decorator, which takes the path param (either string or regexp, as supported by Express) as its first argument. Second argument expects an http method name (string), but it is optional and defaults to `'get'` ([see the list of all http methods supported by express](https://expressjs.com/en/4x/api.html#routing-methods)).

```javascript
import * as express from 'express';
import { bindControllers, Root, Path } from 'express-router-decorators';

const app = express();

@Root('/greet')
class Greeter {

  @Path('/hello')
  hello (req, res) {
    res.json({greeting: 'hello!'});
  }
}

bindControllers(app, Greeter);

app.listen(1221, () => console.log('server ready at localhost:1221'));
```

Inheritance is also supported. You can extend your router classes with other classes!
The router created with `Greeter` class below will also have `/hola` route (inherited from `SpanishGreeter` class).

```javascript
class SpanishGreeter {
  @Path('/hola')
  hola (req, res) {
    res.json({greeting: 'hola!'});
  }
}

@Root('/greet')
class Greeter extends SpanishGreeter {

  @Path('/hello')
  hello (req, res) {
    res.json({greeting: 'hello!'});
  }
}
```

## Installation
`npm install express-router-decorators --save`

## Configuration

### TypeScript:
Make sure to add following two lines in the `"compilerOptions"` of your `tsconfig.json` file:
```
"experimentalDecorators": true,
"emitDecoratorMetadata": true
```

### Babel:
You will need `"transform-decorators-legacy"` plugin (`npm install babel-plugin-transform-decorators-legacy --save-dev`) in your `.babelrc` file, eg:
```json
{
  "presets": ["es2015", "stage-2"],
  "plugins": ["transform-decorators-legacy"]
}
```

## API

**`@Root(rootRoute: string)`** - class decorator used to define the router's mounting point.
- `rootRoute: string` - router's mounting point (as known from Express: `app.use('/mountingpoint', router)`).

**`@Path(pathRoute: string | RegExp, httpMethod?: string)`** - methods decorator that defines the routes within router's instance.
- `pathRoute: string | RegExp` - defines the url path (obeying exactly the same rules as in barebones Express).
- `httpMethod?: string` - (optional) defines the HTTP method for given path ([see the list of all http methods supported by express](https://expressjs.com/en/4x/api.html#routing-methods)). Defaults to `'get'`.

**`@Use`** - methods decorator that defines the router's specific middleware. Takes no arguments.

**`bindControllers(app: Express, ...clazz: Function[])`** - the 'main' function that 'connects' the router(s) class(es) to the Express application's instance.
- `app: Express` - Express application's instance (eg. `const app = express()`).
- `...clazz: Function[]` - (rest-parameters style) router class(es) decorated with `@Root` and `@Path`/`@Use` (see example).

## License
MIT
