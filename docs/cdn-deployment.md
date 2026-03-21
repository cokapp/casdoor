# CDN 部署配置指南

本文档说明如何在 GitHub Actions 中配置 CDN 部署，将静态文件上传到 CDN。

## 环境变量配置

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下环境变量：

### 必需的环境变量

- `PROVIDER_CLIENT_ID` - 存储提供者的客户端ID
- `PROVIDER_CLIENT_SECRET` - 存储提供者的客户端密钥

### 可选的环境变量（有默认值）

- `PROVIDER_OWNER` - 提供者所有者（默认：admin）
- `PROVIDER_NAME` - 提供者名称（默认：github-cdn）
- `PROVIDER_CATEGORY` - 提供者类别（默认：Storage）
- `PROVIDER_TYPE` - 提供者类型（默认：Casdoor）

### 存储特定的环境变量

根据不同的存储提供者类型，可能需要以下变量：

- `PROVIDER_REGION_ID` - 区域ID（适用于阿里云OSS、AWS S3等）
- `PROVIDER_BUCKET` - 存储桶名称
- `PROVIDER_ENDPOINT` - 端点URL
- `PROVIDER_CONTENT` - 内容配置
- `PROVIDER_DOMAIN` - CDN域名
- `PROVIDER_CERT` - 证书名称（适用于Casdoor存储类型）

## 支持的存储提供者

目前支持以下存储提供者：

- **Casdoor** - Casdoor自带的存储服务
- **Aliyun OSS** - 阿里云对象存储
- **AWS S3** - 亚马逊S3存储
- **Azure Blob Storage** - 微软Azure存储
- **Google Cloud Storage** - 谷歌云存储
- **MinIO** - MinIO对象存储
- **Qiniu Cloud** - 七牛云存储
- **Tencent Cloud COS** - 腾讯云对象存储

## 工作流程

1. 当代码推送到主分支时，GitHub Actions 会自动触发构建
2. 前端构建完成后，会执行 CDN 上传步骤
3. 静态文件（JS、CSS）会被上传到配置的 CDN
4. HTML 文件中的静态资源路径会被更新为 CDN 域名

## 注意事项

- CDN 上传步骤只有在设置了 `PROVIDER_CLIENT_ID` 环境变量时才会执行
- 确保存储提供者配置正确，包括权限和网络访问
- 上传的静态文件路径为 `static/js/` 和 `static/css/`
- HTML 文件中的静态资源引用会被自动更新为 CDN 域名

## 故障排除

如果 CDN 上传失败，请检查：

1. 环境变量是否正确配置
2. 存储提供者的认证信息是否有效
3. 网络连接是否正常
4. 存储桶权限是否正确设置 