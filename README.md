# ChronoPlus Frontend

A modern web application for tracking and managing transmission assets. Built as part of a thesis project, this frontend provides an intuitive interface for monitoring and controlling transmission infrastructure.

## 🌐 Live Demo

Try out the live demo of ChronoPlus:

**🔗 [https://chronoplus.up.railway.app/](https://chronoplus.up.railway.app/)**

This is a test deployment of the platform where you can explore the features and functionality in real-time.

## 🚀 Technologies

- **React** - UI library for building interactive user interfaces
- **TypeScript** - Typed superset of JavaScript for enhanced code quality
- **Vite** - Next-generation frontend build tool
- **ESLint** - Code linting and quality assurance
- **Railway** - Deployment platform

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn package manager

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/EFelipitowo/ChronoPlus-Frontend.git
cd ChronoPlus-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 🏗️ Project Structure

```
ChronoPlus-Frontend/
├── src/                  # Source files
│   ├── components/       # React components
│   ├── pages/           # Page components
│   ├── assets/          # Static assets
│   ├── styles/          # CSS/styling files
│   └── App.tsx          # Main application component
├── public/              # Public static files
├── dist/                # Production build output
├── tsconfig.json        # TypeScript configuration
├── tsconfig.app.json    # TypeScript app configuration
├── tsconfig.node.json   # TypeScript Node configuration
├── vite.config.ts       # Vite configuration
├── eslint.config.js     # ESLint configuration
└── package.json         # Project dependencies
```

## ⚙️ Configuration

### Vite Plugins

The project supports two official React plugins:

- **@vitejs/plugin-react** - Uses Babel for Fast Refresh
- **@vitejs/plugin-react-swc** - Uses SWC for Fast Refresh (recommended for better performance)


### React-Specific Linting

Install additional plugins for React-specific lint rules:

```bash
npm install -D eslint-plugin-react-x eslint-plugin-react-dom
```


## 🎯 Features

- Real-time transmission asset tracking
- Responsive and intuitive user interface
- TypeScript for type safety and better developer experience
- Hot Module Replacement (HMR) for rapid development
- Modern build tooling with Vite

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is part of a thesis/memorial project. Please contact the repository owner for licensing information.

## 👨‍💻 Author

- GitHub: [@EFelipitowo](https://github.com/EFelipitowo)

## 📞 Support

For questions or issues, please open an issue in the GitHub repository.

---

Built  using React + Vite + TypeScript.