import { NextFunction, Request, RequestHandler, Response } from 'express'
import asyncHandler from './middleware/asyncHandler'

class Container {
  private static dependencies: Map<any, any> = new Map()

  // Đăng ký dependency
  static register(key: any, instance: any) {
    this.dependencies.set(key, instance)
  }

  // Lấy instance của dependency
  static resolve<T>(key: any): T {
    const instance = this.dependencies.get(key)
    if (!instance) {
      throw new Error(`No dependency found for ${key.name}`)
    }

    // Nếu là class, khởi tạo instance với các dependency của nó
    if (typeof instance === 'function') {
      const resolvedInstance = this.createInstance(instance)
      this.dependencies.set(key, resolvedInstance)
      return resolvedInstance
    }
    return instance
  }

  // Tạo instance từ class với các dependency
  private static createInstance(constructor: any): any {
    const paramTypes = Reflect.getMetadata('design:paramtypes', constructor) || []
    const dependencies = paramTypes.map((param: any) => this.resolve(param))
    return new constructor(...dependencies)
  }
}

export default Container

export function resolveInstance<T>(controllerClass: new (...args: any[]) => T, method: keyof T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const controller = Container.resolve<T>(controllerClass)
    const handler = asyncHandler((controller[method] as RequestHandler).bind(controller))
    if (typeof handler === 'function') {
      handler.call(controller, req, res, next)
    } else {
      throw new Error(`Method ${String(method)} is not a function`)
    }
  }
}
