
# Doctor Blue - Medical AI Assistant

## Overview

Doctor Blue is a sophisticated medical AI assistant designed to provide information and guidance on health-related topics. Built with a sleek, minimalist interface inspired by Apple's design principles, it offers a smooth, intuitive user experience while delivering valuable medical insights.

## Features

- **Clean, Intuitive Interface**: Designed with a focus on simplicity and user experience
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Real-time Streaming Responses**: See the AI's thoughts as they form
- **Markdown Support**: Rich text formatting for clear medical information
- **Chat History**: Maintain multiple conversation threads
- **Powered by Groq**: Utilizes Groq's powerful language models for fast, accurate responses

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks
- **API Integration**: Groq API
- **Bundling**: Vite

## Development

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Gl4d3/doctor-blue.git
cd doctor-blue

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`.

### Project Structure

```
doctor-blue/
├── src/
│   ├── components/       # UI components
│   │   ├── chat/         # Chat-specific components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Route components
│   ├── services/         # API services
│   ├── types/            # TypeScript type definitions
│   └── lib/              # Utility functions
├── public/               # Static assets
└── ...                   # Configuration files
```

## Deployment

The application can be deployed to any static site hosting service:

```bash
# Build the application
npm run build

# The build output will be in the dist/ directory
```

## License

This project is licensed under the MIT License.

## Acknowledgements

- Groq for providing the AI capabilities
- shadcn/ui for the beautiful component library
- The open-source community for all the amazing tools that made this possible

---

Created with ❤️ by [Dr. Blue Team](https://github.com/Gl4d3/doctor-blue)
