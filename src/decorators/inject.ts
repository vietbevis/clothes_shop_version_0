import Container from '@/container'

export function Injectable() {
  return function (target: any) {
    // Đăng ký class vào container
    Container.register(target, target)
  }
}

export function Inject(token: any) {
  return function (target: any, key: string, index: number) {
    // Lưu metadata của dependency vào constructor
    Reflect.defineMetadata(`custom:inject:${key}`, token, target.constructor)
  }
}
