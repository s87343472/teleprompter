# Teleprompter Today

专业的网页提词器应用，为演讲者、主持人和内容创作者打造。支持中英双语、镜像显示、速度调节等功能。

## 功能特性

- 🚀 **简单编辑** - 流畅的编辑体验，支持实时预览和自动保存
- 🎮 **完全控制** - 精确的速度控制，完美把控演讲节奏
- 🪞 **镜像显示** - 支持水平、垂直和双向镜像模式
- 📱 **跨设备同步** - 完美支持桌面端和移动端
- 🎯 **字体调节** - 灵活的字体大小和行距控制
- 📝 **历史记录** - 自动保存历史文稿，随时查看和恢复
- 🌐 **多语言支持** - 完整的中英文界面切换

## 技术栈

- Next.js 15.1.0
- React 19.0.0
- TypeScript
- Tailwind CSS
- shadcn/ui

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发环境运行
pnpm dev

# 构建生产版本
pnpm build

# 运行生产版本
pnpm start
```

## 使用说明

1. **基本操作**
   - 空格键：播放/暂停
   - 上下箭头：调节速度
   - Home：重置位置
   - F：切换全屏

2. **镜像模式**
   - 水平镜像：适用于标准提词器玻璃
   - 垂直镜像：适用于特殊场景
   - 双向镜像：同时水平和垂直镜像

3. **移动设备优化**
   - 响应式设计
   - 触摸控制
   - 手势支持
   - 横竖屏自动切换

## 多语言支持

应用支持完整的中英文界面切换：

- 自动检测用户浏览器语言
- 手动切换语言选项
- 所有界面文本和提示均支持多语言
- 语言偏好保存在本地存储中

## 环境变量配置

本应用不需要特殊环境变量即可运行。

### Vercel部署

在Vercel上部署：

1. 登录Vercel dashboard
2. 选择您的项目
3. 按照提示完成部署
4. 享受您的应用

通过使用Vercel部署，您可以：
- 获得全球CDN分发

## 开发计划

- [ ] 增强的快捷键支持
- [ ] 网络存储与同步
- [ ] 定制主题系统
- [ ] 智能语音辅助
- [ ] 多设备远程控制
- [ ] 脚本版本控制
- [ ] AI提示辅助

## 贡献指南

欢迎提交 Issue 和 Pull Request。在提交 PR 之前，请确保：

1. 代码符合项目规范
2. 更新相关文档
3. 添加必要的测试
4. 本地测试通过

## 许可证

MIT License 