
# 🏥 Doctor Blue - AI Medical Assistant 🤖

![Doctor Blue](public/doctor-blue-banner.png)

## 📋 Overview

Doctor Blue is an AI-powered medical assistant application designed to provide immediate medical advice, information, and help users find nearby hospitals in emergencies. It leverages advanced AI models to deliver accurate medical information while prioritizing user safety and accessibility.

## 🚀 Features

- **🩺 AI Medical Consultation**: Chat with an AI assistant trained on medical knowledge
- **🏥 Hospital Finder**: Locate nearby hospitals and medical facilities based on your location
- **🌓 Dark/Light Mode**: Comfortable viewing experience in any lighting condition
- **💬 Chat History**: Save and revisit previous conversations
- **⚡ Fast Responses**: Powered by Groq's high-performance LLM infrastructure

## 🛠️ Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **UI Components**: Shadcn UI & Tailwind CSS for responsive design
- **State Management**: React Hooks and Context API
- **Routing**: React Router for navigation
- **Location Services**: IP-based geolocation + OpenStreetMap data
- **LLM Provider**: Groq (using Llama-3-70B model)
- **Data Persistence**: Local storage for chat history

## 🏗️ Architecture

The application follows a modern React architecture with these key components:

### 🧠 Core Components

- **ChatInterface**: Main chat UI with message history and input
- **HospitalFinder**: Component to locate and display nearby hospitals
- **MarkdownRenderer**: Renders AI responses with proper formatting

### 🔄 Custom Hooks

- **useChat**: Manages chat sessions, messages, and AI interactions
- **useDarkMode**: Handles theme switching
- **useToast**: Provides feedback notifications

### 🔌 Services

- **location.ts**: Geolocation and hospital data fetching
- **groq.ts**: LLM API integration for AI responses

## 💻 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/doctor-blue.git

# Navigate to the project directory
cd doctor-blue

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔍 How It Works

### AI Chat

1. User sends a message through the chat interface
2. The message is processed and sent to the Groq API
3. The AI model generates a response based on medical knowledge
4. The response is streamed back to the user in real-time

### Hospital Finder

1. User's location is determined through IP geolocation
2. The application queries OpenStreetMap data for nearby hospitals
3. Results are grouped by distance and displayed to the user
4. Users can view details and get directions to the selected hospital

## 🔒 Privacy & Safety

- Location data is used only for finding nearby hospitals
- Chat history is stored locally on the user's device
- Medical information is provided for educational purposes only and should not replace professional medical advice

## 🛣️ Roadmap

- [ ] User authentication and cloud sync
- [ ] Telehealth integration with real doctors
- [ ] Medical document upload and analysis
- [ ] Symptom tracking and health monitoring
- [ ] Emergency contact system

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Groq](https://groq.com/) for their powerful LLM API
- [OpenStreetMap](https://www.openstreetmap.org/) for hospital location data
- [Shadcn UI](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide Icons](https://lucide.dev/) for beautiful iconography

---

⚠️ **Medical Disclaimer**: Doctor Blue provides information for educational purposes only. Always consult with a qualified healthcare provider for medical advice, diagnosis, or treatment.

