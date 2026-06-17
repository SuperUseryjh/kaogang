import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Flashcard from './components/Flashcard';
import Dictation from './components/Dictation';
import Transformation from './components/Transformation';
import Mistakes from './components/Mistakes';
import WordList from './components/WordList';

function MainContent() {
  const { activeTab, isLoaded } = useApp();

  // Hide loading overlay when app is ready
  if (isLoaded) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('opacity-0');
      setTimeout(() => { overlay?.remove(); }, 500);
    }
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'flashcard': return <Flashcard />;
      case 'dictation': return <Dictation />;
      case 'transformation': return <Transformation />;
      case 'mistakes': return <Mistakes />;
      case 'wordlist': return <WordList />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderTab()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}