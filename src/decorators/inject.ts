import Container from '@/container'

export function Injectable() {
  return function (target: any) {
    // Đăng ký class vào container (class chứ ko phải instance của class)
    Container.register(target, target)
  }
}
