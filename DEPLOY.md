# GitHub Pages 部署指南

## 🚀 快速开始

### 方法一：手动部署（最简单）

#### 1. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建新仓库（名称任意，如 `project-management`）
3. 选择 Public（推荐）或 Private

#### 2. 初始化本地仓库

```bash
# 进入项目目录
cd 软件

# 初始化 Git
git init
git add .
git commit -m "初始化项目"

# 添加远程仓库（替换 YOUR_USERNAME 和 YOUR_REPO_NAME）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### 3. 启用 GitHub Pages

1. 进入仓库的 **Settings**（设置）
2. 点击左侧菜单的 **Pages**
3. 在 **Build and deployment** 部分：
   - Source（源）选择：`Deploy from a branch`
   - Branch（分支）选择：`main` / `root`
4. 点击 **Save** 保存

#### 4. 访问您的网站

几分钟后，您的网站将部署到：
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

---

### 方法二：使用 GitHub Actions 自动部署

#### 1. 创建 GitHub Actions 工作流

在项目中创建 `.github/workflows/deploy.yml` 文件（已为您准备好）

#### 2. 推送到 GitHub

```bash
git add .
git commit -m "添加自动部署配置"
git push
```

#### 3. 启用 GitHub Pages

1. 进入仓库的 **Settings** → **Pages**
2. Source 选择：`GitHub Actions`
3. 保存即可

每次推送到 main 分支，GitHub Actions 都会自动部署！

---

## 📁 项目结构

```
软件/
├── index.html          # 主页面
├── css/               # 样式文件
│   ├── style.css
│   ├── components.css
│   └── responsive.css
├── js/                # JavaScript 文件
│   ├── app.js
│   ├── router.js
│   ├── store.js
│   ├── data/
│   ├── components/
│   └── utils/
└── .github/
    └── workflows/
        └── deploy.yml # 自动部署配置
```

---

## 🔧 配置说明

### 使用自定义域名（可选）

1. 在仓库根目录创建 `CNAME` 文件：
```
your-domain.com
```

2. 在域名 DNS 添加 CNAME 记录：
```
YOUR_USERNAME.github.io
```

3. 在 GitHub Pages 设置中填写您的域名

---

## ⚠️ 注意事项

### 1. 路由处理

由于这是单页应用（SPA），刷新页面可能会 404。解决方案：

#### 方案 A：使用 Hash 路由（推荐，已配置）

当前路由使用 Hash 模式（如 `#dashboard`），无需额外配置

#### 方案 B：添加 404 页面

创建 `404.html` 文件，内容与 `index.html` 相同

### 2. 本地存储

数据存储在浏览器 LocalStorage 中：
- 刷新页面数据不会丢失
- 清除浏览器缓存数据会重置
- 不同设备数据不共享

### 3. CDN 资源

项目使用 CDN 加载的库：
- Font Awesome 6.4.0（图标）
- ECharts 5.4.3（图表）

这些资源需要网络连接才能正常加载

---

## 🎯 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] GitHub Pages 已启用
- [ ] 网站可以正常访问
- [ ] 所有链接可正常跳转
- [ ] 图片资源加载正常
- [ ] 表单提交功能正常
- [ ] 移动端适配正常

---

## 📞 常见问题

### Q: 部署后页面空白？
A: 检查浏览器控制台是否有错误，确认文件路径正确

### Q: 刷新页面 404？
A: 这是 SPA 应用的正常现象，使用 Hash 路由即可解决

### Q: 如何更新网站？
A: 修改代码后，执行 `git add . && git commit && git push` 即可

### Q: 可以部署到其他平台吗？
A: 可以！也支持部署到 Vercel、Netlify、Gitee Pages 等

---

## 🌟 其他部署选择

### Vercel 部署
1. 导入 GitHub 仓库
2. 点击 Deploy，自动完成

### Netlify 部署
1. 拖拽项目文件夹到 Netlify
2. 一键部署完成

### Gitee Pages（国内推荐）
1. 推送到 Gitee 仓库
2. 在服务中开启 Gitee Pages

---

## 📚 参考文档

- [GitHub Pages 官方文档](https://pages.github.com/)
- [GitHub Actions 文档](https://docs.github.com/cn/actions)
- [Git 入门教程](https://git-scm.com/docs/gittutorial)

---

**祝您部署顺利！🎉**