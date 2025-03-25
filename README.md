
# 🩺 Doctor Blue - Medical AI Assistant

<div align="center">
  <img src="public/favicon.ico" alt="Doctor Blue Logo" width="120" />
  <br />
  <h3>Your AI-powered medical companion</h3>
  <p>Get reliable medical information and find nearby hospitals instantly</p>
</div>

## 📋 Overview

Doctor Blue is an advanced medical AI assistant designed to provide information and guidance on health-related topics. With a clean, intuitive interface inspired by Apple's design philosophy, it delivers a seamless user experience while providing valuable medical insights and practical assistance like finding nearby hospitals.

## ✨ Features

- **🤖 AI Medical Assistant**: Get reliable information on medical conditions, symptoms, and general health advice
- **🏥 Hospital Finder**: Locate nearby hospitals within customizable distance ranges
- **💬 Chat History**: Maintain context across multiple conversations with automatic chat organization
- **🔍 Contextual Memory**: The AI remembers previous interactions within the same chat session
- **🌓 Dark/Light Mode**: Toggle between visual modes with a default dark theme
- **📱 Responsive Design**: Works seamlessly across desktop and mobile devices
- **⚡ Real-time Streaming**: See the AI's responses as they form for a more natural conversation
- **📝 Markdown Support**: Rich text formatting for clear, structured medical information

## 🛠️ Technology Stack

<div align="center">

| Frontend | UI | State Management | API Integration |
|:--------:|:--:|:----------------:|:---------------:|
| React    | shadcn/ui | React Hooks | Groq API |
| TypeScript | Tailwind CSS | Context API | OpenStreetMap |
| Vite | Lucide Icons | | IP Geolocation |

</div>

## 🧠 AI Capabilities

Doctor Blue leverages advanced language models via the Groq API to provide:

- **📚 Medical Information**: Access to extensive medical knowledge
- **🧐 Symptom Analysis**: Help understanding potential causes of symptoms
- **💊 Medication Information**: Basic details about medications and treatments
- **🩺 General Health Advice**: Wellness and preventative care recommendations

> ⚠️ **Important**: Doctor Blue is an informational tool only and not a replacement for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical concerns.

## 🔍 Hospital Finder Technology

The hospital finder feature uses several technologies to help users locate nearby medical facilities:

1. **📍 IP-based Geolocation**: Determines user location without requiring permission
2. **🗺️ OpenStreetMap Integration**: Queries the OpenStreetMap Overpass API to find hospital data
3. **📏 Distance Calculation**: Uses the Haversine formula to accurately calculate distances
4. **🔢 Range Categorization**: Organizes hospitals into three distance categories:
   - Nearby: < 5km
   - Medium distance: 5-20km  
   - Far: > 20km

## 🚀 Development

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/doctor-blue.git
cd doctor-blue

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`.

## 📁 Project Structure

```
doctor-blue/
├── src/
│   ├── components/       # UI components
│   │   ├── chat/         # Chat-specific components
│   │   ├── hospitals/    # Hospital finder components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Route components
│   ├── services/         # API services
│   │   ├── groq.ts       # AI model integration
│   │   └── location.ts   # Geolocation and hospital services
│   ├── types/            # TypeScript type definitions
│   └── lib/              # Utility functions
├── public/               # Static assets
└── ...                   # Configuration files
```

## 🙏 Acknowledgements

- [Groq](https://groq.com) for providing the AI capabilities
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [OpenStreetMap](https://www.openstreetmap.org/) for the hospital data
- [Lucide Icons](https://lucide.dev/) for the icon set
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  Created with ❤️ by the Doctor Blue Team
</div>
