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
      items: [
        {
          q: "What is a web teleprompter?",
          a: "A web teleprompter is a professional online tool that helps speakers, hosts, and content creators read scripts smoothly during speeches, live streams, or video recordings. It automatically scrolls text at a set speed, supports mirror display, and adapts to various teleprompter devices."
        },
        {
          q: "Why use a teleprompter?",
          a: "Using a teleprompter helps you: 1. Maintain eye contact, enhancing speech impact; 2. Control speech pace, increasing professionalism; 3. Reduce memory load, making delivery more natural; 4. Suitable for speeches, live streams, video recording, and more."
        },
        {
          q: "How to get started?",
          a: 'Getting started is simple: 1. Click "Get Started" to enter the editor; 2. Enter or import your script; 3. Click "Play" to begin. You can adjust text size, scroll speed, mirror display, and other settings to suit your needs.'
        },
        {
          q: "How to adjust the scrolling speed?",
          a: "You can adjust the speed in several ways: 1. Use the up/down arrow buttons in the control bar; 2. Use keyboard arrow keys; 3. Click the speed value to input directly. Speed range is 0.5-10, higher values mean faster scrolling."
        },
        {
          q: "How to adjust progress during playback?",
          a: "You can: 1. Directly drag the text content up/down; 2. Use or click the progress bar; 3. On PC, use mouse wheel for fine-tuning. Any adjustment during playback won't affect the playing state."
        },
        {
          q: "How to use mirror mode?",
          a: "In the control bar: 1. Click the horizontal mirror button for horizontal mirroring; 2. Click the vertical mirror button for vertical mirroring. Both mirror modes can be used simultaneously, suitable for different teleprompter displays."
        },
        {
          q: "How to operate efficiently on mobile devices?",
          a: "Mobile optimizations: 1. Slide up/down with finger to adjust progress; 2. Tap screen to show/hide controls; 3. Use pinch gesture to adjust font size; 4. Fullscreen mode for smoother operation. All control buttons are optimized for touch."
        },
        {
          q: "How to save and import text?",
          a: "In the edit page: 1. Click save button to store locally; 2. Click import to read TXT or MD files; 3. Click export to download current text; 4. Text is auto-saved, won't lose on page refresh."
        }
      ]
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
    title: "Shortcuts & Controls",
    space: "Space: Play/Pause",
    arrows: "Arrow Keys: Adjust Speed",
    home: "Home: Reset Position",
    f: "F: Fullscreen Mode",
    click: "Click Screen: Show/Hide Controls",
    pc: {
      title: "Desktop Controls:",
      mouse: "Mouse Drag: Adjust Progress",
      wheel: "Mouse Wheel: Fine-tune Position",
      shortcuts: "Use Keyboard Shortcuts"
    },
    touch: {
      title: "Touch Device Controls:",
      drag: "Slide Up/Down: Adjust Progress",
      tap: "Tap Screen: Show/Hide Controls",
      pinch: "Pinch: Adjust Font Size",
      controls: "Use On-screen Controls"
    }
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