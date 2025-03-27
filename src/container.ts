import { NextFunction, Request, RequestHandler, Response } from 'express'
import 'reflect-metadata'

/**
 * Enhanced Dependency Injection Container with improved error handling,
 * caching, and lifecycle management
 */
class Container {
  private static dependencies: Map<any, any> = new Map()
  private static singletons: Map<any, any> = new Map()

  /**
   * Register a dependency with the container
   * @param key The identifier for the dependency (usually a class constructor)
   * @param instance The implementation or factory function
   * @param singleton Whether this dependency should be treated as a singleton
   */
  static register(key: any, instance: any, singleton: boolean = true) {
    this.dependencies.set(key, { instance, singleton })
  }

  /**
   * Resolve a dependency from the container
   * @param key The identifier for the dependency to resolve
   * @returns The resolved instance
   */
  static resolve<T>(key: any): T {
    // Check if we've already created a singleton instance
    if (this.singletons.has(key)) {
      return this.singletons.get(key)
    }

    const dependency = this.dependencies.get(key)
    if (!dependency) {
      throw new Error(`No dependency found for ${key?.name || String(key)}`)
    }

    const { instance, singleton } = dependency

    // If it's a factory function, create a new instance with its dependencies
    let resolvedInstance: T
    if (typeof instance === 'function') {
      resolvedInstance = this.createInstance(instance)

      // Cache singleton instances
      if (singleton) {
        this.singletons.set(key, resolvedInstance)
      }
    } else {
      resolvedInstance = instance
    }

    return resolvedInstance
  }

  /**
   * Create an instance of a class with its dependencies resolved
   * @param Constructor The class constructor
   * @returns A new instance with dependencies injected
   */
  private static createInstance<T>(Constructor: new (...args: any[]) => T): T {
    try {
      const paramTypes = Reflect.getMetadata('design:paramtypes', Constructor) || []
      const dependencies = paramTypes.map((param: any) => this.resolve(param))
      return new Constructor(...dependencies)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error creating instance of ${Constructor.name}: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Clear all registered dependencies and singletons
   */
  static clear() {
    this.dependencies.clear()
    this.singletons.clear()
  }
}

/**
 * Middleware factory that resolves a controller instance and binds a method to it
 * @param controllerClass The controller class to resolve
 * @param method The method name to call on the controller
 * @returns Express middleware function
 */
export function resolveController<T>(
  controllerClass: new (...args: any[]) => T,
  method: keyof T
): (req: Request, res: Response, next: NextFunction) => void {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const controller = Container.resolve<T>(controllerClass)
      const handler = controller[method] as unknown as RequestHandler

      if (typeof handler !== 'function') {
        throw new Error(`Method ${String(method)} is not a function on ${controllerClass.name}`)
      }

      // Support for async controller methods
      await Promise.resolve(handler.call(controller, req, res, next)).catch(next)
    } catch (error) {
      next(error)
    }
  }
}

export default Container
