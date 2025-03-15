# Sử dụng Node.js với phiên bản phù hợp
FROM node:20.12.2

# Đặt thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt các dependency
RUN npm install --os=linux --cpu=x64 sharp
RUN npm install

# Copy toàn bộ code vào container
COPY . .

# Build ứng dụng TypeScript
RUN npm run generate:keys
RUN npm run build

# Chỉ định cổng mà ứng dụng sử dụng (ví dụ: 3000)
EXPOSE 4446

# Lệnh để chạy ứng dụng
CMD ["npm", "start"]