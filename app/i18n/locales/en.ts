export const en = {
  common: {
    edit: "Edit",
    prompter: "Prompter",
    save: "Save",
    import: "Import",
    export: "Export",
    play: "Play",
    pause: "Pause",
    reset: "Reset",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit Fullscreen",
    settings: "Settings",
    history: "History",
    home: "Home",
  },
  footer: {
    rights: "All rights reserved",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
  },
  home: {
    title: "Teleprompter Today",
    description: "Professional web teleprompter for speakers, hosts, and content creators. Supporting bilingual, mirroring, speed control, and more.",
    getStarted: "Get Started",
    openRecent: "Open Recent",
    features: {
      title: "Features",
      easyEditing: "Easy Editing",
      fullControl: "Full Control",
      mirror: "Mirror Display",
      fontSize: "Font Control",
      history: "History",
      crossDevice: "Cross-device Sync",
      smooth: "Smooth editing experience with real-time preview and auto-save",
      speed: "Precise speed control for perfect presentation timing",
      remote: "Remote control and multiple mirroring modes",
    },
    faq: {
      title: "FAQ",
      speed: {
        question: "How to precisely control the scrolling speed?",
        answer: "Multiple speed control options available: 1) Precise slider control, range 0.5-10; 2) Fine-tune with arrow keys, ±0.5 each; 3) Gesture control on touch devices; 4) Quick preset speed switching."
      },
      shortcuts: {
        question: "What are the useful shortcuts?",
        answer: "For improved efficiency, we offer rich shortcuts: Space-Play/Pause, Up/Down Arrows-Speed Control, Home-Reset Position, F-Toggle Fullscreen, ESC-Exit Fullscreen, Screen Click-Show/Hide Controls."
      },
      save: {
        question: "How to save and manage scripts?",
        answer: "Multiple safeguards provided: 1) Auto-save to prevent accidental loss; 2) Manual save to local file; 3) Cloud sync (coming soon); 4) History feature to view and restore recent scripts."
      },
      mirror: {
        question: "How to use the mirror display feature?",
        answer: "Three mirroring modes available: 1) Horizontal mirror-for standard prompter glass; 2) Vertical mirror-for special scenarios; 3) Dual mirror. Quick toggle in settings, shortcut support."
      },
      mobile: {
        question: "How to get the best mobile experience?",
        answer: "Mobile version specially optimized: 1) Responsive design for all screens; 2) Touch control with gestures; 3) Optimized layout for phones and tablets; 4) Auto rotation support."
      }
    },
    testimonials: {
      title: "User Feedback",
      host: {
        name: "Sarah Chen",
        role: "Senior TV Host",
        content: "As a TV show host, I use Teleprompter Today daily. Its bilingual support is invaluable for international interviews, and the precision of mirror display and speed control is impressive. The stability during live broadcasts allows me to focus entirely on delivery."
      },
      professor: {
        name: "Michael Li",
        role: "Distinguished Professor",
        content: "Teleprompter Today is my go-to tool for academic presentations and online lectures. The font size and line spacing controls make reading effortless, and the Markdown support helps present my course outlines professionally."
      },
      creator: {
        name: "Alex Wang",
        role: "Content Creator",
        content: "As a content creator producing multiple videos weekly, Teleprompter Today has significantly boosted my efficiency. The history feature and quick editing are fantastic. Cross-device sync lets me rehearse on mobile and record on desktop seamlessly."
      }
    }
  },
  editor: {
    placeholder: "Enter your text here...",
    characters: "Characters",
    words: "Words",
  },
  controls: {
    slower: "Slower",
    faster: "Faster",
    speed: "Speed",
    fontSize: "Font Size",
    lineHeight: "Line Height",
    mirror: "Mirror",
    align: "Align",
  },
  countdown: {
    preparing: "Preparing to Start",
    spaceKey: "Space: Pause/Resume",
    clickScreen: "Click Screen: Show/Hide Controls",
  },
  shortcuts: {
    title: "Shortcuts",
    space: "Space: Play/Pause",
    arrows: "↑/↓: Adjust Speed",
    home: "Home: Reset",
    f: "F: Fullscreen",
    click: "Click: Show/Hide Controls",
  },
  settings: {
    title: "Settings",
    theme: {
      title: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System",
    },
    language: {
      title: "Language",
      en: "English",
      zh: "Chinese",
    },
    fontSize: {
      title: "Default Font Size",
      small: "Small",
      medium: "Medium",
      large: "Large",
    },
    scrollSpeed: {
      title: "Default Scroll Speed",
      slow: "Slow",
      medium: "Medium",
      fast: "Fast",
    },
    save: "Save Settings",
    reset: "Reset to Default",
  },
  history: {
    title: "Script History",
    noHistory: "No history yet",
    clearAll: "Clear All",
    load: "Load",
    delete: "Delete",
    date: "Date",
    preview: "Preview",
    confirmClear: "Are you sure you want to clear all history?",
    confirmDelete: "Are you sure you want to delete this script?",
  },
  prompter: {
    edit: "Edit",
    play: "Play",
    selectTheme: "Select Theme",
    lightTheme: "White on Black",
    darkTheme: "Black on White",
    orangeTheme: "Orange on Black",
    placeholder: "Enter your script here...",
  },
} as const 