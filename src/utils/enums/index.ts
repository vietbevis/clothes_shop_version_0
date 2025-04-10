export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export enum ESort {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum ImageType {
  AVATAR = 'AVATAR', // Ảnh đại diện của người dùng
  COVER = 'COVER', // Ảnh bìa (cho trang cá nhân hoặc gian hàng)
  LOGO = 'LOGO', // Logo của cửa hàng hoặc thương hiệu
  PRODUCT = 'PRODUCT', // Ảnh sản phẩm chính
  PRODUCT_GALLERY = 'PRODUCT_GALLERY', // Ảnh sản phẩm bổ sung (gallery)
  CATEGORY = 'CATEGORY', // Ảnh danh mục sản phẩm
  BANNER = 'BANNER', // Banner quảng cáo
  PROMOTION = 'PROMOTION', // Ảnh chương trình khuyến mãi
  BRAND = 'BRAND', // Ảnh thương hiệu
  USER_UPLOAD = 'USER_UPLOAD', // Ảnh do người dùng tải lên (review sản phẩm)
  BLOG = 'BLOG', // Ảnh minh họa bài blog
  FEATURED = 'FEATURED', // Ảnh nổi bật (ví dụ: top sản phẩm, sản phẩm hot)
  BACKGROUND = 'BACKGROUND', // Ảnh nền (cho trang hoặc popup)
  THUMBNAIL = 'THUMBNAIL' // Ảnh thu nhỏ (thumbnail)
}

export enum TokenType {
  ACCESS_TOKEN = 'accessToken',
  REFRESH_TOKEN = 'refreshToken'
}

export enum ERole {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_USER = 'ROLE_USER',
  ROLE_MODERATOR = 'ROLE_MODERATOR'
}

export enum VerificationCodeType {
  REGISTER = 'REGISTER',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD'
}

export enum UserStatus {
  NOT_VERIFIED = 'not_verified',
  VERIFIED = 'verified',
  BLOCKED = 'blocked',
  DELETED = 'deleted'
}

export enum ShopStatus {
  BLOCKED = 'blocked',
  DELETED = 'deleted',
  CLOSED = 'closed',
  OPEN = 'open',
  PENDING = 'pending'
}

export enum ApproveStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum RoleBased {
  ADMIN = 'admin',
  USER = 'user'
}

export enum ProductStatus {
  AVAILABLE = 'available', // Sản phẩm còn hàng và có thể mua
  SOLD_OUT = 'sold_out', // Sản phẩm đã hết hàng
  COMING_SOON = 'coming_soon', // Sản phẩm sắp ra mắt
  DISCONTINUED = 'discontinued', // Sản phẩm đã ngừng sản xuất hoặc bán
  PREORDER = 'preorder' // Sản phẩm đang ở trạng thái đặt trước
}

export type LoginResponseType = {
  [TokenType.ACCESS_TOKEN]: string
  [TokenType.REFRESH_TOKEN]: string
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
  ALL = 'ALL'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum MessageEventType {
  MESSAGE_CREATED = 'MESSAGE_CREATED',
  MESSAGE_UPDATED = 'MESSAGE_UPDATED',
  MESSAGE_DELETED = 'MESSAGE_DELETED',
  MESSAGE_STATUS_UPDATED = 'MESSAGE_STATUS_UPDATED',
  MESSAGES_READ = 'MESSAGES_READ'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  PAYPAL = 'PAYPAL'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED'
}

export enum ShippingMethod {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS'
}

export enum ShippingStatus {
  NOT_SHIPPED = 'NOT_SHIPPED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED'
}

export enum VoucherType {
  SYSTEM = 'SYSTEM',
  SHOP = 'SHOP'
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  FREESHIP = 'FREESHIP'
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}
